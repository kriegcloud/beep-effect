# HANDOFF_P1: Enron Knowledge Demo Integration

> Kickoff context for implementing the new spec.

---

## Working Context (<=2K tokens)

### Goal

Replace `apps/todox/src/app/knowledge-demo` mock behavior with real Enron-backed extraction, GraphRAG, and meeting prep.

### Mandatory Decisions Already Locked

1. curated scenario dataset only
2. multi-scenario support
3. explicit ingest action in UI
4. extraction scope = full thread, deterministic cap 25 docs
5. persistence org-scoped (RLS default behavior)
6. internal-use gate with `ENABLE_ENRON_KNOWLEDGE_DEMO`
7. meeting prep handler rewritten for live LLM synthesis

### Architecture Targets

- runtime RPC server path: `/v1/knowledge/rpc`
- serialization: NDJSON
- client model: `@effect-atom/atom-react` via `AtomRpc.Tag`
- server runtime composition: `packages/runtime/server/src/Rpc.layer.ts` and `apps/server`

### Required P1 Outputs

1. `outputs/codebase-context.md`
2. `outputs/current-vs-target-matrix.md`
3. `outputs/scenario-catalog.md`
4. `outputs/ingestion-flow.md`

### P1 Exit Criteria

1. mock replacement points are explicitly mapped by file
2. RPC pathway and protocol details are validated
3. scenario catalog ordering and rationale are deterministic
4. ingestion lifecycle includes retry/idempotency rules

---

## Episodic Context (<=1K tokens)

- Prior spec (`enron-data-pipeline`) produced curated extraction and meeting-prep validation artifacts.
- Current `knowledge-demo` behavior is mock-backed by `apps/todox/src/app/knowledge-demo/actions.ts` and related UI helpers.
- This spec is a separate integration effort focused on replacing the demo path with real persisted knowledge data.

---

## Semantic Context (<=500 tokens)

Curated sources:

- `s3://static.vaultctx.com/todox/test-data/enron/curated/threads.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/documents.json`
- `s3://static.vaultctx.com/todox/test-data/enron/curated/manifest.json`

Default ontology source:

- `tooling/cli/src/commands/enron/test-ontology.ttl`

---

## Procedural Context (links only)

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `REFLECTION_LOG.md`

---

## Immediate Tasks

1. map existing mock architecture and replacement points
2. define deterministic scenario catalog with rationale
3. define ingestion flow and status contract
4. produce next-phase handoff pair for P2

---

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 980 | <=2000 | OK |
| Episodic | 250 | <=1000 | OK |
| Semantic | 190 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1420 | <=4000 | OK |

---

## Verification Expectations

At phase end, run checks/tests for touched packages from:

- `@beep/todox`
- `@beep/server`
- `@beep/runtime-server`
- `@beep/knowledge-server`

If commands fail, capture the first actionable error in the phase artifact set.
