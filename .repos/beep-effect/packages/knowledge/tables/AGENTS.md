# @beep/knowledge-tables — Agent Guide

## Purpose & Fit
- Drizzle ORM table definitions for the knowledge graph vertical slice.
- Provides `pgvector`-compatible embedding storage with dimension constraints.
- Defines database schema, relations, and PG enum factories for knowledge entities.
- Bridges domain models from `@beep/knowledge-domain` to PostgreSQL persistence.

## Surface Map
- **Tables (`src/tables/`)**
  - `embedding.table.ts` — Vector embedding storage with `pgvector` type and composite indexes.
- **Relations (`src/relations.ts`)** — Drizzle relation definitions for graph traversal queries.
- **Schema (`src/schema.ts`)** — Unified schema export for Drizzle migrations.
- **Check (`src/_check.ts`)** — Type verification ensuring table-domain alignment.

## Usage Snapshots
- `packages/knowledge/server/src/db.ts` — Imports schema for database client configuration.
- `packages/_internal/db-admin/` — Migration generation references these table definitions.
- `packages/knowledge/server/src/db/repos/` — Repositories use tables for typed queries.

## Authoring Guardrails
- ALWAYS use `@beep/shared-tables` column helpers for common patterns (IDs, timestamps, audit fields).
- PG enums MUST be created via domain schema kit `make*PgEnum` utilities.
- NEVER duplicate column definitions—inherit from shared column factories.
- Table names MUST use snake_case; column names auto-transform via Drizzle config.
- Foreign keys MUST reference parent tables via `.references()` with proper cascade rules.

## Quick Recipes
```ts
import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { columns } from "@beep/shared-tables";
import { vector } from "@beep/shared-tables/columns";

export const embeddingTable = pgTable(
  "embedding",
  {
    ...columns.withRowAndVersion(),
    ...columns.withAuditFields(),
    id: columns.primaryId("emb"),
    organizationId: columns.organizationId(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => [
    index("embedding_org_idx").on(table.organizationId),
  ]
);
```

## Verifications
- `bun run check --filter @beep/knowledge-tables`
- `bun run lint --filter @beep/knowledge-tables`
- `bun run db:generate` — Verify migration generation succeeds.

## Contributor Checklist
- [ ] Table changes regenerated via `bun run db:generate`.
- [ ] Indexes added for frequently queried columns.
- [ ] Relations defined for cross-table joins.
- [ ] Domain model alignment verified via `_check.ts`.
