# @beep/repo-scripts

Repository automation and code generation utilities for the beep-effect monorepo.

## Overview

`@beep/repo-scripts` orchestrates repo-wide maintenance workflows including environment setup, asset generation, locale hydration, and workspace bootstrapping. All scripts follow Effect-first patterns with explicit Layer composition, schema validation, and structured error handling.

## Key Features

- **Bootstrap Automation** - Interactive infrastructure setup (Docker, migrations, env scaffolding)
- **Secret Generation** - Secure `.env` hydration with Effect Random and cryptographic utilities
- **Asset Pipeline** - Public asset crawler with schema validation and AVIF/WebP conversion
- **Locale Generation** - CLDR-based locale fetching and code generation
- **JSDoc Analysis** - Static analysis tool for enforcing documentation standards
- **Workspace Purging** - Intelligent cleanup of build artifacts across all workspaces
- **TypeScript Reference Sync** - Automated workspace reference management

## Installation

```bash
bun install
```

## Scripts

### Environment & Infrastructure

```bash
# Bootstrap entire development environment
bun run bootstrap

# Generate secure secrets for .env
bun run gen:secrets

# Bring up Docker services
bun run services:up
```

### Code Generation

```bash
# Generate public asset paths with validation
bun run generate-public-paths

# Generate locale definitions from CLDR
bun run gen:locales

# Execute locale generator (prints to console)
bun run execute
```

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

### Development

```bash
# Type check
bun run check

# Lint with Biome
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Run tests
bun run test

# Generate coverage report
bun run coverage
```

## Architecture

### Effect-First Design

All scripts are built on Effect's composable effect system:

```typescript
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunContext from "@effect/platform-bun/BunContext";

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // Your logic here
  yield* Console.log("Program complete");
});

BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));
```

### Layer Composition

Scripts compose layers explicitly for filesystem access, networking, and utilities:

```typescript
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { RepoUtilsLive } from "@beep/tooling-utils/RepoUtils";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";

const layer = Layer.mergeAll(
  BunContext.layer,
  FsUtilsLive,
  RepoUtilsLive,
  FetchHttpClient.layer
);

BunRuntime.runMain(program.pipe(Effect.provide(layer)));
```

### Schema Validation

Generated outputs are validated through Effect Schema before writing to disk:

```typescript
import * as S from "effect/Schema";
import { AssetPaths } from "@beep/repo-scripts/utils";

const validateAssets = Effect.gen(function* () {
  const rawPaths = collectFiles(publicDir);

  // Schema validation with detailed error messages
  const validatedPaths = yield* S.decodeUnknown(AssetPaths)(rawPaths).pipe(
    Effect.mapError((error) =>
      new DomainError({
        message: `Invalid asset paths: ${TreeFormatter.formatErrorSync(error)}`,
        cause: error,
      })
    )
  );

  return validatedPaths;
});
```

## Core Scripts

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
- Recursively scans `apps/web/public` directory
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
- Fetches latest available locales from Unicode CLDR repository
- Sorts locales alphabetically
- Generates TypeScript constant at `packages/common/schema/src/custom/locales/ALL_LOCALES.generated.ts`
- Idempotent generation with header attribution

**Usage:**
```bash
bun run gen:locales
```

### analyze-jsdoc.ts

Static analysis tool for JSDoc documentation completeness.

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

# Analyze specific scope
bun run docs:lint --scope errors

# Analyze custom path
bun run docs:lint --root packages/custom/path

# Analyze specific files
bun run docs:lint --file src/utils/index.ts --file src/types/core.ts

# Custom output location
bun run docs:lint --output results.json

# Include internal exports
bun run docs:lint --include-internal
```

**Output Format:**
```json
{
  "scope": "schema",
  "filesScanned": 42,
  "exportsChecked": 156,
  "missingCount": 8,
  "missingByTag": {
    "category": 3,
    "example": 5,
    "since": 2
  },
  "items": [
    {
      "file": "packages/common/schema/src/EntityId.ts",
      "exportName": "EntityIdKit",
      "line": 42,
      "missingTags": ["example", "since"]
    }
  ],
  "generatedAt": "2025-12-05T10:30:00.000Z"
}
```

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

## Utilities

### Asset Path Schema

Type-safe asset path validation and accessor generation.

```typescript
import { AssetPath, AssetPaths, pathObjFromPaths } from "@beep/repo-scripts/utils";

// Validate single path
const path = "/assets/logo.png";
const validated = S.decodeUnknownSync(AssetPath)(path);

// Validate collection
const paths = ["/logo.png", "/assets/bg.avif"];
const validPaths = S.decodeUnknownSync(AssetPaths)(paths);

// Generate type-safe accessor object
const publicPaths = [
  "/logo.png",
  "/assets/background/bg-3-blur.avif"
] as const;

const assets = pathObjFromPaths(publicPaths);
// assets.logo === "/logo.png"
// assets.assets.background.bg3Blur === "/assets/background/bg-3-blur.avif"
```

### Image Conversion

WASM-based image format conversion using jsquash libraries.

```typescript
import { convertDirectoryToNextgen } from "@beep/repo-scripts/utils/convert-to-nextgen";

const conversions = yield* convertDirectoryToNextgen({
  dir: "/path/to/public"
});
// Returns: [{ source: "/path/logo.png", target: "/path/logo.avif" }]
```

**Supported Conversions:**
- JPEG → AVIF
- PNG → AVIF
- WebP → AVIF

### CLDR Utilities

```typescript
import { fetchAvailableCLDRLocales, generateLocalesContent } from "@beep/repo-scripts/i18n";

// Fetch latest locales from CLDR
const locales = yield* fetchAvailableCLDRLocales;

// Generate TypeScript content
const content = yield* generateLocalesContent;
```

## Effect Patterns

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as Layer from "effect/Layer";

// Single-letter aliases for utilities
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
```

### No Native Methods

This package strictly follows Effect utilities over native JavaScript methods:

```typescript
// Array operations
F.pipe(items, A.map(fn));           // NOT items.map(fn)
F.pipe(items, A.filter(fn));        // NOT items.filter(fn)
F.pipe(items, A.reduce(0, fn));     // NOT items.reduce(fn, 0)

// String operations
F.pipe(str, Str.split(","));        // NOT str.split(",")
F.pipe(str, Str.trim);              // NOT str.trim()
F.pipe(str, Str.toUpperCase);       // NOT str.toUpperCase()

// Object operations
F.pipe(obj, Struct.keys);           // NOT Object.keys(obj)
F.pipe(obj, Record.values);         // NOT Object.values(obj)
```

### Error Handling

Use `DomainError` for structured error reporting:

```typescript
import { DomainError } from "@beep/tooling-utils/repo";

const program = Effect.gen(function* () {
  const result = yield* riskyOperation.pipe(
    Effect.mapError((cause) =>
      new DomainError({
        message: "Operation failed with specific context",
        cause,
      })
    )
  );
});
```

### CLI Commands

Use `@effect/cli` for argument parsing:

```typescript
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";

const options = {
  scope: F.pipe(
    Options.text("scope"),
    Options.withAlias("s"),
    Options.withDefault("schema")
  ),
  verbose: F.pipe(
    Options.boolean("verbose"),
    Options.withAlias("v"),
    Options.withDefault(false)
  ),
};

const myCommand = Command.make("analyze", options, (config) =>
  Effect.gen(function* () {
    yield* Console.log(`Analyzing scope: ${config.scope}`);
    // Command logic
  })
);

const cli = Command.run(myCommand, { name: "my-cli", version: "1.0.0" });

BunRuntime.runMain(cli(process.argv).pipe(Effect.provide(BunContext.layer)));
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

## Dependencies

### Core
- `effect` - Effect runtime and standard library
- `@effect/platform` - Platform abstractions
- `@effect/platform-bun` - Bun-specific implementations
- `@effect/cli` - CLI argument parsing

### Utilities
- `@beep/tooling-utils` - Filesystem and repository utilities
- `@beep/schema` - Schema definitions and utilities
- `@beep/constants` - Shared constants

### Image Processing
- `@jsquash/avif` - AVIF encoding
- `@jsquash/jpeg` - JPEG decoding
- `@jsquash/png` - PNG decoding
- `@jsquash/webp` - WebP decoding

### Analysis & Transformation
- `typescript` - TypeScript compiler API
- `ts-morph` - TypeScript AST manipulation
- `jscodeshift` - Codemod framework
- `glob` - File pattern matching

## Contributing

### Code Style

- Use Effect namespace imports
- Prefer Effect utilities over native methods
- Compose layers explicitly
- Validate with schemas before IO
- Use `DomainError` for errors
- Follow Effect naming conventions

### Testing Requirements

- Test exported logic functions
- Provide test layers for dependencies
- Cover error paths
- Validate schema edge cases

### Documentation

All exported functions must include:
- `@category` - Functional categorization
- `@example` - Usage example
- `@since` - Version introduced

Run `bun run docs:lint` to verify compliance.

## License

MIT
