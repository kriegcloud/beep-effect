# P2 Orchestrator Prompt: Zep Ingestion Pipeline

Execute Phase P2 for `specs/pending/codex-effect-v4-knowledge-graph-app`.

## Read First

1. `specs/pending/codex-effect-v4-knowledge-graph-app/README.md`
2. `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P2.md`
3. `specs/completed/effect-v4-knowledge-graph/outputs/` (source data)
4. `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/p2-zep-ingestion-research.md`

## Objectives

1. Build deterministic Zep ingestion script.
2. Build verification script for graph search quality and coverage.
3. Validate replayability/idempotency.
4. Capture operational notes for reruns and rollback.

## Constraints

- Keep shared graph scope (`graphId = effect-v4`).
- Avoid introducing secondary graph stores.
- Preserve deterministic ingest ordering.

## Completion Requirements

1. Run verification commands from `HANDOFF_P2.md`.
2. Update `REFLECTION_LOG.md` with P2 learnings.
3. Refresh `HANDOFF_P3.md` with real outcomes and blockers.
4. Refresh `P3_ORCHESTRATOR_PROMPT.md` for P3 kickoff.
