CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS sensor_data (
  id SERIAL NOT NULL,
  component_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF to_regclass('public.sensor_data') IS NOT NULL THEN
    IF EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'sensor_data_pkey'
        AND conrelid = 'public.sensor_data'::regclass
    ) THEN
      EXECUTE 'ALTER TABLE public.sensor_data DROP CONSTRAINT sensor_data_pkey';
    END IF;

    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_sensor_data_time ON sensor_data (received_at DESC)';
    PERFORM create_hypertable('sensor_data', 'received_at', if_not_exists => TRUE, migrate_data => TRUE);
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
