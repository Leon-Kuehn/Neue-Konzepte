import {
  BadRequestException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

type OllamaChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OllamaChatRequest = {
  model?: string;
  stream?: boolean;
  messages?: Array<{ role?: string; content?: string }>;
};

type OllamaTagsResponse = {
  models?: unknown[];
};

@Injectable()
export class OllamaService {
  private readonly endpoint =
    process.env.OLLAMA_CHAT_ENDPOINT?.trim() ||
    'http://host.docker.internal:11434/api/chat';
  private readonly defaultModel = process.env.OLLAMA_MODEL?.trim();
  private readonly healthEndpoint = this.resolveHealthEndpoint(this.endpoint);

  async health(): Promise<{
    status: 'ok' | 'unreachable';
    endpoint: string;
    model?: string;
    details?: string;
    modelCount?: number;
  }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(this.healthEndpoint, {
        method: 'GET',
        signal: controller.signal,
      });

      if (!response.ok) {
        return {
          status: 'unreachable',
          endpoint: this.healthEndpoint,
          model: this.defaultModel,
          details: `Health probe returned status ${response.status}`,
        };
      }

      const payload = (await response.json()) as OllamaTagsResponse;
      const modelCount = Array.isArray(payload.models)
        ? payload.models.length
        : undefined;

      return {
        status: 'ok',
        endpoint: this.healthEndpoint,
        model: this.defaultModel,
        modelCount,
      };
    } catch (error) {
      const details =
        error instanceof Error
          ? error.message
          : 'Unknown error while reaching Ollama health endpoint';

      return {
        status: 'unreachable',
        endpoint: this.healthEndpoint,
        model: this.defaultModel,
        details,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async chat(request: OllamaChatRequest): Promise<unknown> {
    const sanitizedMessages = this.validateMessages(request.messages);

    const payload = {
      model: request.model ?? this.defaultModel,
      stream: request.stream ?? false,
      messages: sanitizedMessages,
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const parsed = text.length > 0 ? this.safeParseJson(text) : null;

      if (!response.ok) {
        throw new HttpException(
          parsed ?? {
            message: `Ollama request failed with status ${response.status}`,
            details: text,
          },
          response.status,
        );
      }

      return parsed ?? { response: text };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new ServiceUnavailableException({
        message:
          'Unable to reach Ollama. Verify OLLAMA_CHAT_ENDPOINT and that Ollama is running.',
        endpoint: this.endpoint,
      });
    }
  }

  private validateMessages(
    input: OllamaChatRequest['messages'],
  ): OllamaChatMessage[] {
    if (!Array.isArray(input) || input.length === 0) {
      throw new BadRequestException('messages must be a non-empty array');
    }

    return input.map((item, index) => {
      const role = item.role;
      const content = item.content;

      if (
        role !== 'system' &&
        role !== 'user' &&
        role !== 'assistant'
      ) {
        throw new BadRequestException(
          `messages[${index}].role must be one of: system, user, assistant`,
        );
      }

      if (typeof content !== 'string' || content.trim().length === 0) {
        throw new BadRequestException(
          `messages[${index}].content must be a non-empty string`,
        );
      }

      return {
        role,
        content,
      };
    });
  }

  private safeParseJson(text: string): unknown {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { response: text };
    }
  }

  private resolveHealthEndpoint(chatEndpoint: string): string {
    try {
      const parsed = new URL(chatEndpoint);
      if (parsed.pathname.endsWith('/api/chat')) {
        parsed.pathname = parsed.pathname.replace(/\/api\/chat$/, '/api/tags');
      } else {
        parsed.pathname = '/api/tags';
      }
      return parsed.toString();
    } catch {
      return 'http://host.docker.internal:11434/api/tags';
    }
  }
}
