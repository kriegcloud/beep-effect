# HANDOFF P2: Zep Ingestion Pipeline

## Phase Transition

- From: P1 (Auth + Access Foundation)
- To: P2 (Zep Ingestion Pipeline)
- Date: 2026-02-22

## Working Context

Build deterministic ingestion scripts to load completed Effect v4 graph artifacts into Zep and verify retrieval quality.

If P1 outcomes differ from plan, update this handoff before coding.

## Objectives

1. Implement ingestion script for current graph artifacts.
2. Implement verification script for counts, spot checks, and query sanity.
3. Ensure ingestion is replayable and safe to rerun.
4. Document ingestion runbook steps.

## Target File Surfaces

- `apps/web/scripts/zep-ingest-effect-v4.ts`
- `apps/web/scripts/zep-verify-effect-v4.ts`
- `apps/web/src/lib/graph/zep-client.ts`
- `apps/web/src/lib/graph/mappers.ts` (if needed for verification output)
- phase notes in `REFLECTION_LOG.md`

## Data Source Contract

Primary source artifacts:
- `specs/completed/effect-v4-knowledge-graph/outputs/*`

Ingestion scope:
- Modules, migrations, docs/pattern episodes, and selected enrichment/function corpus aligned with current completed output set.

## Verification Commands

```bash
bun run check
bun run test
bun run lint
bun run build
bun run apps/web/scripts/zep-ingest-effect-v4.ts
bun run apps/web/scripts/zep-verify-effect-v4.ts
```

## Phase Exit Criteria

- Ingestion script loads graph data into Zep successfully.
- Verification script confirms searchable graph and expected artifact coverage.
- Script reruns are deterministic/idempotent for repeated deployments.
- Any partial-failure behavior is documented with retry guidance.

## Deliverables Checklist

- [ ] Ingestion script implemented and tested
- [ ] Verification script implemented and tested
- [ ] Runbook notes added for ingestion/verification
- [ ] `HANDOFF_P3.md` updated with actual outcomes
- [ ] `P3_ORCHESTRATOR_PROMPT.md` updated for next phase
