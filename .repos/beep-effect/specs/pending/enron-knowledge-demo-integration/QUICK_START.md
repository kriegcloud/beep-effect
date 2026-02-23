# Enron Knowledge Demo Integration Quick Start

> 5-minute operator guide for this spec.

---

## 1) Read In This Order

1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `RUBRICS.md`
4. `REFLECTION_LOG.md`
5. current handoff pair in `handoffs/`

---

## 2) Confirm Locked Decisions

All phases must preserve:

1. curated Enron scenarios only
2. explicit `Ingest Scenario` action
3. deterministic extraction cap of 25 docs/scenario
4. org-scoped persistence defaults (RLS-aligned)
5. live LLM-backed meeting prep
6. runtime RPC at `/v1/knowledge/rpc` with NDJSON
7. internal feature gate `ENABLE_ENRON_KNOWLEDGE_DEMO`

---

## 3) Validate Handoff Pair Completeness

A phase transition is incomplete unless both files exist:

- `handoffs/HANDOFF_P[N].md`
- `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`

Every `HANDOFF_P[N].md` must include a context budget audit table.

---

## 4) First Command Set

Run at repo root:

```bash
bun --version
bun run check --filter @beep/todox
bun run check --filter @beep/server
bun run check --filter @beep/runtime-server
bun run check --filter @beep/knowledge-server
```

Then run `bun run test --filter ...` for each package touched in the active phase.

---

## 5) Phase Entry/Exit Snapshot

## P1 Discovery

Entry:

- scaffolding complete

Exit:

- `codebase-context.md`, `current-vs-target-matrix.md`, `scenario-catalog.md`, `ingestion-flow.md`

## P2 RPC Migration

Entry:

- P1 outputs accepted

Exit:

- default knowledge-demo flow is RPC-backed and ingest status UX is implemented

## P3 Meeting Prep Rewrite

Entry:

- P2 integration path operational

Exit:

- LLM synthesis active with evidence-link invariants retained

## P4 Demo Validation

Entry:

- P3 merged and stable

Exit:

- multi-scenario ingest/query/meeting-prep path validated, risks documented

## P5 Closure

Entry:

- P4 validation complete

Exit:

- final `spec-reviewer` score is 5.0/5 and closure handoff pair exists

---

## 6) Determinism Rules

1. scenario ordering must be stable and documented
2. ontology source remains `tooling/cli/src/commands/enron/test-ontology.ttl`
3. no random sampling in default demo path
4. report exact blockers when environment dependencies are unavailable

---

## 7) Delegation Requirements

1. delegate multi-file research and review tasks
2. append each delegated run to `outputs/delegation-log.md`
3. require artifact outputs with concrete file references

---

## 8) Before Running Final Review

1. ensure required phase artifacts exist
2. ensure next-phase handoff pair exists
3. ensure reflection for completed phase is concrete
4. ensure touched-package checks/tests ran and were summarized
5. then run strict `spec-reviewer`
