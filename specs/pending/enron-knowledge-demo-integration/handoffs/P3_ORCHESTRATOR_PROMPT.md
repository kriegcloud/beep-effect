You are implementing Phase 3 for `enron-knowledge-demo-integration`.

Read first:
- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `handoffs/HANDOFF_P3.md`

Mission:
1. Rewrite `meetingprep_generate` for live LLM synthesis.
2. Preserve persistence contract and evidence invariants.
3. Keep recoverable-failure behavior deterministic.

Required outputs:
- `outputs/meeting-prep-rewrite-notes.md`
- `outputs/evidence-chain-regression-check.md`

Hard constraints:
- no template relation-id bullet text
- no `Effect.die`/`orDie` on recoverable paths
- evidence links must resolve by `Evidence.List`

Verification:
- run required knowledge/runtime package checks/tests

Then update:
- `REFLECTION_LOG.md` Phase 3
- `handoffs/HANDOFF_P4.md`
- `handoffs/P4_ORCHESTRATOR_PROMPT.md`
