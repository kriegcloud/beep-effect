You are implementing Phase 2.6 for `enron-knowledge-demo-integration`.

Read first:
- `specs/pending/enron-knowledge-demo-integration/README.md`
- `specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md`
- `specs/pending/enron-knowledge-demo-integration/RUBRICS.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2_6.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/ingest-status-contract.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/rpc-client-migration.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/phase-2.5-regression-plan.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/phase-2.5-validation.md`

Mission:
1. Fix the `knowledge-demo` ingest regression where `batch_start` fails with `ParseError` at `BatchOrchestrator/EngineBatchPayload`.
2. Preserve Phase 2 ingest lifecycle behavior and non-mock data flow contracts.
3. Add regression coverage so this payload-boundary failure is caught by tests.
4. Verify browser behavior parity against Phase 2 contract requirements.

Required outputs:
- `specs/pending/enron-knowledge-demo-integration/outputs/phase-2.6-root-cause.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/phase-2.6-fix-summary.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/phase-2.6-validation.md`

Hard constraints:
- do not regress Phase 2 ingest/query contract
- no fallback to mock entities/relations
- preserve explicit ingest action (`Ingest Scenario`), no silent ingest
- preserve route-level feature gate behavior for `ENABLE_ENRON_KNOWLEDGE_DEMO`
- preserve typed error behavior (do not flatten infra failures into not-found)
- no unrelated refactors

Mandatory verification protocol:
- Use **Claude in Chrome** to validate runtime behavior (not terminal-only verification).
- In Chrome, test `/knowledge-demo` with at least `scenario-1` and `scenario-2`.
- Confirm no unhandled `ParseError` / unhandled rejection in browser console.
- Confirm lifecycle UI progression is contract-compliant:
  - `pending` -> (`extracting` and/or `resolving`) -> terminal state.
- Confirm query is disabled until status is `completed`.
- Confirm post-completion query/load path works and renders persisted entities/relations.

Execution policy:
- Repeat this loop until behavior is 100% compliant with Phase 2 requirements:
  - implement fix
  - run checks/tests
  - verify in Claude-in-Chrome
  - capture evidence in output docs
- Do not stop at compile/test pass if browser parity still fails.

Verification:
- `bun run check --filter @beep/knowledge-server`
- `bun run test --filter @beep/knowledge-server`
- `bun run check --filter @beep/todox`
- `bun run test --filter @beep/todox`

Then update:
- `specs/pending/enron-knowledge-demo-integration/REFLECTION_LOG.md` (Phase 2.6)
- next handoff + orchestrator prompt for the following phase only after Phase 2.6 is fully validated
