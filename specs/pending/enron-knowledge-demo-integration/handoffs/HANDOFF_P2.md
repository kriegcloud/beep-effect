# HANDOFF_P2: Enron Knowledge Demo Integration

## Working Context (<=2K tokens)

### Phase 1 Completed Outputs

- `outputs/codebase-context.md`
- `outputs/current-vs-target-matrix.md`
- `outputs/scenario-catalog.md`
- `outputs/ingestion-flow.md`

### Phase 2 Objective

Migrate `knowledge-demo` default path from local mocks to real Atom RPC flows with explicit scenario ingest lifecycle.

### Critical Discoveries From P1 (Must Carry Forward)

1. Server runtime knowledge RPC endpoint is `/v1/knowledge/rpc` over WebSocket + NDJSON (`packages/runtime/server/src/Rpc.layer.ts`).
2. Existing shared client constructor still targets `/v1/shared/rpc` (`packages/shared/client/src/constructors/RpcClient.ts`).
3. `apps/todox/src/app/knowledge-demo/actions.ts` is entirely mock/synthetic and is the primary replacement seam.
4. RPC method coverage is partial:
   - `batch_*`: implemented
   - `entity_get/list/count`: implemented, others not implemented
   - `relation_*`: not implemented
   - `graphrag_query`: implemented, `graphrag_queryFromSeeds` not implemented
   - `evidence_list`: implemented
5. Feature gate `ENABLE_ENRON_KNOWLEDGE_DEMO` is required by spec but not implemented in the route yet.
6. Meeting prep rewrite to live LLM synthesis is deferred to Phase 3, but requirement must remain preserved.

### Locked Constraints

- Curated scenarios only
- Explicit `Ingest Scenario` action
- Full-thread extraction cap = 25 docs/scenario
- Feature gate `ENABLE_ENRON_KNOWLEDGE_DEMO`
- RPC path/serialization must match runtime server (`/v1/knowledge/rpc`, NDJSON)
- No silent fallback to mock entities/relations/actions in default path

### Success Checklist For P2

- [ ] Default flow no longer calls mock `extractFromText` / `queryGraphRAG` actions
- [ ] Knowledge RPC client wiring is explicit and points to `/v1/knowledge/rpc` with NDJSON
- [ ] Scenario ingest lifecycle is visible (`pending/extracting/resolving/completed/failed/cancelled`)
- [ ] Duplicate ingest starts are deterministically blocked client-side
- [ ] Scenario switching keeps org-scoped persisted state coherent
- [ ] Route is internally gated behind `ENABLE_ENRON_KNOWLEDGE_DEMO`

## Episodic Context (<=1K tokens)

- P0 established critical spec structure and workflow controls.
- P1 established deterministic four-scenario catalog and deterministic 25-doc ingest selection rule.
- P1 confirmed protocol details and surfaced RPC implementation gaps that affect migration strategy.
- P1 kept meeting prep rewrite explicitly deferred to P3.

## Semantic Context (<=500 tokens)

- Ontology source: `tooling/cli/src/commands/enron/test-ontology.ttl`
- Curated scenario source: `specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.json`
- Runtime endpoint: `/v1/knowledge/rpc` + WebSocket + NDJSON
- Likely touched packages in P2: `@beep/todox`, `@beep/shared-client` (or todox-local equivalent), possibly `@beep/runtime-client`
- Meeting prep handler exists (`meetingprep_generate`) but currently emits template relation-ID bullets (Phase 3 concern)

## Procedural Context (links only)

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `outputs/codebase-context.md`
- `outputs/current-vs-target-matrix.md`
- `outputs/scenario-catalog.md`
- `outputs/ingestion-flow.md`

## Immediate P2 Work Plan

1. Introduce knowledge RPC client construction for `/v1/knowledge/rpc` + NDJSON in todox client path.
2. Replace mock action invocation path in `knowledge-demo/page.tsx` and related panels with atom-based RPC calls.
3. Replace sample-email selection with deterministic curated scenario cards and explicit ingest button.
4. Implement scenario ingest state machine from `BatchState` and wire status polling/streaming.
5. Avoid unimplemented relation RPC methods in default flow (derive relation display from available responses or scope UI behavior).
6. Add route-level feature gate (`ENABLE_ENRON_KNOWLEDGE_DEMO`).

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 1250 | <=2000 | OK |
| Episodic | 320 | <=1000 | OK |
| Semantic | 280 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1850 | <=4000 | OK |

## Verification Expectations For Phase 2

Run for touched packages:

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
bun run check --filter @beep/shared-client
bun run test --filter @beep/shared-client
bun run check --filter @beep/runtime-client
bun run test --filter @beep/runtime-client
```

If any command fails, record the first actionable error in phase outputs.
