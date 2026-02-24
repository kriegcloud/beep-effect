# @beep/repo-scripts

Repository automation and code generation utilities for the beep-effect monorepo.

## Purpose

`@beep/repo-scripts` orchestrates repo-wide maintenance workflows including environment setup, asset generation, locale hydration, and workspace bootstrapping. It provides:

- **Infrastructure Automation** - Interactive development environment setup with Docker orchestration and database migrations
- **Code Generation** - Asset path validation, locale fetching, and TypeScript constant generation
- **Maintenance Tooling** - Workspace cleanup, JSDoc analysis, TypeScript reference synchronization
- **Codemod Framework** - AST-based code transformation utilities for automated refactoring

All scripts follow Effect-first patterns with explicit Layer composition, schema validation, and structured error handling. This package is primarily executed via scripts rather than imported as a library, though key utilities are exported for reuse in other tooling packages.

## Installation

```bash
# This package is internal to the monorepo
# Add as a dependency in your package.json:
"@beep/repo-scripts": "workspace:*"
```

## Key Exports

This package primarily provides executable scripts, but also exports utilities for use in other tooling packages:

| Export | Description |
|--------|-------------|
| `AssetPath` | Schema for validating public asset paths with JS accessor rules |
| `AssetPaths` | Schema for validating collections of asset paths (deduplication, collision detection) |
| `pathObjFromPaths` | Build type-safe accessor object from asset path arrays |
| `toJsAccessor` | Convert kebab-case to camelCase for JS accessors |
| `toNestedTuple` | Convert path string to nested tuple structure |
| `fetchAvailableCLDRLocales` | Effect for fetching locale list from Unicode CLDR |
| `generateLocalesContent` | Effect for generating locale constant file |
| `convertDirectoryToNextgen` | Convert images to AVIF format using WASM encoders |

**Note:** The package uses wildcard exports (`"./*": "./src/*.ts"`), allowing imports from any source file via `@beep/repo-scripts/path/to/module`.

## Usage

### Asset Path Validation

```typescript
import { AssetPath, AssetPaths, pathObjFromPaths } from "@beep/repo-scripts/utils";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";

// Validate single asset path
const validatePath = Effect.gen(function* () {
  const path = "/assets/logo.png";
  return yield* S.decodeUnknown(AssetPath)(path);
});

// Build type-safe accessor object
const publicPaths = [
  "/logo.png",
  "/assets/background/bg-3-blur.avif"
] as const;

const assets = pathObjFromPaths(publicPaths);
// assets.logo === "/logo.png"
// assets.assets.background.bg3Blur === "/assets/background/bg-3-blur.avif"
```

### CLDR Locale Fetching

```typescript
import { fetchAvailableCLDRLocales } from "@beep/repo-scripts/i18n";
import * as Effect from "effect/Effect";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";

const program = Effect.gen(function* () {
  const locales = yield* fetchAvailableCLDRLocales;
  return locales; // ["af", "ar", "bg", ...]
}).pipe(Effect.provide(FetchHttpClient.layer));
```

### Image Conversion

```typescript
import { convertDirectoryToNextgen } from "@beep/repo-scripts/utils/convert-to-nextgen";
import * as Effect from "effect/Effect";

const convertAssets = Effect.gen(function* () {
  const conversions = yield* convertDirectoryToNextgen({
    dir: "/path/to/public"
  });
  // Returns: [{ source: "/path/logo.png", target: "/path/logo.avif" }]
});
```

## Scripts

### Environment & Infrastructure

```bash
# Bootstrap entire development environment
bun run bootstrap

# Generate secure secrets for .env
bun run gen:secrets
```

> **Note:** Docker services are managed at the repository root level with `bun run services:up` (not a repo-scripts command)

### Code Generation

```bash
# Generate public asset paths with validation
# Note: Run from repo root as `bun run gen:beep-paths`
bun run generate-public-paths

# Generate locale definitions from CLDR
bun run gen:locales

# Test script execution (prints "beep")
bun run execute
```

> **Note:** The `iconify` script is referenced in `package.json` but the source file (`src/iconify/index.ts`) does not exist. This appears to be a stale reference that should be removed or the script should be implemented.

### Maintenance

```bash
# Remove all build artifacts
bun run purge

# Remove build artifacts and lock file
bun run purge --lock

# Analyze JSDoc coverage
bun run docs:lint

# Analyze specific file
bun run docs:lint:file --file path/to/file.ts
```

### Development Commands

```bash
# Type check
bun run --filter @beep/repo-scripts check

# Lint with Biome
bun run --filter @beep/repo-scripts lint

# Auto-fix linting issues
bun run --filter @beep/repo-scripts lint:fix

# Run tests
bun run --filter @beep/repo-scripts test

# Generate coverage report
bun run --filter @beep/repo-scripts coverage
```

## Script Reference

### bootstrap.ts

Interactive development environment setup with staged execution and progress reporting.

**Features:**
- Copies `.env.example` to `.env` if missing
- Generates secure secrets automatically
- Launches Docker infrastructure
- Applies database migrations
- Pretty-printed terminal output with status indicators

**Usage:**
```bash
bun run bootstrap
```

### generate-env-secrets.ts

Secure secret generation using Effect's Random service and Node's crypto module.

**Generates:**
- `BETTER_AUTH_SECRET` - 32-byte base64-encoded secret
- `KV_REDIS_PASSWORD` - 32-byte base64-encoded secret
- `APP_ADMIN_USER_IDS` - Two UUID-based admin identifiers

**Features:**
- Preserves existing `.env` formatting and comments
- Updates only specified variables in-place
- Concurrent secret generation for performance
- Detailed logging of operations

**Usage:**
```bash
bun run gen:secrets

# Custom file path
bun run gen:secrets /path/to/.env
```

### generate-asset-paths.ts

Public asset path generator with schema validation and Next.js image optimization.

**Features:**
- Recursively scans a Next.js app `public/` directory (e.g. `apps/todox/public`)
- Converts eligible images to AVIF format
- Validates paths against strict schema rules
- Generates TypeScript constants at `@beep/constants/src/_generated/asset-paths.ts`

**Schema Rules:**
- Paths must start with `/`
- All lowercase characters
- Directory segments: kebab-case with valid JS identifiers
- File names: kebab-case with supported extensions
- No reserved keywords (`__proto__`, `prototype`, `constructor`)
- No accessor collisions between files and directories

**Usage:**
```bash
bun run generate-public-paths
```

### generate-locales.ts

CLDR locale fetcher and code generator.

**Features:**
- Fetches latest available locales from Unicode CLDR repository via Effect HTTP client
- Sorts locales alphabetically
- Generates TypeScript constant at `packages/common/schema/src/custom/locales/ALL_LOCALES.generated.ts`
- Idempotent generation with header attribution
- Uses Effect layers for filesystem and network access

**Usage:**
```bash
bun run gen:locales
```

**Dependencies:**
- `FsUtils` and `RepoUtils` from `@beep/tooling-utils`
- `FetchHttpClient` from `@effect/platform`
- Bun-specific filesystem and path implementations

### run-docs-lint.ts & analyze-jsdoc.ts

Static analysis tool for JSDoc documentation completeness. The `run-docs-lint.ts` script is the CLI entry point that wraps `analyze-jsdoc.ts` logic.

**Required Tags:**
- `@category` - Functional categorization
- `@example` - Usage examples
- `@since` - Version introduced

**Features:**
- Scope-based analysis (`schema`, `errors`, `invariant`, `identity`, `types`, `utils`)
- File pattern filtering with glob support
- Exports missing tags to JSON with line numbers
- Parallel file processing
- Detailed reporting by tag type

**Usage:**
```bash
# Analyze schema package (default)
bun run docs:lint

# Analyze specific file
bun run docs:lint:file --file packages/common/schema/src/EntityId.ts
```

**Output Format:**
The tool generates detailed JSON reports with:
- Scope and file statistics
- Missing tag counts by type
- Per-export details with file paths and line numbers
- ISO timestamp for report generation

### purge.ts

Workspace artifact cleanup with configurable scope.

**Removes:**
- `.tsbuildinfo` files
- `build/` directories
- `dist/` directories
- `.next/` caches
- `coverage/` reports
- `.turbo/` caches
- `node_modules/` (with `--lock` flag)
- `bun.lock` (with `--lock` flag)

**Workspace Coverage:**
- `apps/*`
- `packages/_internal/*`
- `packages/common/*`
- `packages/documents/*`
- `packages/iam/*`
- `packages/runtime/*`
- `packages/shared/*`
- `packages/ui/*`
- `tooling/*`

**Usage:**
```bash
# Standard cleanup
bun run purge

# Include lock file
bun run purge --lock
```

### docs-copy.ts

Documentation file synchronization and copying utility for maintaining consistency across the monorepo.

**Usage:**
```bash
# Copy documentation files across packages
bun run dotenvx -- bunx tsx src/docs-copy.ts
```

### codemod.ts & codemods/

AST-based code transformation framework using jscodeshift for automated maintenance tasks.

**Available Codemods:**
- `codemods/jsdoc.ts` - JSDoc comment transformations
- `codemods/ts-fence.ts` - TypeScript reference fencing

**Usage:**
```bash
# Run a codemod transformation
bun run dotenvx -- bunx tsx src/codemod.ts
```

### Workspace Templates

Handlebars templates for scaffolding new workspace packages are available in `src/templates/package/`:

**Available Templates:**
- `package.json.hbs` - Package manifest template
- `tsconfig.json.hbs` - Base TypeScript configuration
- `tsconfig.build.json.hbs` - Build-specific TypeScript config
- `tsconfig.src.json.hbs` - Source-specific TypeScript config
- `tsconfig.test.json.hbs` - Test-specific TypeScript config (note: typo in filename)
- `vitest.config.ts.hbs` - Vitest test configuration

These templates support consistent workspace structure across the monorepo.

### sync-ts-references.ts

Automated TypeScript workspace reference management to keep `tsconfig.json` files in sync.

**Features:**
- Auto-detects repository tsconfig variants
- Updates project references based on dependencies
- Validates reference integrity
- Supports check mode for CI

**Usage:**
```bash
# Sync TypeScript references
bun run dotenvx -- bunx tsx src/sync-ts-references.ts

# Check mode (verify without modifying)
bun run dotenvx -- bunx tsx src/sync-ts-references.ts --check
```

## Generated Outputs

### Asset Paths

**Location:** `packages/common/constants/src/_generated/asset-paths.ts`

```typescript
// Auto-generated by tooling/repo-scripts/src/generate-asset-paths.ts
// Do not edit manually.

export const publicPaths = [
  "/favicon.ico",
  "/logo.png",
  "/assets/background/bg-1.avif",
  // ...
] as const;
```

### Locales

**Location:** `packages/common/schema/src/custom/locales/ALL_LOCALES.generated.ts`

```typescript
// Auto-generated by tooling/repo-scripts/src/generate-locales.ts
// Do not edit manually.

export const ALL_LOCALES = [
  "af",
  "ar",
  "bg",
  // ...
] as const;
```

The script also generates an internal cache at `tooling/repo-scripts/src/i18n/_generated/available-locales.ts` for testing and development.

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/tooling-utils` | Filesystem operations (FsUtils), repository utilities (RepoUtils) |
| `@beep/schema` | EntityId, Schema utilities |
| `@beep/constants` | Receives generated asset paths |
| `@beep/invariant` | Assertion contracts |
| `@effect/platform` | FileSystem, Path, HTTP client abstractions |
| `@effect/platform-bun` | Bun runtime and context |
| `@effect/cli` | Command-line argument parsing |
| `@jsquash/*` | WASM-based image encoding/decoding (AVIF, JPEG, PNG, WebP) |
| `typescript` | TypeScript compiler API |
| `ts-morph` | TypeScript AST manipulation |
| `jscodeshift` | Codemod transformation framework |

## Integration

### Generated Artifacts

This package generates code consumed by other packages in the monorepo:

**Asset Paths** (`@beep/constants`)
- Source: `generate-asset-paths.ts`
- Target: `packages/common/constants/src/_generated/asset-paths.ts`
- Consumers: `@beep/todox`, `@beep/ui` (for type-safe asset references)

**Locales** (`@beep/schema`)
- Source: `generate-locales.ts`
- Target: `packages/common/schema/src/custom/locales/ALL_LOCALES.generated.ts`
- Consumers: `@beep/schema`, `@beep/iam-domain` (for locale validation)

### Bootstrap Flow

The `bootstrap.ts` script orchestrates initial setup:
1. Copies `.env.example` → `.env` (if missing)
2. Invokes `generate-env-secrets.ts` for secret generation
3. Starts Docker services via root script
4. Applies database migrations via `@beep/db-admin`

### Workspace Scaffolding

Templates in `src/templates/package/*.hbs` provide Handlebars scaffolding for new workspace packages, ensuring consistency in `package.json`, `tsconfig*.json`, and `vitest.config.ts` across the monorepo.

## Development Workflow

### Adding New Scripts

1. Create script in `src/` directory
2. Follow Effect-first patterns with explicit layers
3. Use schema validation for inputs/outputs
4. Add CLI wrapper with `@effect/cli` if needed
5. Export main function for testing
6. Add script entry to `package.json`
7. Update this README

### Testing

```typescript
import { describe, it, expect } from "bun:test";
import * as Effect from "effect/Effect";
import { myScriptLogic } from "./my-script.ts";

describe("myScript", () => {
  it("should process files correctly", async () => {
    const result = await Effect.runPromise(
      myScriptLogic({ input: "test" }).pipe(
        Effect.provide(testLayer)
      )
    );

    expect(result).toBeDefined();
  });
});
```

### Debugging

All scripts support structured logging:

```typescript
import * as Console from "effect/Console";

const program = Effect.gen(function* () {
  yield* Effect.log("Debug: Starting operation");
  yield* Console.log("User-visible message");
  // ...
});
```

## Development

```bash
# Type check
bun run --filter @beep/repo-scripts check

# Lint
bun run --filter @beep/repo-scripts lint

# Auto-fix linting issues
bun run --filter @beep/repo-scripts lint:fix

# Run tests
bun run --filter @beep/repo-scripts test

# Generate coverage report
bun run --filter @beep/repo-scripts coverage
```

## Notes

### Stale Script Reference

The `iconify` script in `package.json` references `src/iconify/index.ts`, which does not exist. This script should either be removed or implemented.

### Template Filename Typo

The file `src/templates/package/tsconifg.test.json.hbs` has a typo in its name (should be `tsconfig.test.json.hbs`).

### Effect-First Patterns

All scripts in this package follow strict Effect-first development:
- No native `Array` or `String` methods - use `A.*` and `Str.*` from `effect`
- Explicit Layer composition for dependencies
- Schema validation with `effect/Schema` before all I/O operations
- Structured error handling with `DomainError` from `@beep/tooling-utils`

See `AGENTS.md` for detailed authoring guidelines and the root `CLAUDE.md` for comprehensive Effect patterns.
