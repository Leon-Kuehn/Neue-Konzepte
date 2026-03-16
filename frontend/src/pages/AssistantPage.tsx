import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAppPreferences } from "../context/AppPreferencesContext";
import {
  askAssistant,
  getAssistantHint,
  type AssistantMessage,
} from "../services/assistantAgent";

const quickCommands = ["/help", "/sensor rfid", "/component conveyor-1", "/mqtt", "/lager", "/analyse"];

function labels(language: "de" | "en" | "fr") {
  if (language === "de") {
    return {
      title: "KI-Assistent",
      intro:
        "DHBW-tauglicher Assistent fuer Bedienung, Sensorik, Komponenten, MQTT und Lageranalyse.",
      inputLabel: "Frage oder Befehl",
      placeholder: "z. B. /help oder Wie richte ich MQTT korrekt ein?",
      send: "Senden",
      waiting: "Antwort wird erstellt...",
      safety:
        "Hinweis: Der Assistent nutzt optional ein kostenloses HuggingFace-API-Modell (falls konfiguriert), sonst lokale Wissensregeln.",
      assistant: "Assistent",
      you: "Du",
      empty: "Noch keine Unterhaltung. Starte mit /help.",
    };
  }

  if (language === "fr") {
    return {
      title: "Assistant IA",
      intro:
        "Assistant oriente DHBW pour l'utilisation, les capteurs, les composants, MQTT et l'analyse du stock.",
      inputLabel: "Question ou commande",
      placeholder: "ex: /help ou Comment configurer MQTT correctement ?",
      send: "Envoyer",
      waiting: "Generation de la reponse...",
      safety:
        "Note: l'assistant utilise optionnellement un modele gratuit HuggingFace (si configure), sinon une base locale.",
      assistant: "Assistant",
      you: "Vous",
      empty: "Pas encore de conversation. Commencez par /help.",
    };
  }

  return {
    title: "AI Assistant",
    intro:
      "DHBW-oriented assistant for usage, sensors, components, MQTT, and warehouse analytics.",
    inputLabel: "Question or command",
    placeholder: "e.g. /help or How do I configure MQTT correctly?",
    send: "Send",
    waiting: "Generating answer...",
    safety:
      "Note: The assistant optionally uses a free HuggingFace API model (if configured), otherwise local knowledge rules.",
    assistant: "Assistant",
    you: "You",
    empty: "No conversation yet. Start with /help.",
  };
}

export default function AssistantPage() {
  const { language } = useAppPreferences();
  const text = useMemo(() => labels(language), [language]);

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    setInput("");
    const nextHistory: AssistantMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(nextHistory);
    setLoading(true);

    const answer = await askAssistant(userText, language, nextHistory);
    setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    setLoading(false);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" fontWeight={700}>
        {text.title}
      </Typography>

      <Alert severity="info">{text.intro}</Alert>
      <Alert severity="warning">{text.safety}</Alert>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
            {quickCommands.map((command) => (
              <Chip
                key={command}
                label={command}
                variant="outlined"
                onClick={() => setInput(command)}
                clickable
              />
            ))}
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {getAssistantHint(language)}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              label={text.inputLabel}
              placeholder={text.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit();
                }
              }}
              multiline
              minRows={2}
              maxRows={6}
            />
            <Button variant="contained" onClick={() => void submit()} disabled={loading || !input.trim()}>
              {text.send}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
          {messages.length === 0 && (
            <Typography color="text.secondary">{text.empty}</Typography>
          )}

          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";

            return (
              <Box
                key={`${message.role}-${index}`}
                sx={{
                  alignSelf: isAssistant ? "flex-start" : "flex-end",
                  maxWidth: "90%",
                  bgcolor: isAssistant ? "rgba(25, 118, 210, 0.08)" : "rgba(227, 6, 19, 0.08)",
                  border: "1px solid",
                  borderColor: isAssistant ? "rgba(25, 118, 210, 0.3)" : "rgba(227, 6, 19, 0.3)",
                  borderRadius: 1.5,
                  px: 1.25,
                  py: 1,
                  whiteSpace: "pre-wrap",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.75 }}>
                  {isAssistant ? text.assistant : text.you}
                </Typography>
                <Typography variant="body2">{message.content}</Typography>
              </Box>
            );
          })}

          {loading && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                {text.waiting}
              </Typography>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
