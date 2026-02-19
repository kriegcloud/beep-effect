# Build System - effect-smol

**Analysis Date:** 2026-02-19
**Repository:** `.repos/effect-smol`

## Executive Summary

The effect-smol build system uses a **two-phase compilation pipeline**:
1. **TypeScript compilation** (tsc/tsgo) → dist/*.js + dist/*.d.ts
2. **Babel post-processing** → adds pure call annotations

Output is organized in a **dist/** directory mirroring the **src/** structure, with separate files for JavaScript, type definitions, and source maps.

---

## Build Pipeline Overview

### Two-Phase Build

```
Source (src/)
    ↓
[TypeScript Compiler]
    ↓
dist/*.js (ESM)
dist/*.d.ts (types)
dist/*.js.map (source maps)
dist/*.d.ts.map (declaration maps)
    ↓
[Babel Post-Processing]
    ↓
dist/*.js (with pure annotations)
```

---

## Phase 1: TypeScript Compilation

### Compiler Options

**Two compiler choices:**

1. **tsc (Standard)** - via ts-patch (`tspc`)
   ```bash
   tspc -b tsconfig.json
   ```

2. **Native TypeScript (Experimental)** - faster
   ```bash
   tsgo -b tsconfig.json
   ```

### TypeScript Configuration

From `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    // Output Configuration
    "outDir": "${configDir}/dist",
    "rootDir": "${configDir}/src",

    // Module System
    "target": "ES2022",
    "module": "NodeNext",
    "moduleDetection": "force",

    // Output Files
    "declaration": true,           // Generate .d.ts
    "declarationMap": true,        // Generate .d.ts.map
    "sourceMap": true,             // Generate .js.map

    // Build Features
    "incremental": true,           // Enable incremental builds
    "composite": true,             // Enable project references

    // Import Transformations
    "rewriteRelativeImportExtensions": true,  // .ts → .js in imports
    "verbatimModuleSyntax": true              // Preserve import syntax
  }
}
```

### Output Structure

```
packages/effect/
├── src/
│   ├── index.ts
│   ├── Array.ts
│   ├── Option.ts
│   └── internal/
│       └── array.ts
└── dist/            (generated)
    ├── index.js
    ├── index.d.ts
    ├── index.js.map
    ├── index.d.ts.map
    ├── Array.js
    ├── Array.d.ts
    ├── Array.js.map
    ├── Array.d.ts.map
    ├── Option.js
    ├── Option.d.ts
    └── internal/
        ├── array.js
        ├── array.d.ts
        └── [maps]
```

**Key Points:**
- Mirrors src/ structure exactly
- Four files per module: .js, .d.ts, .js.map, .d.ts.map
- Internal directories preserved
- All files in ESM format (NodeNext module system)

---

## Phase 2: Babel Post-Processing

### Purpose

Add `/*#__PURE__*/` annotations to function calls for better tree-shaking.

### Command

```bash
babel dist --plugins annotate-pure-calls --out-dir dist --source-maps
```

### Plugin

**babel-plugin-annotate-pure-calls** (v0.5.0)

### What It Does

Transforms:
```javascript
const result = someFunction()
```

Into:
```javascript
const result = /*#__PURE__*/ someFunction()
```

This tells bundlers (webpack, rollup, esbuild) that the function has no side effects and can be safely removed if unused.

### Configuration

**Root `.babelrc` (if present) or inline in package.json:**
```json
{
  "plugins": ["annotate-pure-calls"]
}
```

**Script:**
```json
{
  "scripts": {
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps"
  }
}
```

---

## Build Commands

### Package-Level Build

```bash
# Standard build
pnpm build
# → tspc -b tsconfig.json && pnpm babel

# Fast build (experimental)
pnpm build:tsgo
# → tsgo -b tsconfig.json && pnpm babel

# Type check only (no emit)
pnpm check
# → tspc -b tsconfig.json
```

### Monorepo Build

```bash
# Build all packages
pnpm build
# → tspc -b tsconfig.packages.json && pnpm --recursive --parallel --filter "./packages/**/*" run build

# Type check all packages
pnpm check
# → tspc -b tsconfig.json
```

---

## Incremental Builds

### Configuration

```jsonc
{
  "compilerOptions": {
    "incremental": true,
    "composite": true
  }
}
```

### Build Cache

**File:** `tsconfig.tsbuildinfo`

**Purpose:** Track compilation state for incremental builds

**Location:** Package root (e.g., `packages/effect/tsconfig.tsbuildinfo`)

**Git:** Ignored (in .gitignore)

### Project References

```jsonc
// tsconfig.packages.json
{
  "references": [
    { "path": "packages/effect" },
    { "path": "packages/platform-node" },
    // ...all packages
  ]
}
```

**Benefits:**
- TypeScript builds dependencies first
- Only rebuilds changed packages
- Faster CI builds

---

## Output Files

### Published Files

From package.json `files` field:

```json
{
  "files": [
    "src/**/*.ts",
    "dist/**/*.js",
    "dist/**/*.js.map",
    "dist/**/*.d.ts",
    "dist/**/*.d.ts.map"
  ]
}
```

**Included in npm package:**
- Source files (src/*.ts) - for source maps to work
- Compiled JavaScript (dist/*.js)
- Type definitions (dist/*.d.ts)
- JavaScript source maps (dist/*.js.map)
- Declaration source maps (dist/*.d.ts.map)

### Ignored Files

From .gitignore:

```gitignore
dist/
build/
**/*.tsbuildinfo
coverage/
```

**Not committed to git:**
- Build output (dist/)
- Incremental build cache (*.tsbuildinfo)
- Test coverage (coverage/)

---

## Module Format

### ESM Only

**Configuration:**
```json
{
  "type": "module",
  "compilerOptions": {
    "module": "NodeNext",
    "target": "ES2022"
  }
}
```

**Output:** ES modules (.js with `import`/`export`)

**No CJS:** No CommonJS output (effect v4+ is ESM-only)

### Import Rewriting

**Source:**
```typescript
import { pipe } from "./Function.ts"
```

**Output:**
```javascript
import { pipe } from "./Function.js"
```

**Enabled by:**
```jsonc
{
  "rewriteRelativeImportExtensions": true
}
```

---

## Build Scripts Breakdown

### Root Scripts

```json
{
  "scripts": {
    "clean": "node scripts/clean.mjs",
    "build": "tspc -b tsconfig.packages.json && pnpm --recursive --parallel --filter \"./packages/**/*\" run build",
    "build:tsgo": "tsgo -b tsconfig.packages.json && pnpm --recursive --parallel --filter \"./packages/**/*\" run build:tsgo"
  }
}
```

**Execution Order:**
1. Compile all packages (project references determine order)
2. Run each package's babel script in parallel

### Package Scripts

```json
{
  "scripts": {
    "build": "tsc -b tsconfig.json && pnpm babel",
    "build:tsgo": "tsgo -b tsconfig.json && pnpm babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps"
  }
}
```

**Execution:**
```bash
# In package directory
pnpm build
# 1. TypeScript compilation (tsc -b)
# 2. Babel annotation (pnpm babel)
```

---

## Build Optimization

### Parallel Builds

```bash
pnpm --recursive --parallel --filter "./packages/**/*" run build
```

**Benefits:**
- Independent packages build in parallel
- Faster CI/CD pipeline
- Better CPU utilization

### Composite Builds

```jsonc
{
  "composite": true,
  "references": [
    { "path": "../effect" }
  ]
}
```

**Benefits:**
- TypeScript handles dependency order
- Incremental builds (only rebuild what changed)
- Project-level caching

---

## Build Verification

### Type Checking

```bash
# Check without emit
pnpm check
# → tspc -b tsconfig.json

# Recursive check (all packages)
pnpm check-recursive
# → pnpm --recursive --filter "./packages/**/*" exec tspc -b tsconfig.json
```

### Circular Dependencies

```bash
pnpm circular
# → node scripts/circular.mjs (uses madge)
```

---

## Development vs Production

### Development (Local)

**Exports point to src/:**
```json
{
  "exports": {
    ".": "./src/index.ts"
  }
}
```

**No build required** - TypeScript/Node can run .ts files directly

### Production (Published)

**publishConfig exports point to dist/:**
```json
{
  "publishConfig": {
    "exports": {
      ".": "./dist/index.js"
    }
  }
}
```

**Build required** - npm package contains compiled .js files

---

## Special Build Cases

### Unstable Features

**Build:** Included in standard build

**Output:**
```
dist/
└── unstable/
    ├── ai/
    │   ├── index.js
    │   └── [modules]
    └── http/
```

**Exports:**
```json
{
  "exports": {
    "./unstable/ai": "./dist/unstable/ai/index.js",
    "./unstable/http": "./dist/unstable/http/index.js"
  }
}
```

### Internal Modules

**Build:** Compiled but not exported

**Output:**
```
dist/internal/
├── array.js
├── option.js
└── [modules]
```

**Exports:**
```json
{
  "exports": {
    "./internal/*": null  // Blocked
  }
}
```

---

## Build Performance

### Standard Build (tsc)

**Time:** ~30-60s for full monorepo (30 packages)

**Features:**
- Full type checking
- Project references
- Incremental builds

### Fast Build (tsgo)

**Time:** ~15-30s for full monorepo

**Features:**
- Native TypeScript compiler (Rust-based)
- Experimental
- Faster but less tested

### Incremental Build

**Time:** ~5-15s (only changed packages)

**Requires:**
- Composite mode enabled
- Previous build artifacts (.tsbuildinfo)

---

## Key Takeaways for @beep/repo-cli

1. **Two-phase build:** TypeScript → Babel
2. **Dist structure:** Mirrors src/ exactly
3. **Output files:** .js, .d.ts, .js.map, .d.ts.map
4. **ESM only:** No CommonJS output
5. **Incremental builds:** Enabled via composite
6. **Project references:** For dependency ordering
7. **Pure annotations:** Required for tree-shaking
8. **Dual exports:** src/ (dev) vs dist/ (prod)
9. **Parallel builds:** For independent packages
10. **Build verification:** Separate check scripts

---

## Build Script Template

```json
{
  "scripts": {
    "codegen": "effect-utils codegen",
    "build": "tsc -b tsconfig.json && pnpm babel",
    "build:tsgo": "tsgo -b tsconfig.json && pnpm babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
    "check": "tsc -b tsconfig.json",
    "clean": "rm -rf dist *.tsbuildinfo"
  }
}
```

---

## Build Output Validation

### What to Check

1. **dist/ exists** after build
2. **All .ts files** have corresponding .js files
3. **Type definitions** (.d.ts) generated
4. **Source maps** (.js.map, .d.ts.map) present
5. **Pure annotations** in .js files
6. **Import paths** rewritten (.ts → .js)

### Verification Commands

```bash
# Check dist exists
ls dist/

# Count output files
find dist -type f | wc -l

# Verify pure annotations
grep -r "PURE" dist/

# Check import paths
grep -r "from.*\.js" dist/
```
