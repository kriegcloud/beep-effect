# HANDOFF_P1: Enron Knowledge Demo Integration

> Kickoff context for implementing the new spec.

---

## Working Context (<=2K tokens)

### Goal

Replace `apps/todox/src/app/knowledge-demo` mock behavior with real Enron-backed extraction, GraphRAG, and meeting prep.

### Mandatory Decisions Already Locked

1. Curated scenario dataset only
2. Multi-scenario support
3. Explicit ingest action in UI
4. Extraction scope = full thread, deterministic cap 25 docs
5. Persistence org-scoped (RLS default behavior)
6. Internal-use gate with `ENABLE_ENRON_KNOWLEDGE_DEMO`
7. Meeting prep handler must be rewritten for live LLM synthesis

### Architecture Targets

- Runtime RPC server path: `/v1/knowledge/rpc`
- Serialization: NDJSON
- Client model: `@effect-atom/atom-react` RPC atoms (`AtomRpc.Tag`)
- Server runtime composition: `packages/runtime/server/src/Rpc.layer.ts` and `apps/server`

---

## Episodic Context (<=1K tokens)

- Prior spec (`enron-data-pipeline`) already produced curated data + extraction/meeting prep validation artifacts.
- Current `knowledge-demo` is mock-backed via `apps/todox/src/app/knowledge-demo/actions.ts`.
- This spec is a fresh integration spec to replace that mock path with real persisted data flows.

---

## Semantic Context (<=500 tokens)

- Curated sources:
  - `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
  - `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
  - `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`
- Default ontology source decision:
  - `tooling/cli/src/commands/enron/test-ontology.ttl`

---

## Procedural Context (links only)

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `REFLECTION_LOG.md`

---

## Immediate Phase 1 Tasks

1. Produce discovery output files:
   - `outputs/codebase-context.md`
   - `outputs/current-vs-target-matrix.md`
2. Map RPC contracts currently available vs missing
3. Define deterministic scenario catalog schema for UI use
4. Define ingestion request/response and status polling contract in todox-side integration plan

---

## Verification Expectations

At minimum by phase end, run checks/tests for touched packages from:

- `@beep/todox`
- `@beep/server`
- `@beep/runtime-server`
- `@beep/knowledge-server`
