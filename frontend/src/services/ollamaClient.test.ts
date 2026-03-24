gitimport { afterEach, describe, expect, it, vi } from "vitest";
import {
  getOllamaHealth,
  resolveOllamaChatEndpoint,
  sendOllamaMessage,
  type AssistantProjectContext,
  type ChatMessage,
} from "./ollamaClient";

const fetchMock = vi.fn<typeof fetch>();

const context: AssistantProjectContext = {
  language: "en",
  simulation: {
    enabled: true,
    scenario: "plant-demo",
    speed: "normal",
    startedAt: 123,
  },
  mqtt: {
    connected: true,
    totalComponents: 10,
    onlineComponents: 8,
    activeComponents: 5,
  },
};

describe("ollamaClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  it("falls back to /api/ollama/chat by default", () => {
    expect(resolveOllamaChatEndpoint({})).toBe("/api/ollama/chat");
  });

  it("accepts internal relative endpoint override", () => {
    expect(resolveOllamaChatEndpoint({ VITE_OLLAMA_CHAT_ENDPOINT: "/api/internal/ollama/chat" })).toBe(
      "/api/internal/ollama/chat",
    );
  });

  it("rejects external endpoint override", () => {
    expect(
      resolveOllamaChatEndpoint({ VITE_OLLAMA_CHAT_ENDPOINT: "https://example.com/ollama/chat" }),
    ).toBe("/api/ollama/chat");
  });

  it("sends messages and parses Ollama message.content response", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ message: { role: "assistant", content: "Project-local answer" } }),
      text: async () => "",
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const history: ChatMessage[] = [{ role: "user", content: "How does /api/sensor-data work?" }];
    const result = await sendOllamaMessage(history, context);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/ollama/chat");
    expect(result.role).toBe("assistant");
    expect(result.content).toContain("Project-local");
  });

  it("supports OpenAI-like choices response shape", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "choice-content" } }] }),
      text: async () => "",
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const history: ChatMessage[] = [{ role: "user", content: "Ping" }];
    const result = await sendOllamaMessage(history, context);

    expect(result.content).toBe("choice-content");
  });

  it("throws on non-2xx responses", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: "unavailable" }),
      text: async () => "service unavailable",
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendOllamaMessage([{ role: "user", content: "Hi" }], context)).rejects.toThrow(
      "Ollama request failed (503): service unavailable",
    );
  });

  it("reads health status from backend health endpoint", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: "ok", endpoint: "http://host.docker.internal:11434/api/tags" }),
      text: async () => "",
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const health = await getOllamaHealth();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ollama/health",
      expect.objectContaining({ method: "GET" }),
    );
    expect(health.status).toBe("ok");
  });

  it("throws on health request non-2xx", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "error" }),
      text: async () => "failed",
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(getOllamaHealth()).rejects.toThrow(
      "Ollama health request failed (500): failed",
    );
  });
});
