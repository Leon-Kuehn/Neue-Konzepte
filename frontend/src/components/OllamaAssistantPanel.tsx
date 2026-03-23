import { useEffect, useMemo, useRef, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useLiveComponents } from "../hooks/useLiveComponents";
import { useSimulationState } from "../hooks/useSimulationState";
import {
  getOllamaHealth,
  sendOllamaMessage,
  type AssistantProjectContext,
  type ChatMessage,
  type OllamaHealthResponse,
} from "../services/ollamaClient";

interface OllamaAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function OllamaAssistantPanel({
  open,
  onClose,
}: OllamaAssistantPanelProps) {
  const { t, language } = useAppPreferences();
  const simulationState = useSimulationState();
  const { components, mqttConnected } = useLiveComponents();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [useTypewriter, setUseTypewriter] = useState(true);
  const [typingSpeedMs, setTypingSpeedMs] = useState(18);
  const [healthLoading, setHealthLoading] = useState(false);
  const [health, setHealth] = useState<OllamaHealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const context = useMemo<AssistantProjectContext>(() => {
    const onlineComponents = components.filter((component) => component.online).length;
    const activeComponents = components.filter((component) => component.status === "on").length;

    return {
      language,
      simulation: {
        enabled: simulationState.enabled,
        scenario: simulationState.scenario,
        speed: simulationState.speed,
        startedAt: simulationState.startedAt,
      },
      mqtt: {
        connected: mqttConnected,
        totalComponents: components.length,
        onlineComponents,
        activeComponents,
      },
    };
  }, [components, language, mqttConnected, simulationState]);

  useEffect(() => {
    if (!open || !stickToBottom) {
      return;
    }

    const container = messageListRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, loading, typing, stickToBottom]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setHealthLoading(true);
    setHealthError(null);
    void getOllamaHealth()
      .then((result) => {
        setHealth(result);
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : t("ollama.healthUnavailable");
        setHealthError(message);
      })
      .finally(() => {
        setHealthLoading(false);
      });
  }, [open, t]);

  const animateAssistantMessage = async (
    fullText: string,
    timestamp: string,
  ): Promise<void> => {
    if (fullText.length === 0) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "",
          timestamp,
        },
      ]);
      return;
    }

    setTyping(true);
    setMessages((previous) => [
      ...previous,
      {
        role: "assistant",
        content: "",
        timestamp,
      },
    ]);

    await new Promise<void>((resolve) => {
      let index = 0;
      const step = 3;

      const intervalId = window.setInterval(() => {
        index = Math.min(index + step, fullText.length);
        const chunk = fullText.slice(0, index);

        setMessages((previous) => {
          if (previous.length === 0) {
            return previous;
          }

          const next = [...previous];
          const last = next[next.length - 1];
          if (!last || last.role !== "assistant" || last.timestamp !== timestamp) {
            return previous;
          }

          next[next.length - 1] = {
            ...last,
            content: chunk,
          };

          return next;
        });

        if (index >= fullText.length) {
          window.clearInterval(intervalId);
          setTyping(false);
          resolve();
        }
      }, typingSpeedMs);
    });
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    inputRef.current?.focus();
    setLoading(true);

    try {
      const assistantMessage = await sendOllamaMessage(nextHistory, context);
      if (!useTypewriter) {
        setMessages((previous) => [...previous, assistantMessage]);
      } else {
        await animateAssistantMessage(
          assistantMessage.content,
          assistantMessage.timestamp ?? new Date().toISOString(),
        );
      }
    } catch (error) {
      const errorText = error instanceof Error ? error.message : t("ollama.errorUnavailable");
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: `${t("ollama.errorUnavailable")} ${errorText}`,
          error: true,
          timestamp: new Date().toISOString(),
        },
      ]);
      inputRef.current?.focus();
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleMessageScroll = () => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    const thresholdPx = 32;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setStickToBottom(distanceFromBottom <= thresholdPx);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
      }}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 430 },
          maxWidth: "100vw",
          height: { xs: "100%", sm: "calc(100% - 96px)" },
          mt: { sm: 8 },
          mr: { sm: 2 },
          mb: { sm: 2 },
          borderRadius: { sm: 2 },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {t("ollama.title")}
        </Typography>
        <IconButton aria-label={t("ollama.close")} onClick={onClose} sx={{ ml: "auto" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ flexShrink: 0 }}>
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          {t("ollama.scopeNote")}
        </Alert>

        {healthLoading && (
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            {t("ollama.healthChecking")}
          </Alert>
        )}

        {!healthLoading && health && health.status === "ok" && (
          <Alert severity="success" sx={{ borderRadius: 0 }}>
            {t("ollama.healthReady")} ({health.endpoint})
          </Alert>
        )}

        {!healthLoading && health && health.status === "unreachable" && (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            {t("ollama.healthUnavailable")}
            {health.details ? ` ${health.details}` : ""}
          </Alert>
        )}

        {!healthLoading && !health && healthError && (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            {t("ollama.healthUnavailable")} {healthError}
          </Alert>
        )}

        <Box sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  size="small"
                  checked={useTypewriter}
                  onChange={(event) => setUseTypewriter(event.target.checked)}
                />
              }
              label={
                <Typography variant="caption" color="text.secondary">
                  Typewriter
                </Typography>
              }
            />

            <Chip
              size="small"
              label="Fast"
              color={typingSpeedMs === 10 ? "primary" : "default"}
              onClick={() => setTypingSpeedMs(10)}
            />
            <Chip
              size="small"
              label="Normal"
              color={typingSpeedMs === 18 ? "primary" : "default"}
              onClick={() => setTypingSpeedMs(18)}
            />
            <Chip
              size="small"
              label="Slow"
              color={typingSpeedMs === 28 ? "primary" : "default"}
              onClick={() => setTypingSpeedMs(28)}
            />
          </Stack>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1, display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1, minHeight: 0 }}>
        <Box
          ref={messageListRef}
          onScroll={handleMessageScroll}
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            pr: 0.5,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": {
              width: 0,
              height: 0,
            },
          }}
        >
          {messages.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("ollama.empty")}
            </Typography>
          ) : (
            messages.map((message, index) => {
              const isAssistant = message.role === "assistant";
              return (
                <Box
                  key={`${message.role}-${index}-${message.timestamp ?? "no-ts"}`}
                  sx={{
                    alignSelf: isAssistant ? "flex-start" : "flex-end",
                    maxWidth: "90%",
                    bgcolor: isAssistant
                      ? message.error
                        ? "rgba(211, 47, 47, 0.1)"
                        : "rgba(25, 118, 210, 0.08)"
                      : "rgba(227, 6, 19, 0.08)",
                    border: "1px solid",
                    borderColor: isAssistant
                      ? message.error
                        ? "rgba(211, 47, 47, 0.4)"
                        : "rgba(25, 118, 210, 0.3)"
                      : "rgba(227, 6, 19, 0.3)",
                    borderRadius: 1.5,
                    px: 1.25,
                    py: 1,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {isAssistant ? (
                    <Box
                      sx={{
                        typography: "body2",
                        "& p": { m: 0 },
                        "& p + p": { mt: 1 },
                        "& pre": {
                          m: 0,
                          mt: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: "rgba(0, 0, 0, 0.08)",
                          overflowX: "auto",
                        },
                        "& code": {
                          fontFamily: "Consolas, 'Courier New', monospace",
                          fontSize: "0.85em",
                        },
                        "& ul, & ol": {
                          pl: 2.5,
                          my: 0.5,
                        },
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {message.content}
                    </Typography>
                  )}
                </Box>
              );
            })
          )}

          {loading && !typing && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                {t("ollama.thinking")}
              </Typography>
            </Stack>
          )}
        </Box>

        <Divider />

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            label={t("ollama.inputLabel")}
            placeholder={t("ollama.inputPlaceholder")}
            value={input}
            inputRef={inputRef}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }
            }}
            multiline
            minRows={1}
            maxRows={4}
          />
          <IconButton
            color="primary"
            onClick={() => void handleSend()}
            disabled={!input.trim()}
            aria-label={t("ollama.send")}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Drawer>
  );
}
