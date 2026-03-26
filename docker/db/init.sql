-- Prisma handles all schema creation via migrations
-- TimescaleDB extension is managed by backend container

CREATE TABLE IF NOT EXISTS simulation_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  repeat INTEGER,
  steps JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
