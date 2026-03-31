import type { AppLanguage } from "../i18n";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp?: string;
  error?: boolean;
}

export interface AssistantProjectContext {
  language: AppLanguage;
  simulation: {
    enabled: boolean;
    scenario: string;
    speed: string;
    startedAt: number | null;
  };
  mqtt: {
    connected: boolean;
    totalComponents: number;
    onlineComponents: number;
    activeComponents: number;
  };
}

interface OllamaChatRequest {
  model?: string;
  stream?: boolean;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
}

interface OllamaChatResponse {
  message?: {
    role?: "assistant";
    content?: string;
  };
  response?: string;
  choices?: Array<{
    message?: {
      role?: "assistant";
      content?: string;
    };
  }>;
}

export interface OllamaHealthResponse {
  status: "ok" | "unreachable";
  endpoint: string;
  model?: string;
  details?: string;
  modelCount?: number;
}

const DEFAULT_CHAT_ENDPOINT = "/api/ollama/chat";
const DEFAULT_TIMEOUT_MS = 20000;

const INTERNAL_HOSTS = ["localhost", "127.0.0.1"];

const INTERNAL_ENDPOINT_HINTS = [
  "GET /api/health - backend health status",
  "GET /api/sensor-data - sensor rows (filters: componentId, topic, limit, offset)",
  "GET /api/sensor-data/latest - latest persisted rows",
  "GET /api/sensor-data/:componentId - component history",
  "GET /api/sensor-data/range?from&to - inclusive time-range query",
  "GET /api/sensor-data/stats/:componentId - aggregate stats",
  "GET /api/sensor-data/activity/:componentId?interval=minute|hour - activity buckets",
  "POST /api/ollama/chat - local assistant chat endpoint",
];

function isInternalEndpoint(url: string): boolean {
  if (url.startsWith("/api/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    if (!INTERNAL_HOSTS.includes(parsed.hostname)) {
      return false;
    }
    return parsed.pathname.startsWith("/api/") || parsed.pathname.startsWith("/ollama");
  } catch {
    return false;
  }
}

export function resolveOllamaChatEndpoint(
  env: Record<string, unknown> = import.meta.env as Record<string, unknown>,
): string {
  const configured = env.VITE_OLLAMA_CHAT_ENDPOINT;
  if (typeof configured === "string" && configured.trim().length > 0) {
    const normalized = configured.trim();
    if (isInternalEndpoint(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_CHAT_ENDPOINT;
}

function resolveTimeoutMs(
  env: Record<string, unknown> = import.meta.env as Record<string, unknown>,
): number {
  const configured = env.VITE_OLLAMA_TIMEOUT_MS;
  const timeoutValue =
    typeof configured === "number" ? configured : Number(typeof configured === "string" ? configured : NaN);

  if (Number.isFinite(timeoutValue) && timeoutValue >= 1000) {
    return Math.floor(timeoutValue);
  }

  return DEFAULT_TIMEOUT_MS;
}

function resolveModel(
  env: Record<string, unknown> = import.meta.env as Record<string, unknown>,
): string | undefined {
  const configured = env.VITE_OLLAMA_MODEL;
  if (typeof configured === "string" && configured.trim().length > 0) {
    return configured.trim();
  }
  return undefined;
}

const NO_PROJECT_CONTEXT_REPLY =
  "Dazu habe ich keine ausreichenden Informationen aus dem Projekt und kann daher nicht antworten.";

function buildSystemPrompt(context: AssistantProjectContext): string {
  return [
    "Du bist der interne Assistent des IoT-Plant-Operations-Cockpit-Projekts.",
    "Du darfst ausschließlich auf Fragen antworten, die sich direkt auf dieses Projekt beziehen:",
    "Code, Architektur, Konfiguration und Dokumentation aus dem Repository sowie Daten aus der aktuellen Benutzereingabe.",
    "",
    "Strikte Einschränkungen:",
    "- Erfinde keine externen Inhalte und erkläre keine Themen außerhalb des Projekts",
    "  (keine allgemeine Enzyklopädie, kein Rechts- oder Medizinratgeber, keine externen Systeme).",
    "- Wenn eine Frage nicht durch Projektdateien oder die aktuelle Eingabe gedeckt ist,",
    `  antworte ausschließlich mit: "${NO_PROJECT_CONTEXT_REPLY}"`,
    "- Generiere keine API-Keys, erfinde keine vertraulichen Daten und treffe keine Annahmen über externe Systeme.",
    "- Halte Antworten prägnant und operativ.",
    `- Bevorzugte Antwortsprache: ${context.language}`,
    "",
    "Interne Endpunkte und Ressourcen:",
    ...INTERNAL_ENDPOINT_HINTS.map((line) => `- ${line}`),
    "",
    "Aktueller Laufzeit-Kontext:",
    `- MQTT verbunden: ${context.mqtt.connected}`,
    `- Komponenten gesamt/online/aktiv: ${context.mqtt.totalComponents}/${context.mqtt.onlineComponents}/${context.mqtt.activeComponents}`,
    `- Simulation aktiv: ${context.simulation.enabled}`,
    `- Simulationsszenario: ${context.simulation.scenario}`,
    `- Simulationsgeschwindigkeit: ${context.simulation.speed}`,
    `- Simulation gestartet: ${context.simulation.startedAt ?? "nicht aktiv"}`,
  ].join("\n");
}

function extractAssistantContent(payload: OllamaChatResponse): string | null {
  const direct = payload.message?.content;
  if (typeof direct === "string" && direct.trim().length > 0) {
    return direct.trim();
  }

  if (typeof payload.response === "string" && payload.response.trim().length > 0) {
    return payload.response.trim();
  }

  const choiceContent = payload.choices?.[0]?.message?.content;
  if (typeof choiceContent === "string" && choiceContent.trim().length > 0) {
    return choiceContent.trim();
  }

  return null;
}

export async function sendOllamaMessage(
  messages: ChatMessage[],
  context: AssistantProjectContext,
): Promise<ChatMessage> {
  if (messages.length === 0) {
    throw new Error("Cannot send an empty conversation to Ollama.");
  }

  const endpoint = resolveOllamaChatEndpoint();
  const timeoutMs = resolveTimeoutMs();
  const model = resolveModel();

  const requestPayload: OllamaChatRequest = {
    model,
    stream: false,
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(context),
      },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ],
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const rawBody = await response.text();
      throw new Error(
        rawBody
          ? `Ollama request failed (${response.status}): ${rawBody}`
          : `Ollama request failed (${response.status}).`,
      );
    }

    const payload = (await response.json()) as OllamaChatResponse;
    const content = extractAssistantContent(payload);

    if (!content) {
      throw new Error("Ollama response did not contain assistant text.");
    }

    return {
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The Ollama endpoint did not respond in time.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getOllamaHealth(): Promise<OllamaHealthResponse> {
  const timeoutMs = resolveTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch("/api/ollama/health", {
      method: "GET",
      signal: controller.signal,
    });

    if (!response.ok) {
      const rawBody = await response.text();
      throw new Error(
        rawBody
          ? `Ollama health request failed (${response.status}): ${rawBody}`
          : `Ollama health request failed (${response.status}).`,
      );
    }

    return (await response.json()) as OllamaHealthResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The Ollama health endpoint did not respond in time.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export { INTERNAL_ENDPOINT_HINTS, NO_PROJECT_CONTEXT_REPLY };
