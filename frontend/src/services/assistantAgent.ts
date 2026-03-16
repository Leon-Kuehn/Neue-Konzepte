import { mockComponents } from "../types/mockData";
import type { AppLanguage } from "../i18n";

type Role = "user" | "assistant";

export type AssistantMessage = {
  role: Role;
  content: string;
};

const HF_API_URL =
  import.meta.env.VITE_HF_API_URL ?? "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = import.meta.env.VITE_HF_MODEL ?? "Qwen/Qwen2.5-1.5B-Instruct";
const HF_TOKEN = import.meta.env.VITE_HF_API_TOKEN;

const byCategory = mockComponents.reduce<Record<string, number>>((acc, component) => {
  acc[component.category] = (acc[component.category] ?? 0) + 1;
  return acc;
}, {});

const componentFacts = [
  `Total components: ${mockComponents.length}`,
  ...Object.entries(byCategory).map(([category, count]) => `${category}: ${count}`),
  "Known category examples: conveyor, rotating-conveyor, press, inductive-sensor, rfid-sensor, optical-sensor, pneumatic-unit, crane, storage, input",
].join("\n");

function buildSystemPrompt(language: AppLanguage): string {
  const languageInstruction =
    language === "de"
      ? "Antworte auf Deutsch."
      : language === "fr"
        ? "Reponds en francais."
        : "Respond in English.";

  return [
    "You are an on-site assistant for a DHBW industrial IoT demonstrator web app.",
    languageInstruction,
    "Answer concise, practical, and safety-focused.",
    "Do not invent unavailable measurements or backend data.",
    "If a request is unclear, ask one short clarifying question.",
    "Prefer actionable steps and mention the exact UI area/tab names.",
    "Support slash commands: /help /sensor /component /mqtt /lager /analyse.",
    "Project facts:",
    componentFacts,
    "Known product areas: Top-Down View, High-Bay Warehouse, Component Browser, Settings, Documentation, AI Assistant.",
  ].join("\n");
}

function commandHelp(language: AppLanguage): string {
  if (language === "de") {
    return [
      "Verfuegbare Befehle:",
      "/help - Zeigt alle Befehle",
      "/sensor <typ> - Erklaert Sensoren und Fehlersuche",
      "/component <id|name> - Sucht Komponenteninfos aus den Projektdaten",
      "/mqtt - Schritt-fuer-Schritt MQTT-Einrichtung",
      "/lager - Bedienung Hochregallager und Slot-Details",
      "/analyse - Wirtschaftliche Kennzahlen erklaeren",
    ].join("\n");
  }

  if (language === "fr") {
    return [
      "Commandes disponibles:",
      "/help - Liste des commandes",
      "/sensor <type> - Capteurs et depannage",
      "/component <id|nom> - Recherche composant",
      "/mqtt - Configuration MQTT pas a pas",
      "/lager - Utilisation de l'entrepot",
      "/analyse - Explication des indicateurs economiques",
    ].join("\n");
  }

  return [
    "Available commands:",
    "/help - Show commands",
    "/sensor <type> - Sensor explanation and troubleshooting",
    "/component <id|name> - Search component info",
    "/mqtt - MQTT setup walkthrough",
    "/lager - High-bay usage and slot details",
    "/analyse - Explain economic KPIs",
  ].join("\n");
}

function commandMqtt(language: AppLanguage): string {
  if (language === "de") {
    return [
      "MQTT Kurzanleitung:",
      "1. In Einstellungen den Broker Host und Port setzen.",
      "2. TLS nur aktivieren, wenn der Broker TLS anbietet (typisch 8883).",
      "3. Verbinden klicken und den Verbindungsstatus pruefen.",
      "4. Danach Top-Down-Ansicht auf Live-Status pruefen.",
      "5. Wenn keine Daten kommen: Topic-Berechtigungen und JSON-Payload pruefen.",
    ].join("\n");
  }

  if (language === "fr") {
    return [
      "Guide MQTT rapide:",
      "1. Configurez host et port dans Parametres.",
      "2. Activez TLS seulement si le broker le supporte (souvent 8883).",
      "3. Cliquez Connecter et verifiez le statut.",
      "4. Controlez ensuite les etats live dans la vue de dessus.",
      "5. Si aucune donnee: verifier droits des topics et payload JSON.",
    ].join("\n");
  }

  return [
    "MQTT quick guide:",
    "1. Configure host and port in Settings.",
    "2. Enable TLS only if broker supports it (often 8883).",
    "3. Click Connect and verify status.",
    "4. Check live states in Top-Down View.",
    "5. If no data arrives, verify topic permissions and JSON payload.",
  ].join("\n");
}

function commandLager(language: AppLanguage): string {
  if (language === "de") {
    return [
      "Hochregallager Bedienung:",
      "1. Slot anklicken, um rechts Details zu sehen (Artikel, Menge, Kosten, Preis, Nachfrage).",
      "2. Lagerwert und Monats-Rohertrag oben als Schnellkennzahlen nutzen.",
      "3. Lagerhueter und Langsamdreher fuer Sortimentsbereinigung beobachten.",
      "4. Fuer Entscheidungen immer mit realen ERP/API-Daten abgleichen.",
    ].join("\n");
  }

  if (language === "fr") {
    return [
      "Utilisation de l'entrepot:",
      "1. Cliquez un emplacement pour voir le detail a droite.",
      "2. Utilisez la valeur de stock et la marge brute mensuelle.",
      "3. Surveillez stock mort et rotation lente.",
      "4. Validez toujours avec des donnees reelles ERP/API.",
    ].join("\n");
  }

  return [
    "High-bay usage:",
    "1. Click a slot to open details on the right.",
    "2. Use inventory value and monthly gross profit KPI cards.",
    "3. Monitor dead stock and slow movers.",
    "4. Validate decisions with real ERP/API data.",
  ].join("\n");
}

function commandAnalyse(language: AppLanguage): string {
  if (language === "de") {
    return [
      "Wirtschaftliche Analyse in der App:",
      "- Lagerwert: gebundenes Kapital (Menge x Stueckkosten)",
      "- Monatsumsatz: Nachfrage x Verkaufspreis",
      "- Monats-Rohertrag: Nachfrage x (Preis - Kosten)",
      "- Lagerhueter-Quote: Anteil Artikel ohne/mit sehr geringer Nachfrage",
      "Empfehlung: ABC/XYZ als naechsten Schritt ergaenzen.",
    ].join("\n");
  }

  if (language === "fr") {
    return [
      "Analyse economique dans l'app:",
      "- Valeur de stock: capital immobilise",
      "- Chiffre d'affaires mensuel: demande x prix",
      "- Marge brute mensuelle: demande x (prix - cout)",
      "- Taux de stock mort: part d'articles sans demande",
      "Suggestion: ajouter une classification ABC/XYZ.",
    ].join("\n");
  }

  return [
    "Economic analytics in the app:",
    "- Inventory value: tied-up capital",
    "- Monthly revenue: demand x price",
    "- Monthly gross profit: demand x (price - cost)",
    "- Dead-stock ratio: share of no/very-low-demand items",
    "Suggestion: add ABC/XYZ classification next.",
  ].join("\n");
}

function commandSensor(language: AppLanguage, query: string): string {
  const q = query.toLowerCase();

  const sensorMap = [
    {
      keys: ["induktiv", "inductive"],
      de: "Induktivsensor: erkennt Metall beruehrungslos. Pruefe Abstand, Ausrichtung, 24V Versorgung und Stecker.",
      en: "Inductive sensor: contactless metal detection. Check distance, alignment, 24V supply, and connectors.",
      fr: "Capteur inductif: detection sans contact des metaux. Verifiez distance, alignement, alimentation 24V et connecteurs.",
    },
    {
      keys: ["rfid"],
      de: "RFID-Sensor: liest Tag-ID. Pruefe Tag-Abstand, metallische Abschirmung und Bus-Kommunikation.",
      en: "RFID sensor: reads tag ID. Check tag distance, metal shielding, and bus communication.",
      fr: "Capteur RFID: lit l'ID du tag. Verifiez distance, ecran metallique et communication bus.",
    },
    {
      keys: ["licht", "optical", "light"],
      de: "Lichtsensor/Lichtschranke: pruefe Optik, Sender-Empfaenger-Ausrichtung und Fremdlicht.",
      en: "Light sensor/barrier: check optics, emitter-receiver alignment, and external light.",
      fr: "Capteur/barriere optique: verifier optique, alignement emetteur-recepteur et lumiere parasite.",
    },
  ];

  const found = sensorMap.find((item) => item.keys.some((k) => q.includes(k)));
  if (!found) {
    return language === "de"
      ? "Bitte Sensor spezifizieren, z. B. /sensor induktiv, /sensor rfid oder /sensor licht."
      : language === "fr"
        ? "Precisez le capteur, ex: /sensor inductif, /sensor rfid ou /sensor light."
        : "Please specify a sensor, e.g. /sensor inductive, /sensor rfid, or /sensor light.";
  }

  return language === "de" ? found.de : language === "fr" ? found.fr : found.en;
}

function commandComponent(language: AppLanguage, query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) {
    return language === "de"
      ? "Bitte Komponente angeben, z. B. /component conveyor-1 oder /component rfid."
      : language === "fr"
        ? "Precisez un composant, ex: /component conveyor-1 ou /component rfid."
        : "Please provide a component, e.g. /component conveyor-1 or /component rfid.";
  }

  const matches = mockComponents.filter(
    (component) =>
      component.id.toLowerCase().includes(q) || component.name.toLowerCase().includes(q),
  );

  if (matches.length === 0) {
    return language === "de"
      ? "Keine passende Komponente gefunden."
      : language === "fr"
        ? "Aucun composant correspondant trouve."
        : "No matching component found.";
  }

  const top = matches.slice(0, 3);
  const lines = top.map(
    (component) =>
      `- ${component.name} (${component.id}) | ${component.category} | ${component.online ? "online" : "offline"} | status=${component.status}`,
  );

  if (language === "de") {
    return [`Gefundene Komponenten (${matches.length}):`, ...lines].join("\n");
  }
  if (language === "fr") {
    return [`Composants trouves (${matches.length}):`, ...lines].join("\n");
  }
  return [`Found components (${matches.length}):`, ...lines].join("\n");
}

function handleCommand(input: string, language: AppLanguage): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;

  const [command, ...rest] = trimmed.split(" ");
  const arg = rest.join(" ");

  switch (command.toLowerCase()) {
    case "/help":
      return commandHelp(language);
    case "/mqtt":
      return commandMqtt(language);
    case "/lager":
      return commandLager(language);
    case "/analyse":
      return commandAnalyse(language);
    case "/sensor":
      return commandSensor(language, arg);
    case "/component":
      return commandComponent(language, arg);
    default:
      return language === "de"
        ? "Unbekannter Befehl. Nutze /help fuer eine Uebersicht."
        : language === "fr"
          ? "Commande inconnue. Utilisez /help pour la liste."
          : "Unknown command. Use /help for a list.";
  }
}

function localFallback(input: string, language: AppLanguage): string {
  const q = input.toLowerCase();

  if (q.includes("mqtt")) return commandMqtt(language);
  if (q.includes("lager") || q.includes("warehouse")) return commandLager(language);
  if (q.includes("analyse") || q.includes("profit") || q.includes("dead stock"))
    return commandAnalyse(language);
  if (q.includes("sensor") || q.includes("rfid") || q.includes("indukt"))
    return commandSensor(language, q);
  if (q.includes("component") || q.includes("komponent") || q.includes("conveyor"))
    return commandComponent(language, q.replace("component", "").replace("komponente", "").trim());

  if (language === "de") {
    return [
      "Ich kann dir bei Bedienung, Sensorik, Komponenten, MQTT und Lageranalyse helfen.",
      "Tippe z. B. /help oder eine konkrete Frage wie:",
      "- Wie richte ich MQTT richtig ein?",
      "- /sensor rfid",
      "- /component conveyor-1",
      "- Was bedeutet Lagerhueter-Quote?",
    ].join("\n");
  }

  if (language === "fr") {
    return [
      "Je peux aider sur l'utilisation, capteurs, composants, MQTT et analyse de stock.",
      "Essayez /help ou une question concrete.",
    ].join("\n");
  }

  return [
    "I can help with usage, sensors, components, MQTT, and warehouse analytics.",
    "Try /help or ask a concrete question.",
  ].join("\n");
}

export async function askAssistant(
  input: string,
  language: AppLanguage,
  history: AssistantMessage[],
): Promise<string> {
  const commandAnswer = handleCommand(input, language);
  if (commandAnswer) return commandAnswer;

  if (!HF_TOKEN) {
    return localFallback(input, language);
  }

  try {
    const systemPrompt = buildSystemPrompt(language);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map((item) => ({ role: item.role, content: item.content })),
      { role: "user", content: input },
    ];

    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      body: JSON.stringify({
        model: HF_MODEL,
        temperature: 0.2,
        max_tokens: 420,
        messages,
      }),
    });

    if (!response.ok) {
      return localFallback(input, language);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const answer = data.choices?.[0]?.message?.content?.trim();
    return answer && answer.length > 0 ? answer : localFallback(input, language);
  } catch {
    return localFallback(input, language);
  }
}

export function getAssistantHint(language: AppLanguage): string {
  if (language === "de") {
    return "Tipp: /help, /sensor rfid, /component conveyor-1, /mqtt, /lager, /analyse";
  }

  if (language === "fr") {
    return "Astuce: /help, /sensor rfid, /component conveyor-1, /mqtt, /lager, /analyse";
  }

  return "Tip: /help, /sensor rfid, /component conveyor-1, /mqtt, /lager, /analyse";
}
