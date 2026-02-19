# Tooling & Dependencies - effect-smol

**Analysis Date:** 2026-02-19
**Repository:** `.repos/effect-smol`

## Executive Summary

The effect-smol repository uses a modern, carefully curated toolchain centered around:
- **pnpm** for workspace management (v10.17.1)
- **TypeScript** (v5.9.3) with ts-patch for patching
- **Vitest** (v4.0.18) for testing with Effect integration
- **oxlint** + **dprint** for linting & formatting
- **@effect/utils** for code generation
- **Babel** for pure call annotations
- **@changesets** for release management

---

## Package Manager

### pnpm Configuration

**Version:** 10.17.1 (specified in packageManager field)

**Workspace Pattern:**
```yaml
# pnpm-workspace.yaml
packages:
  - scratchpad
  - scripts
  - packages/*
  - packages/ai/*
  - packages/atom/*
  - packages/sql/*
  - packages/tools/*
  - examples/*
```

**Key Features:**
- Nested workspace support (packages/ai/*, packages/sql/*)
- Explicit patterns for each category
- No workspace hoisting (flat node_modules in packages)

---

## Standard Script Patterns

### Root Scripts (Monorepo-Level)

```json
{
  "scripts": {
    "postinstall": "pnpm ai:rulesync",
    "clean": "node scripts/clean.mjs",
    "codegen": "pnpm --recursive --parallel --filter \"./packages/**/*\" run codegen",
    "build": "tspc -b tsconfig.packages.json && pnpm --recursive --parallel --filter \"./packages/**/*\" run build",
    "build:tsgo": "tsgo -b tsconfig.packages.json && pnpm --recursive --parallel --filter \"./packages/**/*\" run build:tsgo",
    "circular": "node scripts/circular.mjs",
    "test": "vitest",
    "coverage": "vitest --coverage",
    "check": "tspc -b tsconfig.json",
    "check:tsgo": "tsgo -b tsconfig.json",
    "check-recursive": "pnpm --recursive --filter \"./packages/**/*\" exec tspc -b tsconfig.json",
    "lint": "oxlint && dprint check",
    "lint-fix": "oxlint --fix && dprint fmt",
    "ai:rulesync": "rulesync generate --targets=claudecode,codexcli,opencode --features=commands,rules,skills",
    "docgen": "pnpm --recursive --filter \"./packages/**/*\" exec docgen && node scripts/docs.mjs",
    "analyze-jsdoc": "node scripts/analyze-jsdoc.mjs",
    "test-types": "tstyche",
    "changeset-version": "changeset version",
    "changeset-publish": "pnpm codemod && pnpm build && changeset publish"
  }
}
```

### Package Scripts (Per-Package)

**Universal pattern across all packages:**
```json
{
  "scripts": {
    "codegen": "effect-utils codegen",
    "build": "tsc -b tsconfig.json && pnpm babel",
    "build:tsgo": "tsgo -b tsconfig.json && pnpm babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "vitest",
    "coverage": "vitest --coverage"
  }
}
```

**Script Purposes:**

| Script | Purpose | Tools Used |
|--------|---------|------------|
| `codegen` | Generate barrel files & exports | @effect/utils |
| `build` | Full build (TypeScript + Babel) | tsc/tspc + Babel |
| `build:tsgo` | Fast build (Native TypeScript) | tsgo + Babel |
| `babel` | Add pure call annotations | babel-plugin-annotate-pure-calls |
| `check` | Type checking only (no emit) | tsc/tspc |
| `test` | Run tests | vitest |
| `coverage` | Generate coverage reports | vitest --coverage |

---

## Core Development Dependencies

### TypeScript Toolchain

```json
{
  "typescript": "^5.9.3",
  "ts-patch": "^3.3.0",
  "@typescript/native-preview": "7.0.0-dev.20260201.1",
  "@effect/language-service": "^0.73.1"
}
```

**Key Tools:**
- **typescript**: Standard TypeScript compiler (v5.9.3)
- **ts-patch**: Patches TypeScript for plugin support
- **@typescript/native-preview**: Native TypeScript compiler (experimental)
- **@effect/language-service**: Effect-specific IDE support & transformations

**Commands:**
- `tspc` - Patched TypeScript compiler (ts-patch)
- `tsgo` - Native TypeScript compiler (experimental, faster)

---

### Testing Framework

```json
{
  "vitest": "4.0.18",
  "@vitest/browser": "4.0.18",
  "@vitest/coverage-v8": "4.0.18",
  "@vitest/expect": "4.0.18",
  "@vitest/web-worker": "4.0.18",
  "@effect/vitest": "workspace:^",
  "happy-dom": "^20.4.0",
  "playwright": "^1.58.1",
  "vitest-websocket-mock": "^0.5.0"
}
```

**Key Tools:**
- **vitest**: Primary test runner (v4.0.18)
- **@vitest/coverage-v8**: Code coverage provider
- **@effect/vitest**: Custom Effect integration
- **happy-dom**: Fast DOM implementation for tests
- **playwright**: Browser automation for E2E tests
- **vitest-websocket-mock**: WebSocket mocking

**Configuration:**
- Root: `vitest.config.ts` (workspace test orchestration)
- Shared: `vitest.shared.ts` (common config for all packages)
- Packages: `vitest.config.ts` (package-specific overrides)

---

### Linting & Formatting

```json
{
  "oxlint": "^1.42.0",
  "@effect/oxc": "workspace:^",
  "dprint": "^0.51.1"
}
```

**Key Tools:**
- **oxlint**: Fast Rust-based linter (Oxc project)
- **@effect/oxc**: Custom Effect lint rules
- **dprint**: Code formatter (Rust-based)

**Configuration Files:**
- `.oxlintrc.json` - Linting rules & ignores
- `dprint.json` - Formatting rules
- `packages/tools/oxc/oxlintrc.json` - Base lint rules

**Lint Commands:**
```bash
oxlint                    # Check for issues
oxlint --fix              # Auto-fix issues
dprint check              # Check formatting
dprint fmt                # Format files
```

---

### Build Tools

```json
{
  "@babel/cli": "^7.28.6",
  "@babel/core": "^7.29.0",
  "babel-plugin-annotate-pure-calls": "^0.5.0",
  "rollup": "^4.57.1",
  "rollup-plugin-esbuild": "^6.2.1",
  "@rollup/plugin-terser": "^0.4.4",
  "terser": "^5.46.0"
}
```

**Key Tools:**
- **Babel**: JavaScript transpiler (for pure call annotations)
- **Rollup**: Module bundler (for bundle size analysis)
- **terser**: Minifier
- **esbuild**: Fast bundler (via rollup plugin)

**Purpose:**
- Babel adds `/*#__PURE__*/` annotations for better tree-shaking
- Rollup used for bundle analysis (not production builds)

---

### Code Generation

```json
{
  "@effect/utils": "workspace:^",
  "@effect/docgen": "https://pkg.pr.new/Effect-TS/docgen/@effect/docgen@e7fe055",
  "jscodeshift": "^17.3.0",
  "ast-types": "^0.14.2"
}
```

**Key Tools:**
- **@effect/utils**: Effect-specific codegen (barrel files, exports)
- **@effect/docgen**: Documentation generation
- **jscodeshift**: Code transformation tool
- **ast-types**: AST manipulation utilities

**Codegen Commands:**
```bash
effect-utils codegen      # Generate barrel files
docgen                    # Generate API docs
```

---

### Version Management

```json
{
  "@changesets/cli": "^2.29.8",
  "@changesets/changelog-github": "^0.5.2"
}
```

**Key Tools:**
- **@changesets/cli**: Monorepo versioning & publishing
- **@changesets/changelog-github**: GitHub changelog generation

**Workflow:**
1. `changeset` - Create changeset file
2. `changeset version` - Bump versions
3. `changeset publish` - Publish packages

---

### AI Tools & Rules

```json
{
  "rulesync": "^6.2.0"
}
```

**Purpose:** Sync AI assistant rules across tools (Claude Code, Codex, etc.)

**Command:**
```bash
rulesync generate --targets=claudecode,codexcli,opencode --features=commands,rules,skills
```

---

### Type Testing

```json
{
  "tstyche": "^6.2.0"
}
```

**Purpose:** Type-level testing (tests in `dtslint/` directories)

**Configuration:** `tstyche.config.json`

---

### Dependency Analysis

```json
{
  "madge": "^8.0.0"
}
```

**Purpose:** Circular dependency detection

**Command:**
```bash
madge -c .                # Check for circular deps
```

---

## Dependency Version Strategies

### Workspace Protocol

**Pattern:** `workspace:^`

```json
{
  "dependencies": {
    "@effect/platform-node-shared": "workspace:^"
  },
  "peerDependencies": {
    "effect": "workspace:^"
  },
  "devDependencies": {
    "effect": "workspace:^"
  }
}
```

**Benefits:**
- Always uses local workspace version
- Prevents version mismatches
- Supports monorepo development

### External Dependencies

**Pattern:** Caret ranges (`^`) for most deps

```json
{
  "dependencies": {
    "fast-check": "^4.5.3",
    "uuid": "^13.0.0",
    "yaml": "^2.8.2"
  }
}
```

**Exceptions:** Exact versions for patched dependencies

### Peer Dependencies

**Pattern:** effect is almost always a peer dependency

```json
{
  "peerDependencies": {
    "effect": "workspace:^"
  }
}
```

---

## Common Dependencies Across Packages

### Universal Dev Dependencies

Present in almost every package:

```json
{
  "@types/node": "^25.2.0"
}
```

### Common Runtime Dependencies

**Effect packages:**
```json
{
  "dependencies": {
    "effect": "workspace:^"
  }
}
```

**Platform packages:**
```json
{
  "dependencies": {
    "@effect/platform-node": "workspace:^",
    "@effect/platform-node-shared": "workspace:^"
  }
}
```

---

## Configuration File Patterns

### dprint.json (Formatting)

```json
{
  "$schema": "https://dprint.dev/schemas/v0.json",
  "includes": ["**/*.{ts,tsx,js,jsx,json,md}"],
  "indentWidth": 2,
  "lineWidth": 120,
  "newLineKind": "lf",
  "typescript": {
    "semiColons": "asi",
    "quoteStyle": "alwaysDouble",
    "trailingCommas": "never",
    "operatorPosition": "maintain",
    "arrowFunction.useParentheses": "force"
  },
  "excludes": [
    "**/dist",
    "**/build",
    "**/docs",
    "**/coverage",
    "packages/**/CHANGELOG.md",
    "!scratchpad/**/*",
    ".agents",
    ".context"
  ],
  "plugins": [
    "https://plugins.dprint.dev/typescript-0.93.4.wasm",
    "https://plugins.dprint.dev/markdown-0.20.0.wasm",
    "https://plugins.dprint.dev/json-0.21.1.wasm"
  ]
}
```

**Key Settings:**
- No semicolons (ASI)
- Double quotes always
- No trailing commas
- 120 character line width
- LF line endings
- Force parentheses on arrow functions

### .oxlintrc.json (Linting)

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "extends": ["./packages/tools/oxc/oxlintrc.json"],
  "ignorePatterns": [
    "**/dist",
    "**/build",
    "**/docs",
    "**/.tsbuildinfo",
    "packages/**/CHANGELOG.md",
    "!scratchpad/**/*",
    ".agents/**/*",
    ".context/**/*"
  ],
  "jsPlugins": ["@effect/oxc/oxlint"],
  "overrides": [{
    "files": ["**/{test,dtslint,examples,benchmark,bundle,scripts,scratchpad}/**"],
    "rules": {
      "eslint/no-console": "off",
      "effect/no-import-from-barrel-package": "off"
    }
  }]
}
```

**Key Features:**
- Custom Effect lint rules via plugin
- Overrides for test/example code
- Extends base config from tools/oxc

### vitest.shared.ts (Test Config)

```typescript
export default {
  esbuild: {
    target: "es2020"
  },
  optimizeDeps: {
    exclude: ["bun:sqlite"]
  },
  plugins: [aliases()],  // tsconfig paths
  test: {
    setupFiles: ["vitest.setup.ts"],
    fakeTimers: {
      toFake: undefined  // Disable fake timers by default
    },
    sequence: {
      concurrent: true    // Run tests concurrently
    },
    include: ["test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["html"],
      reportsDirectory: "coverage",
      exclude: [
        "node_modules/",
        "dist/",
        "benchmark/",
        "test/utils/",
        "**/*.d.ts",
        "**/*.config.*"
      ]
    }
  }
}
```

---

## Build Scripts

### Custom Scripts

Located in `scripts/` directory:

| Script | Purpose |
|--------|---------|
| `clean.mjs` | Clean build artifacts |
| `codemod.mjs` | Code transformations |
| `circular.mjs` | Circular dependency detection |
| `docs.mjs` | Documentation processing |
| `analyze-jsdoc.mjs` | JSDoc coverage analysis |
| `version.mjs` | Version bumping |

### Script Execution

**Root scripts use Node.js:**
```bash
node scripts/clean.mjs
```

**Package scripts use effect-utils:**
```bash
effect-utils codegen
```

---

## Key Takeaways for @beep/repo-cli

1. **Standard scripts:** All packages use identical script patterns
2. **pnpm workspaces:** Nested workspace support required
3. **Codegen required:** effect-utils codegen for barrel files
4. **Dual compilation:** Support both tsc and tsgo
5. **Babel required:** Pure call annotations for tree-shaking
6. **Vitest standard:** Use vitest with shared config
7. **Lint + Format:** oxlint + dprint combination
8. **Workspace protocol:** Use `workspace:^` for internal deps
9. **Type checking:** Separate check vs build scripts
10. **Documentation:** docgen.json in each package

---

## Template Package.json Scripts

```json
{
  "scripts": {
    "codegen": "effect-utils codegen",
    "build": "tsc -b tsconfig.json && pnpm babel",
    "build:tsgo": "tsgo -b tsconfig.json && pnpm babel",
    "babel": "babel dist --plugins annotate-pure-calls --out-dir dist --source-maps",
    "check": "tsc -b tsconfig.json",
    "test": "vitest",
    "coverage": "vitest --coverage"
  },
  "devDependencies": {
    "@types/node": "^25.2.0"
  },
  "dependencies": {
    "effect": "workspace:^"
  },
  "peerDependencies": {
    "effect": "workspace:^"
  }
}
```
