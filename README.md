# IoT Plant Admin

A web application for monitoring and managing an IoT logistics plant. Built with React + TypeScript (frontend) and NestJS + Prisma + PostgreSQL (backend).

## Project Structure

```
├── frontend/          # React + TypeScript + Vite (MUI)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (PlantOverview, MqttSettings)
│   │   ├── services/      # MQTT client service
│   │   ├── types/         # TypeScript interfaces & mock data
│   │   └── svg/           # Plant top-down SVG
│   └── package.json
├── backend/           # NestJS + Prisma + PostgreSQL
│   ├── src/               # NestJS application source
│   ├── prisma/            # Prisma schema
│   ├── Dockerfile         # Multi-stage Docker build
│   └── package.json
├── docker-compose.yml # Backend + PostgreSQL services
└── svg/               # Original SVG source files
```

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at [http://localhost:5173](http://localhost:5173).

### Pages

| Route    | Description                                         |
| -------- | --------------------------------------------------- |
| `/plant` | Plant overview with interactive SVG, tiles & details |
| `/mqtt`  | MQTT broker connection settings                     |

## Running the Backend + PostgreSQL (Docker)

```bash
# From the project root
docker compose up -d
```

This starts:

- **PostgreSQL** on port `5432`
- **NestJS backend** on port `3000` (health check at `GET /health`)

### Running Database Migrations (when models are added)

```bash
cd backend
npx prisma migrate dev --name init
```

## MQTT

The frontend connects as an MQTT **client** to an external broker (e.g. Mosquitto on a Raspberry Pi) via WebSockets. Configure the broker connection on the `/mqtt` settings page. No broker is bundled with this app.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, MUI 7, react-router-dom, mqtt.js
- **Backend:** NestJS, Prisma, PostgreSQL
- **Infrastructure:** Docker, Docker Compose
