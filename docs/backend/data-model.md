# Backend Data Model

## ORM

The project uses **Prisma** as the ORM. The schema is defined in `backend/prisma/schema.prisma`.

## Database

- **Engine:** PostgreSQL 16 (Alpine)
- **Database name:** `iot_plant`

## Models

### SensorData

Stores incoming sensor readings from IoT plant components.

| Column         | Type       | Description                            |
| -------------- | ---------- | -------------------------------------- |
| `id`           | `Int`      | Auto-incrementing primary key          |
| `component_id` | `String`   | ID of the plant component              |
| `topic`        | `String`   | MQTT topic the data was received on    |
| `payload`      | `Json`     | Raw JSON payload from the sensor       |
| `received_at`  | `DateTime` | Timestamp of when the data was stored  |

**Indexes:**
- `component_id` — For fast lookups by component
- `received_at` — For time-range queries

**SQL table name:** `sensor_data`

### Prisma Schema

```prisma
model SensorData {
  id          Int      @id @default(autoincrement())
  componentId String   @map("component_id")
  topic       String
  payload     Json
  receivedAt  DateTime @default(now()) @map("received_at")

  @@index([componentId])
  @@index([receivedAt])
  @@map("sensor_data")
}
```

## Migrations

To create a new migration after changing the schema:

```bash
cd backend
npx prisma migrate dev --name <description>
```

To apply existing migrations in production:

```bash
npx prisma migrate deploy
```

## Prisma Client

The Prisma client is generated into `backend/generated/prisma/`. It is configured in `backend/prisma.config.ts`:

```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```
