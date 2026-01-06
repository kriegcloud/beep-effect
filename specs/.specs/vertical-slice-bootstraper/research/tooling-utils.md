# Tooling Utils Research for create-slice CLI

## Executive Summary

The `@beep/tooling-utils` package provides Effect-based utilities for filesystem operations and monorepo workspace management. It exports two primary services:

1. **FsUtils** - Comprehensive filesystem operations with glob support, JSON I/O, and directory management
2. **RepoUtils** - Repository-wide operations including workspace resolution and dependency collection

Both services follow Effect's dependency injection pattern using `Context.GenericTag` and provide live Layer implementations backed by Bun's platform services.

---

## FsUtils Service

### Service Definition

```typescript
// Context tag (dependency injection)
export const FsUtils = Context.GenericTag<FsUtils>("@beep/tooling-utils/FsUtils");

// Interface derived from make effect
export interface FsUtils extends Effect.Effect.Success<typeof make> {}

// Live Layer (backed by BunFileSystem + BunPath)
export const FsUtilsLive = Layer.provideMerge(
  Layer.effect(FsUtils, make),
  Layer.provideMerge(BunFileSystem.layer, BunPath.layerPosix)
);
```

The service is constructed internally via `Effect.gen` and requires `FileSystem.FileSystem` and `Path.Path` services from `@effect/platform`.

### Key Methods

| Method | Signature | Purpose |
|--------|-----------|---------|
| `glob` | `(pattern: string \| string[], options?: GlobOptions) => Effect<string[], DomainError>` | Match files/directories against glob patterns |
| `globFiles` | `(pattern: string \| string[], options?: GlobOptions) => Effect<string[], DomainError>` | Like glob but only returns files (no directories) |
| `modifyFile` | `(path: string, f: (content: string, path: string) => string) => Effect<void, DomainError>` | Read, transform, and write file (only if changed) |
| `modifyGlob` | `(pattern: string \| string[], f: (s: string, path: string) => string, options?: GlobOptions) => Effect<void, DomainError>` | Apply transform to all files matching glob |
| `rmAndCopy` | `(from: string, to: string) => Effect<void, DomainError>` | Remove target then copy source |
| `copyIfExists` | `(from: string, to: string) => Effect<void, DomainError>` | Copy only if source exists |
| `mkdirCached` | `(path: string) => Effect<void, DomainError>` | Create directory recursively (cached for performance) |
| `copyGlobCached` | `(baseDir: string, pattern: string, to: string) => Effect<void, DomainError>` | Copy glob matches preserving relative structure |
| `rmAndMkdir` | `(path: string) => Effect<void, DomainError>` | Remove path and recreate as empty directory |
| `readJson` | `(path: string) => Effect<unknown, DomainError>` | Read and parse JSON file |
| `writeJson` | `(path: string, json: unknown) => Effect<void, DomainError>` | Write JSON with 2-space formatting |
| `existsOrThrow` | `(path: string) => Effect<string, DomainError>` | Verify path exists or fail with DomainError |
| `isDirectory` | `(path: string) => Effect<boolean, DomainError>` | Check if path is a directory |
| `isFile` | `(path: string) => Effect<boolean, DomainError>` | Check if path is a file |
| `dirHasFile` | `(dir: string, filename: string) => Effect<boolean, DomainError>` | Check if directory contains a specific file |
| `getParentDirectory` | `(path: string) => Effect<string, DomainError>` | Get parent directory of path |

### Layer Dependencies

```
FsUtilsLive
  |-- Layer.effect(FsUtils, make)
  |     |-- FileSystem.FileSystem (from @effect/platform)
  |     |-- Path.Path (from @effect/platform)
  |
  |-- BunFileSystem.layer (provides FileSystem.FileSystem)
  |-- BunPath.layerPosix (provides Path.Path)
```

### Usage Example

```typescript
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const utils = yield* FsUtils;

  // Find all TypeScript files
  const files = yield* utils.globFiles("src/**/*.ts");

  // Read package.json
  const pkg = yield* utils.readJson("package.json");

  // Create directory (cached - multiple calls are no-ops)
  yield* utils.mkdirCached("/path/to/new/dir");

  // Write JSON file
  yield* utils.writeJson("output.json", { name: "example" });

  // Modify files matching pattern
  yield* utils.modifyGlob("src/**/*.ts", (content, path) => {
    return content.replace(/oldImport/g, "newImport");
  });
});

// Run with live layer
Effect.runPromise(program.pipe(Effect.provide(FsUtilsLive)));
```

---

## RepoUtils Service

### Service Definition

```typescript
// Context tag (dependency injection)
export const RepoUtils = Context.GenericTag<RepoUtils>("@beep/tooling-utils/RepoUtils");

// Interface derived from make effect
export interface RepoUtils extends Effect.Effect.Success<typeof make> {}

// Live Layer
export const RepoUtilsLive = Layer.effect(RepoUtils, make).pipe(
  Layer.provide(FsUtilsLive),
  Layer.provide(BunFileSystem.layer),
  Layer.provide(BunPath.layerPosix)
);
```

### Key Properties & Methods

| Member | Type | Purpose |
|--------|------|---------|
| `REPOSITORY_ROOT` | `string` | Absolute path to monorepo root |
| `RepoWorkspaceMap` | `HashMap<string, string>` | Map of package name to absolute directory |
| `getWorkspaceDir` | `(workspace: string) => Effect<string, DomainError, Path \| FileSystem \| FsUtils>` | Resolve workspace package name to directory |

### Layer Dependencies

```
RepoUtilsLive
  |-- Layer.effect(RepoUtils, make)
  |     |-- FileSystem.FileSystem
  |     |-- Path.Path
  |     |-- FsUtils (uses readJson, glob)
  |
  |-- FsUtilsLive (provides FsUtils)
  |-- BunFileSystem.layer (provides FileSystem.FileSystem)
  |-- BunPath.layerPosix (provides Path.Path)
```

### Usage Example

```typescript
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";

const program = Effect.gen(function* () {
  const repo = yield* RepoUtils;

  // Access repository root
  console.log("Repo root:", repo.REPOSITORY_ROOT);

  // Look up workspace directory by package name
  const iamDomainDir = yield* repo.getWorkspaceDir("@beep/iam-domain");
  // => "/home/user/beep-effect/packages/iam/domain"

  // Direct HashMap lookup
  const dir = HashMap.get(repo.RepoWorkspaceMap, "@beep/common-schema");
  // => Option<string>
});

Effect.runPromise(program.pipe(Effect.provide(RepoUtilsLive)));
```

---

## Additional Repo Utilities (Standalone Effects)

The `@beep/tooling-utils` package also exports standalone Effect functions from the `repo/` submodule:

### findRepoRoot

```typescript
import { findRepoRoot } from "@beep/tooling-utils";

// Effect<string, NoSuchFileError, FileSystem | Path>
// Walks up from cwd looking for .git or bun.lock
const root = yield* findRepoRoot;
```

### resolveWorkspaceDirs

```typescript
import { resolveWorkspaceDirs } from "@beep/tooling-utils";

// Effect<HashMap<string, string>, DomainError, Path | FsUtils | FileSystem>
// Returns all workspace directories as a HashMap
const workspaces = yield* resolveWorkspaceDirs;
```

### getWorkspaceDir

```typescript
import { getWorkspaceDir } from "@beep/tooling-utils";

// (workspace: string) => Effect<string, DomainError, Path | FileSystem | FsUtils>
const dir = yield* getWorkspaceDir("@beep/iam-domain");
```

---

## Error Handling

### DomainError

Generic domain-level error with message and cause:

```typescript
import { DomainError } from "@beep/tooling-utils";

// Create explicitly
new DomainError({
  message: "Operation failed",
  cause: originalError
});

// Map unknown errors
Effect.mapError(DomainError.selfOrMap);

// Type guard
if (DomainError.is(error)) { ... }
```

### NoSuchFileError

Specific error for missing files:

```typescript
import { NoSuchFileError } from "@beep/tooling-utils";

new NoSuchFileError({
  path: "/missing/file.ts",
  message: "Configuration file not found" // optional
});
```

---

## Integration with create-slice CLI

### Recommended Usage Patterns

For the create-slice CLI command, use these services to:

1. **Resolve monorepo structure**:
   ```typescript
   const repo = yield* RepoUtils;
   const packagesDir = `${repo.REPOSITORY_ROOT}/packages`;
   ```

2. **Check existing slices**:
   ```typescript
   const utils = yield* FsUtils;
   const existingSlice = yield* utils.dirHasFile(
     `${packagesDir}/${sliceName}`,
     "package.json"
   );
   ```

3. **Create slice directories**:
   ```typescript
   yield* utils.mkdirCached(`${packagesDir}/${sliceName}/domain/src`);
   yield* utils.mkdirCached(`${packagesDir}/${sliceName}/tables/src`);
   yield* utils.mkdirCached(`${packagesDir}/${sliceName}/infra/src`);
   // etc.
   ```

4. **Write configuration files**:
   ```typescript
   yield* utils.writeJson(`${sliceDir}/package.json`, packageJsonContent);
   ```

5. **Copy templates**:
   ```typescript
   yield* utils.copyGlobCached(
     `${repo.REPOSITORY_ROOT}/tooling/cli/templates/slice`,
     "**/*",
     sliceDir
   );
   ```

### Service Layer Composition

For the CLI command, compose layers like this:

```typescript
import { FsUtils, FsUtilsLive, RepoUtils, RepoUtilsLive } from "@beep/tooling-utils";
import * as Layer from "effect/Layer";

// Option 1: Use RepoUtilsLive (includes FsUtilsLive)
const createSlice = Effect.gen(function* () {
  const repo = yield* RepoUtils;
  const fs = yield* FsUtils;
  // ... implementation
}).pipe(
  Effect.provide(RepoUtilsLive)
);

// Option 2: Compose custom layer for testing
const TestLayer = Layer.succeed(FsUtils, mockFsUtils).pipe(
  Layer.provideMerge(Layer.succeed(RepoUtils, mockRepoUtils))
);
```

### Complete CLI Integration Example

```typescript
import { FsUtils, RepoUtils, RepoUtilsLive, DomainError } from "@beep/tooling-utils";
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";

interface CreateSliceOptions {
  readonly name: string;
  readonly layers: ReadonlyArray<"domain" | "tables" | "infra" | "sdk" | "ui">;
}

const createSlice = (options: CreateSliceOptions) =>
  Effect.gen(function* () {
    const repo = yield* RepoUtils;
    const fs = yield* FsUtils;

    const sliceDir = `${repo.REPOSITORY_ROOT}/packages/${options.name}`;

    // Check if slice already exists
    const exists = yield* fs.isDirectory(sliceDir).pipe(
      Effect.catchAll(() => Effect.succeed(false))
    );

    if (exists) {
      return yield* Effect.fail(
        new DomainError({
          message: `Slice "${options.name}" already exists at ${sliceDir}`,
          cause: null
        })
      );
    }

    // Create layer directories
    for (const layer of options.layers) {
      yield* fs.mkdirCached(`${sliceDir}/${layer}/src`);
      yield* Console.log(`Created ${sliceDir}/${layer}/src`);
    }

    return sliceDir;
  }).pipe(
    Effect.withSpan("createSlice", { attributes: { name: options.name } })
  );

// Execute
const main = createSlice({
  name: "billing",
  layers: ["domain", "tables", "infra", "sdk", "ui"]
}).pipe(
  Effect.provide(RepoUtilsLive),
  Effect.tapError((e) => Console.error(`Failed: ${e.message}`))
);

Effect.runPromise(main);
```

---

## Prompt Feedback

**Efficiency Score**: 9/10

**What Worked**:
- Clear task definition with specific files to analyze
- Output format template made documentation structure clear
- The requirement to document Layer dependencies was helpful for understanding composition

**What Was Missing**:
- No mention of the `repo/` submodule exports (findRepoRoot, resolveWorkspaceDirs, etc.)
- Could have asked for existing usage examples in the codebase to see real-world patterns
- Would benefit from specifying whether to include error types (DomainError, NoSuchFileError)
- Schema exports (PackageJson, RootPackageJson, DotEnv) from `schemas/` submodule were not mentioned but may be relevant for create-slice

**Additional Observations**:
- The `FsUtils.mkdirCached` uses `Effect.cachedFunction` for deduplication - important for CLI performance
- `modifyFile` only writes if content actually changed - prevents unnecessary file system writes
- All methods use `Effect.fn` for automatic span creation with descriptive names
- The `DomainError.mapError` helper is consistently used for error normalization
