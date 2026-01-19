# @beep/knowledge-server — Agent Guide

## Purpose & Fit
- Server infrastructure for the knowledge graph vertical: repositories, services, and database access.
- Implements Effect-based repositories for knowledge entities using `@beep/shared-server` patterns.
- Provides embedding storage and retrieval with `pgvector` similarity search.
- Consumes domain models from `@beep/knowledge-domain` and tables from `@beep/knowledge-tables`.

## Surface Map
- **Database (`src/db.ts`)** — Knowledge slice database client factory using `DbClient.make`.
- **Repositories (`src/db/repos/`)**
  - `Embedding.repo.ts` — Repository for vector embeddings with similarity search methods.
- **Services** — Business logic services for knowledge extraction and graph operations.

## Usage Snapshots
- `packages/runtime/server/src/DataAccess.layer.ts` — Composes knowledge repositories into server runtime.
- `packages/knowledge/client/` — RPC handlers reference server services.
- Test suites use testcontainers for `pgvector`-enabled Postgres integration tests.

## Authoring Guardrails
- ALWAYS use `DbRepo.make` for repository creation with proper service dependencies.
- NEVER access database directly; use repository pattern with `makeQuery` helpers.
- Effect Config MUST be used for all environment-dependent values.
- Repositories MUST extend base CRUD methods with domain-specific queries via `maker` block.
- Similarity search MUST use `pgvector` operators (`<->`, `<#>`, `<=>`) for vector distance.

## Quick Recipes
```ts
import { DbRepo } from "@beep/shared-server";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { Embedding } from "@beep/knowledge-domain/entities";
import { KnowledgeDb } from "../db";
import * as Effect from "effect/Effect";

export class EmbeddingRepo extends Effect.Service<EmbeddingRepo>()(
  "@beep/knowledge-server/repos/EmbeddingRepo",
  {
    dependencies: [KnowledgeDb.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const baseRepo = yield* DbRepo.make(
        KnowledgeEntityIds.EmbeddingId,
        Embedding.Model,
        Effect.gen(function* () {
          const { makeQuery } = yield* KnowledgeDb;

          const findSimilar = makeQuery(
            (execute, embedding: number[], limit: number) =>
              execute((client) =>
                client.query.embedding.findMany({
                  orderBy: (table, { sql }) =>
                    sql`${table.embedding} <-> ${embedding}`,
                  limit,
                })
              )
          );

          return { findSimilar };
        })
      );
      return baseRepo;
    }),
  }
) {}
```

## Verifications
- `bun run check --filter @beep/knowledge-server`
- `bun run lint --filter @beep/knowledge-server`
- `bun run test --filter @beep/knowledge-server`

## Contributor Checklist
- [ ] Repositories use `DbRepo.make` with proper domain ID schemas.
- [ ] Custom queries placed in `maker` block with proper typing.
- [ ] Telemetry spans added via `Effect.withSpan` for observability.
- [ ] Integration tests added for new repository methods.
