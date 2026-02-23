# Existing Utilities for tsconfig-sync

> Analysis of `@beep/tooling-utils` utilities that reduce implementation boilerplate.

---

## Impact Summary

| Planned Component | Existing Utility | Boilerplate Eliminated |
|-------------------|------------------|------------------------|
| `workspace-parser.ts` | `resolveWorkspaceDirs` | ~150 lines |
| Dependency extraction | `extractWorkspaceDependencies` | ~80 lines |
| Dependency index | `buildRepoDependencyIndex` | ~100 lines |
| tsconfig discovery | `collectTsConfigPaths` | ~100 lines |
| Repo root finding | `findRepoRoot` | ~30 lines |
| Package.json mapping | `mapWorkspaceToPackageJsonPath` | ~40 lines |
| File operations | `FsUtils` service | Numerous |
| **Total Estimated** | | **~500+ lines** |

---

## High-Value Utilities (Direct Replacements)

### 1. Workspace Discovery

**Planned**: `workspace-parser.ts` with `discoverPackages()`
**Use Instead**: `resolveWorkspaceDirs` from `@beep/tooling-utils/repo/Workspaces`

```typescript
import { resolveWorkspaceDirs, getWorkspaceDir } from "@beep/tooling-utils/repo/Workspaces";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";

// Get all workspaces: HashMap<packageName, absoluteDir>
const program = Effect.gen(function* () {
  const workspaces = yield* resolveWorkspaceDirs;
  // HashMap.get(workspaces, "@beep/schema") => Some("/absolute/path/to/packages/common/schema")

  // Or get a specific workspace:
  const schemaDir = yield* getWorkspaceDir("@beep/schema");
});
```

**Eliminates**: Package.json parsing, glob patterns, workspace validation.

---

### 2. Dependency Extraction

**Planned**: Extract deps from each package.json
**Use Instead**: `extractWorkspaceDependencies` from `@beep/tooling-utils/repo/Dependencies`

```typescript
import { extractWorkspaceDependencies } from "@beep/tooling-utils/repo/Dependencies";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";

const program = Effect.gen(function* () {
  const deps = yield* extractWorkspaceDependencies("/path/to/package.json");

  // deps.dependencies.workspace: HashSet<"@beep/foo" | "@beep/bar">
  // deps.dependencies.npm: HashSet<"effect" | "drizzle-orm">
  // deps.devDependencies.workspace: HashSet<...>
  // deps.devDependencies.npm: HashSet<...>
  // deps.peerDependencies.workspace: HashSet<...>
  // deps.peerDependencies.npm: HashSet<...>
});
```

**Eliminates**: Package.json parsing, dependency categorization, workspace vs npm detection.

---

### 3. Repository-Wide Dependency Index

**Planned**: Build dependency graph for all packages
**Use Instead**: `buildRepoDependencyIndex` from `@beep/tooling-utils/repo/DependencyIndex`

```typescript
import { buildRepoDependencyIndex } from "@beep/tooling-utils/repo/DependencyIndex";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";

const program = Effect.gen(function* () {
  const depIndex = yield* buildRepoDependencyIndex;

  // HashMap<"@beep/package", RepoDepMapValue>
  // Includes @beep/root for repository root package.json

  const schemaDeps = HashMap.get(depIndex, "@beep/schema");
  // => Some({ dependencies: {...}, devDependencies: {...}, peerDependencies: {...} })
});
```

**Eliminates**: Iterating workspaces, extracting deps manually, building the index.

---

### 4. tsconfig Path Discovery

**Planned**: `reference-resolver.ts` to find tsconfig paths
**Use Instead**: `collectTsConfigPaths` from `@beep/tooling-utils/repo/TsConfigIndex`

```typescript
import { collectTsConfigPaths } from "@beep/tooling-utils/repo/TsConfigIndex";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";

const program = Effect.gen(function* () {
  const tsconfigMap = yield* collectTsConfigPaths;

  // HashMap<packageName, NonEmptyArray<tsconfigPath>>
  // Includes: tsconfig.json, tsconfig.build.json, tsconfig.test.json, etc.

  const rootConfigs = HashMap.get(tsconfigMap, "@beep/root");
  // => Some(["/repo/tsconfig.json", "/repo/tsconfig.build.json", "/repo/tsconfig.base.jsonc"])

  const schemaConfigs = HashMap.get(tsconfigMap, "@beep/schema");
  // => Some([".../packages/common/schema/tsconfig.json", ".../tsconfig.build.json", ...])
});
```

**Eliminates**: Globbing for tsconfig files, validating existence, collecting variants.

---

### 5. Repository Root Discovery

**Planned**: Find repo root for path calculations
**Use Instead**: `findRepoRoot` from `@beep/tooling-utils/repo/Root`

```typescript
import { findRepoRoot } from "@beep/tooling-utils/repo/Root";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const repoRoot = yield* findRepoRoot;
  // => "/home/user/projects/beep-effect"
});
```

**Eliminates**: Directory traversal, marker file detection (.git, bun.lock).

---

### 6. FsUtils Service

**Provides**: Effect-based file operations with spans and error handling.

```typescript
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as Effect from "effect/Effect";

const program = Effect.gen(function* () {
  const fs = yield* FsUtils;

  // Read JSON with automatic parsing and error handling
  const json = yield* fs.readJson("/path/to/package.json");

  // Write JSON with stable formatting
  yield* fs.writeJson("/path/to/output.json", { foo: "bar" });

  // Modify file in-place (only writes if changed)
  yield* fs.modifyFile("/path/to/file.ts", (content, path) =>
    content.replace(/foo/g, "bar")
  );

  // Glob for files
  const files = yield* fs.globFiles("packages/**/tsconfig.build.json");

  // Check existence with error on missing
  yield* fs.existsOrThrow("/path/to/required/file");
}).pipe(Effect.provide(FsUtilsLive));
```

---

## Schemas to Reuse

### Package.json Schema

```typescript
import { PackageJson } from "@beep/tooling-utils/schemas/PackageJson";
import * as S from "effect/Schema";

// Decode package.json with typed fields
const pkg = yield* S.decode(PackageJson)(jsonContent);
// pkg.name, pkg.dependencies, pkg.devDependencies, pkg.peerDependencies
```

### tsconfig.json Schema

```typescript
import { TsConfigJson, ProjectReference } from "@beep/tooling-utils/schemas/TsConfigJson";
import * as S from "effect/Schema";

// Decode tsconfig.json
const config = yield* S.decode(TsConfigJson)(jsonContent);
// config.references: Array<{ path: string, circular?: boolean, prepend?: boolean }>
```

### Workspace Dependency Schemas

```typescript
import {
  WorkspacePkgKey,      // "@beep/*" template literal
  WorkspacePkgValue,    // "workspace:^" literal
  RepoDepMapValue,      // { dependencies, devDependencies, peerDependencies }
  Dependencies,         // { workspace: HashSet, npm: HashSet }
} from "@beep/tooling-utils/schemas/WorkspaceDependencies";
```

---

## Error Types to Reuse

```typescript
import { NoSuchFileError, DomainError } from "@beep/tooling-utils/repo/Errors";

// NoSuchFileError - for missing files
new NoSuchFileError({ path: "/path/to/missing", message: "Config not found" })

// DomainError - generic with cause mapping
new DomainError({ message: "Validation failed", cause: originalError })

// Error mapping helper
Effect.mapError(DomainError.selfOrMap)
```

---

## What Still Needs Implementation

With existing utilities, the following components **still require implementation**:

| Component | Purpose | Lines Est. |
|-----------|---------|------------|
| `dependency-graph.ts` (partial) | **Transitive closure** computation | ~150 |
| `dep-sorter.ts` | Topological + alphabetical sorting | ~200 |
| `reference-path-builder.ts` | Root-relative path calculation | ~80 |
| `cycle-detector.ts` | DFS cycle detection | ~100 |
| `tsconfig-updater.ts` | jsonc-parser integration | ~150 |
| `package-json-updater.ts` | Write sorted deps back | ~100 |
| **Total New Code** | | **~780 lines** |

**Original estimate**: ~3,600 lines
**With existing utilities**: ~780 lines new code + integration
**Boilerplate reduction**: **~78%**

---

## Revised File Structure

```
tooling/cli/src/commands/tsconfig-sync/
├── index.ts              # Command definition
├── handler.ts            # Main orchestration (uses existing utils)
├── schemas.ts            # Input validation
├── errors.ts             # Error types (extend existing)
└── utils/
    ├── transitive-closure.ts  # NEW: Compute transitive deps
    ├── dep-sorter.ts          # NEW: Topological + alphabetical sorting
    ├── reference-path-builder.ts  # NEW: Root-relative path calculation
    ├── tsconfig-updater.ts    # NEW: jsonc-parser write-back
    ├── package-json-updater.ts # NEW: Sorted deps write-back
    └── cycle-detector.ts      # NEW: DFS cycle detection
```

**Removed** (use `@beep/tooling-utils` instead):
- ~~workspace-parser.ts~~ → `resolveWorkspaceDirs`
- ~~dependency-graph.ts~~ (mostly) → `buildRepoDependencyIndex`
- ~~reference-resolver.ts~~ → `collectTsConfigPaths`

---

## Import Patterns

```typescript
// Repo utilities
import {
  resolveWorkspaceDirs,
  getWorkspaceDir
} from "@beep/tooling-utils/repo/Workspaces";

import {
  extractWorkspaceDependencies
} from "@beep/tooling-utils/repo/Dependencies";

import {
  buildRepoDependencyIndex
} from "@beep/tooling-utils/repo/DependencyIndex";

import {
  collectTsConfigPaths
} from "@beep/tooling-utils/repo/TsConfigIndex";

import {
  findRepoRoot
} from "@beep/tooling-utils/repo/Root";

import {
  NoSuchFileError,
  DomainError
} from "@beep/tooling-utils/repo/Errors";

// FsUtils service
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";

// Schemas
import { PackageJson } from "@beep/tooling-utils/schemas/PackageJson";
import { TsConfigJson } from "@beep/tooling-utils/schemas/TsConfigJson";
import {
  WorkspacePkgKey,
  RepoDepMapValue
} from "@beep/tooling-utils/schemas/WorkspaceDependencies";
```

---

## Layer Composition

```typescript
import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { BunFileSystem } from "@effect/platform-bun";
import * as Layer from "effect/Layer";

// FsUtilsLive already includes BunFileSystem and BunPath
export const TsconfigSyncLive = Layer.mergeAll(
  FsUtilsLive,
  // Add any additional layers here
);
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [tooling/utils/AGENTS.md](../../tooling/utils/AGENTS.md) | Full API guide for @beep/tooling-utils |
| [tooling/utils/src/repo/](../../tooling/utils/src/repo/) | Source code for repo utilities |
| [README.md](./README.md) | Full spec design |
| [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 implementation context |
