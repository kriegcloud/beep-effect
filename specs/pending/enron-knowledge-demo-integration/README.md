# Enron Knowledge Demo Integration

> Replace `apps/todox/src/app/knowledge-demo` mock behavior with real Enron-backed extraction, GraphRAG, and LLM meeting prep over runtime RPC.

---

## Purpose

`knowledge-demo` currently relies on hardcoded entities, relations, and synthetic timing. This spec upgrades the route into an internal product demo backed by persisted Enron-derived knowledge data and real RPC workflows.

Demo target flow:

1. select curated scenario
2. ingest/extract into org-scoped persistence
3. browse real entities/relations and GraphRAG context
4. generate live LLM-backed meeting prep
5. inspect evidence references by source spans

---

## In Scope

1. replace mock data/actions in `apps/todox/src/app/knowledge-demo`
2. deterministic curated scenario support (multi-scenario)
3. explicit scenario ingestion trigger with lifecycle UX
4. persisted org-scoped extraction data
5. runtime RPC wiring through `packages/runtime/server/src/Rpc.layer.ts` and `apps/server`
6. Atom RPC client usage in todox (`@effect-atom/atom-react`)
7. rewrite meeting prep generation to live synthesis while preserving evidence model
8. gate demo via `ENABLE_ENRON_KNOWLEDGE_DEMO`

## Out of Scope

1. public/customer rollout
2. non-curated dataset browsing
3. wholesale graph UI framework rewrite
4. broad unrelated refactors

---

## Locked Decisions

1. this is a separate spec from `enron-data-pipeline`
2. curated dataset only (`threads/documents/manifest`)
3. explicit `Ingest Scenario` user action
4. extraction cap `maxDocumentsPerScenario = 25`
5. org-scoped persistence aligned with RLS defaults
6. meeting prep output is live LLM-backed
7. runtime RPC endpoint `/v1/knowledge/rpc` with NDJSON
8. internal feature gate `ENABLE_ENRON_KNOWLEDGE_DEMO`

---

## Constraints

1. preserve monorepo boundaries and Effect patterns (`no any`, no unchecked casts, no `@ts-ignore`)
2. do not start long-running dev servers unless required
3. preserve deterministic scenario ordering and reporting
4. avoid cross-slice direct imports; use package entrypoints/aliases
5. preserve evidence-chain invariants for meeting prep bullets

---

## Architecture Target

Data/control path:

1. scenario catalog displayed in todox
2. user triggers ingest
3. RPC mutation starts extraction batch
4. extraction uses curated docs + ontology payload
5. UI observes batch status
6. UI loads entities/relations/GraphRAG from persisted data
7. UI requests meeting prep through RPC
8. evidence panel resolves references with `Evidence.List`

Default ontology source:

- `tooling/cli/src/commands/enron/test-ontology.ttl`

---

## Success Criteria

- [ ] `knowledge-demo` default path no longer uses mock entities/relations/actions
- [ ] deterministic multi-scenario picker is implemented
- [ ] `Ingest Scenario` runs real extraction and shows lifecycle state
- [ ] extracted data persists and is visible within org scope
- [ ] GraphRAG panel shows real persisted context
- [ ] meeting prep returns live synthesized bullets (not template relation IDs)
- [ ] evidence references resolve by `Evidence.List` and support source inspection
- [ ] route is hidden when `ENABLE_ENRON_KNOWLEDGE_DEMO` is disabled
- [ ] phase artifacts and reflection are updated throughout execution
- [ ] verification gates pass for touched packages

---

## Phase Map

1. P0 Scaffolding: critical spec structure and initial handoff chain
2. P1 Discovery: mock-to-real map, scenario catalog, ingestion design
3. P2 RPC Migration: Atom RPC client wiring + ingest lifecycle UX
4. P3 Meeting Prep Rewrite: live synthesis with evidence invariants
5. P4 Demo Validation: multi-scenario end-to-end validation + risks
6. P5 Closure: final review score, closure handoff, completion readiness

Execution details and transition guards live in:

- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `AGENT_PROMPTS.md`

---

## Verification Gates

Run for touched packages:

```bash
bun run check --filter @beep/todox
bun run test --filter @beep/todox
bun run check --filter @beep/server
bun run test --filter @beep/server
bun run check --filter @beep/runtime-server
bun run test --filter @beep/runtime-server
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

Also produce deterministic smoke evidence in `outputs/demo-validation.md`.

---

## Related Inputs

- `specs/pending/enron-data-pipeline/outputs/extraction-results.md`
- `specs/pending/enron-data-pipeline/outputs/extraction-results.json`
- `specs/pending/enron-data-pipeline/outputs/meeting-prep-quality.md`
