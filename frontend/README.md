# Frontend – IoT Plant Admin

Dieses Verzeichnis enthält das React-Frontend zur Visualisierung und Bedienung der Anlage.

## Aufgaben des Frontends

- Interaktive Top-Down-Ansicht der Anlage
- Anzeige von Live-Zuständen und historischen Sensordaten
- Komponentenbrowser und Detailansichten
- MQTT-Verbindungskonfiguration
- Simulations-/Bedienoberflächen

## Start

### Lokal

```bash
cd frontend
npm install
npm run dev
```

Standard-URL: `http://localhost:5173`

### Build

```bash
npm run build
```

## Wichtige Routen

- `/plant` – Top-Down-Hauptansicht
- `/components` – Komponentenbrowser
- `/hochregallager` – Lageransicht
- `/plant-control` – Steuer-/Kontrollbereich
- `/mqtt` – MQTT-Einstellungen
- `/docs` – integrierte Dokumentationsseite

## Datenfluss

1. **MQTT (Live):** direkte Zustandsupdates der Komponenten
2. **REST (`/api/*`):** persistierte Daten, Historie, Statistiken

Diese Trennung ist bewusst und soll erhalten bleiben.

## Technische Kernelemente

- React + TypeScript + Vite
- Material UI
- TanStack React Query
- Kontexte für Präferenzen und Simulation

## Konfiguration

Optional in `frontend/.env.local`:

```bash
VITE_API_BASE=http://localhost:3000/api
VITE_OLLAMA_CHAT_ENDPOINT=/api/ollama/chat
VITE_OLLAMA_MODEL=qwen2.5:0.5b
VITE_OLLAMA_TIMEOUT_MS=20000
```

## Hinweise zur Top-Down-Ansicht

- Hotspots sind in `src/entryRoute/hotspots.config.json` definiert.
- IDs müssen konsistent zu den Komponenten-IDs sein.
- Aktueller Ball-Loader-Bereich: `ball-loader-1` bis `ball-loader-4`.

## Weiterführende Dokumentation

- Gesamtdokumentation: `../docs/PROJEKTDOKUMENTATION.md`
- Architektur: `../docs/ARCHITECTURE.md`
- API: `../docs/API.md`
- Setup: `../docs/SETUP.md`
