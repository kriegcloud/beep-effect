# Complete Tooling Setup for Package Creation

**Date:** 2026-02-19
**Status:** ✅ Complete

## Summary

All foundational tooling is now configured and ready for package creation. The @beep/repo-cli can now scaffold packages with full build/test/doc tooling support.

---

## Installed Tooling

### 1. ✅ TypeScript Compilation

**Standard (tspc):**
- **Package:** `ts-patch@3.3.0`
- **Command:** `tspc` (TypeScript with plugin support)
- **Usage:** Supports `@effect/language-service` plugin
- **Config:** `tsconfig.base.json` (uses `${configDir}`)
- **Applied:** `ts-patch install` ✅

**Fast (tsgo):**
- **Package:** `@typescript/native-preview@7.0.0-dev.20260201.1`
- **Command:** `tsgo` (experimental native compiler)
- **Usage:** Faster alternative to tsc
- **Scripts:** `build:tsgo`, `check:tsgo`

### 2. ✅ Type Testing (tstyche)

- **Package:** `tstyche@6.2.0`
- **Config:** `tstyche.config.json`
- **Command:** `bun run test-types`
- **Usage:** Type-level tests in `dtslint/**/*.tst.*` files
- **Pattern:** Tests type assertions and type-level logic

**tstyche.config.json:**
```json
{
  "$schema": "https://tstyche.org/schemas/config.json",
  "testFileMatch": [
    "packages/*/dtslint/**/*.tst.*",
    "tooling/*/dtslint/**/*.tst.*",
    "apps/*/dtslint/**/*.tst.*"
  ],
  "tsconfig": "ignore"
}
```

### 3. ✅ Documentation Generation (docgen)

- **Package:** `@effect/docgen` (from pkg.pr.new)
- **Command:** `bunx @effect/docgen`
- **Config:** `docgen.json` (per package)
- **Script:** `bun run docgen` (runs via Turbo)
- **Output:** Markdown docs from JSDoc comments

**Template docgen.json** (for packages):
```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "exclude": [
    "src/internal/**/*.ts"
  ],
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/<package-path>/src/",
  "examplesCompilerOptions": {
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "module": "ES2022",
    "target": "ES2022",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "rewriteRelativeImportExtensions": true,
    "allowImportingTsExtensions": true,
    "paths": {
      "effect": ["../../packages/effect/src/index.ts"],
      "@beep/*": ["../../<workspace>/**/src/index.ts"]
    }
  }
}
```

### 4. ✅ Babel (Pure Call Annotations)

- **Packages:**
  - `@babel/cli@7.28.6`
  - `@babel/core@7.29.0`
  - `babel-plugin-annotate-pure-calls@0.5.0`
- **Usage:** Inline in package scripts (no config file)
- **Command:** `babel dist --plugins annotate-pure-calls --out-dir dist --source-maps`
- **Purpose:** Add `/*#__PURE__*/` annotations for better tree-shaking

### 5. ✅ Vitest (Testing)

- **Package:** `vitest@4.0.18` (inherited from root)
- **Config:** `vitest.shared.ts` (shared), per-package `vitest.config.ts`
- **Integration:** `@effect/vitest@workspace:*` (once created)
- **Commands:** `bun test`, `bun coverage`

### 6. ⏭️ Codegen (Barrel Files)

- **Status:** To be created in `@beep/repo-cli`
- **Purpose:** Generate `index.ts` exports (barrel files)
- **Effect equivalent:** `@effect/utils` (workspace package)
- **Decision:** We'll implement this as part of repo-cli

---

## Root Scripts Available

```json
{
  "build": "bunx turbo run build",
  "build:tsgo": "tsgo -b tsconfig.packages.json",
  "check": "tsc -b tsconfig.json",
  "check:tsgo": "tsgo -b tsconfig.json",
  "test": "vitest",
  "test-types": "tstyche",
  "coverage": "vitest --coverage",
  "lint": "biome check .",
  "lint:fix": "biome check . --write",
  "lint:circular": "bunx madge --circular --extensions ts,tsx .",
  "docgen": "bunx turbo run docgen"
}
```

---

## Standard Package Scripts Pattern

Every package created by `@beep/repo-cli` will have:

```json
{
  "scripts": {
    "codegen": "@beep/repo-cli codegen",
    "build": "tsc -b tsconfig.json && bun run babel",
    "build:tsgo": "tsgo -b tsconfig.json && bun run babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "vitest",
    "coverage": "vitest --coverage",
    "docgen": "bunx @effect/docgen"
  }
}
```

---

## Package File Structure Template

```
@beep/example-package/
├── package.json
├── tsconfig.json              # Extends ../../tsconfig.base.json
├── vitest.config.ts           # Extends ../../vitest.shared.ts
├── docgen.json                # Documentation config
├── README.md                  # Package documentation
├── LICENSE                    # MIT license
├── src/
│   ├── index.ts              # Main barrel file (generated)
│   ├── internal/             # Private implementation
│   │   └── *.ts
│   └── [PublicModules].ts    # PascalCase public modules
├── test/
│   ├── [Module].test.ts      # Mirrors src structure
│   └── utils/                # Test utilities
└── dtslint/                  # Type tests (optional)
    └── *.tst.ts
```

---

## TypeScript Configuration Hierarchy

```
tsconfig.base.json
    ↓
tsconfig.packages.json (references all packages)
    ↓
tsconfig.json (root + tests + path aliases)
    ↓
[package]/tsconfig.json (simple, extends base)
```

**Package tsconfig.json template:**
```json
{
  "$schema": "http://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "include": ["src"],
  "compilerOptions": {
    "types": ["node", "bun"]
  }
}
```

---

## Vitest Configuration Hierarchy

```
vitest.shared.ts (shared config)
    ↓
vitest.config.ts (workspace projects)
    ↓
[package]/vitest.config.ts (extends shared)
```

**Package vitest.config.ts template:**
```typescript
import { defineConfig, mergeConfig } from "vitest/config"
import shared from "../../vitest.shared"

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      // Package-specific overrides
    }
  })
)
```

---

## Build Pipeline

### Two-Phase Build

```
Source (src/)
    ↓
[TypeScript Compiler] (tspc or tsgo)
    ↓
dist/*.js (ESM)
dist/*.d.ts (types)
dist/*.js.map (source maps)
dist/*.d.ts.map (declaration maps)
    ↓
[Babel Post-Processing]
    ↓
dist/*.js (with /*#__PURE__*/ annotations)
```

### Output Structure

```
package/
├── src/
│   ├── index.ts
│   └── Module.ts
└── dist/              # Generated
    ├── index.js
    ├── index.d.ts
    ├── index.js.map
    ├── index.d.ts.map
    ├── Module.js
    ├── Module.d.ts
    ├── Module.js.map
    └── Module.d.ts.map
```

---

## Documentation Standards

### Module-Level JSDoc

```typescript
/**
 * <One-line module description>
 *
 * ## Mental model
 *
 * - Key concept 1
 * - Key concept 2
 *
 * ## Common tasks
 *
 * - **Category**: {@link fn1}, {@link fn2}
 *
 * ## Gotchas
 *
 * - Edge case 1
 *
 * ## Quickstart
 *
 * **Example** (Description)
 *
 * ```ts
 * import { Module } from "@beep/package"
 *
 * const result = Module.function(...)
 * console.log(result)
 * ```
 *
 * @since X.0.0
 */
```

### Function-Level JSDoc

```typescript
/**
 * <One-line function description>
 *
 * @since X.0.0
 * @category DomainModel
 */
export const functionName = ...
```

### Required Tags

- `@since` - **MANDATORY** on all exports
- `@category` - Use one canonical taxonomy value (DomainModel, DomainLogic, PortContract, Validation, Utility, UseCase, Presentation, DataAccess, Integration, Configuration, CrossCutting, Uncategorized)
- `@internal` - Mark internal implementation functions

---

## Next Steps

1. ✅ All tooling configured and tested
2. ✅ Template patterns documented
3. ⏭️ Create `@beep/repo-cli` in `tooling/cli`
4. ⏭️ Implement `create-package` command
5. ⏭️ Implement `codegen` command for barrel files

---

## Ready for Package Creation! 🚀

All foundational tooling is in place. The `@beep/repo-cli` can now:

- Generate packages with correct tsconfig/vitest configs
- Support dual build modes (tsc/tsgo)
- Enable type testing with tstyche
- Generate documentation with docgen
- Apply babel pure annotations
- Follow effect-smol patterns exactly

**Time to build `@beep/repo-cli`!**
