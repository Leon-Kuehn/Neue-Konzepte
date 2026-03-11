# Backend API Overview

## Tech Stack

- **NestJS** — Node.js framework for building server-side applications
- **Prisma** — Type-safe ORM for database access
- **PostgreSQL** — Relational database

## Base URL

- **Development:** `http://localhost:3000`
- **Docker:** `http://localhost:3000`

## Endpoints

| Method | Path      | Description            | Response                                |
| ------ | --------- | ---------------------- | --------------------------------------- |
| `GET`  | `/`       | Hello World            | `"Hello World!"` (string)               |
| `GET`  | `/health` | Health check           | `{ status: "ok", timestamp: "..." }`    |

## Architecture

The backend follows the standard NestJS module structure:

```
backend/src/
├── main.ts                  # Application bootstrap
├── app.module.ts            # Root module
├── app.controller.ts        # Route handlers
├── app.controller.spec.ts   # Controller unit tests
└── app.service.ts           # Business logic service
```

### Module Pattern

- **`AppModule`** — Root module that imports controllers and providers.
- **`AppController`** — Handles HTTP routes.
- **`AppService`** — Contains business logic (currently minimal).

## Configuration

The backend connects to PostgreSQL via the `DATABASE_URL` environment variable:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/iot_plant?schema=public
```

## Running

```bash
# Development (with hot reload)
cd backend
npm run start:dev

# Production
npm run build
npm run start:prod

# Via Docker Compose
docker compose up -d backend
```

## Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```
