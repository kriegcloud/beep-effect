You are implementing Phase 1 of the `knowledge-server-test-shared-fixtures-dedup` spec.

Read first:
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/README.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/MASTER_ORCHESTRATION.md`
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/handoffs/HANDOFF_P1.md`

Phase 1 objective:
- Build a concrete duplication inventory for `packages/knowledge/server/test/**` and map candidates for extraction into `packages/knowledge/server/test/_shared`.

Do:
1. Identify repeated layer assembly helpers, mock service builders, and fixture factories.
2. Group these into 3+ duplication families with file-level references.
3. Propose target shared modules for each family and rate migration difficulty.
4. Record intentional non-dedup cases where local helpers should remain local.

Output required:
- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/codebase-context.md`

Constraints:
- Read-only phase: do not edit production or test files.
- Keep recommendations compatible with Effect patterns and repo guardrails.

Definition of done:
- `outputs/codebase-context.md` exists with required sections from `HANDOFF_P1.md`.
- `REFLECTION_LOG.md` updated with a Phase 1 entry.
- Prepare `handoffs/HANDOFF_P2.md` and `handoffs/P2_ORCHESTRATOR_PROMPT.md` if moving to the next phase.
