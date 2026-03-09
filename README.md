# DHBW IoT Monitoring Dashboard

Moderne React/TypeScript Single-Page-App (Vite) im DHBW-Style zur Visualisierung und Steuerung eines MQTT-basierten Smart-Village/Smart-Campus Projekts. Enthält MQTT-Frontend-Integration, responsive Dashboard-UI, Docker-Setup mit Mosquitto (WebSockets) und Beispiel-Konfiguration.

## Schnellstart

```bash
npm install
cp .env.example .env          # MQTT-URL anpassen (Standard: ws://mosquitto:9001)
npm run dev                   # läuft auf http://localhost:5173
```

## Docker / Docker-Compose Demo

```bash
docker compose up --build
# Frontend: http://localhost:5173
# MQTT WebSocket Broker: ws://localhost:9001 (TCP: 1883)
# (Innerhalb von Docker-Compose: ws://mosquitto:9001)
```

- `docker-compose.yml` bringt einen Mosquitto-Broker mit aktivierten WebSockets plus das Frontend.
- Mosquitto-Konfiguration: `mosquitto/mosquitto.conf` (anonyme Verbindung für lokale Entwicklung, Ports 1883 & 9001).

## MQTT-Konfiguration

Umgebungsvariablen (`.env`):

- `VITE_MQTT_URL` (z. B. `ws://mosquitto:9001`)
- `VITE_MQTT_USERNAME`, `VITE_MQTT_PASSWORD` (optional; vorbereitet für spätere Auth)

MQTT-Provider & Hooks:

- `src/mqtt/MqttProvider.tsx` stellt Connection-Status, Logs und Publish/Subscribe bereit.
- Hooks: `useMqttSubscription(topic)` und `useMqttPublish()` für Komponenten.
- Reconnect-Logik, letzte Nachricht und Log-Viewer inklusive.

## Topics & Datenmodell

Zentrale Definitionen: `src/config/devices.ts`

- Sensoren (nur lesen)
  - `dhbw/iot/sensors/temperature`
  - `dhbw/iot/sensors/humidity`
  - `dhbw/iot/sensors/light`
  - `dhbw/iot/sensors/soil`
  - `dhbw/iot/sensors/energy`
- Aktoren (lesen + schreiben; Kommandos gehen an `.../set`)
  - `dhbw/iot/actuators/pump` (`/set` für ON/OFF)
  - `dhbw/iot/actuators/light-street` (`/set` für AUTO/ON/OFF)
  - `dhbw/iot/actuators/ventilation` (`/set` für 0–100 %)
- System
  - `dhbw/iot/system/status`
  - `dhbw/iot/system/heartbeat`

### Neue Sensoren/Aktoren hinzufügen

1. `src/config/devices.ts` um weiteren Eintrag ergänzen (Name, Topic, Icon, Einheit).
2. Bei Aktoren zusätzlich `setTopic` und den gewünschten Control-Typ definieren (`toggle`, `select`, `slider`).
3. UI aktualisiert sich automatisch über die Konfiguration.

### Wo Auth/Rollen ergänzt werden

- `src/mqtt/mqttConfig.ts`: Auth-Optionen/TLS ergänzen.
- `src/mqtt/MqttProvider.tsx`: ggf. Token-Handling oder Refresh.
- `src/components/Sidebar.tsx`: Platzhalter für Projekt-/Tenant-Auswahl.

## Ordnerstruktur

```
src/
  App.tsx                # Dashboard Layout (Header, Sidebar, Sections)
  config/devices.ts      # Sensor/Aktor-Definitionen & Topics
  mqtt/                  # MqttProvider, Hooks, Env-Config
  components/            # UI-Bausteine (Cards, Status, Log)
  hooks/                 # useTopicHistory, useActuatorControl
```

## Styling & UI

- Tailwind CSS mit DHBW-Farben (Rot/Weiß/Grau), Cards-Layout, Recharts für Sparklines.
- Responsive (Desktop-first, Tablet-freundlich), „No Data“-Zustände und dezente Fehleranzeigen.

## Tests & Qualität

- `npm run lint`
- `npm run build`

## Wo Topics/Kommandos angepasst werden

- Topic-Schema & Icons: `src/config/devices.ts`
- MQTT-URL/Auth: `.env` oder `src/mqtt/mqttConfig.ts`
- Publish/Subscribe-Logik: `src/mqtt/MqttProvider.tsx`, `src/mqtt/useMqtt.ts`
