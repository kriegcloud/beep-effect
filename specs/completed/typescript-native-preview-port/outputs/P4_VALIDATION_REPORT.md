# P4 Validation Report

**Date**: 2026-02-10
**Branch**: `native-preview-experiment`
**tsgo Version**: `7.0.0-dev.20260210.1`
**Migration Path**: CHECK-ONLY

---

## Verification Results

All 5 acceptance gates pass.

| Command | Exit Code | Status | Notes |
|---------|-----------|--------|-------|
| `bun run build` | 0 | PASS | 65/65 tasks successful, 7m58s |
| `bun run check` | 0 | PASS | 118/118 tasks successful, 43.2s (54 cached) |
| `bun run lint:fix` | 0 | PASS | 64/64 tasks, 8.68s. 5 warnings (pre-existing XSS in todox) |
| `bun run lint` | 0 | PASS | 125/125 tasks, 55.4s. No circular dependencies. |
| `bun run test` | 0 | PASS | 584 pass, 29 skip, 0 fail across 118 tasks, 28s |

---

## tsgo Usage Verification

- **tsgo version confirmed**: YES (`7.0.0-dev.20260210.1`)
- **Packages using tsgo for `check` scripts**: 63 (57 in `packages/`, 1 in `apps/server`, 5 in `tooling/`)
- **Packages still using tsc for `check`**: 1 -- `apps/todox` (excluded due to tsgo-specific TS2578 unused `@ts-expect-error` and TS2430 stricter MUI theme generics)
- **All build/dev scripts correctly remain on tsc**: YES (CHECK-ONLY path -- tsgo has const type parameter parser bug blocking build mode)
- **No accidental tsc fallback in check scripts**: CONFIRMED

---

## Migration Summary

| Metric | Value |
|--------|-------|
| Total packages in repo | 64 |
| Packages migrated to tsgo (check) | 63 |
| Packages excluded | 1 (`apps/todox`) |
| Packages skipped due to errors | 0 |
| Migration path | CHECK-ONLY |

---

## Excluded Packages

| Package | Reason | Status |
|---------|--------|--------|
| `@beep/todox` | tsgo raises TS2578 (unused `@ts-expect-error`) and TS2430 (stricter MUI theme generic constraints) | Working with `tsc --noEmit` |

`todox` check verified separately: passes with `tsc` (109/109 tasks cached).

---

## Remaining TypeScript Dependencies

| Dependency | Location | Purpose | Removable? |
|------------|----------|---------|-----------|
| `typescript` ^5.9.3 | root catalog | ts-morph runtime, effect-language-service patch | NO |
| `ts-morph` ^27.0.2 | root catalog, `tooling/cli`, `tooling/repo-scripts` | Code generation (create-slice, docgen) | NO |
| `effect-language-service` | root `prepare` script | Patches tsserver for Effect IDE support | NO |
| `@typescript/native-preview` | root devDependencies | Provides `tsgo` binary | Required for migration |

---

## Performance

- `bun run check` with tsgo: **43.2s** (118 tasks, 54 cached)
- Previous full tsc check (from P3 baseline): comparable with cache, but tsgo individual package checks are 7-10x faster per the P1/P2 research
- Full uncached build: 7m58s (build scripts still use tsc, unaffected by migration)

---

## Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| tsgo const type parameter parser bug in `.d.ts` files | HIGH (blocks HYBRID/STRICT) | CHECK-ONLY path avoids it entirely by using `--noEmit` |
| todox TS2578 unused `@ts-expect-error` with tsgo | LOW | Keep todox on `tsc --noEmit` |
| todox TS2430 stricter MUI theme generic constraints | LOW | Keep todox on `tsc --noEmit` |
| Pre-existing Biome XSS warnings in todox (5 warnings) | INFO | Not related to migration |

---

## Critical Package Regression Tests

All critical packages pass tests:

| Package | Result |
|---------|--------|
| `@beep/schema` | PASS (cached) |
| `@beep/shared-domain` | PASS (cached) |
| `@beep/iam-domain` | PASS (1 test, 56ms) |
| `@beep/testkit` | PASS (cached) |

---

## Decision Record

- **Path chosen**: CHECK-ONLY
- **Rationale**: tsgo has a const type parameter parser bug that makes it unable to parse `.d.ts` files it generates when they contain `<const Value>` syntax. Since ~54/57 packages are downstream of packages using Effect's const generics, HYBRID and STRICT paths are blocked. CHECK-ONLY works because `--noEmit` resolves through `.ts` source files via `paths` in `tsconfig.base.jsonc`, completely avoiding `.d.ts` parsing.
- **Outcome**: SUCCESS -- All 5 acceptance gates pass. 63/64 packages migrated (98.4%).
- **Recommendation**: Merge to main. The migration is safe and provides 7-10x faster type-checking for developer workflows. Monitor tsgo releases for const type parameter parser fix to unlock HYBRID/STRICT paths in the future.

---

## Script Changes Summary

The migration changed ONE script per package:

- **Before**: `"check": "tsc -b tsconfig.json"`
- **After**: `"check": "tsgo --noEmit -p tsconfig.json"`

Build (`build-esm`, `build`), dev (`dev`), and all other scripts remain unchanged on `tsc`.

---

## Next Steps

1. [ ] Code review of all changes on `native-preview-experiment` branch
2. [ ] PR to merge into main
3. [ ] Monitor for issues in CI after merge
4. [ ] Track tsgo releases for const type parameter `.d.ts` parser fix (enables build migration)
5. [ ] Re-evaluate todox exclusion when tsgo addresses TS2578/TS2430 behavioral differences
6. [ ] Consider adding tsgo version pinning to prevent unexpected breaks from dev channel updates
