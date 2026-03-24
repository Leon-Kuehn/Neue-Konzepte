CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS sensor_data (
  id SERIAL NOT NULL,
  component_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, received_at)
);

DO $$
BEGIN
  IF to_regclass('public.sensor_data') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE c.contype = 'p'
        AND c.conname = 'sensor_data_pkey'
        AND n.nspname = 'public'
        AND t.relname = 'sensor_data'
        AND NOT EXISTS (
          SELECT 1
          FROM pg_index i
          JOIN pg_attribute a
            ON a.attrelid = i.indrelid
           AND a.attnum = ANY (i.indkey)
          WHERE i.indrelid = c.conrelid
            AND i.indisprimary
            AND a.attname = 'received_at'
        )
    ) THEN
      EXECUTE 'ALTER TABLE public.sensor_data DROP CONSTRAINT sensor_data_pkey';
    END IF;

    PERFORM create_hypertable('sensor_data', 'received_at', if_not_exists => TRUE, migrate_data => TRUE);
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sensor_data_time ON sensor_data (received_at DESC)';
    IF NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'sensor_data_pkey'
        AND conrelid = 'public.sensor_data'::regclass
    ) THEN
      EXECUTE 'ALTER TABLE public.sensor_data ADD CONSTRAINT sensor_data_pkey PRIMARY KEY (id, received_at)';
    END IF;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS simulation_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  repeat INTEGER,
  steps JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
