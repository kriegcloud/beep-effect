# P0 Research Summary: @typescript/native-preview (tsgo)

**Date**: 2026-02-10
**Status**: Complete
**Purpose**: Knowledge base for all subsequent migration phases

---

## 1. What Is @typescript/native-preview?

- **Project name**: Project Corsa / TypeScript 7
- **What it is**: A ground-up rewrite of the TypeScript compiler in Go
- **Package**: `@typescript/native-preview` on npm
- **CLI binary**: `tsgo` (mirrors `tsc` interface)
- **Version scheme**: Nightly releases as `7.0.0-dev.*`
- **Speed improvement**: 7-10x faster than tsc on full builds
- **Stable release target**: Mid-2026
- **Install command**: `bun add -D @typescript/native-preview`

### What It Replaces

tsgo replaces `tsc` as the command-line compiler. It does NOT replace the TypeScript JavaScript API (used by ts-morph, eslint-typescript, etc.). The JS API equivalent (codenamed "Strada") is not yet available.

---

## 2. Feature Compatibility Matrix (February 2026)

| Feature | Status | Notes |
|---------|--------|-------|
| Type checking | ~99.6% parity with tsc | Minor inconsistencies with overload resolution |
| `--noEmit` | Supported | Drop-in replacement |
| `--project` / `-p` | Supported | Drop-in replacement |
| `--build` mode (`-b`) | Supported | Added late 2025 |
| `--incremental` | Supported | Compatible with existing .tsbuildinfo |
| Project references | Supported | Works with composite projects |
| `--composite` | Supported | Required for project references |
| Declaration emit (`.d.ts`) | Partial | Common cases work; edge cases with complex generics may fail |
| JavaScript emit (`.js`) | Not fully ported | Major blocker for build pipelines that emit JS |
| Downlevel emit | Only back to ES2021 | Fine for this project (ES2024 target) |
| Decorator emit | Not supported | `emitDecoratorMetadata` will fail |
| `--watch` mode | File monitoring works | No incremental recheck on changes |
| Language service (LSP) | Functional | Auto-imports, find-all-refs, rename working |
| Path aliases (`paths`) | Supported | Resolved from tsconfig |
| `strict` mode | Supported | All strict flags work |
| `verbatimModuleSyntax` | Supported | |
| `isolatedModules` | Supported | |
| `moduleResolution: "bundler"` | Supported | |
| `skipLibCheck` | Supported | |

### Flags With Unknown/Partial Support

These flags are used in this project's `tsconfig.base.jsonc` and need empirical testing:

| Flag | Used In This Project | tsgo Status |
|------|---------------------|-------------|
| `rewriteRelativeImportExtensions` | Yes | Unknown -- newer tsc flag, may not be ported |
| `erasableSyntaxOnly` | Yes | Unknown -- newer tsc flag, may not be ported |
| `emitDecoratorMetadata` | Yes | Not supported |
| `experimentalDecorators` | Yes | Partial -- checking may work, emit does not |
| `exactOptionalPropertyTypes` | Yes | Likely supported (strict family) |
| `noUncheckedIndexedAccess` | Yes | Likely supported (strict family) |
| `declarationMap` | Yes | Unknown -- related to declaration emit |
| `preserveWatchOutput` | Yes | Unknown |

---

## 3. Known Limitations and Issues

### 3.1 Declaration Emit

tsgo cannot emit declarations when errors are present (tsc can). This means:
- A partially broken codebase cannot generate `.d.ts` files with tsgo
- All type errors must be resolved before declarations can be emitted
- This affects the build pipeline if any upstream package has errors

### 3.2 Strada API Not Available

Tools that depend on TypeScript's JavaScript API will NOT work with tsgo:
- `ts-morph` (used in `tooling/cli`)
- `typescript-eslint` (NOT used -- this project uses Biome)
- `@effect/docgen` (uses TypeScript API for doc generation)
- Any custom scripts that `import typescript` as a module

### 3.3 Auto-Import Path Issues

GitHub Issue #2175: In monorepos, tsgo's LSP may suggest relative paths instead of package aliases (e.g., `../../packages/shared/domain/src/index` instead of `@beep/shared-domain`). This affects developer experience but not builds.

### 3.4 Side-by-Side Installation

GitHub Issue #2555: Installing `@typescript/native-preview` alongside `typescript` can break imports in composite tsconfig setups. The two packages may conflict. Mitigation: ensure `tsgo` binary is referenced by explicit path or package bin, not by generic `tsc` resolution.

### 3.5 @ts-expect-error Inconsistencies

Minor inconsistencies with how `@ts-expect-error` interacts with overload resolution. Some `@ts-expect-error` annotations that are valid in tsc may be flagged as unused in tsgo, or vice versa.

---

## 4. beep-effect Project Configuration

### 4.1 TypeScript Setup

| Property | Value |
|----------|-------|
| TypeScript version | ^5.9.3 |
| Bun version | 1.3.2 |
| Target | ES2024 |
| Module | ESNext |
| Module resolution | bundler |
| Strict mode | Yes (all strict flags) |
| Composite | Yes |
| Incremental | Yes |
| Declaration | Yes |
| Declaration map | Yes |
| Source map | Yes |
| Isolated modules | Yes |
| Verbatim module syntax | Yes |
| Experimental decorators | Yes |
| Emit decorator metadata | Yes |
| Erasable syntax only | Yes |
| Rewrite relative import extensions | Yes |
| Skip lib check | Yes |
| Path aliases | 100+ `@beep/*` patterns |
| Plugins | `@effect/language-service` |

### 4.2 Build Pipeline

The per-package build pattern is:

```json
{
  "build-esm": "tsc -b tsconfig.build.json",
  "check": "tsc -b tsconfig.json",
  "dev": "tsc -b tsconfig.build.json --watch"
}
```

Build outputs go to `build/esm/` and `build/cjs/` directories. The CJS build uses Babel (independent of tsc). The ESM build is the one that depends on `tsc -b`.

### 4.3 Project Reference Structure

```
tsconfig.json (root -- check)
  -> tsconfig.slices/common.json
  -> tsconfig.slices/shared.json
  -> tsconfig.slices/core.json
  -> tsconfig.slices/ui.json
  -> tsconfig.slices/iam.json
  -> tsconfig.slices/documents.json
  -> tsconfig.slices/runtime.json
  -> tsconfig.slices/apps.json
  -> tsconfig.slices/internal.json
  -> tsconfig.slices/tooling.json
  -> tsconfig.slices/customization.json
  -> tsconfig.slices/comms.json
  -> tsconfig.slices/calendar.json
  -> tsconfig.slices/knowledge.json
  -> tsconfig.slices/integrations.json
  -> tsconfig.slices/another-test.json

tsconfig.build.json (root -- build)
  -> 50+ individual package tsconfig.build.json files
```

### 4.4 Turborepo Configuration

- `check` task depends on `^build` and `^check`
- `build` task depends on `^build` (dependency cascade)
- `test` task depends on `^build`
- Turborepo manages the dependency graph; project references are redundant but coexist

### 4.5 Dependencies on TypeScript JS API

| Consumer | Import | Purpose | Replaceable? |
|----------|--------|---------|-------------|
| `tooling/cli` (ts-morph) | Runtime `import` | AST manipulation for code generation | NO -- must keep `typescript` |
| `effect-language-service patch` | Runtime patch | Patches tsserver for Effect support | NO -- must keep `typescript` |
| `@effect/docgen` | Runtime `import` | API documentation generation | NO -- must keep `typescript` |
| Biome | None | Linting/formatting | N/A -- compatible with tsgo |

### 4.6 Root Scripts

```json
{
  "prepare": "effect-language-service patch",
  "build": "bunx turbo run build",
  "check": "bunx turbo run check",
  "test": "turbo run test --ui=stream",
  "lint": "bun run lint:deps && bunx turbo run lint lint:circular",
  "lint:fix": "bunx turbo run lint:fix && bun run lint:deps:fix"
}
```

---

## 5. Migration Strategy Assessment

### 5.1 Strict Path (Remove `typescript` Entirely)

**Verdict**: Almost certainly NOT feasible.

Blockers:
- ts-morph requires TypeScript JS API at runtime
- effect-language-service patch requires tsserver from `typescript` package
- @effect/docgen requires TypeScript JS API

### 5.2 Hybrid Path (tsgo for Build/Check, Keep `typescript` for JS API)

**Verdict**: Recommended approach.

Steps:
1. Install `@typescript/native-preview` alongside `typescript`
2. Replace `tsc` with `tsgo` in all `check` and `build-esm` scripts
3. Keep `typescript` in devDependencies for ts-morph, effect-language-service, docgen
4. Verify all 5 acceptance commands pass

Risks:
- Side-by-side installation issues (GitHub #2555)
- Declaration emit edge cases with Effect types
- Non-standard tsconfig flags may not be supported

### 5.3 Check-Only Path (tsgo for Check, tsc for Build)

**Verdict**: Fallback if hybrid build fails.

If tsgo cannot reliably emit JS + declarations:
1. Use `tsgo` only for `check` scripts (type-checking)
2. Keep `tsc` for `build-esm` scripts (JS + declaration emit)
3. This still provides the speed benefit for the most frequent developer action (type-checking)

---

## 6. Recommended Migration Order

Start with leaf packages (no downstream consumers) and work toward root:

### Tier 1: Leaf Packages (Zero Risk)
- `@beep/types` (type-only, no runtime)
- `@beep/constants`
- `@beep/invariant`

### Tier 2: Common Foundation
- `@beep/utils`
- `@beep/schema`
- `@beep/identity`
- `@beep/wrap`
- `@beep/errors`

### Tier 3: Shared Layer
- `@beep/shared-domain`
- `@beep/shared-tables`
- `@beep/shared-server`
- `@beep/shared-client`
- `@beep/shared-ui`
- `@beep/shared-env`
- `@beep/shared-ai`

### Tier 4: Slice Packages
- All `@beep/iam-*`, `@beep/documents-*`, `@beep/calendar-*`, etc.

### Tier 5: UI Packages
- `@beep/ui-core`, `@beep/ui-editor`, `@beep/ui-spreadsheet`

### Tier 6: Runtime & Apps
- `@beep/runtime-server`, `@beep/runtime-client`
- `apps/server`, `apps/marketing`, `apps/todox`

### Tier 7: Tooling (Special Handling)
- `@beep/build-utils`, `@beep/testkit`
- `@beep/repo-cli` (ts-morph -- keep tsc)
- `@beep/repo-scripts`

---

## 7. Verification Commands

```bash
# Per-package verification (after each package migration)
bun run check --filter @beep/<package>
bun run build --filter @beep/<package>
bun run test --filter @beep/<package>

# Full repo verification (P4 acceptance gate)
bun run build
bun run check
bun run lint:fix
bun run lint
bun run test

# Verify tsgo is actually being used
which tsgo
tsgo --version
# Check that package.json scripts reference tsgo, not tsc
grep -r '"tsc ' packages/*/package.json  # Should return empty
grep -r '"tsgo ' packages/*/package.json  # Should return all packages
```
