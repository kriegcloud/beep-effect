# Codebase Context: Enron Knowledge Demo Integration

## Current Demo State (Mock)

Primary mock implementation lives in:

- `apps/todox/src/app/knowledge-demo/actions.ts`
- `apps/todox/src/app/knowledge-demo/page.tsx`
- `apps/todox/src/app/knowledge-demo/components/*`

Observed behavior:

- Hardcoded mock entity and relation IDs
- Mock extraction path (`extractFromText`) with synthetic delay
- Mock GraphRAG path (`queryGraphRAG`) with synthetic context generation
- Client-side “resolution” simulation logic

This means current demo does not exercise runtime RPC, persistence, extraction workflows, or real evidence retrieval.

## Existing Runtime RPC Surface

Runtime server composition:

- `packages/runtime/server/src/Rpc.layer.ts`

Knowledge RPC groups already merged:

- `Batch`
- `Entity`
- `Relation`
- `GraphRag`
- `Evidence`
- `MeetingPrep`

Transport:

- websocket path: `/v1/knowledge/rpc`
- serialization: NDJSON (`RpcSerialization.layerNdjson`)

## Relevant Knowledge Contracts

- Batch ingestion: `packages/knowledge/domain/src/entities/Batch/contracts/StartBatch.contract.ts`
- Batch status: `packages/knowledge/domain/src/entities/Batch/contracts/GetBatchStatus.contract.ts`
- Graph query: `packages/knowledge/domain/src/entities/GraphRag/contracts/Query.contract.ts`
- Meeting prep: `packages/knowledge/domain/src/entities/MeetingPrep/contracts/Generate.contract.ts`
- Evidence list: `packages/knowledge/domain/src/entities/Evidence/contracts/List.contract.ts`
- Entity list: `packages/knowledge/domain/src/entities/Entity/contracts/List.contract.ts`
- Relation list: `packages/knowledge/domain/src/entities/Relation/contracts/ListByEntity.contract.ts`, `ListByPredicate.contract.ts`

## Important Backend Limitation

- `MeetingPrep` RPC exists, but current handler text is template-based relation metadata:
  - `packages/knowledge/server/src/entities/MeetingPrep/rpc/generate.ts`
- Spec requires rewrite to live LLM synthesis while preserving bullet/evidence persistence model.

## App Runtime Entry Points

- Server app package: `apps/server`
- Todox app package: `apps/todox`
- Runtime client/server packages: `packages/runtime/client`, `packages/runtime/server`

## Feature Flag Requirement

- Internal-only visibility required for demo route via `ENABLE_ENRON_KNOWLEDGE_DEMO`.

## Dependency/Boundary Notes

- Use package entrypoints and shared constructors, avoid deep ad-hoc imports where existing constructors exist.
- `packages/knowledge/client` is currently minimal and not yet a full SDK surface; todox likely needs app-local Atom RPC binding layer for this spec.

## Risks

1. Protocol mismatch (JSON vs NDJSON) can silently break RPC client calls.
2. Ingest UX must model async lifecycle (pending/running/completed/failed) to avoid ambiguous operator state.
3. Meeting prep rewrite can regress evidence linkage if bullet synthesis and citation selection are decoupled.
4. Existing resolution panel has no clear server RPC equivalent in current domain contracts; either implement RPC or scope UI behavior accordingly.
