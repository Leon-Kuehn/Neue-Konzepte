# DHBW IoT Monitoring Dashboard – Anlagen-Schaltplan

MQTT-basiertes IoT-Dashboard (React/Vite/TypeScript) mit DHBW-Layout, Schaltplan/Plant-View, Sensor-/Aktor-Details und Docker-Setup inkl. Mosquitto (WebSocket).

## Projektstruktur

```
frontend/   # React/Vite App (Plant-View, Dashboard, MQTT-Integration)
backend/    # Platzhalter (später API/Gateway), einfacher Node-Server
mosquitto/  # Mosquitto-Konfig, Daten, Logs (WebSocket aktiviert)
docker-compose.yml
```

## Schnellstart (Frontend)

```bash
cd frontend
npm install
cp .env.example .env   # MQTT-URL anpassen (Standard: ws://mosquitto:9001)
npm run dev            # http://localhost:5173
```

## Docker / Docker-Compose

```bash
docker compose up --build
# Frontend: http://localhost:5173
# MQTT WebSocket Broker: ws://localhost:9001  (im Compose-Netz: ws://mosquitto:9001)
# Backend-Platzhalter: optional (siehe docker-compose.yml, auskommentiert)
```

Mosquitto-Konfiguration: `mosquitto/mosquitto.conf` (WebSocket Port 9001, anonyme Verbindung nur für lokale Entwicklung).

## Wichtige Pfade (Frontend)

- MQTT Provider & Hooks: `frontend/src/mqtt/`
- Geräte-/Topic-Definitionen: `frontend/src/config/devices.ts`
- Anlagen-Layout (Schaltplan): `frontend/src/config/layout.ts`
- Gerätetypen: `frontend/src/types/devices.ts`
- Plant-View: `frontend/src/components/plant/PlantView.tsx`
- Klassische Karten: `frontend/src/components/devices/*`, Status/Logs: `frontend/src/components/status/*`

## Schaltplan / Anlagenansicht

- Interaktive 2D-Layout-Ansicht (Förderband, Pumpe, Drehteller, Sensoren wie Lichtschranke/NFC).
- Status direkt im Plan (Farbcode, Signal-Dot bei neuen MQTT-Messages).
- Klick öffnet Detailpanel mit Topics, Status, Historie und Steuer-Controls (Start/Stop, Slider, Select).

## Geräte & Topics anpassen

1. `frontend/src/config/devices.ts` erweitern (ID, Typ sensor/actuator, Icon, Topics: `valueTopic`, `stateTopic`, `commandTopic`, Einheit, Steuerungs-Typ).
2. `frontend/src/config/layout.ts` um Position (`x/y` in %) für das Gerät ergänzen.
3. UI aktualisiert sich dynamisch anhand der Config; Plant-View nutzt ausschließlich diese Definitionen.

## MQTT-Konfiguration

Umgebungsvariablen (`frontend/.env`):

- `VITE_MQTT_URL` (z. B. `ws://mosquitto:9001`)
- `VITE_MQTT_USERNAME`, `VITE_MQTT_PASSWORD` (optional, vorbereitet für spätere Auth/TLS)

## Tests & Qualität

```bash
cd frontend
npm run lint
npm run build
```

## Backend-Platzhalter

`backend/` enthält einen minimalen Node-HTTP-Server (Port 3001). Docker-Service ist vorbereitet und kann bei Bedarf in `docker-compose.yml` aktiviert werden (Profil `backend`).
