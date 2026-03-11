# Local Development Setup

## Prerequisites

- **Node.js** ≥ 20 (LTS)
- **npm** (comes with Node.js)
- **Docker** & **Docker Compose** (for the database and optional full-stack mode)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs at [http://localhost:5173](http://localhost:5173).

### Available Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start Vite dev server             |
| `npm run build`   | Type-check and build for prod     |
| `npm run preview` | Preview production build locally  |
| `npm run lint`    | Run ESLint                        |
| `npm run test`    | Run Vitest tests                  |

## Backend

The backend requires a running PostgreSQL instance. The easiest way is via Docker Compose:

```bash
# Start only the database
docker compose up -d db

# Then start the backend in dev mode
cd backend
npm install
npx prisma migrate dev --name init   # first time only
npm run start:dev
```

The backend runs at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run start:dev`    | Start NestJS in watch mode           |
| `npm run build`        | Build for production                 |
| `npm run start:prod`   | Run production build                 |
| `npm run lint`         | Run ESLint with auto-fix             |
| `npm run test`         | Run unit tests (Jest)                |
| `npm run test:e2e`     | Run end-to-end tests                 |

## Database Migrations

When Prisma models are changed:

```bash
cd backend
npx prisma migrate dev --name <description>
```

## MQTT Configuration

The frontend connects to an external MQTT broker via WebSockets. Configure the broker connection on the `/mqtt` settings page in the UI. No broker is bundled with this application.
