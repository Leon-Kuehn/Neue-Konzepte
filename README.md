# DHBW IoT Monitoring Dashboard – Digital Twin Builder

MQTT-basiertes IoT-Dashboard (React/Vite/TypeScript) mit DHBW-Layout, Digital-Twin-Plant-Builder, Hochregallager-Ansicht sowie Docker-Setup inkl. Mosquitto (WebSocket).

## Projektstruktur

```
frontend/   # React/Vite App (Plant Builder, Warehouse, Dashboard, MQTT-Integration)
backend/    # Platzhalter (später API/Gateway), einfacher Node-Server (derzeit auskommentiert)
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
# Frontend: http://localhost:5173 (Vite Dev-Server)
# MQTT WebSocket Broker: ws://localhost:9001  (im Compose-Netz: ws://mosquitto:9001)
# Backend-Platzhalter: optional (siehe docker-compose.yml, auskommentiert)
```

Mosquitto-Konfiguration: `mosquitto/mosquitto.conf` (WebSocket Port 9001, anonyme Verbindung nur für lokale Entwicklung).

## Wichtige Pfade (Frontend)

- MQTT Provider & Hooks: `frontend/src/mqtt/`
- Geräte-/Topic-Definitionen: `frontend/src/config/devices.ts`
- Anlagen-Layout (statische Schaltplan-Ansicht): `frontend/src/config/layout.ts`
- Plant Builder (Canvas, Palette, Module): `frontend/src/components/plant/PlantBuilderView.tsx`, `frontend/src/config/modules.ts`, `frontend/src/store/plantStore.tsx`
- Hochregallager-Ansicht: `frontend/src/components/warehouse/WarehouseView.tsx`, `frontend/src/config/warehouse.ts`
- Gerätetypen: `frontend/src/types/devices.ts`, Module-Typen: `frontend/src/types/modules.ts`
- Klassische Karten & Logs: `frontend/src/components/devices/*`, `frontend/src/components/status/*`, Settings: `frontend/src/components/settings/SettingsView.tsx`

## Navigation / Tabs

- **Overview**: bestehende KPI-Karten, Sensor-/Aktor-Listen, klassische Schaltplan-Ansicht.
- **Plant Builder**: Digital Twin Canvas mit Palette, Drag & Drop, Rotation, Topic-Bindings.
- **Warehouse**: Hochregallager-Gitter mit Belegungsstatus, Donut-Chart, History.
- **MQTT & Status**: Broker-Status, Heartbeat, Message-Log.
- **Settings**: MQTT-URL/User/Passwort setzen, Layout/Bindings zurücksetzen, Theme-Toggle.

## Plant Builder – digitale Zwillinge

- Palette mit Förderband, Drehteller, Pumpe, Motor, Sensor, NFC-Reader.
- Drag & Drop auf den Canvas (Raster-Snap), Rotation in 90°-Schritten, frei positionierbar.
- Detailpanel pro Modul: Anzeigename, Typ (Sensor/Aktor), MQTT-Topics (`stateTopic`, `commandTopic`, `metaTopic`), Live-Status, letzter Wert.
- Farbcodes: Grün = aktiv/1, Grau = inaktiv/0, Orange = keine Daten/keine Topics. Signal-Dot pulsiert bei neuer MQTT-Message.
- Aktoren können über das Panel per Button `1/0` an `commandTopic` senden; State kommt von `stateTopic`.

## Hochregallager-Ansicht

- Raster aus Slots (z. B. A1–D4) – jeder Slot lauscht auf sein MQTT-Topic (0/1).
- Live-Belegung (Farbe + Signal), Statistik (belegt/frei) + Donut-Chart, einfache History der letzten Bewegungen.

## Persistenz der Layouts & Bindings

- Plant-Layout, Positionen, Rotation und Topic-Bindings werden clientseitig in `localStorage` gespeichert (`plant-builder-state-v1`).
- MQTT-URL/User/Passwort werden ebenfalls im Browser abgelegt, sodass eine spätere Backend- oder Auth-Integration leicht ergänzt werden kann.
- Reset-Buttons in **Plant Builder** und **Settings** setzen alles auf Default (siehe `frontend/src/config/modules.ts`).

## Geräte & Topics anpassen

1. Klassische Geräte-Listen in `frontend/src/config/devices.ts`.
2. Plant-Builder-Module + Default-Bindings in `frontend/src/config/modules.ts`.
3. Warehouse-Slots in `frontend/src/config/warehouse.ts`.
4. Persistenz erfolgt automatisch; bei Änderungen ggf. im Settings-Tab das Layout zurücksetzen.

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
