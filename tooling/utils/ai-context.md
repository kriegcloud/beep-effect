---
path: tooling/utils
summary: Effect-first filesystem and repository helpers - FsUtils, RepoUtils, schemas
tags: [tooling, utils, filesystem, schemas, repo]
---

# @beep/tooling-utils

Effect-first filesystem and repository helpers used by automation scripts and build-time tooling. Wraps Bun platform services for portability between runtime and test harnesses. Ships schema definitions for `package.json`, `tsconfig.json`, and `.env` files to keep repo automation type-safe.

## Architecture

```
|-------------------|     |-------------------|
|     FsUtils       | --> |  Bun FileSystem   |
|-------------------|     |-------------------|
        |
        v
|-------------------|     |-------------------|
|    RepoUtils      | --> |   FsUtils Layer   |
|-------------------|     |-------------------|
        |
        v
|-------------------|
| Repo Namespace    |
| - Workspaces      |
| - Dependencies    |
| - TsConfigIndex   |
|-------------------|

|-------------------|
|     Schemas       |
| - PackageJson     |
| - TsConfigJson    |
| - DotEnv          |
|-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/FsUtils.ts` | Span-instrumented glob, JSON helpers, file operations |
| `src/RepoUtils.ts` | Repository root, workspace map, directory resolution |
| `src/repo/Workspaces.ts` | Workspace directory discovery via glob |
| `src/repo/Root.ts` | Repository root detection (`.git`, `bun.lock`) |
| `src/repo/Dependencies.ts` | HashSet-backed dependency inventories |
| `src/repo/TsConfigIndex.ts` | TypeScript config validation and collection |
| `src/repo/UniqueDependencies.ts` | Unique npm dependency collection |
| `src/schemas/PackageJson.ts` | Package manifest schema |
| `src/schemas/TsConfigJson.ts` | TypeScript config schema |
| `src/schemas/DotEnv.ts` | Environment file parsing schema |

## Usage Patterns

### Filesystem Operations

```typescript
import * as Effect from "effect/Effect";
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import * as F from "effect/Function";
import * as Str from "effect/String";

export const normalizeHeadings = Effect.gen(function* () {
  const fsUtils = yield* FsUtils;
  yield* fsUtils.modifyGlob("docs/**/*.md", (content) =>
    F.pipe(content, Str.replace(/^# /gm, "## "))
  );
}).pipe(Effect.provide(FsUtilsLive));
```

### Repository Utilities

```typescript
import * as Effect from "effect/Effect";
import * as Path from "@effect/platform/Path";
import { RepoUtils, RepoUtilsLive } from "@beep/tooling-utils/RepoUtils";

export const ensureGeneratedFolder = Effect.gen(function* () {
  const repo = yield* RepoUtils;
  const path_ = yield* Path.Path;
  return path_.join(repo.REPOSITORY_ROOT, "packages", "common", "constants", "_generated");
}).pipe(Effect.provide(RepoUtilsLive));
```

### Dependency Collection

```typescript
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { collectUniqueNpmDependencies } from "@beep/tooling-utils/repo/UniqueDependencies";

export const listSortedDeps = Effect.gen(function* () {
  const result = yield* collectUniqueNpmDependencies;
  return F.pipe(result.dependencies, A.sort(Str.Order));
});
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Tag-based injection | `FsUtils`/`RepoUtils` via Context tags, not direct instantiation |
| Span instrumentation | Meaningful traces for debugging automation |
| Cached mkdir | `Effect.cachedFunction` for repeated directory creation |
| Stable JSON formatting | Two-space, no trailing newline to avoid noisy diffs |
| HashSet/HashMap usage | Immutable Effect collections over native Set/Map |

## Dependencies

**Internal**: None (foundational package)

**External**: `effect`, `@effect/platform`, `@effect/platform-bun`, `glob`

## Related

- **AGENTS.md** - Detailed contributor guidance and authoring guardrails
- **tooling/repo-scripts/** - Primary consumer of these utilities
- **tooling/cli/** - Uses FsUtils and RepoUtils for command implementations
