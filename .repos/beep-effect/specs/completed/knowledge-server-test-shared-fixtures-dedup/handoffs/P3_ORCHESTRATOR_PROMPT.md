You are implementing Phase 3 of the `knowledge-server-test-shared-fixtures-dedup` spec.

Read first:
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/README.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/MASTER_ORCHESTRATION.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/handoffs/HANDOFF_P3.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/codebase-context.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/evaluation.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/remediation-plan.md`

Phase 3 objective:
- Implement shared fixture/layer/mock modules under `packages/knowledge/server/test/_shared` and migrate duplicate test helpers using the risk-ordered plan, while preserving behavior.

Do:
1. Implement shared helpers exactly aligned with Phase 2 API/module decisions.
2. Migrate tests in the batch order defined in `outputs/remediation-plan.md`.
3. Remove replaced local duplicate helpers in each migrated file.
4. Run verification per batch (targeted tests + `bun run check` + `bun run lint`).
5. If a medium/high-risk batch regresses, apply rollback guidance from `outputs/remediation-plan.md` and continue incrementally.

Outputs required:
- Code changes in `packages/knowledge/server/test/_shared/**` and migrated test files.
- Updated `specs/completed/knowledge-server-test-shared-fixtures-dedup/REFLECTION_LOG.md` with a Phase 3 entry.

Constraints:
- Keep intentional non-dedup exceptions from Phase 1/2 unless explicitly re-justified in writing.
- No production code changes unless strictly required by test compile constraints (if so, document explicitly).
- Keep helper modules focused; avoid grab-bag abstractions.

Definition of done:
- At least low-risk batches are complete and validated; medium/high-risk batches are either complete or explicitly rolled back with rationale.
- Touched tests pass without assertion semantic drift.
- `REFLECTION_LOG.md` includes a Phase 3 summary with what changed, what failed, and what remains.
- If Phase 4 is needed next, prepare `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md`.
