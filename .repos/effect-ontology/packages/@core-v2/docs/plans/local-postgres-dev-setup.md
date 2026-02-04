# Local Docker PostgreSQL Development Setup Plan

**Date**: December 11, 2025
**Status**: Planning Complete
**Purpose**: Set up local PostgreSQL that matches deployed GCE configuration exactly

---

## Executive Summary

This plan documents how to set up a local Docker PostgreSQL instance that **exactly matches** the deployed Cloud Run / GCE PostgreSQL configuration. This enables local development and testing of the durable workflow engine (`ClusterWorkflowEngine`) without deploying to GCP.

---

## 1. Deployed Configuration Analysis

### 1.1 Production PostgreSQL Setup (from `infra/modules/postgres/main.tf`)

| Parameter | Production Value | Notes |
|-----------|-----------------|-------|
| **PostgreSQL Version** | `15-alpine` | `postgres:15-alpine` image |
| **Database Name** | `workflow` | `POSTGRES_DB=workflow` |
| **Username** | `workflow` | `POSTGRES_USER=workflow` |
| **Password** | Secret Manager | `POSTGRES_PASSWORD_FILE=/run/secrets/pg_password` |
| **Port** | `5432` | Standard PostgreSQL port |
| **Storage** | Persistent disk | 10GB attached disk at `/var/lib/postgresql/data` |

### 1.2 Environment Variables Expected by Application (from `src/server.ts`)

```typescript
// From PgClient.layerConfig in server.ts lines 40-46
{
  host: Config.string("POSTGRES_HOST"),
  port: Config.number("POSTGRES_PORT").pipe(Config.withDefault(5432)),
  database: Config.string("POSTGRES_DATABASE").pipe(Config.withDefault("workflow")),
  username: Config.string("POSTGRES_USER").pipe(Config.withDefault("workflow")),
  password: Config.redacted("POSTGRES_PASSWORD")
}
```

### 1.3 Cloud Run Environment Variables (from `infra/modules/cloud-run/main.tf`)

```hcl
# Lines 66-102
POSTGRES_HOST     = <internal VPC IP>
POSTGRES_PORT     = "5432"
POSTGRES_DATABASE = "workflow"
POSTGRES_USER     = "workflow"
POSTGRES_PASSWORD = <from Secret Manager>
```

---

## 2. @effect/cluster Schema Requirements

### 2.1 Auto-Created Tables

The `@effect/cluster` library with `SingleRunner.layer({ runnerStorage: "sql" })` auto-creates these tables:

**workflow_cluster_messages** (with `workflow_` prefix):
```sql
CREATE TABLE IF NOT EXISTS workflow_cluster_messages (
  id BIGINT PRIMARY KEY,
  shard_id INT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  message BYTEA NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**workflow_cluster_replies**:
```sql
CREATE TABLE IF NOT EXISTS workflow_cluster_replies (
  request_id BIGINT PRIMARY KEY,
  reply BYTEA NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**workflow_cluster_runners** (when `runnerStorage: "sql"`):
```sql
CREATE TABLE IF NOT EXISTS workflow_cluster_runners (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  shards INT[] NOT NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.2 No Manual Migration Required

The `SingleRunner.layer` with SQL storage auto-creates tables on first connection. No migration scripts are necessary.

---

## 3. Implementation Plan

### 3.1 Docker Compose Configuration

**File: `/Users/pooks/Dev/effect-ontology/docker-compose.yml`**

```yaml
version: '3.8'

services:
  # Existing Jaeger service (if any)...

  # PostgreSQL for workflow persistence (matches GCE deployment)
  postgres:
    image: postgres:15-alpine  # EXACT match to production
    container_name: workflow-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: workflow      # Matches production
      POSTGRES_PASSWORD: workflow  # Local dev only - use secrets in prod
      POSTGRES_DB: workflow        # Matches production
    ports:
      - "5432:5432"
    volumes:
      - workflow-postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U workflow -d workflow"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - effect-ontology

networks:
  effect-ontology:
    driver: bridge

volumes:
  workflow-postgres-data:
```

### 3.2 Environment Variables File

**File: `/Users/pooks/Dev/effect-ontology/packages/@core-v2/.env.postgres`**

```bash
# =============================================================================
# PostgreSQL-Enabled Local Development
# =============================================================================
# Use with: bun --env-file=.env.postgres run src/server.ts

# --- PostgreSQL Configuration (enables durable workflows) ---
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DATABASE=workflow
POSTGRES_USER=workflow
POSTGRES_PASSWORD=workflow

# --- LLM Configuration (copy from .env) ---
LLM_PROVIDER=anthropic
LLM_MODEL=claude-haiku-4-5
LLM_API_KEY=<your-api-key-here>
LLM_TIMEOUT_MS=60000
LLM_MAX_TOKENS=4096
LLM_TEMPERATURE=0.1

# --- Storage Configuration ---
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=/tmp/effect-ontology-dev

# --- Ontology Configuration ---
# IMPORTANT: Must be an absolute path for file-system OntologyService.
# Relative paths are resolved from CWD, not package root, causing failures.
ONTOLOGY_PATH=/Users/pooks/Dev/effect-ontology/ontologies/football/ontology.ttl
ONTOLOGY_CACHE_TTL=3600

# --- Runtime Configuration ---
RUNTIME_CONCURRENCY=4
RUNTIME_LLM_CONCURRENCY=2

# --- Server Configuration ---
PORT=8080
NODE_ENV=development
```

### 3.3 Package.json Scripts

**Add to `/Users/pooks/Dev/effect-ontology/packages/@core-v2/package.json`**:

```json
{
  "scripts": {
    "serve": "bun run src/server.ts",
    "serve:postgres": "bun --env-file=.env.postgres run src/server.ts",
    "db:start": "docker compose -f ../../docker-compose.yml up -d postgres",
    "db:stop": "docker compose -f ../../docker-compose.yml down postgres",
    "db:logs": "docker compose -f ../../docker-compose.yml logs -f postgres",
    "db:psql": "docker exec -it workflow-postgres psql -U workflow -d workflow",
    "db:tables": "docker exec -it workflow-postgres psql -U workflow -d workflow -c '\\dt workflow_*'"
  }
}
```

### 3.4 Quick Start Script

**File: `/Users/pooks/Dev/effect-ontology/scripts/dev-postgres.sh`**

```bash
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
```

---

## 4. Usage Instructions

### 4.1 Starting the Development Environment

```bash
# 1. Navigate to project root
cd /Users/pooks/Dev/effect-ontology

# 2. Start PostgreSQL
docker compose up -d postgres

# 3. Wait for PostgreSQL to be ready
docker compose logs -f postgres
# Look for: "database system is ready to accept connections"

# 4. Navigate to @core-v2 package
cd packages/@core-v2

# 5. Copy API key to .env.postgres (one-time setup)
# Edit .env.postgres and set LLM_API_KEY

# 6. Start server with PostgreSQL enabled
bun --env-file=.env.postgres run src/server.ts
```

Expected output:
```
PostgreSQL workflow engine enabled (durable workflows)
PostgreSQL connection verified
Server starting on port 8080
```

### 4.2 Stopping the Environment

```bash
# Stop PostgreSQL (data persists in volume)
docker compose down postgres

# Stop PostgreSQL AND delete data
docker compose down postgres -v
```

### 4.3 Database Inspection

```bash
# Connect to PostgreSQL shell
docker exec -it workflow-postgres psql -U workflow -d workflow

# List workflow tables
\dt workflow_*

# Show table contents
SELECT * FROM workflow_cluster_runners;
SELECT COUNT(*) FROM workflow_cluster_messages;
```

---

## 5. Verification Steps

### 5.1 Verify Docker PostgreSQL Matches Production

| Check | Command | Expected |
|-------|---------|----------|
| Image version | `docker inspect workflow-postgres --format '{{.Config.Image}}'` | `postgres:15-alpine` |
| Database name | `docker exec workflow-postgres psql -U workflow -c "SELECT current_database()"` | `workflow` |
| Username | `docker exec workflow-postgres psql -U workflow -c "SELECT current_user"` | `workflow` |
| Port | `docker port workflow-postgres` | `0.0.0.0:5432->5432/tcp` |

### 5.2 Verify Application Connects

```bash
# Expected log messages:
# - "PostgreSQL workflow engine enabled (durable workflows)"
# - "PostgreSQL connection verified"
```

### 5.3 Verify Tables Auto-Created

```bash
docker exec -it workflow-postgres psql -U workflow -d workflow -c "\dt workflow_*"

# Expected output:
#  Schema |           Name            | Type  |  Owner
# --------+---------------------------+-------+----------
#  public | workflow_cluster_messages | table | workflow
#  public | workflow_cluster_replies  | table | workflow
#  public | workflow_cluster_runners  | table | workflow
```

---

## 6. Configuration Mapping (Production vs Local)

| Component | Production (GCE) | Local Docker |
|-----------|------------------|--------------|
| PostgreSQL Image | `postgres:15-alpine` | `postgres:15-alpine` |
| Host | VPC internal IP | `localhost` |
| Port | `5432` | `5432` |
| Database | `workflow` | `workflow` |
| Username | `workflow` | `workflow` |
| Password | Secret Manager | `workflow` (plaintext) |
| Storage | 10GB persistent disk | Docker volume |
| Network | VPC private | Docker bridge |

---

## 7. Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL container is running: `docker compose up -d postgres`

### Authentication Failed
```
Error: password authentication failed for user "workflow"
```
**Solution**: Verify `.env.postgres` has `POSTGRES_PASSWORD=workflow`

### Tables Not Created
If workflow tables are missing after starting the server, check server logs for database connection errors.

---

## 8. Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `docker-compose.yml` | Modify | Add postgres service |
| `packages/@core-v2/.env.postgres` | Create | PostgreSQL-enabled env |
| `packages/@core-v2/package.json` | Modify | Add convenience scripts |
| `scripts/dev-postgres.sh` | Create | Quick start script |
