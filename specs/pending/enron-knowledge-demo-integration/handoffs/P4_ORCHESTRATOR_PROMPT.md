You are implementing Phase 4 for `enron-knowledge-demo-integration`.

Read first:
- `specs/pending/enron-knowledge-demo-integration/README.md`
- `specs/pending/enron-knowledge-demo-integration/MASTER_ORCHESTRATION.md`
- `specs/pending/enron-knowledge-demo-integration/RUBRICS.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P4.md`

Mission:
1. Validate the complete demo flow with real Enron-derived data across multiple deterministic scenarios.
2. Confirm `knowledge-demo` default features no longer rely on dummy/mock data.
3. Verify feature gate behavior for `ENABLE_ENRON_KNOWLEDGE_DEMO` in enabled and disabled states.
4. Validate meeting-prep evidence references resolve and semantically support claims.

Required outputs:
- `specs/pending/enron-knowledge-demo-integration/outputs/demo-validation.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/demo-risks.md`

Hard constraints:
- no unrelated refactors
- deterministic scenario ordering and reporting
- record concrete blockers if environment dependencies prevent full validation
- include mismatch mode accounting if evidence issues are found

Verification:
- run checks/tests for touched packages
- include command summaries in output artifacts

Then update:
- `specs/pending/enron-knowledge-demo-integration/REFLECTION_LOG.md` (Phase 4)
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P5.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/P5_ORCHESTRATOR_PROMPT.md`
