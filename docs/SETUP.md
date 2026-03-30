# Lokale Entwicklungsumgebung einrichten

## Voraussetzungen

| Software      | Mindestversion | Hinweis |
|---------------|---------------|---------|
| Docker        | 24.x          | Docker Desktop oder Docker Engine + Compose Plugin |
| Docker Compose | 2.x           | Im Docker-Desktop-Paket enthalten |
| Node.js       | 20.x LTS      | Benotig fur Backend und Frontend bei lokaler Entwicklung |
| npm           | 10.x          | Wird mit Node.js installiert |

## Schnellstart mit Docker Compose (empfohlen)

Der einfachste Weg, das gesamte System zu starten:

```bash
# Im Projektverzeichnis
docker compose up --build
```

Danach sind folgende Dienste erreichbar:

- Frontend: https://localhost (selbstsigniertes Zertifikat - Browserwarnung ist erwartet)
- Backend-API: http://localhost:3000/api
- Datenbank: postgresql://localhost:5432/iot_plant

Zum Stoppen:

```bash
docker compose down
```

### Umgebungsvariablen fur Docker Compose

Erstelle eine `.env`-Datei im Projektverzeichnis (Vorlage: `.env.example`):

```
MQTT_BROKER_URL=mqtt://192.168.178.40:1883
OLLAMA_CHAT_ENDPOINT=http://ollama:11434/api/chat
OLLAMA_MODEL=qwen2.5:0.5b
```

Die Datenbankkonfiguration ist im `docker-compose.yml` fest eingetragen (`postgres`/`postgres`). Fur Produktivbetrieb sollte sie uber Secrets oder `.env`-Datei uberschrieben werden.

## Backend lokal starten (ohne Docker)

```bash
cd backend

# Abhangigkeiten installieren
npm install

# Prisma-Client generieren (DATABASE_URL muss gesetzt sein)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iot_plant?schema=public" npx prisma generate

# Datenbankschema synchronisieren (Datenbank muss laufen)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iot_plant?schema=public" npx prisma db push

# Entwicklungsserver starten
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/iot_plant?schema=public" \
MQTT_BROKER_URL="mqtt://192.168.178.40:1883" \
npm run start:dev
```

Das Backend ist dann unter http://localhost:3000/api erreichbar.

### Umgebungsvariablen fur das Backend

Erstelle `backend/.env` (Vorlage: `backend/.env.example`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iot_plant?schema=public
MQTT_BROKER_URL=mqtt://192.168.178.40:1883
CORS_ORIGIN=http://localhost:5173
OLLAMA_CHAT_ENDPOINT=http://localhost:11434/api/chat
OLLAMA_MODEL=qwen2.5:0.5b
PORT=3000
```

## Frontend lokal starten (ohne Docker)

```bash
cd frontend

# Abhangigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Das Frontend ist dann unter http://localhost:5173 erreichbar.

Fur lokale Entwicklung gegen ein lokal laufendes Backend, erstelle `frontend/.env.local`:

```
VITE_API_BASE_URL=http://localhost:3000
```

## Datenbankmigrationen

Das Projekt nutzt `prisma db push` (Schema-Synchronisation ohne Migrationsdateien) im Entwicklungsmodus und in Docker. Fur produktionsnahes Migrationsmanagement:

```bash
cd backend

# Neue Migration erstellen
DATABASE_URL="..." npx prisma migrate dev --name <beschreibung>

# Migrationen in Produktion anwenden
DATABASE_URL="..." npx prisma migrate deploy
```

Migrationen werden unter `backend/prisma/migrations/` gespeichert.

## Tests ausfuhren

### Backend-Tests

```bash
cd backend
npm test
```

### Frontend-Tests

```bash
cd frontend
npm run test
```

## Linter ausfuhren

```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```
