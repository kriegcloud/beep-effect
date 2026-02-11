# P1 Discovery Report

**Date**: 2026-02-10
**Branch**: `native-preview-experiment`
**Executor**: Phase 1 Discovery Agent

---

## tsgo Installation

- **Version installed**: `7.0.0-dev.20260210.1`
- **Binary**: `npx tsgo` (from `@typescript/native-preview`)
- **Install command**: `bun add -D @typescript/native-preview`
- **Install successful**: Yes, side-by-side with `typescript@^5.9.3`
- **`prepare` script**: `effect-language-service patch` ran successfully after install, reporting TypeScript already patched

---

## tsc Invocation Inventory

All `package.json` files in the project (excluding `.repos/` submodules) that invoke `tsc`:

### Packages — Standard Pattern (`build-esm` / `check` / `dev`)

| Package | Script | Command |
|---------|--------|---------|
| `@beep/types` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/types` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/types` | check | `tsc -b tsconfig.json` |
| `@beep/constants` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/constants` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/constants` | check | `tsc -b tsconfig.json` |
| `@beep/invariant` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/invariant` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/invariant` | check | `tsc -b tsconfig.json` |
| `@beep/utils` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/utils` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/utils` | check | `tsc -b tsconfig.json` |
| `@beep/schema` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/schema` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/schema` | check | `tsc -b tsconfig.json` |
| `@beep/identity` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/identity` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/identity` | check | `tsc -b tsconfig.json` |
| `@beep/wrap` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/wrap` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/wrap` | check | `tsc -b tsconfig.json` |
| `@beep/errors` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/errors` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/errors` | check | `tsc -b tsconfig.json` |
| `@beep/machine` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/machine` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/machine` | check | `tsc -b tsconfig.json` |
| `@beep/semantic-web` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/semantic-web` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/semantic-web` | check | `tsc -b tsconfig.json` |
| `@beep/shared-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/shared-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/shared-domain` | check | `tsc -b tsconfig.json` |
| `@beep/shared-tables` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/shared-tables` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/shared-tables` | check | `tsc -b tsconfig.json` |
| `@beep/shared-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/shared-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/shared-server` | check | `tsc -b tsconfig.json` |
| `@beep/shared-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/shared-client` | check | `tsc -b tsconfig.json` |
| `@beep/shared-ui` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/shared-ui` | check | `tsc -b tsconfig.json` |
| `@beep/shared-env` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/shared-env` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/shared-env` | check | `tsc -b tsconfig.json` |
| `@beep/shared-ai` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/shared-ai` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/shared-ai` | check | `tsc -b tsconfig.json` |
| `@beep/iam-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/iam-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/iam-domain` | check | `tsc -b tsconfig.json` |
| `@beep/iam-tables` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/iam-tables` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/iam-tables` | check | `tsc -b tsconfig.json` |
| `@beep/iam-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/iam-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/iam-server` | check | `tsc -b tsconfig.json` |
| `@beep/iam-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/iam-client` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/iam-client` | check | `tsc -b tsconfig.json` |
| `@beep/iam-ui` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/iam-ui` | check | `tsc -b tsconfig.json` |
| `@beep/documents-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/documents-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/documents-domain` | check | `tsc -b tsconfig.json` |
| `@beep/documents-tables` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/documents-tables` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/documents-tables` | check | `tsc -b tsconfig.json` |
| `@beep/documents-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/documents-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/documents-server` | check | `tsc -b tsconfig.json` |
| `@beep/documents-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/documents-client` | check | `tsc -b tsconfig.json` |
| `@beep/documents-ui` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/documents-ui` | check | `tsc -b tsconfig.json` |
| `@beep/calendar-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/calendar-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/calendar-domain` | check | `tsc -b tsconfig.json` |
| `@beep/calendar-tables` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/calendar-tables` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/calendar-tables` | check | `tsc -b tsconfig.json` |
| `@beep/calendar-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/calendar-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/calendar-server` | check | `tsc -b tsconfig.json` |
| `@beep/calendar-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/calendar-client` | check | `tsc -b tsconfig.json` |
| `@beep/calendar-ui` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/calendar-ui` | check | `tsc -b tsconfig.json` |
| `@beep/knowledge-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/knowledge-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/knowledge-domain` | check | `tsc -b tsconfig.json` |
| `@beep/knowledge-tables` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/knowledge-tables` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/knowledge-tables` | check | `tsc -b tsconfig.json` |
| `@beep/knowledge-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/knowledge-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/knowledge-server` | check | `tsc -b tsconfig.json` |
| `@beep/knowledge-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/knowledge-client` | check | `tsc -b tsconfig.json` |
| `@beep/knowledge-ui` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/knowledge-ui` | check | `tsc -b tsconfig.json` |
| `@beep/comms-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/comms-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/comms-domain` | check | `tsc -b tsconfig.json` |
| `@beep/comms-tables` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/comms-tables` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/comms-tables` | check | `tsc -b tsconfig.json` |
| `@beep/comms-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/comms-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/comms-server` | check | `tsc -b tsconfig.json` |
| `@beep/comms-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/comms-client` | check | `tsc -b tsconfig.json` |
| `@beep/comms-ui` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/comms-ui` | check | `tsc -b tsconfig.json` |
| `@beep/customization-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/customization-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/customization-domain` | check | `tsc -b tsconfig.json` |
| `@beep/customization-tables` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/customization-tables` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/customization-tables` | check | `tsc -b tsconfig.json` |
| `@beep/customization-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/customization-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/customization-server` | check | `tsc -b tsconfig.json` |
| `@beep/customization-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/customization-client` | check | `tsc -b tsconfig.json` |
| `@beep/customization-ui` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/customization-ui` | check | `tsc -b tsconfig.json` |
| `@beep/google-workspace-domain` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/google-workspace-domain` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/google-workspace-domain` | check | `tsc -b tsconfig.json` |
| `@beep/google-workspace-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/google-workspace-client` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/google-workspace-client` | check | `tsc -b tsconfig.json` |
| `@beep/google-workspace-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/google-workspace-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/google-workspace-server` | check | `tsc -b tsconfig.json` |
| `@beep/db-admin` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/db-admin` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/db-admin` | check | `tsc -b tsconfig.json` |
| `@beep/ui-core` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/ui-core` | check | `tsc -b tsconfig.json` |
| `@beep/ui` (packages/ui/ui) | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/ui` | check | `tsc -b tsconfig.json` |
| `@beep/ui-editor` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/ui-editor` | check | `tsc -b tsconfig.json` |
| `@beep/ui-spreadsheet` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/ui-spreadsheet` | check | `tsc -b tsconfig.json` |
| `@beep/runtime-client` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/runtime-client` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/runtime-client` | check | `tsc -b tsconfig.json` |
| `@beep/runtime-server` | build-esm | `tsc -b tsconfig.build.json` |
| `@beep/runtime-server` | dev | `tsc -b tsconfig.build.json --watch` |
| `@beep/runtime-server` | check | `tsc -b tsconfig.json` |

### Tooling Packages

| Package | Script | Command |
|---------|--------|---------|
| `@beep/build-utils` | build | `tsc -b tsconfig.build.json` |
| `@beep/build-utils` | check | `tsc -b tsconfig.json` |
| `@beep/repo-scripts` | build | `tsc -b tsconfig.build.json` |
| `@beep/repo-scripts` | check | `tsc -b tsconfig.json` |
| `@beep/repo-cli` | build | `tsc -b tsconfig.build.json` |
| `@beep/repo-cli` | check | `tsc -b tsconfig.json` |
| `@beep/tooling-utils` | build | `tsc -b tsconfig.build.json` |
| `@beep/tooling-utils` | check | `tsc -b tsconfig.json` |
| `@beep/testkit` | build | `tsc -b tsconfig.build.json` |
| `@beep/testkit` | check | `tsc -b tsconfig.json` |

### Apps

| Package | Script | Command |
|---------|--------|---------|
| `apps/server` | build | `tsc -b tsconfig.build.json` |
| `apps/server` | check | `tsc -b tsconfig.json` |
| `apps/todox` | check | `tsc --noEmit` |

### Summary

- **Total packages with tsc**: ~55 (excluding `.repos/` submodules)
- **Standard pattern packages**: ~48 (use `build-esm`/`check`/`dev`)
- **Tooling packages**: 5 (use `build`/`check`)
- **Apps**: 2 (server uses `-b`, todox uses `--noEmit`)
- **All scripts use `tsc -b`** except `apps/todox` which uses `tsc --noEmit`

---

## TypeScript JS API Consumers

| File | Import | Purpose | Blocks Strict? |
|------|--------|---------|---------------|
| `tooling/repo-scripts/src/analyze-jsdoc.ts` | `import ts from "typescript"` | Runtime — JSDoc analysis using TypeScript compiler API | YES |
| `tooling/cli/src/commands/create-slice/utils/ts-morph.ts` | `import { Project } from "ts-morph"` | Runtime — AST manipulation for slice code generation | YES |
| `tooling/cli/src/commands/docgen/shared/ast.ts` | `import { ... } from "ts-morph"` | Runtime — API doc generation AST utilities | YES |
| `tooling/cli/test/commands/docgen/shared/ast.test.ts` | `import { Project } from "ts-morph"` | Test — docgen test fixtures | YES (transitive) |
| Root `package.json` | `effect-language-service patch` | Runtime — patches `node_modules/typescript/lib/typescript.js` for Effect support | YES |

### Analysis

- **ts-morph** is used in `tooling/cli` for code generation and docgen — requires `typescript` package at runtime
- **`analyze-jsdoc.ts`** directly imports `typescript` as a module for JSDoc analysis
- **`effect-language-service patch`** modifies the installed `typescript` package to add Effect-specific language service features — requires `typescript` package
- **Biome** is used for linting and has NO dependency on the TypeScript JS API
- **All TypeScript API consumers are in tooling** — not in application packages

**Conclusion**: The `typescript` package CANNOT be removed. It must remain as a devDependency for ts-morph, analyze-jsdoc, and effect-language-service.

---

## Flag Compatibility

Testing was performed against `packages/common/types/tsconfig.json` which extends `tsconfig.base.jsonc`.

### Direct Flag Test Results

| Flag | Value | Accepted by tsgo? | Error (if rejected) |
|------|-------|-------------------|---------------------|
| `incremental` | `true` | YES | — |
| `composite` | `true` | YES | — |
| `target` | `ES2024` | YES | — |
| `module` | `ESNext` | YES | — |
| `moduleDetection` | `force` | YES | — |
| `esModuleInterop` | `true` | YES | — |
| `verbatimModuleSyntax` | `true` | YES | — |
| `rewriteRelativeImportExtensions` | `true` | YES | — |
| `erasableSyntaxOnly` | `true` | YES | — |
| `declarationMap` | `true` | YES | — |
| `sourceMap` | `true` | YES | — |
| `strict` | `true` | YES | — |
| `exactOptionalPropertyTypes` | `true` | YES | — |
| `allowImportingTsExtensions` | `true` | YES | — |
| `noImplicitReturns` | `true` | YES | — |
| `noUnusedLocals` | `true` | YES | — |
| `noImplicitOverride` | `true` | YES | — |
| `noFallthroughCasesInSwitch` | `true` | YES | — |
| `skipLibCheck` | `true` | YES | — |
| `noErrorTruncation` | `true` | YES | — |
| `emitDecoratorMetadata` | `true` | YES (accepted) | No rejection at parse time |
| `experimentalDecorators` | `true` | YES (accepted) | No rejection at parse time |
| `noUncheckedIndexedAccess` | `true` | YES | — |
| `moduleResolution` | `bundler` | YES | — |
| `isolatedModules` | `true` | YES | — |
| `declaration` | `true` | YES | — |
| `preserveWatchOutput` | `true` | YES | — |
| `noEmitOnError` | `true` | YES | — |
| `downlevelIteration` | `true` | YES | — |
| `resolveJsonModule` | `true` | YES | — |
| `paths` | (100+ aliases) | YES | — |

### Key Finding

**ALL flags in `tsconfig.base.jsonc` are accepted by tsgo.** No flag rejection errors occurred when running `npx tsgo --noEmit` or `npx tsgo -b` on `packages/common/types`. The P0 research predicted potential issues with `rewriteRelativeImportExtensions`, `erasableSyntaxOnly`, and `emitDecoratorMetadata`, but empirical testing shows they are all accepted.

---

## Leaf Package Test (@beep/types)

### Type-Check (tsgo -b tsconfig.json)

```
$ npx tsgo -b packages/common/types/tsconfig.json
Exit code: 0
```

**Result**: PASS — zero errors, clean type-check.

### Type-Check Comparison (tsc -b tsconfig.json)

```
$ npx tsc -b packages/common/types/tsconfig.json
Exit code: 0
```

**Result**: MATCH — both tsgo and tsc produce identical result (zero errors).

### Build/Emit (tsgo -b tsconfig.build.json)

```
$ rm -rf packages/common/types/build/
$ npx tsgo -b packages/common/types/tsconfig.build.json
Exit code: 0
```

**Build output inspection** (`packages/common/types/build/esm/`):
- JS files emitted (e.g., `all-extend.js`, `basic.js`, etc.)
- Source maps emitted (`.js.map` files)
- Hundreds of `.js` + `.js.map` pairs generated

**Result**: PASS — tsgo successfully emits JavaScript, declarations, and source maps for this type-only leaf package.

---

## Effect Package Test (@beep/schema)

### Type-Check with --noEmit

```
$ npx tsgo --noEmit -p packages/common/schema/tsconfig.json
Exit code: 0
```

**Result**: PASS — tsgo can type-check @beep/schema with zero errors using `--noEmit`.

### Build Mode (-b)

```
$ npx tsgo -b packages/common/schema/tsconfig.json
Exit code: 2

packages/common/utils/build/.../NonEmptyreadonly.d.ts(37,40): error TS1005: '>' expected.
packages/common/utils/build/.../NonEmptyreadonly.d.ts(37,42): error TS1109: Expression expected.
packages/common/utils/build/.../NonEmptyreadonly.d.ts(37,55): error TS1389: 'const' is not allowed as a variable declaration name.
[8 parse errors total]
```

**Result**: FAIL — tsgo cannot parse `const` type parameters in `.d.ts` declaration files.

### Comparison with tsc

```
$ npx tsc -b packages/common/schema/tsconfig.json
Exit code: 0
```

**Result**: tsc handles the same declaration files without issue.

### Root Cause Analysis

The failing declaration file (`NonEmptyreadonly.d.ts` line 37) contains:

```typescript
type MapWith = ReturnType<typeof F.dual<
  (<const Value, const MappedValue>(f: ...) => ...),
  <const Value, const MappedValue>(...) => ...
>>;
```

The `const` keyword in type parameter position (`<const Value>`) is a TypeScript 5.0+ feature. **tsgo's parser cannot handle `const` type parameters when reading `.d.ts` files** — even when tsgo itself generated those `.d.ts` files.

### Critical Discovery: tsgo Cannot Read Its Own Declaration Output

1. `npx tsgo -b packages/common/utils/tsconfig.build.json` → **EXIT 0** (builds from `.ts` source, generates `.d.ts` with `const` type params)
2. `npx tsgo -b packages/common/schema/tsconfig.build.json` → **EXIT 2** (tries to read utils' `.d.ts` output, fails to parse `const` type params)

This means tsgo can EMIT declarations with `const` type parameters but cannot PARSE them back. This is a fundamental parser limitation affecting build mode for any package downstream of code using `const` type parameters.

### Impact Assessment

- `@beep/utils` uses `const` type parameters via `effect/Function.dual`
- Any package depending on `@beep/utils` (nearly all packages) will fail with `tsgo -b`
- The `--noEmit` path is unaffected (reads `.ts` source, not `.d.ts` output)

---

## Feasibility Assessment

### Recommended Path: CHECK-ONLY

**tsgo should replace tsc ONLY in `check` scripts (type-checking with `--noEmit` equivalent).** Build scripts (`build-esm`) must continue using tsc.

### Rationale

| Criterion | tsgo Status |
|-----------|-------------|
| Type-checking (`--noEmit`) | WORKS on all tested packages |
| Build mode (`-b tsconfig.json` for check) | WORKS on leaf packages; FAILS on packages with `const` type param dependencies |
| Build mode (`-b tsconfig.build.json` for emit) | WORKS on leaf packages; FAILS on packages consuming `.d.ts` with `const` type params |
| Flag compatibility | ALL flags accepted |
| Effect types | No issues with type-checking; parser issue is in declaration files only |
| Side-by-side installation | No conflicts observed with `typescript@5.9.3` |

### Why Not HYBRID or STRICT?

- **STRICT** is impossible: `typescript` package must remain for ts-morph, effect-language-service, analyze-jsdoc
- **HYBRID** (tsgo for build+check) is blocked by the `const` type parameter parser bug: tsgo cannot read `.d.ts` files containing `const` type parameters in build mode, which breaks the project reference chain for nearly all packages
- **CHECK-ONLY** is the viable path because `--noEmit` / check mode reads `.ts` source files (via path aliases in `tsconfig.base.jsonc`) rather than `.d.ts` build output

### CHECK-ONLY Migration Strategy

For each package's `check` script, change:
```json
"check": "tsc -b tsconfig.json"
```
to:
```json
"check": "tsgo --noEmit -p tsconfig.json"
```

**Note**: The check scripts currently use `-b` (build mode) which resolves project references through `.d.ts` output. Switching to `--noEmit -p` makes tsgo resolve through `.ts` source files (via `paths` in `tsconfig.base.jsonc`), avoiding the declaration parsing issue entirely.

### Blockers

1. **`const` type parameter parser bug**: tsgo cannot parse `const` type parameters in `.d.ts` files (blocks HYBRID/STRICT)
2. **TypeScript JS API**: ts-morph, effect-language-service, analyze-jsdoc require `typescript` package (blocks STRICT)

### Risks

1. **`--noEmit` vs `-b` behavior differences**: The `check` scripts currently use `-b` which validates project references and incremental builds. Switching to `--noEmit -p` changes the resolution strategy (paths-based vs project-reference-based). This could surface or mask different errors.
2. **tsgo type-checking discrepancies**: While ~99.6% compatible, there may be minor differences in `@ts-expect-error` handling or overload resolution that only surface at scale.
3. **Developer experience**: Developers accustomed to `tsc -b` semantics may need to adapt to `tsgo --noEmit` for faster checks while keeping `tsc -b` for builds.

### Performance Benefit

Even CHECK-ONLY provides significant value:
- `bun run check` is the most frequently executed developer command
- 7-10x speedup on type-checking across 55 packages would dramatically improve iteration speed
- Build (`build-esm`) runs less frequently and benefits from Turborepo caching

---

## Appendix: Test Command Summary

| Test | Command | Result |
|------|---------|--------|
| tsgo version | `npx tsgo --version` | `7.0.0-dev.20260210.1` |
| Flag compat (noEmit) | `npx tsgo --noEmit -p packages/common/types/tsconfig.json` | EXIT 0 |
| Leaf build mode | `npx tsgo -b packages/common/types/tsconfig.json` | EXIT 0 |
| Leaf emit | `npx tsgo -b packages/common/types/tsconfig.build.json` | EXIT 0 |
| tsc baseline (types) | `npx tsc -b packages/common/types/tsconfig.json` | EXIT 0 |
| Schema noEmit | `npx tsgo --noEmit -p packages/common/schema/tsconfig.json` | EXIT 0 |
| Schema build mode | `npx tsgo -b packages/common/schema/tsconfig.json` | EXIT 2 (const type param parse error) |
| tsc baseline (schema) | `npx tsc -b packages/common/schema/tsconfig.json` | EXIT 0 |
| Utils noEmit | `npx tsgo --noEmit -p packages/common/utils/tsconfig.json` | EXIT 0 |
| Utils build mode | `npx tsgo -b packages/common/utils/tsconfig.json` | EXIT 2 (reads own stale .d.ts) |
| Utils clean build | `npx tsgo -b packages/common/utils/tsconfig.build.json` (after rm -rf build/) | EXIT 0 |
| Schema after utils tsgo build | `npx tsgo -b packages/common/schema/tsconfig.build.json` (after utils rebuilt by tsgo) | EXIT 2 (tsgo can't parse its own .d.ts) |
| Shared-domain noEmit | `npx tsgo --noEmit -p packages/shared/domain/tsconfig.json` | EXIT 0 |
| Shared-domain build mode | `npx tsgo -b packages/shared/domain/tsconfig.json` | EXIT 2 (cascading from utils .d.ts) |
