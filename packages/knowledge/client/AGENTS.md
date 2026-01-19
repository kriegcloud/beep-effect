# @beep/knowledge-client — Agent Guide

## Purpose & Fit
- Client-side contracts and handlers for the knowledge graph vertical.
- Provides RPC type definitions for knowledge extraction and query operations.
- Consumed by web applications for type-safe client-server communication.
- Bridges `@beep/knowledge-domain` types to frontend applications.

## Surface Map
- **Index (`src/index.ts`)** — Main barrel export for client contracts.
- **Contracts** — RPC schema definitions for knowledge operations.
- **Handlers** — Effect-based handlers for client-side knowledge operations.

## Usage Snapshots
- `apps/web/` — Imports knowledge client for GraphRAG query interface.
- `packages/knowledge/server/` — Server implements contracts defined here.

## Authoring Guardrails
- ALWAYS define contracts using `@effect/rpc` schema patterns.
- Client handlers MUST be Effect-based, never using raw async/await.
- NEVER import server-side code; client package is browser-safe.
- Contracts MUST match server implementation exactly for type safety.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { KnowledgeContract } from "@beep/knowledge-client";

// Use knowledge client in application
const queryKnowledgeGraph = (query: string) =>
  Effect.gen(function* () {
    const client = yield* KnowledgeContract.Client;
    const results = yield* client.search({ query, limit: 10 });
    return results;
  });
```

## Verifications
- `bun run check --filter @beep/knowledge-client`
- `bun run lint --filter @beep/knowledge-client`
- `bun run test --filter @beep/knowledge-client`

## Contributor Checklist
- [ ] Contract changes synchronized with server implementation.
- [ ] No server-side imports in client package.
- [ ] Effect patterns used throughout (no async/await).
