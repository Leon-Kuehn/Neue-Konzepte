import { Body, Controller, Get, Post } from '@nestjs/common';
import { OllamaService } from './ollama.service.js';

type OllamaChatBody = {
  model?: string;
  stream?: boolean;
  messages?: Array<{ role?: string; content?: string }>;
};

@Controller('ollama')
export class OllamaController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Get('health')
  health() {
    return this.ollamaService.health();
  }

  @Post('chat')
  chat(@Body() body: OllamaChatBody) {
    return this.ollamaService.chat(body);
  }
}
