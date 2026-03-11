# Docker Compose

The project provides a `docker-compose.yml` at the repository root that orchestrates the full stack.

## Services

| Service    | Image / Build             | Port         | Description                          |
| ---------- | ------------------------- | ------------ | ------------------------------------ |
| `db`       | `postgres:16-alpine`      | `5432:5432`  | PostgreSQL database                  |
| `backend`  | `./backend/Dockerfile`    | `3000:3000`  | NestJS API server                    |
| `frontend` | `./frontend/Dockerfile`   | `8080:80`    | React app served by nginx            |

## Quick Start

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

After starting, the application is available at:

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Health check:** [http://localhost:3000/health](http://localhost:3000/health)

## Running Individual Services

```bash
# Database only (for local backend development)
docker compose up -d db

# Backend + database
docker compose up -d db backend

# Full stack
docker compose up -d
```

## Prisma Studio (Optional)

To inspect the database visually, uncomment the `prisma-studio` service in `docker-compose.yml` and run:

```bash
docker compose up -d prisma-studio
```

Prisma Studio will be available at [http://localhost:5555](http://localhost:5555).

## Volumes

| Volume   | Description                                   |
| -------- | --------------------------------------------- |
| `pgdata` | Persistent PostgreSQL data across restarts     |

## Environment Variables

| Variable        | Service   | Default                                                        |
| --------------- | --------- | -------------------------------------------------------------- |
| `DATABASE_URL`  | backend   | `postgresql://postgres:postgres@db:5432/iot_plant?schema=public` |
| `POSTGRES_USER` | db        | `postgres`                                                     |
| `POSTGRES_PASSWORD` | db    | `postgres`                                                     |
| `POSTGRES_DB`   | db        | `iot_plant`                                                    |
