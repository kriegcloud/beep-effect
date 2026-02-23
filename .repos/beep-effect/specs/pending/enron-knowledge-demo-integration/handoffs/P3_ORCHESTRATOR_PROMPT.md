You are implementing Phase 3 for `enron-knowledge-demo-integration`.

Read first:
- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`
- `handoffs/HANDOFF_P3.md`
- `outputs/rpc-client-migration.md`
- `outputs/ingest-status-contract.md`

Mission:
1. Rewrite `meetingprep_generate` to produce live LLM-synthesized bullets grounded in persisted relation/evidence context.
2. Preserve persistence and evidence-link invariants.
3. Keep recoverable-failure behavior deterministic and demo-safe.
4. Do not regress Phase 2 ingest/query pathway or route-level gate behavior.

Required outputs:
- `outputs/meeting-prep-rewrite-notes.md`
- `outputs/evidence-chain-regression-check.md`

Hard constraints:
- no template relation-id bullet text
- no `Effect.die` / `Effect.orDie` on recoverable paths
- evidence links must resolve by `Evidence.List`
- preserve org-scoped persistence model
- no unrelated refactors

Verification:
- checks/tests for touched packages (at minimum `@beep/knowledge-server` and `@beep/runtime-server`)

Then update:
- `REFLECTION_LOG.md` Phase 3
- `handoffs/HANDOFF_P4.md`
- `handoffs/P4_ORCHESTRATOR_PROMPT.md`
