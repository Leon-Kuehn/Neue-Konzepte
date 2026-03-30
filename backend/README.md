# Backend – IoT Plant Admin

Dieses Verzeichnis enthält das NestJS-Backend für MQTT-Ingest, Datenpersistenz und REST-API.

## Aufgaben des Backends

- MQTT-Nachrichten aus der Anlage empfangen
- Sensordaten strukturiert in TimescaleDB speichern
- Historische Daten und Auswertungen per REST bereitstellen
- Simulationskonfigurationen verwalten
- Warehouse-Simulator für Testdaten steuern

## Einstieg

### Mit Docker Compose (empfohlen)

```bash
docker compose up --build
```

Backend-Basis: `http://localhost:3000/api`

### Lokal (ohne Docker)

```bash
cd backend
npm install
npm run start:dev
```

Erforderliche Umgebungsvariablen stehen in `backend/.env.example`.

## Modulübersicht

- `src/mqtt/` – MQTT-Verbindung und Topic-Subscription
- `src/sensor-data/` – Ingest, Listenabfragen, Statistiken, Aktivitätsdaten
- `src/simulation-config/` – CRUD für Simulationsdefinitionen
- `src/warehouse-simulator/` – Simulatorsteuerung (start/stop/tick/status)
- `src/ollama/` – optionaler Chat-Proxy zu lokalem LLM
- `src/prisma/` – PrismaService + Modul

## API-Überblick

Alle Endpunkte laufen unter `/api`.

- `GET /api/health`
- `GET /api/sensor-data`
- `GET /api/sensor-data/latest`
- `GET /api/sensor-data/range`
- `GET /api/sensor-data/stats/:componentId`
- `GET /api/sensor-data/activity/:componentId`
- `GET /api/sensor-data/:componentId`
- `POST /api/sensor-data/ingest`
- `GET|POST|PUT|DELETE /api/simulations`
- `GET|POST /api/warehouse-simulator/*`
- `GET|POST /api/ollama/*` (optional)

Für vollständige Endpunktdetails siehe `../docs/API.md`.

## MQTT-Verhalten

Abonnierte Topic-Muster:

- `entry-route/#`
- `hochregallager/#`
- `plant/#`

Nachrichten werden robust verarbeitet: Parse-Fehler einzelner Payloads stoppen den Dienst nicht.

## Datenbank

Prisma-Schema: `prisma/schema.prisma`  
Wesentliche Tabellen:

- `sensor_data`
- `simulation_definitions`

## Weiterführende Dokumentation

- Gesamtdokumentation: `../docs/PROJEKTDOKUMENTATION.md`
- Architektur: `../docs/ARCHITECTURE.md`
- Setup: `../docs/SETUP.md`
- Übergabe: `../docs/HANDOVER.md`
