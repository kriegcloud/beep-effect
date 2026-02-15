# HANDOFF_P2: Enron Knowledge Demo Integration

## Working Context (<=2K tokens)

### Phase 1 Completed Outputs

- `outputs/codebase-context.md`
- `outputs/current-vs-target-matrix.md`
- `outputs/scenario-catalog.md`
- `outputs/ingestion-flow.md`

### Phase 2 Objective

Migrate `knowledge-demo` from mock actions to real Atom RPC client flows, including explicit ingest status lifecycle.

### Locked Constraints

- Curated scenarios only
- Explicit `Ingest Scenario` action
- Full-thread extraction cap = 25 docs/scenario
- Feature gate `ENABLE_ENRON_KNOWLEDGE_DEMO`
- RPC path/serialization must match runtime server (`/v1/knowledge/rpc`, NDJSON)

### Success Checklist For P2

- [ ] mock path removed from default flow
- [ ] Atom RPC queries/mutations operational
- [ ] ingest lifecycle rendered in UI
- [ ] multi-scenario switching works

## Episodic Context (<=1K tokens)

- P0 established critical spec structure and workflow controls.
- P1 identified that extraction should use Batch RPC contracts.
- P1 identified that meeting prep rewrite is a separate server phase (P3).

## Semantic Context (<=500 tokens)

- Ontology source: `tooling/cli/src/commands/enron/test-ontology.ttl`
- RPC groups in runtime server: Batch, Entity, Relation, GraphRag, Evidence, MeetingPrep
- packages touched in P2 likely: `@beep/todox`, `@beep/runtime-client`, maybe `@beep/server`

## Procedural Context (links only)

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `outputs/codebase-context.md`
- `outputs/current-vs-target-matrix.md`
- `outputs/scenario-catalog.md`
- `outputs/ingestion-flow.md`

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 850 | <=2000 | OK |
| Episodic | 250 | <=1000 | OK |
| Semantic | 180 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1280 | <=4000 | OK |

## Verification Expectations For Phase 2

Run for touched packages:

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
bun run check --filter @beep/runtime-client
bun run test --filter @beep/runtime-client
bun run check --filter @beep/server
bun run test --filter @beep/server
```

If any command fails, record the first actionable error in phase outputs.
