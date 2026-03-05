# Phase 4 Handoff: create-slice Reuse Extraction

**Date**: 2026-02-20  
**Status**: Ready for Phase 4 implementation

## Why Phase 4 Exists

`create-package` now generates canonical package structure (including `packages/common/*` via `--parent-dir`), but its core still lives mostly inside one handler.  
Legacy `create-slice` architecture expects reusable service boundaries (file generation, config orchestration, AST integration) that are not yet provided by current `create-package`.

Primary gap report: `specs/completed/repo-tooling/outputs/create-slice-reuse-gap-analysis.md`

## Phase 4 Objective

Extract and stabilize reusable core modules so a new `.repos/beep-effect/tooling/cli/src/commands/create-slice` can build on `create-package` internals without copy-pasting command-specific logic.

## Required Work Items

1. Extract template orchestration from handler:
   - `TemplateService` with load/compile/render contract
2. Extract deterministic generation planning:
   - `FileGenerationPlanService` with `createPlan`, `previewPlan`, `executePlan`
3. Expand config updater abstraction:
   - keep existing root JSONC-safe updates
   - add orchestration entry point for multi-package/slice update flows
4. Define AST integration contract:
   - `TsMorphIntegrationService` for shared file mutations needed by slice creation
5. Refactor handler to compose services (not contain orchestration details inline)
6. Add tests that enforce service contracts + idempotent generation
7. Add integration verification for zero-manual baseline:
   - generate `@beep/types` + `@beep/utils` in `packages/common`
   - run install + full quality gates

## Suggested File Targets

- `tooling/cli/src/commands/create-package/handler.ts` (thin orchestration)
- `tooling/cli/src/commands/create-package/` (new service modules)
- `tooling/cli/test/create-package.test.ts` (service/integration coverage)
- `specs/completed/repo-tooling/outputs/` (phase outputs and verification artifacts)
- `specs/completed/repo-tooling/REFLECTION_LOG.md` (phase learnings)

## Verification Gate

```bash
bun run beep create-package types --parent-dir packages/common
bun run beep create-package utils --parent-dir packages/common
bun install
bun run build
bun run check
bun run test
bun run lint
```

No manual post-generation edits allowed.
