# Package Structure - effect-smol

**Analysis Date:** 2026-02-19
**Repository:** `.repos/effect-smol`

## Executive Summary

The effect-smol monorepo contains **30 packages** organized in a clear hierarchy with consistent structure across all package types. The repository uses **pnpm workspaces** with organized categorization (ai/, sql/, atom/, tools/) and standardized package layouts.

---

## Repository Structure

### Top-Level Organization

```
effect-smol/
├── packages/                    # All publishable packages
│   ├── effect/                 # Core Effect library
│   ├── platform-node/          # Platform implementations
│   ├── platform-browser/
│   ├── platform-bun/
│   ├── platform-node-shared/
│   ├── opentelemetry/          # Integrations
│   ├── vitest/                 # Testing utilities
│   ├── ai/                     # AI integrations (4 packages)
│   ├── sql/                    # Database adapters (11 packages)
│   ├── atom/                   # UI framework adapters (3 packages)
│   └── tools/                  # Build & dev tools (4 packages)
├── scripts/                     # Build & automation scripts
├── scratchpad/                  # Development sandbox
└── examples/                    # Usage examples
```

### Package Count by Category

| Category | Count | Examples |
|----------|-------|----------|
| **Core** | 6 | effect, platform-*, opentelemetry, vitest |
| **AI** | 4 | anthropic, openai, openai-compat, openrouter |
| **SQL** | 11 | pg, mysql2, sqlite-*, mssql, clickhouse |
| **Atom** | 3 | react, solid, vue |
| **Tools** | 4 | utils, oxc, openapi-generator, bundle |
| **TOTAL** | **30** | |

---

## Workspace Configuration

### pnpm-workspace.yaml

```yaml
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

**Pattern:** Explicit glob patterns for each category directory to support nested packages.

---

## Standard Package Structure

### Typical Package Layout

```
packages/effect/
├── package.json           # Package metadata & config
├── tsconfig.json         # TypeScript configuration
├── vitest.config.ts      # Test configuration
├── docgen.json           # Documentation generation config
├── README.md             # Package documentation
├── CHANGELOG.md          # Version history
├── LICENSE               # MIT license
├── src/                  # Source code
│   ├── index.ts         # Main barrel file
│   ├── Array.ts         # Public modules (PascalCase)
│   ├── Option.ts
│   ├── internal/        # Private implementation (camelCase)
│   │   ├── array.ts
│   │   └── option.ts
│   ├── encoding/        # Sub-namespaces
│   │   └── index.ts
│   └── unstable/        # Experimental APIs
│       ├── ai/
│       └── http/
├── test/                 # Test files
│   ├── Array.test.ts    # Mirrors src structure
│   └── utils/           # Test utilities
├── dtslint/             # Type tests (optional)
└── benchmark/           # Performance benchmarks (optional)
```

---

## Package Types & Patterns

### 1. Core Library Package (effect)

**Characteristics:**
- Large surface area (126+ modules)
- Multiple sub-namespaces (encoding, testing, unstable/*)
- Extensive test coverage
- Benchmarks included
- Special docs (SCHEMA.md, MCP.md, etc.)

**Structure:**
```
effect/
├── src/
│   ├── index.ts (barrel file)
│   ├── [126 modules].ts
│   ├── internal/ (implementation details)
│   ├── encoding/ (encoding utilities)
│   ├── testing/ (test utilities)
│   └── unstable/ (experimental features)
│       ├── ai/
│       ├── cli/
│       ├── cluster/
│       └── [17 more]
├── test/ (mirrors src)
├── benchmark/
└── dtslint/ (type tests)
```

### 2. Platform Package (platform-node, platform-bun, platform-browser)

**Characteristics:**
- Runtime-specific implementations
- Simple structure (no unstable/)
- Platform dependencies (node, bun types)
- Shared code via platform-node-shared

**Structure:**
```
platform-node/
├── src/
│   ├── index.ts
│   ├── NodeHttpServer.ts
│   ├── NodeHttpClient.ts
│   ├── NodeFileSystem.ts
│   └── [20-30 modules]
└── test/
```

### 3. SQL Adapter Package (sql/pg, sql/mysql2, etc.)

**Characteristics:**
- Minimal surface area (2-4 modules)
- Database-specific dependencies
- Standard exports pattern
- Test containers for integration tests

**Structure:**
```
sql/pg/
├── src/
│   ├── index.ts
│   ├── PgClient.ts
│   └── PgMigrator.ts
└── test/
```

**All SQL packages follow identical structure.**

### 4. AI Provider Package (ai/openai, ai/anthropic, etc.)

**Characteristics:**
- Provider-specific client modules
- Large Generated.ts file (API types, 1.4MB)
- Config, Error, Telemetry modules
- Internal directory for helpers

**Structure:**
```
ai/openai/
├── src/
│   ├── index.ts
│   ├── Generated.ts (API types)
│   ├── OpenAiClient.ts
│   ├── OpenAiLanguageModel.ts
│   ├── OpenAiConfig.ts
│   ├── OpenAiError.ts
│   ├── OpenAiTelemetry.ts
│   ├── OpenAiTool.ts
│   └── internal/
└── test/
```

### 5. Atom UI Adapter Package (atom/react, atom/solid, atom/vue)

**Characteristics:**
- Framework-specific adapters
- Minimal surface area
- No internal directory

**Structure:**
```
atom/react/
├── src/
│   ├── index.ts
│   └── [5-10 modules]
└── test/
```

### 6. Tool Package (tools/utils, tools/oxc, etc.)

**Characteristics:**
- Private packages (not published)
- CLI binaries (bin field in package.json)
- Build & development utilities
- More permissive exports

**Structure:**
```
tools/utils/
├── package.json (private: true, bin field)
├── src/
│   ├── bin.ts (CLI entry)
│   ├── commands/
│   └── [utilities]
└── test/
```

---

## Package.json Patterns

### Common Fields (All Packages)

```json
{
  "name": "effect" | "@effect/<name>",
  "type": "module",
  "version": "4.0.0-beta.4",
  "license": "MIT",
  "description": "...",
  "homepage": "https://effect.website",
  "repository": {
    "type": "git",
    "url": "https://github.com/Effect-TS/effect-smol.git",
    "directory": "packages/<path>"
  },
  "bugs": {
    "url": "https://github.com/Effect-TS/effect-smol/issues"
  },
  "tags": ["typescript", ...],
  "keywords": ["typescript", ...],
  "sideEffects": []
}
```

### Exports Pattern

**Development (src/):**
```json
{
  "exports": {
    "./package.json": "./package.json",
    ".": "./src/index.ts",
    "./*": "./src/*.ts",
    "./internal/*": null,
    "./*/index": null
  }
}
```

**Production (publishConfig):**
```json
{
  "publishConfig": {
    "access": "public",
    "provenance": true,
    "exports": {
      "./package.json": "./package.json",
      ".": "./dist/index.js",
      "./*": "./dist/*.js",
      "./internal/*": null,
      "./*/index": null
    }
  }
}
```

**Key Points:**
- Development points to `src/`, production to `dist/`
- Internal directories blocked via `null` exports
- Index files blocked to force namespace imports

### Scripts Pattern

**Standard across all packages:**
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
- `codegen` - Generate barrel files & exports
- `build` - TypeScript compilation + Babel annotation
- `babel` - Add pure call annotations for tree-shaking
- `check` - Type checking only (no emit)
- `test` - Run Vitest tests
- `coverage` - Generate test coverage

### Dependencies Pattern

**Workspace Protocol:**
```json
{
  "dependencies": {
    "@effect/platform-node-shared": "workspace:^"
  },
  "peerDependencies": {
    "effect": "workspace:^"
  },
  "devDependencies": {
    "effect": "workspace:^",
    "@types/node": "^25.2.0"
  }
}
```

**Key Patterns:**
- Internal deps use `workspace:^`
- Core `effect` is usually a peer dependency
- Type definitions in devDependencies

---

## File Organization Rules

### Source Files (src/)

1. **Public modules:** PascalCase (Array.ts, Option.ts)
2. **Internal modules:** camelCase in internal/ (array.ts, option.ts)
3. **Index files:** Barrel exports (index.ts)
4. **Sub-namespaces:** Directories with own index.ts

### Test Files (test/)

1. **Mirror src structure:** Same directory hierarchy
2. **Naming:** Module.test.ts matches Module.ts
3. **Test utilities:** test/utils/ directory
4. **Fixtures:** test/fixtures/ for test data

### Additional Files

1. **CHANGELOG.md:** Version history (present in 21/30 packages)
2. **README.md:** Package documentation (present in all packages)
3. **LICENSE:** MIT license file
4. **docgen.json:** Documentation generation config

---

## Special Directories

### internal/

**Purpose:** Private implementation details

**Characteristics:**
- Blocked in exports (`"./internal/*": null`)
- camelCase filenames
- Used only by public modules
- Not exposed to consumers

**Example:**
```
src/
├── Option.ts (public)
└── internal/
    └── option.ts (private impl)
```

### unstable/

**Purpose:** Experimental/preview features

**Characteristics:**
- Explicit subpath exports
- Own internal directories
- Clear upgrade path to stable
- Organized by domain (ai, cli, http, etc.)

**Example:**
```
src/unstable/
├── ai/
│   ├── index.ts
│   ├── LanguageModel.ts
│   └── internal/
├── http/
└── [17 more]
```

### encoding/

**Purpose:** Encoding utilities sub-namespace

**Characteristics:**
- Explicit subpath export (`./encoding`)
- Own barrel file
- Separate from main namespace

### testing/

**Purpose:** Test utilities for consumers

**Characteristics:**
- Explicit subpath export (`./testing`)
- Includes TestClock, TestConsole, etc.
- Separate from test/ directory (which is for package tests)

---

## Package Naming Conventions

### Pattern Rules

1. **Core package:** Just `effect` (no scope)
2. **Platform packages:** `@effect/platform-<runtime>`
3. **Category packages:** `@effect/<category>-<specific>`
   - AI: `@effect/ai-openai`
   - SQL: `@effect/sql-pg`
   - Atom: `@effect/atom-react`
4. **Standalone:** `@effect/<name>` (e.g., `@effect/opentelemetry`)
5. **Tools:** `@effect/<name>` with `private: true`

### Examples

```
effect                          # Core (no scope)
@effect/platform-node           # Platform
@effect/ai-anthropic           # AI provider
@effect/sql-pg                 # SQL adapter
@effect/atom-react             # UI adapter
@effect/opentelemetry          # Standalone integration
@effect/utils                  # Private tool
```

---

## Key Takeaways for @beep/repo-cli

1. **Standardized structure:** All packages follow same layout
2. **Category organization:** Use subdirectories (ai/, sql/, etc.) for related packages
3. **Workspace protocol:** Internal deps use `workspace:^`
4. **Exports blocking:** Block internal/* and */index
5. **Scripts consistency:** Same scripts across all packages
6. **Dual exports:** Development (src/) + publishConfig (dist/)
7. **File naming:** PascalCase public, camelCase internal
8. **Test mirroring:** Tests mirror src/ structure
9. **Sub-namespaces:** encoding/, testing/, unstable/ pattern
10. **Documentation files:** README, CHANGELOG, LICENSE, docgen.json

---

## Template Recommendations

### Minimal Package Template

```
my-package/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
├── LICENSE
├── src/
│   └── index.ts
└── test/
    └── index.test.ts
```

### Standard Package Template

Add:
- `docgen.json`
- `CHANGELOG.md`
- `src/internal/` (if needed)
- Multiple modules in src/
- Corresponding tests in test/

### Complex Package Template (like effect)

Add:
- Sub-namespaces (encoding/, testing/)
- Unstable features (unstable/*)
- Benchmarks (benchmark/)
- Type tests (dtslint/)
- Special docs (SCHEMA.md, etc.)
