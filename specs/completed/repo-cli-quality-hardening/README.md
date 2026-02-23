# Repo CLI Quality Hardening

## Status
- Status: `completed`

## Owner
@elpresidank

## Created
2026-02-20

## Completed
2026-02-20

## Purpose
Track the post-migration hardening work discovered while closing `effect-v4-migration`: stabilize `create-package` config updates, restore green CLI tests, and fix coverage tooling compatibility.

## Why This Spec Exists
`specs/completed/effect-v4-migration` landed the Effect v4 baseline and the first `@beep/repo-cli` implementation. Final verification showed unresolved quality issues that were incremental hardening work, not migration-baseline blockers.

## Completion Summary

1. Hardened JSONC handling in `tooling/cli/src/commands/create-package/config-updater.ts`:
   - Added defensive parse/shape guards.
   - Removed defect-prone direct property access on parsed JSONC values.
   - Improved idempotency checks for base + wildcard aliases.
2. Made CLI test execution deterministic:
   - Disabled concurrent test sequencing in `tooling/cli/vitest.config.ts`.
3. Fixed coverage tooling mismatch:
   - Aligned `@vitest/coverage-v8` to `3.2.4` in root catalog.
4. Removed noisy tsconfig-path parsing warnings from subtree mirrors:
   - Set `ignoreConfigErrors: true` in `vitest.shared.ts` tsconfig-paths plugin config.
5. Improved package test ergonomics:
   - Updated `tooling/cli/package.json` to use `vitest run` for `test`, with `test:watch` retained for interactive runs.

## Current Issues

All previously tracked issues are resolved.

## Scope

### In Scope
- Harden `tooling/cli/src/commands/create-package/config-updater.ts` JSONC parsing/guards.
- Make `tooling/cli/test/create-package.test.ts` deterministic and green.
- Align Vitest + coverage provider versions and restore `bun run coverage`.
- Confirm test invocation ergonomics (`bun run test` vs `bun test`) in package docs/scripts.
- Capture final verification evidence.

### Out of Scope
- New command features unrelated to quality stabilization.
- Large API redesign of `create-package`.
- Monorepo-wide test framework migration beyond what is needed for `tooling/cli`.

## Success Criteria

- [x] `bun run check` passes in `tooling/cli`.
- [x] `bun run build` passes in `tooling/cli`.
- [x] `bunx vitest run` passes in `tooling/cli`.
- [x] `bun run coverage` passes in `tooling/cli`.
- [x] `create-package` config update tests are green and idempotent.
- [x] Coverage dependency versions are consistent and documented.
- [x] Remaining warnings are either removed or explicitly accepted with rationale.

## Initial Task List

1. [x] Add defensive parsing/shape checks in `config-updater.ts` before reading `references` and `compilerOptions`.
2. [x] Stabilize test determinism for `create-package` suite.
3. [x] Align `vitest` and `@vitest/coverage-v8` versions.
4. [x] Re-run full CLI verification and capture results in `outputs/verification.md`.

## Verification Commands

```bash
cd tooling/cli
bun run check
bun run build
bunx vitest run
bun run coverage
```

## Verification Results

See: `./outputs/verification.md`
