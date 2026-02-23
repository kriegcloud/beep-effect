# Ingestion Flow Design (Phase 1)

## Non-Negotiable Constraints

1. Curated scenarios only.
2. Explicit ingest action (`Ingest Scenario`) only; no auto-ingestion.
3. Full-thread ingest capped at 25 docs per scenario.
4. Org-scoped persistence and reads.
5. Route gated by `ENABLE_ENRON_KNOWLEDGE_DEMO`.
6. Meeting prep live-LLM rewrite is later-phase scope, but requirement remains locked.

## End-to-End Flow

1. User opens route and selects one curated scenario.
2. User explicitly clicks `Ingest Scenario`.
3. Client assembles deterministic full-thread document set for that scenario (<=25 docs).
4. Client calls `batch_start` with org + ontology + docs.
5. Server returns `batchId`.
6. Client transitions scenario ingest state to `pending` and begins status tracking.
7. Client tracks state via `batch_getStatus` polling and/or `batch_streamProgress`.
8. On `BatchState.Completed`, client enables data query surfaces for the scenario.
9. Client reads/query surfaces via `entity_*`, `graphrag_query`, `evidence_list` (and later meeting prep).

## RPC Contracts Mapped to UX

| UX step | RPC method | Key payload fields | Expected result |
|---|---|---|---|
| Start ingest | `batch_start` | `organizationId`, `ontologyId`, `ontologyContent`, `documents[]` | `batchId`, `totalDocuments` |
| Observe status | `batch_getStatus` | `batchId` | `BatchState.*` tagged ADT |
| Stream progress (optional) | `batch_streamProgress` | `batchId` | `BatchEvent.*` stream |
| Query graph context | `graphrag_query` | `organizationId`, `query`, optional limits | entities + relations + context |
| List entities | `entity_list` | `organizationId`, optional filters | stream of entities |
| Resolve evidence | `evidence_list` | org + one-of filter | validated evidence spans |

## Ingest State Model (UI)

Map `BatchState` tags directly:

- `BatchState.Pending` -> `pending`
- `BatchState.Extracting` -> `extracting` (show `% = completedDocuments / totalDocuments`)
- `BatchState.Resolving` -> `resolving`
- `BatchState.Completed` -> `completed`
- `BatchState.Failed` -> `failed`
- `BatchState.Cancelled` -> `cancelled`

Unknown or missing batch state should be rendered as deterministic `failed` with explicit operator action (`Retry`).

## Idempotency and Retry Policy

1. Prevent duplicate start per scenario while state is `pending`, `extracting`, or `resolving`.
2. Allow `Retry Ingest` only from `failed` or `cancelled`.
3. Allow `Re-ingest` from `completed`, but only through explicit action.
4. Persist `scenarioId -> latestBatchId` mapping client-side so reloads keep deterministic status lookup.

Current server gap to account for:

- `batch_start` contract includes typed failures for duplicate/invalid transitions, but current handler path does not enforce duplicate-run rejection. Phase 2 must enforce duplicate-start prevention in client state until server guard is added.

## Deterministic Document Selection

For selected scenario thread:

1. Resolve all thread documents from curated dataset.
2. Sort by `(document.id, metadata.messageId)` ascending.
3. Take first 25 only.
4. Build `BatchDocument[]` as `{ documentId, text }`.
5. If no documents resolved, fail fast with deterministic user-facing error.

## Data Surface Gating After Ingest

After successful completion:

- Enable GraphRAG panel and evidence inspection.
- Use entity methods that are implemented (`entity_get`, `entity_list`, `entity_count`).
- Do not rely on unimplemented `relation_*` RPC methods without adding server support; where needed in P2, derive relation display from `graphrag_query` response until relation RPC implementation exists.

## Failure Handling

- `batch_start` transport/validation failure: inline error + `Retry`.
- In-flight failure state (`BatchState.Failed`): retain `batchId`, show failure reason, allow retry.
- WebSocket disconnect: keep last known state and switch to poll-only fallback.
- Evidence/query failures: keep ingest success state; fail feature locally without resetting batch lifecycle.

## Feature Gate Behavior

- If `ENABLE_ENRON_KNOWLEDGE_DEMO` is disabled, deny route access (404 or internal-only denial per app convention).
- No data fetches or ingest mutations should run when the gate is off.
