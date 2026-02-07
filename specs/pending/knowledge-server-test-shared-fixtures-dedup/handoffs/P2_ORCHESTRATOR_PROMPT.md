You are implementing Phase 2 of the `knowledge-server-test-shared-fixtures-dedup` spec.

Read first:
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/README.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/MASTER_ORCHESTRATION.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/handoffs/HANDOFF_P2.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/codebase-context.md`

Phase 2 objective:
- Define concrete shared-module design and a migration sequence for deduplicating knowledge-server test fixtures/layers.

Do:
1. Define module boundaries under `packages/knowledge/server/test/_shared` for each duplication family.
2. Specify helper APIs (naming, parameters, defaults, return types) and identify merge-vs-local decisions.
3. Create an incremental migration plan ordered by risk, with file-level rollout batches.
4. Define semantic-equivalence verification checks and rollback guidance for medium/high-risk batches.

Outputs required:
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/evaluation.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/remediation-plan.md`

Constraints:
- Keep recommendations compatible with Effect patterns and repo guardrails.
- No production code changes in this phase.
- Avoid grab-bag utility design; prefer focused modules.

Definition of done:
- `outputs/evaluation.md` contains concrete module/API design with file references.
- `outputs/remediation-plan.md` contains ordered migration batches with verification steps.
- Intentional non-dedup exceptions from Phase 1 are preserved unless explicitly re-justified.
- `REFLECTION_LOG.md` updated with a Phase 2 entry at phase end.
