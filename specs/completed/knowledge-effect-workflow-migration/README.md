# knowledge-effect-workflow-migration

Migrate the knowledge slice workflow runtime to `@effect/workflow` with parity against `.repos/effect-ontology`, then remove superseded custom workflow code.

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | Discovery + compatibility assessment | READY |
| P2 | Target architecture + migration design | PLANNED |
| P3 | Runtime implementation + persistence | PLANNED |
| P4 | Cutover + behavioral parity | PLANNED |
| P5 | Legacy code deletion | PLANNED |
| P6 | Hardening + final verification | PLANNED |

## Why This Spec Exists

The current workflow stack in `packages/knowledge/server/src/Workflow/*` has grown through incremental parity work and now diverges from the effect-ontology reference implementation. That divergence increases maintenance cost and makes future parity phases slower.

This spec standardizes on `@effect/workflow` to align with reference architecture and reduce future integration friction.

## Important Reality Check

Porting from subtree reference is likely faster than greenfield, but not automatically straightforward. Risk factors to validate in P1:
- `@effect/workflow` API/version drift between local dependencies and subtree reference
- runtime wiring differences (`Layer` composition, DB lifecycle, observability hooks)
- persistence model mismatch with current knowledge tables
- behavior currently encoded outside workflow engine (custom retries/idempotency conventions)

The migration plan treats these as explicit validation steps, not assumptions.

## Scope

In scope:
- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*` workflow wiring
- workflow persistence paths/tables used by knowledge slice
- workflow-facing tests in `packages/knowledge/server/test/Workflow/*`
- parity documentation under `specs/pending/knowledge-ontology-comparison/outputs/*`

Out of scope:
- unrelated batch-machine refactors
- non-workflow P2/P3 parity items unless required by cutover

## Goals

1. Replace custom workflow execution path with `@effect/workflow`-based runtime.
2. Preserve existing behavior delivered in prior parity phases (named graphs, provenance, token budget, bundles, NL->SPARQL).
3. Prove parity against `.repos/effect-ontology/packages/@core-v2/src` workflow patterns where applicable.
4. Remove old workflow engine code after cutover and verification.

## Non-Goals

- keeping two long-term workflow runtimes active in production
- introducing new product behavior unrelated to migration

## Deliverables

| # | Deliverable | Priority | Phase |
|---|-------------|----------|-------|
| 1 | Compatibility report (`@effect/workflow` fit/gaps) | P0 | P1 |
| 2 | Migration design with file-level plan + rollback | P0 | P2 |
| 3 | `@effect/workflow` runtime integration in knowledge-server | P0 | P3 |
| 4 | Persistence parity implementation + tests | P0 | P3 |
| 5 | Cutover (default path switched to new runtime) | P0 | P4 |
| 6 | Legacy workflow code deletion with evidence | P0 | P5 |
| 7 | Final parity matrix updates + reflection/handoff | P1 | P6 |

## Mandatory Verification

Run after each major milestone:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

Legacy deletion gate (P5) must also include:

```bash
# prove no legacy engine entrypoints remain (adjust patterns after P1 discovery)
rg -n "DurableActivities|ExtractionWorkflow|WorkflowPersistence" packages/knowledge/server/src/Workflow

# prove no old runtime is wired by default
rg -n "Workflow\\.layer|WorkflowRuntime|Durable" packages/knowledge/server/src/Runtime packages/knowledge/server/src/index.ts
```

## Completion Criteria

- [ ] `@effect/workflow` runtime is the default execution path in knowledge-server
- [ ] workflow persistence parity implemented and tested
- [ ] parity evidence captured in `knowledge-ontology-comparison` matrix/docs
- [ ] legacy custom workflow code removed (not just unused)
- [ ] typecheck/lint/tests pass on knowledge packages
- [ ] `REFLECTION_LOG.md` updated with migration decisions and follow-ups
- [ ] each completed phase has produced next-phase handoff docs (`handoffs/HANDOFF_P{N+1}.md` and `handoffs/P{N+1}_ORCHESTRATOR_PROMPT.md`)

## Orchestrator Rules For Next Agent

1. Delegate file-heavy implementation tasks to workers.
2. Keep diffs incremental and verifiable.
3. Do not mark complete while legacy code still exists.
4. If an intentional divergence remains, document rationale and regression coverage.
5. Do not mark a phase complete without generating the next-phase handoff pair.

## Entry Points

- Start: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- Full phase context: `handoffs/HANDOFF_P1.md`
- Existing parity context: `specs/pending/knowledge-ontology-comparison/handoffs/HANDOFF_P6.md`
