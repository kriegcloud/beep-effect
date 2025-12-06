# @beep/tooling-utils

Effect-first filesystem and repository helpers for build-time automation and tooling scripts.

## Overview

`@beep/tooling-utils` provides Effect-based utilities for working with filesystems, repository workspaces, and monorepo metadata. It wraps Bun platform services with span-instrumented helpers, enabling portable, type-safe automation scripts across the beep-effect monorepo.

This package is designed for build-time tooling and repository automation rather than runtime application code. All operations are Effect-first, avoiding `async/await` and native Promise patterns in favor of Effect's composable error handling and dependency injection.

## Installation

```bash
bun install @beep/tooling-utils
```

## Core Services

### FsUtils

Effect-based filesystem operations with observability spans and typed error handling.

**Key Features:**
- Glob pattern matching via `glob` and `globFiles`
- File manipulation with `modifyFile`, `modifyGlob`, `copyGlobCached`
- JSON operations with `readJson`, `writeJson`
- Directory management with `mkdirCached`, `rmAndMkdir`, `rmAndCopy`
- Path validation with `existsOrThrow`, `isDirectory`, `isFile`, `dirHasFile`
- Parent directory resolution with `getParentDirectory`

**Usage:**

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils";

// Modify all markdown files matching a glob pattern
const normalizeHeadings = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  yield* fsUtils.modifyGlob("docs/**/*.md", (content) =>
    F.pipe(content, Str.replace(/^# /gm, "## "))
  );
}).pipe(Effect.provide(FsUtilsLive));

// Read and parse JSON with type-safe error handling
const loadConfig = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  const config = yield* fsUtils.readJson("config.json");
  return config;
}).pipe(Effect.provide(FsUtilsLive));

// Copy files matching a pattern with cached directory creation
const copyAssets = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  yield* fsUtils.copyGlobCached("src/assets", "**/*.png", "dist/assets");
}).pipe(Effect.provide(FsUtilsLive));
```

### RepoUtils

Repository-level utilities for workspace discovery and root resolution.

**Key Features:**
- `REPOSITORY_ROOT`: Absolute path to repository root (detected via `.git` or `bun.lock`)
- `RepoWorkspaceMap`: HashMap of package name to workspace directory
- `getWorkspaceDir`: Resolve workspace directory by package name

**Usage:**

```typescript
import * as Effect from "effect/Effect";
import * as Path from "@effect/platform/Path";
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";

// Get path to generated constants folder
const ensureGeneratedFolder = Effect.gen(function* () {
  const repo = yield* RepoUtils;
  const path_ = yield* Path.Path;
  return path_.join(
    repo.REPOSITORY_ROOT,
    "packages",
    "common",
    "constants",
    "_generated"
  );
}).pipe(Effect.provide(RepoUtilsLive));

// Resolve workspace directory by package name
const getDocsDir = Effect.gen(function* () {
  const repo = yield* RepoUtils;
  return yield* repo.getWorkspaceDir("@beep/documents-domain");
}).pipe(Effect.provide(RepoUtilsLive));
```

## Repository Utilities

Low-level helpers for workspace and dependency analysis (exported via `@beep/tooling-utils/repo`):

### Workspace Discovery

- **`findRepoRoot`**: Walks upward from cwd to locate `.git` or `bun.lock`
- **`resolveWorkspaceDirs`**: Expands workspace globs from root `package.json` to HashMap of package name → directory
- **`getWorkspaceDir`**: Resolves workspace directory by package name with typed error

### Dependency Analysis

- **`extractWorkspaceDependencies`**: Parses package.json to extract workspace vs npm dependency sets
- **`collectUniqueNpmDependencies`**: Aggregates unique npm dependencies across all workspaces
- **`getUniqueDeps`**: Compatibility alias for `collectUniqueNpmDependencies`

### Package.json Operations

- **`PackageJsonMap`**: Builds workspace → package.json content map
- **`PackageFileMap`**: Maps package files for workspace resolution
- **`NearestPackageJson`**: Finds nearest package.json from current file

### TypeScript Configuration

- **`TsConfigIndex`**: Validates root tsconfig files and collects workspace-specific variants

**Example:**

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { collectUniqueNpmDependencies } from "@beep/tooling-utils/repo/UniqueDependencies";

// List all unique npm dependencies sorted alphabetically
const listSortedDeps = Effect.gen(function* () {
  const result = yield* collectUniqueNpmDependencies;
  return F.pipe(result.dependencies, A.sort(Str.Order));
});
```

## Schemas

Effect Schema definitions for repository metadata (exported via `@beep/tooling-utils/schemas`):

### JSON Schemas

- **`Json`**: Recursive JSON value schema
- **`JsonLiteral`**: JSON primitive literals (string, number, boolean, null)

### Package Manifests

- **`PackageJson`**: Complete package.json schema with dependency maps, scripts, exports, workspaces
- **`RootPackageJson`**: Root-level package.json with workspace configuration
- **`WorkspaceDependencies`**: Typed workspace dependency structures

### TypeScript Configuration

- **`TsConfigJson`**: tsconfig.json schema with compiler options, references, build settings
- **`ProjectReference`**: TypeScript project reference definition

### Environment Variables

- **`EnvironmentVariableName`**: Schema for environment variable naming
- **`DotEnv`**: .env file schema

**Example:**

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { PackageJson } from "@beep/tooling-utils/schemas";
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils";

// Read and validate package.json
const loadPackageJson = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  const json = yield* fsUtils.readJson("package.json");
  const pkg = yield* S.decode(PackageJson)(json);
  return pkg;
}).pipe(Effect.provide(FsUtilsLive));
```

## Error Handling

All utilities use tagged errors from `@beep/tooling-utils/repo/Errors`:

- **`DomainError`**: Generic domain-level error with message and cause
- **`NoSuchFileError`**: Path-specific error for missing files

Errors are automatically mapped through `DomainError.mapError` to provide consistent error messages with Effect's TreeFormatter.

## Effect Patterns

This package strictly follows Effect-first patterns:

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// Single-letter aliases for frequently used modules
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
```

### Effect Collections

All operations use Effect collections rather than native JavaScript:

```typescript
// Use Effect Array utilities
F.pipe(items, A.map(fn));
F.pipe(items, A.filter(predicate));
F.pipe(items, A.findFirst(predicate));

// Use Effect String utilities
F.pipe(str, Str.trim);
F.pipe(str, Str.split(" "));
F.pipe(str, Str.toUpperCase);

// Use HashMap instead of Map
import * as HashMap from "effect/HashMap";
HashMap.empty<string, number>();
F.pipe(hashMap, HashMap.set(key, value));
F.pipe(hashMap, HashMap.get(key)); // returns Option<V>

// Use HashSet instead of Set
import * as HashSet from "effect/HashSet";
HashSet.empty<string>();
F.pipe(hashSet, HashSet.add(value));
```

### Layer Composition

Services are composed via Effect Layers:

```typescript
import { FsUtilsLive } from "@beep/tooling-utils";
import { RepoUtilsLive } from "@beep/tooling-utils";

// FsUtilsLive provides FsUtils + Bun filesystem layers
const program = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  // ... use fsUtils
}).pipe(Effect.provide(FsUtilsLive));

// RepoUtilsLive provides RepoUtils + FsUtils + Bun layers
const repoProgram = Effect.gen(function* () {
  const repo = yield* RepoUtils;
  // ... use repo
}).pipe(Effect.provide(RepoUtilsLive));
```

## Implementation Notes

### Glob Pattern Ignoring

Workspace resolution automatically ignores common build artifacts:
- `**/node_modules/**`
- `**/dist/**`
- `**/build/**`
- `**/.turbo/**`
- `**/.tsbuildinfo/**`

Extend the `IGNORE` constant in `src/repo/Workspaces.ts` if new artifact directories appear.

### Caching Strategy

- **`mkdirCached`**: Uses `Effect.cachedFunction` to memoize directory creation
- **`resolveWorkspaceDirs`**: Computed once per Effect runtime lifecycle

### JSON Formatting

`writeJson` produces stable two-space formatting without trailing newline to avoid noisy diffs in generated files.

### Span Instrumentation

All filesystem operations are instrumented with Effect spans for observability:
- `FsUtils.glob`
- `FsUtils.modifyFile`
- `FsUtils.readJson`
- `FsUtils.writeJson`
- etc.

## Development

### Scripts

```bash
# Type check
bun run check

# Build
bun run build

# Lint
bun run lint
bun run lint:fix

# Test
bun run test
bun run test --coverage

# Check for circular dependencies
bun run lint:circular
```

### Testing

Tests are colocated in the `test/` directory. Use Vitest via Bun:

```bash
# Run tests from workspace root
bun run test --filter=@beep/tooling-utils

# Run tests from package directory
bun run --cwd tooling/utils test
```

## Package Exports

```typescript
// Main exports
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils";
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import { getUniqueDeps } from "@beep/tooling-utils";

// Repo utilities
import * as Repo from "@beep/tooling-utils/repo";
import { findRepoRoot } from "@beep/tooling-utils/repo/Root";
import { resolveWorkspaceDirs } from "@beep/tooling-utils/repo/Workspaces";
import { extractWorkspaceDependencies } from "@beep/tooling-utils/repo/Dependencies";

// Schemas
import { PackageJson, TsConfigJson } from "@beep/tooling-utils/schemas";
import { Json, JsonLiteral } from "@beep/tooling-utils/schemas";

// Errors
import { DomainError, NoSuchFileError } from "@beep/tooling-utils/repo/Errors";
```

## Related Packages

- **`@beep/testkit`**: Effect testing harness for unit tests
- **`@beep/types`**: Compile-time type utilities (provides `UnsafeAny` bridge)
- **`@beep/repo-scripts`**: Automation scripts consuming these utilities
- **`@beep/cli`**: Repository CLI tools

## License

MIT

---

For additional guidance, see [AGENTS.md](./AGENTS.md) for detailed authoring guardrails and usage patterns.
