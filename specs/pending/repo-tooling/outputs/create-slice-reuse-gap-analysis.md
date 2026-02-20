# create-package → create-slice Reuse Gap Analysis

**Date**: 2026-02-20  
**Spec**: `specs/pending/repo-tooling`

## Goal

Validate whether current `create-package` core modules can be reused for a new `.repos/beep-effect/tooling/cli/src/commands/create-slice` implementation with a zero-manual package creation baseline.

## Current Reuse Assessment

### Reusable As-Is

1. `tooling/cli/src/commands/create-package/config-updater.ts`
   - Idempotent JSONC-safe root config updates (`tsconfig.packages.json`, `tsconfig.json` paths).
2. `tooling/cli/src/commands/create-package/handler.ts` template pipeline pattern
   - Template context creation, template loading/compilation, dry-run file listing.
3. Schema-based package manifest generation
   - `encodePackageJsonPrettyEffect` path keeps manifest writing typed and consistent.

### Not Yet Reusable for create-slice

1. Missing `FileGeneratorService` boundary
   - Current `create-package` writes files inline in command handler.
   - `create-slice` requires a multi-package generation plan (`plan`, `preview`, `execute`) with deterministic ordering.
2. Missing multi-target `ConfigUpdaterService`
   - Existing updater is root-focused only.
   - `create-slice` requires coordinated updates across multiple package configs and slice-specific tsconfigs.
3. Missing `TsMorphService` integration layer
   - `create-slice` needs AST-safe edits in shared integration files (identity composers, entity-id exports, persistence/data-access wiring).
4. Missing enriched template helper/context strategy
   - `create-slice` template set needs casing helpers and richer derived names across multiple generated packages.

## Quality Gate Baseline (2026-02-20)

## Commands Executed

```bash
bun run beep create-package types --parent-dir packages/common --description "Shared type utilities for beep"
bun run beep create-package utils --parent-dir packages/common --description "Shared runtime utilities for beep"
bun install
bun run build
bun run check
bun run test
bun run lint
```

## Observed Status

- `create-package` successfully generated:
  - `packages/common/types`
  - `packages/common/utils`
- `build`: pass
- `test`: pass
- `check`: fail on existing branch-level type-check drift in `tooling/cli/test/tsconfig-sync.test.ts`
- `lint`: fail on current branch-level formatting/import-order drift and test artifact residue

**Conclusion**: zero-manual baseline is not yet proven on current branch; additional extraction + verification work is required.

## Phase 4 Scope (New)

1. Extract reusable scaffolding services from `create-package`:
   - `TemplateService` (load/compile/render)
   - `FileGenerationPlanService` (plan/preview/execute)
2. Expand config updater into service-style API:
   - root refs/aliases + optional package-level/slice-level update orchestration
3. Add AST integration service contract for slice flows:
   - `TsMorphIntegrationService` with explicit mutation methods and tests
4. Ensure deterministic cleanup and no artifact leakage from command tests
5. Add integration tests for `--parent-dir packages/common` proving no manual edits required
6. Add reuse readiness tests that assert create-slice-required service contracts exist
7. Re-run full repo quality gates after scaffolding and service extraction

## Exit Criteria for Phase 4

- `create-package` internals expose service-level APIs suitable for multi-package slice generation.
- New `create-slice` work can call extracted services without duplicating handler internals.
- Running:

```bash
bun run beep create-package types --parent-dir packages/common
bun run beep create-package utils --parent-dir packages/common
bun install
bun run build
bun run check
bun run test
bun run lint
```

passes without manual fixes.
