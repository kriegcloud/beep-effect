# Phase 6 Handoff: Spec Validation & Acceptance

**Date**: 2026-02-20  
**Status**: Ready for Phase 6 implementation (after Phase 5)

## Why Phase 6 Exists

After hardening fixes are complete, the remaining risk is acceptance drift: the implementation may be green but still miss explicit spec expectations, especially around zero-manual workflows and create-slice reuse readiness.

Phase 6 is a dedicated validation phase to certify that the repo-tooling spec is truly complete.

## Phase 6 Objective

Run an explicit, evidence-backed validation pass against the repo-tooling spec and produce a signoff report that maps success criteria to passing checks, tests, and runtime behavior.

## Required Work Items

1. Build a spec traceability matrix:
   - Map each success criterion in `README.md` to concrete verification evidence (test, command, output artifact).
2. Validate `create-package` scenarios end-to-end:
   - `library`, `tool`, and `app` generation paths.
   - Nested parent path generation (`packages/common/*`).
3. Validate zero-manual baseline:
   - Generate `@beep/types` and `@beep/utils` under `packages/common`.
   - Confirm no manual file edits required post-generation.
   - Confirm root configs are correct and idempotent.
4. Validate reuse extraction contracts from Phase 4:
   - `TemplateService`
   - `FileGenerationPlanService`
   - config updater multi-target orchestration
   - ts-morph integration contract
5. Execute and record full verification gate results:
   - `bun run build`
   - `bun run check`
   - `bun run test`
   - `bun run lint`
6. Produce final validation artifact:
   - `specs/completed/repo-tooling/outputs/phase-6-spec-validation-report.md`
7. Update reflection log with final acceptance insights and any residual risks.

## Suggested File Targets

- `specs/completed/repo-tooling/README.md`
- `specs/completed/repo-tooling/outputs/phase-6-spec-validation-report.md`
- `specs/completed/repo-tooling/REFLECTION_LOG.md`
- `tooling/cli/test/create-package.test.ts`
- `tooling/cli/test/create-package-services.test.ts`

## Validation Commands

```bash
bun run beep create-package types --parent-dir packages/common
bun run beep create-package utils --parent-dir packages/common
bun run build
bun run check
bun run test
bun run lint
```

Optional cross-checks:

```bash
bun tooling/cli/src/bin.ts tsconfig-sync --check
bun tooling/cli/src/bin.ts create-package _phase6_validation_smoke --dry-run
```

## Done Criteria

- Every success criterion has evidence in the Phase 6 validation report.
- Zero-manual `packages/common` generation workflow is verified.
- Full verification gate is green.
- Residual risks are explicitly documented (or marked none).
- Repo-tooling spec is ready to move to completed state.
