# HANDOFF_P3: Enron Knowledge Demo Integration

## Working Context (<=2K tokens)

### Phase 2 Completion Summary

Phase 2 is implemented and verified for touched package `@beep/todox`.

Completed outputs:
- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`

Implemented code outcomes:
- Dedicated knowledge RPC client now uses websocket endpoint `/v1/knowledge/rpc` with NDJSON transport.
- Default `knowledge-demo` flow no longer depends on mock extraction/query actions.
- Curated scenario ingest is explicit (`Ingest Scenario`) with visible lifecycle state.
- Ingest payload preparation is deterministic and curated-only, with 25-doc cap.
- Route-level internal gate `ENABLE_ENRON_KNOWLEDGE_DEMO` is active (`notFound()` when disabled).
- Meeting prep rewrite is intentionally not touched (still Phase 3).

Primary files changed in Phase 2:
- `apps/todox/src/app/knowledge-demo/rpc-client.ts`
- `apps/todox/src/app/knowledge-demo/actions.ts`
- `apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx`
- `apps/todox/src/app/knowledge-demo/page.tsx`
- `apps/todox/src/app/knowledge-demo/components/EmailInputPanel.tsx`
- `apps/todox/src/app/knowledge-demo/components/GraphRAGQueryPanel.tsx`
- `apps/todox/src/app/knowledge-demo/components/QueryInput.tsx`
- `apps/todox/src/app/knowledge-demo/types.ts`
- `apps/todox/src/app/knowledge-demo/constants.ts`
- `apps/todox/src/app/knowledge-demo/data/scenarios.ts`

### Phase 3 Objective

Rewrite `meetingprep_generate` to produce meaningful LLM-backed synthesis grounded in persisted evidence/relations while preserving all persistence/evidence invariants.

### P3 Hard Constraints To Preserve

- No template relation-id bullet text.
- No `Effect.die` / `Effect.orDie` on recoverable paths.
- Evidence links returned from meeting prep must resolve through `Evidence.List`.
- Preserve org-scoped behavior and persistence contracts.
- Keep P2 ingest/query pathway intact (no regression to mock/default synthetic behavior).

## Episodic Context (<=1K tokens)

- P1 identified partial RPC method implementation and required P2 to avoid unimplemented methods.
- P2 intentionally used only implemented knowledge methods (`batch_start`, `batch_getStatus`, `graphrag_query`).
- P2 added explicit lifecycle UX and route gating with no silent ingest.
- P2 verification passed for touched package (`@beep/todox` check/test).

## Semantic Context (<=500 tokens)

P3 focus files:
- `packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts`
- `packages/knowledge/domain/src/entities/MeetingPrep/contracts/Generate.contract.ts`
- `packages/knowledge/domain/src/entities/Evidence/contracts/List.contract.ts`

P2 output references:
- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`

Behavioral invariant to retain:
- Curated scenario ingest + graph query path in `apps/todox/src/app/knowledge-demo/*` remains unchanged except if strictly required for meeting-prep integration.

## Procedural Context (links only)

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 1050 | <=2000 | OK |
| Episodic | 220 | <=1000 | OK |
| Semantic | 240 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1510 | <=4000 | OK |

## Verification Evidence From Phase 2

Executed:

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
```

Result:
- check: pass
- test: pass (47 passing, 0 failing)

## Verification Expectations For Phase 3

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run check --filter @beep/runtime-server
bun run test --filter @beep/runtime-server
```

Also produce:
- `outputs/meeting-prep-rewrite-notes.md`
- `outputs/evidence-chain-regression-check.md`
