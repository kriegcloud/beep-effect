#!/bin/bash
# Quick start script for PostgreSQL-enabled development

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "Starting PostgreSQL..."
docker compose up -d postgres

echo "Waiting for PostgreSQL to be ready..."
until docker exec workflow-postgres pg_isready -U workflow -d workflow >/dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready!"

echo "Starting server with durable workflows..."
cd packages/@core-v2
bun --env-file=.env.postgres run src/server.ts




