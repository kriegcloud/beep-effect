You are implementing Phase 1 for `enron-knowledge-demo-integration`.

Read first:
- `specs/pending/enron-knowledge-demo-integration/README.md`
- `specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md`
- `specs/pending/enron-knowledge-demo-integration/RUBRICS.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P1.md`

Mission:
1. Map existing `knowledge-demo` mock architecture and identify replacement points.
2. Produce deterministic scenario-catalog and ingestion-flow design artifacts.
3. Confirm RPC pathways and protocol details required for `@effect-atom/atom-react` client wiring.

Required outputs:
- `specs/pending/enron-knowledge-demo-integration/outputs/codebase-context.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/current-vs-target-matrix.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/scenario-catalog.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/ingestion-flow.md`

Hard constraints:
- Curated scenarios only
- Explicit ingest action (no silent ingestion)
- Full-thread extraction capped at 25 docs per scenario
- Org-scoped persistence model
- Internal feature gating via `ENABLE_ENRON_KNOWLEDGE_DEMO`
- Meeting prep rewrite to live LLM synthesis is in scope of later phase; preserve that requirement in design outputs

Verification:
- Run checks/tests for any package touched in this phase.

Then update:
- `specs/pending/enron-knowledge-demo-integration/REFLECTION_LOG.md` (Phase 1 entry)
- next handoff docs for Phase 2
