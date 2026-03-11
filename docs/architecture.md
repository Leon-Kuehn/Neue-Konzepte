# Architecture Overview

IoT Plant Admin is a full-stack web application for monitoring and managing an IoT logistics plant.

## System Components

```
┌──────────────┐     WebSocket      ┌─────────────────┐
│   Frontend   │◄──────────────────►│  MQTT Broker    │
│  (React/TS)  │                    │  (external)     │
└──────┬───────┘                    └─────────────────┘
       │ HTTP (REST)
       ▼
┌──────────────┐
│   Backend    │
│  (NestJS)    │
└──────┬───────┘
       │ SQL (Prisma)
       ▼
┌──────────────┐
│  PostgreSQL  │
└──────────────┘
```

### Frontend

- **Tech stack:** React 19, TypeScript, Vite, MUI 7, react-router-dom, mqtt.js
- **Port (dev):** `5173`
- **Port (Docker):** `8080`
- Connects to an **external MQTT broker** via WebSocket for real-time plant status updates.
- Communicates with the backend via REST for persisted data (future).

### Backend

- **Tech stack:** NestJS, Prisma ORM, PostgreSQL
- **Port:** `3000`
- Provides a REST API (`GET /health` for health check, `GET /` for hello world).
- Uses Prisma for database migrations and typed queries.

### Database

- **PostgreSQL 16** (Alpine), managed via Docker Compose.
- Schema managed by Prisma (`backend/prisma/schema.prisma`).

### MQTT

- The frontend acts as an **MQTT client** connecting to an external broker (e.g. Mosquitto on a Raspberry Pi) via WebSockets.
- No MQTT broker is bundled with this application.
- Broker connection is configured on the `/mqtt` settings page.

## Project Directory Layout

```
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/    # Reusable UI building blocks (StatusChips, PageHeader)
│   │   │   ├── layout/    # Layout components (MainLayout with sidebar)
│   │   │   └── domain/    # Domain-specific components (ComponentDetails, etc.)
│   │   ├── pages/         # Page-level components
│   │   ├── services/      # MQTT client service
│   │   ├── types/         # TypeScript interfaces & mock data
│   │   └── utils/         # Utility functions (hotspot, categoryLabel)
│   ├── Dockerfile         # Multi-stage build (node → nginx)
│   └── package.json
├── backend/               # NestJS + Prisma + PostgreSQL
│   ├── src/               # Application source
│   ├── prisma/            # Prisma schema & migrations
│   ├── Dockerfile         # Multi-stage build
│   └── package.json
├── mosquitto/             # Mosquitto broker data (optional)
├── svg/                   # Source SVG diagrams
├── docs/                  # Project documentation
├── docker-compose.yml     # Full-stack Docker orchestration
└── README.md              # Project entry point
```
