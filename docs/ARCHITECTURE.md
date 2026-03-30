# Systemarchitektur

## Systemtopologie

Das System besteht aus drei Schichten:

1. **Hardware-Schicht**: Siemens-Automatisierungsmodule (Forderbander, Sensoren, Eingabestationen, Hochregallager) sind an einer physischen Logistikanlage montiert. Ein Raspberry Pi fungiert als Gateway und betreibt einen MQTT-Broker (z.B. Mosquitto).
2. **Backend-Schicht**: Ein NestJS-Dienst abonniert MQTT-Topics, speichert Sensordaten in TimescaleDB und stellt eine REST-API bereit.
3. **Presentation-Schicht**: Das React-Frontend (Web) greift auf die REST-API zu und verbindet sich direkt mit dem MQTT-Broker fur Echtzeitdaten.
4. **Infrastruktur**: Docker Compose orchestriert Backend, Frontend und Datenbank auf einem Server.

## ASCII-Diagramm

```
+----------------------------+
|  Siemens-Hardware / Anlage |
|  (Forderbander, Sensoren,  |
|   Hochregallager, etc.)    |
+------------+---------------+
             |
             | (physische Verbindung)
             v
+----------------------------+
|       Raspberry Pi          |
|   MQTT-Broker (Mosquitto)   |
|   Port 1883 (TCP / WS)      |
+------+---------------------+
       |
       | MQTT (TCP)                   MQTT (WebSocket)
       v                              ^
+------+-------+                +----+--------------------+
|   Backend    |  REST API      |   Frontend (Browser)    |
|  (NestJS)    +<-------------->|   React + Vite + MUI    |
|  Port 3000   |  /api/*        |   Port 80/443 (Nginx)   |
+------+-------+                +-------------------------+
       |
       | Prisma ORM
       v
+--------------+
| TimescaleDB  |
| (PostgreSQL) |
| Port 5432    |
+--------------+
```

## Docker-Dienste

Die folgenden Dienste sind in `docker-compose.yml` definiert:

| Dienst    | Image / Build         | Port(s)  | Beschreibung |
|-----------|-----------------------|----------|--------------|
| `db`      | `timescale/timescaledb:latest-pg16` | 5432 | TimescaleDB-Datenbankserver. Umgebungsvariablen: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. Initialisierungsskript in `docker/db/init.sql`. Datenpersistenz uber Volume `pgdata`. |
| `backend` | `./backend/Dockerfile` | 3000 | NestJS-Anwendungsserver. Fuhrt beim Start `npx prisma db push` aus. Umgebungsvariablen: `DATABASE_URL`, `MQTT_BROKER_URL`, `CORS_ORIGIN`, `OLLAMA_CHAT_ENDPOINT`, `OLLAMA_MODEL`. Healthcheck: `GET /api/health`. |
| `frontend` | `./frontend/Dockerfile` | 80, 443 | Nginx-Webserver mit kompiliertem React-Build. HTTP wird auf HTTPS umgeleitet. Selbstsigniertes Entwicklungszertifikat unter `frontend/nginx/certs/`. |

Deaktivierte Dienste (auskommentiert in `docker-compose.yml`):

- `ollama` / `ollama-init`: Lokales LLM-Inferenz-Backend (Ollama). Deaktiviert, da das Image 7-9 GB benotigt.
- `prisma-studio`: Webbasiertes Datenbank-Inspektionstool. Bei Bedarf einkommentieren.

## MQTT-Topic-Struktur

Das Backend abonniert die folgenden Topic-Muster:

| Topic-Muster       | Beschreibung |
|--------------------|--------------|
| `entry-route/#`    | Alle Nachrichten von der Eingabestrecke (Entry Route) |
| `hochregallager/#` | Alle Nachrichten vom Hochregallager |
| `plant/#`          | Allgemeine Anlagen-Topics |

Konkrete Topic-Konvention fur `plant/`-Topics (aus dem Frontend-Quellcode abgeleitet):

```
plant/{componentId}/status     - Status einer Komponente (on/off)
plant/{componentId}/command    - Steuerbefehl an eine Komponente
plant/{componentId}/telemetry  - Messwerte / Telemetriedaten
```

Beispiele fur Komponenten-IDs: `conveyor-1` bis `conveyor-14`, `rotating-conveyor-1` bis `rotating-conveyor-3`, `inductive-1` bis `inductive-18`, `rfid-1` bis `rfid-5`, `ball-loader-1` bis `ball-loader-4`, `input-station-1`, `highbay-storage-1`.

## Datenbankschema

Das Schema ist in `backend/prisma/schema.prisma` definiert. Die Datenbank lauft als TimescaleDB (PostgreSQL 16).

### Tabelle `sensor_data`

Speichert alle vom Backend empfangenen MQTT-Nachrichten.

| Spalte         | Typ                  | Beschreibung |
|----------------|----------------------|--------------|
| `id`           | Int (autoincrement)  | Interne ID |
| `component_id` | String               | ID der Anlagenkomponente |
| `topic`        | String               | Vollstandiges MQTT-Topic |
| `payload`      | Json                 | Nachrichteninhalt (beliebiges JSON) |
| `received_at`  | DateTime (Timestamptz) | Zeitstempel des Empfangs |

Primarschlussel: `(id, received_at)`. Indizes auf `component_id` und `received_at`.

### Tabelle `simulation_definitions`

Speichert benutzerdefinierte Simulationskonfigurationen.

| Spalte        | Typ      | Beschreibung |
|---------------|----------|--------------|
| `id`          | String   | Benutzerdefinierte ID (Primarschlussel) |
| `name`        | String   | Anzeigename |
| `description` | String?  | Optionale Beschreibung |
| `repeat`      | Int?     | Anzahl der Wiederholungen (null = unendlich) |
| `steps`       | Json     | Array von Simulationsschritten |
| `created_at`  | DateTime | Erstellungszeitpunkt |
| `updated_at`  | DateTime | Letzter Anderungszeitpunkt |

### Datenbank-Initialisierung

Das Skript `docker/db/init.sql` erstellt beim ersten Start die Tabelle `simulation_definitions`. Das Prisma-Schema wird beim Backend-Start uber `npx prisma db push` synchronisiert.
