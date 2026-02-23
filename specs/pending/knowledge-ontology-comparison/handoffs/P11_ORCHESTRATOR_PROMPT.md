# P11 Orchestrator Prompt: TodoX Wealth Management Demo MVP (Execution)

You are the orchestrator for Phase 11 in the `beep-effect` monorepo.

## Goal

Ship a demoable end-to-end workflow in `apps/todox`:

1. Signed-in TodoX user can pull a bounded Gmail sync (query preset).
2. Emails are materialized as Documents with stable IDs and de-dupe.
3. Knowledge extraction runs durably as a batch with visible progress.
4. Extraction results are persisted (entities/relations/embeddings/extraction rows).
5. TodoX “Knowledge Base” view visualizes the graph and supports GraphRAG queries.
6. Clicking entities/relations shows provenance back to the source email text.
7. Wealth management ontology is used via registry/storage, but the TTL stays in TodoX boundary.

## Read These First

1. `specs/pending/knowledge-ontology-comparison/outputs/P10_TODOX_E2E_GMAIL_KNOWLEDGE_PLAN.md`
2. `specs/pending/knowledge-ontology-comparison/outputs/P11_TODOX_WEALTH_MGMT_DEMO_EXECUTION_SPEC.md`
3. `packages/runtime/server/src/GoogleWorkspace.layer.ts` (AuthContext construction constraint)
4. `packages/runtime/server/src/AuthContext.layer.ts` (AuthContext semantics)

## Non-Negotiables

- Do not reimplement AuthContext semantics in TodoX.
- Do not rebuild Gmail integration from scratch.
- Do not ship extraction without persistence to SQL + embeddings.
- No `any`, no `@ts-ignore`, no unchecked casts.
- Validate external data with Schema (`@beep/schema`) where feasible.
- Do not start long-running dev servers without confirmation.
- Preserve Phase 9 boundary: TodoX-specific ontology content stays in TodoX.

## Parallel Workstreams (Delegate)

### Stream A: AuthContext Bridge (Next.js)

Deliver:
- `@beep/runtime-server` helper to build `AuthContext` from request headers.
- Tests proving valid cookie header yields a context, invalid/missing yields Unauthorized.

References:
- `packages/runtime/server/src/AuthContext.layer.ts`
- `apps/todox/src/app/api/liveblocks-auth/route.ts`

### Stream B: TodoX Gmail API (Preview + Sync)

Deliver:
- `GET /api/integrations/gmail/extract-preview`
- Clear handling for `GoogleScopeExpansionRequiredError` (structured response)

References:
- `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`

### Stream C: Document Materialization + Mapping Table

Deliver:
- mapping `(orgId, "gmail", gmailMessageId) -> documentId`
- upsert semantics + tests

### Stream D: Knowledge Ingestion Persistence

Deliver:
- authoritative ingestion persistence for entities/relations/embeddings/extraction rows
- idempotency tests
- GraphRAG “query returns data after ingest” test

References:
- `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`
- `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`

### Stream E: TodoX Knowledge Base UI

Deliver:
- Replace `"knowledge-base"` placeholder in `apps/todox/src/app/page.tsx`
- UI integrates sync, batch progress, graph viz (real data), GraphRAG query, provenance panel

## Orchestrator Verification Checklist

1. Gmail preview endpoint works for a real session cookie.
2. Re-sync does not create duplicate documents.
3. Batch extraction runs with progress and survives refresh (demo env uses durable workflow mode).
4. Entities/relations/embeddings exist and GraphRAG returns non-empty context.
5. Knowledge Base UI is fully integrated end-to-end.
6. Ontology is loaded from registry/storage and used by default in TodoX.

Suggested commands:

```bash
bun run check --filter @beep/runtime-server
bun run test  --filter @beep/runtime-server

bun run check --filter @beep/knowledge-server
bun run test  --filter @beep/knowledge-server

bun run check --filter @beep/documents-server
bun run test  --filter @beep/documents-server

bun run check --filter @beep/todox
```

