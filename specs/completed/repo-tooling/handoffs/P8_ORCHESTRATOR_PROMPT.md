# Orchestrator Prompt: Phase 8 (Comprehensive Final Review & Spec Closeout)

You are implementing **Phase 8** of `specs/completed/repo-tooling`.

## Objective

Run a final comprehensive review that confirms repo-tooling is fully complete, regression-safe, and ready to transition from pending to completed status.

## Read First

1. `specs/completed/repo-tooling/README.md`
2. `specs/completed/repo-tooling/handoffs/HANDOFF_P8.md`
3. `specs/completed/repo-tooling/outputs/phase-6-spec-validation-report.md`
4. `specs/completed/repo-tooling/outputs/phase-7-remaining-issues-resolution.md`
5. `specs/completed/repo-tooling/REFLECTION_LOG.md`

## Required Deliverables

1. Perform comprehensive implementation review for:
   - create-package command flow
   - template/runtime behavior
   - extracted service contracts and orchestration boundaries
2. Perform comprehensive test review:
   - success-criterion coverage
   - hardening/edge-path coverage stability
3. Verify traceability and artifact consistency across README + Phase 6/7 outputs.
4. Run full verification gate:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`
5. Run final smoke checks:
   - source-mode create-package dry-run
   - dist-mode create-package dry-run
   - `tsconfig-sync --check`
6. Produce `specs/completed/repo-tooling/outputs/phase-8-comprehensive-review.md` with:
   - findings summary
   - risk assessment
   - final signoff recommendation
7. Update reflection log with final closeout learnings.

## Done Criteria

- Comprehensive review finds no unresolved blocking issues.
- Full gate and smoke checks pass.
- Final review report explicitly recommends spec closeout with evidence.
