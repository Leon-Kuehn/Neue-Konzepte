#!/usr/bin/env bash
set -euo pipefail

# Always run from repo root
cd "$(dirname "$0")/.."

echo "[compose] Stopping old stack and removing orphans..."
docker compose down --remove-orphans

echo "[compose] Building and starting stack..."
docker compose up -d --build --remove-orphans

echo "[compose] Current status:"
docker compose ps
