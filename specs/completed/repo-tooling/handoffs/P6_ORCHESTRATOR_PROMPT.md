# Orchestrator Prompt: Phase 6 (Spec Validation & Acceptance)

You are implementing **Phase 6** of `specs/completed/repo-tooling`.

## Objective

Validate the repo-tooling spec end-to-end and produce final acceptance evidence showing the implementation satisfies all success criteria without manual post-generation edits.

## Read First

1. `specs/completed/repo-tooling/README.md`
2. `specs/completed/repo-tooling/handoffs/HANDOFF_P6.md`
3. `specs/completed/repo-tooling/REFLECTION_LOG.md`

## Required Deliverables

1. Build a traceability matrix from spec success criteria to verification evidence.
2. Validate `create-package` across package types and nested parent paths.
3. Validate zero-manual `packages/common` flow for `@beep/types` + `@beep/utils`.
4. Validate Phase 4 reuse contracts are present and exercised by tests.
5. Produce `specs/completed/repo-tooling/outputs/phase-6-spec-validation-report.md`.
6. Run full verification gate:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`
7. Update reflection log with final acceptance learnings.

## Done Criteria

- Validation report clearly marks each criterion Pass/Fail with evidence.
- Zero-manual generation baseline is confirmed.
- Verification gate passes.
- Any residual gaps are documented with explicit follow-up.
