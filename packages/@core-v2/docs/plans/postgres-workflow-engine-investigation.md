# PostgreSQL Workflow Engine Investigation

**Date**: December 11, 2025
**Status**: Investigation Complete
**Purpose**: Understand why ClusterWorkflowEngine is disabled and how to fix it

---

## Executive Summary

The PostgreSQL-backed `ClusterWorkflowEngine` is disabled because **the conditional logic was never wired up**. The code defines `ClusterWorkflowEngineLive` but then hardcodes `WorkflowEngine.layerMemory` unconditionally. This is a simple fix, but there are additional considerations around schema initialization and the `runnerStorage` option.

---

## 1. Current State Analysis

### 1.1 The Problem (server.ts lines 48-63)

```typescript
// Durable WorkflowEngine backed by PostgreSQL via @effect/cluster
const ClusterWorkflowEngineLive = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(SingleRunner.layer()),
  Layer.provideMerge(PgClientLive)
)

// Select workflow engine based on PostgreSQL availability
// TODO: Debug PostgreSQL-backed ClusterWorkflowEngine setup
// For now, use in-memory engine to unblock testing
const WorkflowEngineLive = WorkflowEngine.layerMemory  // <-- HARDCODED!
```

**What happens:**
1. Code checks `POSTGRES_HOST` env var ✓
2. Defines `ClusterWorkflowEngineLive` with PostgreSQL ✓
3. **Completely ignores it** and uses `WorkflowEngine.layerMemory` ✗
4. Logs misleading message: "PostgreSQL configured but using in-memory engine"

### 1.2 Layer Dependencies

From @effect/cluster docs, `ClusterWorkflowEngine.layer` requires:
- `Sharding.Sharding`
- `MessageStorage`

And `SingleRunner.layer()` provides:
- `Sharding.Sharding`
- `Runners.Runners`
- `MessageStorage.MessageStorage`

The composition is **correct in theory** but missing `runnerStorage: "sql"` option.

### 1.3 PostgresLayer.ts Already Exists

The file `src/Runtime/Persistence/PostgresLayer.ts` provides:
- `PgClientLive` - PostgreSQL client from environment
- `MessageStorageLive` - SqlMessageStorage with `workflow_` prefix
- `RunnerStorageLive` - SqlRunnerStorage with `workflow_` prefix
- `PostgresPersistenceLive` - Complete persistence stack

**This is well-designed but not being used in server.ts.**

---

## 2. Root Causes

### 2.1 Primary: Conditional Selection Never Implemented

The intended code should be:
```typescript
const WorkflowEngineLive = usePostgres
  ? ClusterWorkflowEngineLive
  : WorkflowEngine.layerMemory
```

But it's hardcoded to memory engine.

### 2.2 Missing: `runnerStorage: "sql"` Option

```typescript
// Current (incomplete):
SingleRunner.layer()

// Correct:
SingleRunner.layer({ runnerStorage: "sql" })
```

Without this, runner registration uses memory storage even with PostgreSQL.

### 2.3 Missing: Database Schema Initialization

The PostgreSQL instance is created via Terraform but there's no evidence the workflow schema was ever initialized. @effect/cluster auto-creates tables, but needs:
- Database to exist and be accessible
- User to have CREATE TABLE permissions

---

## 3. Required Changes

### 3.1 Fix server.ts Layer Selection

```typescript
// Replace line 56:
const WorkflowEngineLive = WorkflowEngine.layerMemory

// With:
const WorkflowEngineLive = usePostgres
  ? ClusterWorkflowEngineLive
  : WorkflowEngine.layerMemory
```

### 3.2 Fix ClusterWorkflowEngineLive Composition

```typescript
// Replace lines 48-51:
const ClusterWorkflowEngineLive = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(SingleRunner.layer()),
  Layer.provideMerge(PgClientLive)
)

// With:
const ClusterWorkflowEngineLive = ClusterWorkflowEngine.layer.pipe(
  Layer.provideMerge(
    SingleRunner.layer({
      runnerStorage: "sql"  // CRITICAL: Use SQL-backed runner storage
    })
  ),
  Layer.provideMerge(PgClientLive)
)
```

### 3.3 Add Database Readiness Check

```typescript
const checkDatabaseReady = Effect.gen(function*() {
  const client = yield* PgClient.PgClient
  yield* client.execute(sql`SELECT 1`)
  yield* Effect.logInfo("PostgreSQL connection verified")
}).pipe(
  Effect.timeout("10 seconds"),
  Effect.retry(Schedule.exponential("500 millis").pipe(Schedule.compose(Schedule.recurs(5)))),
  Effect.catchAll((e) =>
    Effect.fail(new Error(`Database not ready: ${e}`))
  )
)
```

### 3.4 Update Log Message

```typescript
// Replace lines 59-63:
if (usePostgres) {
  console.log(`PostgreSQL workflow engine enabled`)
} else {
  console.log("Using in-memory workflow engine (no POSTGRES_HOST configured)")
}
```

---

## 4. Database Schema

### 4.1 Auto-Created Tables

@effect/cluster auto-creates these with `workflow_` prefix:

**workflow_cluster_messages**:
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

**workflow_cluster_runners** (with `runnerStorage: "sql"`):
```sql
CREATE TABLE IF NOT EXISTS workflow_cluster_runners (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  shards INT[] NOT NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Optional: Pre-Create Schema

Create `infra/sql/workflow-schema.sql`:

```sql
-- Pre-create workflow tables to ensure permissions are correct
CREATE TABLE IF NOT EXISTS workflow_cluster_messages (
  id BIGINT PRIMARY KEY,
  shard_id INT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  message BYTEA NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_cluster_replies (
  request_id BIGINT PRIMARY KEY,
  reply BYTEA NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_cluster_runners (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  shards INT[] NOT NULL,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wcm_shard_entity
  ON workflow_cluster_messages(shard_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_wcr_heartbeat
  ON workflow_cluster_runners(last_heartbeat);
```

---

## 5. Testing Strategy

### 5.1 Local Testing with Docker

```bash
# Start PostgreSQL
docker run -d \
  --name workflow-postgres \
  -e POSTGRES_USER=workflow \
  -e POSTGRES_PASSWORD=workflow \
  -e POSTGRES_DB=workflow \
  -p 5432:5432 \
  postgres:15-alpine

# Set environment
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_USER=workflow
export POSTGRES_PASSWORD=workflow
export POSTGRES_DATABASE=workflow

# Run server
bun run packages/@core-v2/src/server.ts
```

### 5.2 Verify Tables Created

```bash
docker exec -it workflow-postgres psql -U workflow -d workflow -c "\dt workflow_*"
```

### 5.3 Crash Recovery Test

1. Start a batch extraction workflow
2. Kill the server mid-execution (`kill -9`)
3. Restart the server
4. Verify workflow resumes from last checkpoint

---

## 6. Implementation Checklist

### Phase 1: Fix Layer Wiring (30 min)

- [ ] Update `server.ts` to use conditional `WorkflowEngineLive`
- [ ] Add `runnerStorage: "sql"` to `SingleRunner.layer()` options
- [ ] Update log messages to reflect actual engine in use
- [ ] Add database readiness check before server launch

### Phase 2: Local Testing (1 hour)

- [ ] Start local PostgreSQL with Docker
- [ ] Run server with POSTGRES_HOST set
- [ ] Verify workflow tables are created
- [ ] Test crash recovery (kill and restart)

### Phase 3: Cloud Deployment (30 min)

- [ ] Deploy with `enable_postgres=true` in Terraform
- [ ] Verify Cloud Run can reach PostgreSQL via VPC connector
- [ ] Run extraction workflow and verify durability

### Phase 4: Production Hardening (optional)

- [ ] Add `/health/deep` check for database connectivity
- [ ] Add metric for workflow engine type
- [ ] Document non-durable mode as dev-only

---

## 7. Files to Modify

| File | Changes |
|------|---------|
| `src/server.ts` | Enable conditional WorkflowEngineLive, add readiness check |
| `infra/sql/workflow-schema.sql` | Optional: pre-create schema |

---

## 8. Risks

### Low Risk
- Layer composition changes are straightforward
- Auto-created tables should "just work"

### Medium Risk
- VPC connectivity between Cloud Run and PostgreSQL
- First-time schema creation permissions

### Mitigations
- Test locally with Docker first
- Verify VPC connector is properly configured
- Grant CREATE TABLE permissions to workflow user
