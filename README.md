# IoT Plant Admin

A web application for monitoring and managing an IoT logistics plant. Built with React + TypeScript (frontend) and NestJS + Prisma + PostgreSQL (backend).

## Quick Start

### With Docker (recommended)

```bash
docker compose up -d --build
```

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Health check:** [http://localhost:3000/health](http://localhost:3000/health)

### Without Docker

```bash
# Terminal 1 – Frontend
cd frontend
npm install
npm run dev          # → http://localhost:5173

# Terminal 2 – Database (Docker required for PostgreSQL)
docker compose up -d db

# Terminal 3 – Backend
cd backend
npm install
npx prisma migrate dev --name init   # first time only
npm run start:dev    # → http://localhost:3000
```

## Project Structure

```
├── frontend/          # React + TypeScript + Vite (MUI)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/    # Reusable UI building blocks
│   │   │   ├── layout/    # Layout shell (MainLayout)
│   │   │   └── domain/    # Plant-specific components
│   │   ├── pages/         # Route-level page components
│   │   ├── services/      # MQTT client service
│   │   ├── types/         # TypeScript interfaces & mock data
│   │   └── utils/         # Utility functions
│   ├── Dockerfile         # Multi-stage build (node → nginx)
│   └── package.json
├── backend/           # NestJS + Prisma + PostgreSQL
│   ├── src/               # NestJS application source
│   ├── prisma/            # Prisma schema & migrations
│   ├── Dockerfile         # Multi-stage Docker build
│   └── package.json
├── docs/              # Project documentation
├── docker-compose.yml # Full-stack Docker orchestration
└── svg/               # Original SVG source files
```

## Pages

| Route          | Description                                          |
| -------------- | ---------------------------------------------------- |
| `/plant`       | Plant overview with interactive SVG, tiles & details  |
| `/components`  | Component browser with category grouping              |
| `/mqtt`        | MQTT broker connection settings                       |

## MQTT

The frontend connects as an MQTT **client** to an external broker (e.g. Mosquitto on a Raspberry Pi) via WebSockets. Configure the broker connection on the `/mqtt` settings page. No broker is bundled with this app.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite, MUI 7, react-router-dom, mqtt.js
- **Backend:** NestJS, Prisma, PostgreSQL
- **Infrastructure:** Docker, Docker Compose

## Documentation

| Document | Description |
| -------- | ----------- |
| [Architecture](docs/architecture.md) | System overview, component diagram, directory layout |
| [Local Setup](docs/setup-local.md) | Prerequisites and step-by-step development setup |
| [Docker Compose](docs/docker-compose.md) | Container orchestration, services, and configuration |
| [Frontend Components](docs/frontend/components-architecture.md) | Component hierarchy and patterns |
| [Frontend Styling](docs/frontend/styling.md) | Theme, MUI usage, and styling conventions |
| [Backend API](docs/backend/api-overview.md) | REST endpoints and backend architecture |
| [Data Model](docs/backend/data-model.md) | Prisma schema and database structure |
