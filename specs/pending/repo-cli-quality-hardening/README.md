# Repo CLI Quality Hardening

## Status
ACTIVE

## Owner
@elpresidank

## Created
2026-02-20

## Purpose
Track the post-migration hardening work discovered while closing `effect-v4-migration`: stabilize `create-package` config updates, restore green CLI tests, and fix coverage tooling compatibility.

## Why This Spec Exists
`specs/completed/effect-v4-migration` landed the Effect v4 baseline and the first `@beep/repo-cli` implementation. Final verification showed unresolved quality issues that are incremental hardening work, not migration-baseline blockers.

## Current Issues

1. `tooling/cli` test failures in `create-package` config updater paths:
   - `TypeError: Cannot read properties of undefined (reading 'references')`
   - `TypeError: Cannot read properties of undefined (reading 'compilerOptions')`
2. Coverage failure due mixed versions:
   - `vitest@3.2.4`
   - `@vitest/coverage-v8@4.0.18`
3. `tsconfig-paths` parse warnings while traversing nested subtree tsconfigs under `.repos/`.

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

- [ ] `bun run check` passes in `tooling/cli`.
- [ ] `bun run build` passes in `tooling/cli`.
- [ ] `bunx vitest run` passes in `tooling/cli`.
- [ ] `bun run coverage` passes in `tooling/cli`.
- [ ] `create-package` config update tests are green and idempotent.
- [ ] Coverage dependency versions are consistent and documented.
- [ ] Remaining warnings are either removed or explicitly accepted with rationale.

## Initial Task List

1. Add defensive parsing/shape checks in `config-updater.ts` before reading `references` and `compilerOptions`.
2. Update or fix fixtures in `create-package.test.ts` so config files always match expected baseline shape.
3. Align `vitest` and `@vitest/coverage-v8` versions.
4. Re-run full CLI verification and capture results in `outputs/verification.md`.

## Verification Commands

```bash
cd tooling/cli
bun run check
bun run build
bunx vitest run
bun run coverage
```
