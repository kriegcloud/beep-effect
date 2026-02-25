# @beep/repo-utils Implementation Plan

**Date:** 2026-02-19
**Status:** 📋 Ready for Implementation
**Package:** `@beep/repo-utils`
**Location:** `tooling/repo-utils/`

---

## Executive Summary

Create a **from-scratch** Effect v4 implementation of monorepo utilities following effect-smol patterns. This package will provide essential primitives for @beep/repo-cli and other tooling.

**Implementation Approach:** Clean room design - DO NOT reference legacy code
**Patterns Source:** effect-smol packages for Effect v4 best practices
**Total Estimated Time:** 37-53 hours across 4 phases

---

## Package Structure

```
tooling/repo-utils/
├── package.json                 # Package manifest
├── tsconfig.json                # TypeScript config (extends base)
├── vitest.config.ts             # Test config (extends shared)
├── docgen.json                  # Doc generation config
├── README.md                    # Package documentation
├── LICENSE                      # MIT license
├── src/
│   ├── index.ts                 # Main exports with @since tags
│   ├── FsUtils.ts               # Filesystem service
│   ├── Root.ts                  # Root discovery
│   ├── Workspaces.ts            # Workspace resolution
│   ├── Dependencies.ts          # Dependency extraction
│   ├── DependencyIndex.ts       # Full repo dependency map
│   ├── Graph.ts                 # Graph algorithms
│   ├── UniqueDeps.ts            # NPM dependency collection
│   ├── TsConfig.ts              # TypeScript config discovery
│   ├── schemas/
│   │   ├── index.ts
│   │   ├── PackageJson.ts       # Package.json schema
│   │   ├── TsConfigJson.ts      # tsconfig.json schema
│   │   └── WorkspaceDeps.ts     # Typed dependency sets
│   └── errors/
│       ├── index.ts
│       ├── NoSuchFileError.ts   # File not found error
│       ├── DomainError.ts       # Generic domain error
│       └── CyclicDependencyError.ts  # Cycle detection error
├── test/
│   ├── FsUtils.test.ts
│   ├── Root.test.ts
│   ├── Workspaces.test.ts
│   ├── Dependencies.test.ts
│   ├── Graph.test.ts
│   ├── schemas/
│   │   └── PackageJson.test.ts
│   └── fixtures/
│       ├── mock-monorepo/       # Test fixture directory structure
│       └── package-jsons/       # Sample package.json files
└── dtslint/                     # Type-level tests (optional)
```

---

## Phase 1: Foundation (Priority 1)

**Goal:** Basic file operations and workspace discovery
**Estimated Time:** 15-20 hours

### 1.1 Package Setup (2 hours)

**Tasks:**
- [ ] Create `tooling/repo-utils/` directory structure
- [ ] Create package.json following @beep/repo-cli patterns
- [ ] Add dependencies to root catalog:
  - `effect: "^4.0.0-beta.5"`
  - `@effect/platform: "^4.0.0-beta.5"`
  - `@effect/platform-node: "^4.0.0-beta.5"` (or bun variant)
  - `glob: "^13.0.0"`
- [ ] Create tsconfig.json extending base
- [ ] Create vitest.config.ts extending shared
- [ ] Create docgen.json
- [ ] Add README.md with module-level documentation
- [ ] Test build scripts (build, check, babel, test, docgen)

### 1.2 Error Types (1 hour)

**Module:** `src/errors/`

**Files to create:**
1. `NoSuchFileError.ts` - File/directory not found error
2. `DomainError.ts` - Generic domain error with cause tracking
3. `index.ts` - Export all errors with @since tags

**Schema Pattern:**
```typescript
import * as S from "effect/Schema"
import * as Data from "effect/Data"

export class NoSuchFileError extends Data.TaggedError("NoSuchFileError")<{
  readonly path: string
  readonly message: string
}> {}
```

**Tests:**
- Error creation and matching
- Error messages format correctly
- TaggedError integration

### 1.3 PackageJson Schema (3 hours)

**Module:** `src/schemas/PackageJson.ts`

**Schema Structure:**
```typescript
import * as S from "effect/Schema"

export const PackageJson = S.Struct({
  name: S.String,
  version: S.optional(S.String),
  description: S.optional(S.String),
  keywords: S.optional(S.Array(S.String)),
  license: S.optional(S.String),
  scripts: S.optional(S.Record({ key: S.String, value: S.String })),
  dependencies: S.optional(S.Record({ key: S.String, value: S.String })),
  devDependencies: S.optional(S.Record({ key: S.String, value: S.String })),
  peerDependencies: S.optional(S.Record({ key: S.String, value: S.String })),
  optionalDependencies: S.optional(S.Record({ key: S.String, value: S.String })),
  workspaces: S.optional(S.Array(S.String)),
  // ... additional fields
})

export type PackageJson = S.Schema.Type<typeof PackageJson>
```

**Tests:**
- Valid package.json decoding
- Invalid package.json rejection
- Missing required fields
- Additional unknown properties allowed

### 1.4 Root Discovery (2 hours)

**Module:** `src/Root.ts`

**Function:** `findRepoRoot`

**Implementation:**
```typescript
import * as Effect from "effect/Effect"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import { NoSuchFileError } from "./errors/index.ts"

export const findRepoRoot = (startPath?: string): Effect.Effect<
  string,
  NoSuchFileError,
  FileSystem.FileSystem | Path.Path
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    let current = startPath ?? process.cwd()

    while (true) {
      // Check for .git or bun.lock
      const hasGit = yield* fs.exists(path.join(current, ".git"))
      const hasBunLock = yield* fs.exists(path.join(current, "bun.lock"))

      if (hasGit || hasBunLock) {
        return current
      }

      // Move to parent
      const parent = path.dirname(current)
      if (parent === current) {
        // Reached filesystem root
        return yield* Effect.fail(
          new NoSuchFileError({
            path: startPath ?? process.cwd(),
            message: "Could not find repository root (.git or bun.lock)"
          })
        )
      }
      current = parent
    }
  })
```

**Tests:**
- Find root from subdirectory
- Find root from root directory
- Error when no root found
- Works with both .git and bun.lock

### 1.5 FsUtils Core (8 hours)

**Module:** `src/FsUtils.ts`

**Service Definition:**
```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export interface FsUtils {
  readonly glob: (pattern: string, options?: GlobOptions) => Effect.Effect<string[]>
  readonly globFiles: (pattern: string, options?: GlobOptions) => Effect.Effect<string[]>
  readonly readJson: (path: string) => Effect.Effect<unknown>
  readonly writeJson: (path: string, json: unknown) => Effect.Effect<void>
  readonly modifyFile: (path: string, transform: (content: string) => string) => Effect.Effect<void>
  readonly existsOrThrow: (path: string) => Effect.Effect<void>
  readonly isDirectory: (path: string) => Effect.Effect<boolean>
  readonly isFile: (path: string) => Effect.Effect<boolean>
  readonly getParentDirectory: (path: string) => Effect.Effect<string>
}

export const FsUtils = Context.GenericTag<FsUtils>("@beep/repo-utils/FsUtils")
```

**Implementation Pattern (from effect-smol):**
```typescript
export const FsUtilsLive = Layer.effect(
  FsUtils,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    return FsUtils.of({
      glob: (pattern, options) =>
        Effect.gen(function* () {
          // Use glob library
          const { glob } = yield* Effect.promise(() => import("glob"))
          const matches = yield* Effect.promise(() => glob(pattern, options))
          return matches
        }),

      readJson: (filePath) =>
        Effect.gen(function* () {
          const content = yield* fs.readFileString(filePath)
          return JSON.parse(content)
        }).pipe(
          Effect.catchAll((error) =>
            Effect.fail(new DomainError({ message: `Failed to read JSON: ${filePath}`, cause: error }))
          )
        ),

      // ... implement other functions
    })
  })
).pipe(
  Layer.provide(NodeFileSystem.layer),  // or BunFileSystem.layer
  Layer.provide(NodePath.layer)
)
```

**Functions to Implement:**
1. `glob` - Wrap glob library with Effect
2. `globFiles` - Filter glob results to files only
3. `readJson` - Read and parse JSON file
4. `writeJson` - Stringify and write JSON with formatting
5. `modifyFile` - Read, transform, write (only if changed)
6. `existsOrThrow` - Verify path exists or fail
7. `isDirectory` - Check if path is directory
8. `isFile` - Check if path is file
9. `getParentDirectory` - Get parent with validation

**Tests:**
- Each function with temp directory fixtures
- Error cases (file not found, invalid JSON, etc.)
- Modify functions only write when changed
- Glob patterns match correctly

### 1.6 Workspace Resolution (4 hours)

**Module:** `src/Workspaces.ts`

**Functions:**
1. `resolveWorkspaceDirs` - Expand workspaces globs to HashMap
2. `getWorkspaceDir` - Look up single workspace by name

**Implementation:**
```typescript
import * as Effect from "effect/Effect"
import * as HashMap from "effect/HashMap"
import { FsUtils } from "./FsUtils.js"
import { PackageJson } from "./schemas/PackageJson.js"
import { findRepoRoot } from "./Root.js"

export const resolveWorkspaceDirs = Effect.gen(function* () {
  const fs = yield* FsUtils
  const root = yield* findRepoRoot()

  // Read root package.json
  const rootPkgJson = yield* fs.readJson(`${root}/package.json`)
  const rootPkg = yield* S.decode(PackageJson)(rootPkgJson)

  if (!rootPkg.workspaces) {
    return HashMap.empty<string, string>()
  }

  // Expand each workspace glob pattern
  const workspaceMap = HashMap.empty<string, string>()

  for (const pattern of rootPkg.workspaces) {
    const matches = yield* fs.glob(`${root}/${pattern}/package.json`)

    for (const pkgJsonPath of matches) {
      const pkgJson = yield* fs.readJson(pkgJsonPath)
      const pkg = yield* S.decode(PackageJson)(pkgJson)

      const dir = yield* fs.getParentDirectory(pkgJsonPath)
      workspaceMap.set(pkg.name, dir)
    }
  }

  return workspaceMap
})
```

**Tests:**
- Resolve workspaces from mock monorepo
- Handle missing workspaces field
- Ignore node_modules, dist, .turbo
- Correct HashMap structure

---

## Phase 2: Dependency Analysis (Priority 2)

**Goal:** Dependency extraction and indexing
**Estimated Time:** 10-12 hours

### 2.1 WorkspaceDeps Schema (2 hours)

**Module:** `src/schemas/WorkspaceDeps.ts`

**Schema:**
```typescript
import * as S from "effect/Schema"
import * as HashSet from "effect/HashSet"

export const WorkspaceDependencies = S.Struct({
  workspace: S.Array(S.String),  // Will convert to HashSet
  npm: S.Array(S.String)
})

export const TypedDependencies = S.Struct({
  dependencies: WorkspaceDependencies,
  devDependencies: WorkspaceDependencies,
  peerDependencies: WorkspaceDependencies
})
```

### 2.2 Dependency Extraction (4 hours)

**Module:** `src/Dependencies.ts`

**Function:** `extractWorkspaceDependencies`

**Implementation:**
```typescript
export const extractWorkspaceDependencies = (
  pkgJsonPath: string,
  workspacePattern: string = "@beep/"
) =>
  Effect.gen(function* () {
    const fs = yield* FsUtils
    const pkgJson = yield* fs.readJson(pkgJsonPath)
    const pkg = yield* S.decode(PackageJson)(pkgJson)

    const classify = (deps: Record<string, string> | undefined) => {
      if (!deps) return { workspace: HashSet.empty(), npm: HashSet.empty() }

      const workspace = HashSet.empty<string>()
      const npm = HashSet.empty<string>()

      for (const [name, _version] of R.toEntries(deps)) {
        if (name.startsWith(workspacePattern)) {
          workspace.add(name)
        } else {
          npm.add(name)
        }
      }

      return { workspace, npm }
    }

    return {
      dependencies: classify(pkg.dependencies),
      devDependencies: classify(pkg.devDependencies),
      peerDependencies: classify(pkg.peerDependencies)
    }
  })
```

**Tests:**
- Extract workspace deps correctly
- Extract npm deps correctly
- Handle missing dependency fields
- Custom workspace pattern matching

### 2.3 Dependency Index (4 hours)

**Module:** `src/DependencyIndex.ts`

**Function:** `buildRepoDependencyIndex`

**Implementation:**
```typescript
export const buildRepoDependencyIndex = Effect.gen(function* () {
  const workspaces = yield* resolveWorkspaceDirs
  const fs = yield* FsUtils
  const root = yield* findRepoRoot()

  const index = HashMap.empty<string, TypedDependencies>()

  // Add root package
  const rootDeps = yield* extractWorkspaceDependencies(`${root}/package.json`)
  index.set("@beep/root", rootDeps)

  // Add all workspaces
  for (const [name, dir] of HashMap.toIterable(workspaces)) {
    const deps = yield* extractWorkspaceDependencies(`${dir}/package.json`)
    index.set(name, deps)
  }

  return index
})
```

**Tests:**
- Index includes root
- Index includes all workspaces
- Correct dependency classification
- Handles errors gracefully

### 2.4 Unique NPM Dependencies (2 hours)

**Module:** `src/UniqueDeps.ts`

**Function:** `collectUniqueNpmDependencies`

**Implementation:**
```typescript
export const collectUniqueNpmDependencies = Effect.gen(function* () {
  const index = yield* buildRepoDependencyIndex

  const allDeps = HashSet.empty<string>()
  const allDevDeps = HashSet.empty<string>()

  for (const [_name, deps] of HashMap.toIterable(index)) {
    HashSet.union(allDeps, deps.dependencies.npm)
    HashSet.union(allDevDeps, deps.devDependencies.npm)
  }

  return {
    dependencies: Array.from(allDeps).sort(),
    devDependencies: Array.from(allDevDeps).sort()
  }
})
```

**Tests:**
- Collects all unique deps
- No duplicates
- Sorted output
- Excludes workspace deps

---

## Phase 3: Advanced Analysis (Priority 3)

**Goal:** Graph algorithms and TypeScript config discovery
**Estimated Time:** 12-16 hours

### 3.1 Graph Algorithms (10 hours)

**Module:** `src/Graph.ts`

**Functions:**
1. `topologicalSort` - Kahn's algorithm
2. `detectCycles` - DFS-based cycle detection
3. `computeTransitiveClosure` - Deep dependency analysis

**Topological Sort Implementation:**
```typescript
export const topologicalSort = <K>(
  adjacencyList: HashMap.HashMap<K, HashSet.HashSet<K>>
): Effect.Effect<K[], CyclicDependencyError> =>
  Effect.gen(function* () {
    // 1. Build in-degree map
    const inDegree = HashMap.empty<K, number>()
    for (const [node, _] of HashMap.toIterable(adjacencyList)) {
      if (!inDegree.has(node)) inDegree.set(node, 0)
    }
    for (const [_node, deps] of HashMap.toIterable(adjacencyList)) {
      for (const dep of HashSet.toIterable(deps)) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
      }
    }

    // 2. Queue nodes with in-degree 0
    const queue = []
    for (const [node, degree] of HashMap.toIterable(inDegree)) {
      if (degree === 0) queue.push(node)
    }

    // 3. Process queue
    const sorted = []
    while (queue.length > 0) {
      const node = queue.shift()!
      sorted.push(node)

      const deps = adjacencyList.get(node) ?? HashSet.empty()
      for (const dep of HashSet.toIterable(deps)) {
        const newDegree = inDegree.get(dep)! - 1
        inDegree.set(dep, newDegree)
        if (newDegree === 0) queue.push(dep)
      }
    }

    // 4. Check for cycles
    if (sorted.length !== HashMap.size(adjacencyList)) {
      const cycles = yield* detectCycles(adjacencyList)
      return yield* Effect.fail(new CyclicDependencyError({ cycles }))
    }

    return sorted
  })
```

**Cycle Detection Implementation:**
```typescript
export const detectCycles = <K>(
  adjacencyList: HashMap.HashMap<K, HashSet.HashSet<K>>
): Effect.Effect<K[][]> =>
  Effect.gen(function* () {
    const visited = new Set<K>()
    const recStack = new Set<K>()
    const cycles: K[][] = []

    const dfs = (node: K, path: K[]): void => {
      visited.add(node)
      recStack.add(node)
      path.push(node)

      const deps = adjacencyList.get(node) ?? HashSet.empty()
      for (const dep of HashSet.toIterable(deps)) {
        if (!visited.has(dep)) {
          dfs(dep, [...path])
        } else if (recStack.has(dep)) {
          // Found cycle
          const cycleStart = path.indexOf(dep)
          cycles.push([...path.slice(cycleStart), dep])
        }
      }

      recStack.delete(node)
    }

    for (const [node, _] of HashMap.toIterable(adjacencyList)) {
      if (!visited.has(node)) {
        dfs(node, [])
      }
    }

    return cycles
  })
```

**Tests:**
- Topological sort on DAG
- Topological sort detects cycles
- Cycle detection finds all cycles
- Transitive closure computes correctly
- Edge cases (empty graph, single node, disconnected)

### 3.2 TsConfig Discovery (3 hours)

**Module:** `src/TsConfig.ts`

**Function:** `collectTsConfigPaths`

**Implementation:**
```typescript
export const collectTsConfigPaths = Effect.gen(function* () {
  const workspaces = yield* resolveWorkspaceDirs
  const fs = yield* FsUtils
  const root = yield* findRepoRoot()

  const index = HashMap.empty<string, string[]>()

  // Root tsconfig files
  const rootConfigs = [
    "tsconfig.json",
    "tsconfig.build.json",
    "tsconfig.base.jsonc"
  ]
  const rootPaths = []
  for (const config of rootConfigs) {
    const path = `${root}/${config}`
    if (yield* fs.exists(path)) {
      rootPaths.push(path)
    }
  }
  index.set("@beep/root", rootPaths)

  // Workspace tsconfig files
  for (const [name, dir] of HashMap.toIterable(workspaces)) {
    const configs = [
      "tsconfig.json",
      "tsconfig.build.json",
      "tsconfig.test.json",
      "tsconfig.src.json"
    ]
    const paths = []
    for (const config of configs) {
      const path = `${dir}/${config}`
      if (yield* fs.exists(path)) {
        paths.push(path)
      }
    }
    if (paths.length > 0) {
      index.set(name, paths)
    }
  }

  return index
})
```

**Tests:**
- Discover root tsconfigs
- Discover workspace tsconfigs
- Handle missing tsconfigs
- Correct HashMap structure

---

## Phase 4: Polish (Optional)

**Goal:** Additional utilities and convenience layers
**Estimated Time:** 5-8 hours

### 4.1 Additional FsUtils Functions (3 hours)

**Functions:**
- `rmAndCopy` - Delete and copy recursively
- `copyIfExists` - Conditional copy
- `rmAndMkdir` - Delete and recreate directory
- `mkdirCached` - Cached directory creation
- `modifyGlob` - Apply transform to glob matches

### 4.2 Convenience Service (2 hours)

**Module:** `src/RepoUtils.ts`

**Service combining all utilities with cached root and workspace map**

### 4.3 Additional Schemas (2 hours)

- TsConfigJson schema
- DotEnv schema
- Additional package.json fields

---

## Dependencies

### Root Catalog Additions

Add to `package.json` catalog:
```json
{
  "catalog": {
    "effect": "^4.0.0-beta.5",
    "@effect/platform": "^4.0.0-beta.5",
    "@effect/platform-node": "^4.0.0-beta.5",
    "glob": "^13.0.0"
  }
}
```

### Package Dependencies

**tooling/repo-utils/package.json:**
```json
{
  "dependencies": {
    "effect": "catalog:",
    "@effect/platform": "catalog:",
    "@effect/platform-node": "catalog:",
    "glob": "catalog:"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "@effect/vitest": "catalog:"
  }
}
```

---

## Testing Strategy

### Test Structure
```
test/
├── FsUtils.test.ts              # Filesystem operations
├── Root.test.ts                 # Root discovery
├── Workspaces.test.ts           # Workspace resolution
├── Dependencies.test.ts         # Dependency extraction
├── DependencyIndex.test.ts      # Full index building
├── Graph.test.ts                # Graph algorithms
├── UniqueDeps.test.ts           # NPM collection
├── TsConfig.test.ts             # TsConfig discovery
├── schemas/
│   └── PackageJson.test.ts      # Schema validation
└── fixtures/
    └── mock-monorepo/           # Test monorepo structure
        ├── package.json
        ├── bun.lock
        ├── packages/
        │   ├── a/package.json
        │   └── b/package.json
        └── tooling/
            └── utils/package.json
```

### Test Fixtures

Create mock monorepo with:
- Root package.json with workspaces
- Multiple workspace packages
- Interdependent packages (for graph tests)
- Cyclic dependencies (for cycle detection)
- Various tsconfig files

### Coverage Goals
- Minimum 80% line coverage
- All public functions tested
- Error cases covered
- Edge cases covered

---

## Documentation Requirements

### Module-Level Documentation

Each module needs:
```typescript
/**
 * Brief module description.
 *
 * ## Mental model
 *
 * - Concept 1
 * - Concept 2
 *
 * ## Common tasks
 *
 * - Task 1: {@link functionName}
 * - Task 2: {@link functionName}
 *
 * ## Quickstart
 *
 * ```ts
 * import { FsUtils, FsUtilsLive } from "@beep/repo-utils"
 *
 * const program = Effect.gen(function* () {
 *   const fs = yield* FsUtils
 *   const files = yield* fs.glob("src/**/*.ts")
 *   console.log(files)
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(FsUtilsLive)))
 * ```
 *
 * @since 0.0.0
 */
```

### Function Documentation

Each function needs:
```typescript
/**
 * Brief function description.
 *
 * Longer explanation if needed.
 *
 * @since 0.0.0
 * @category FileSystem
 * @example
 * ```ts
 * import { FsUtils } from "@beep/repo-utils"
 *
 * const program = Effect.gen(function* () {
 *   const fs = yield* FsUtils
 *   const files = yield* fs.glob("src/**/*.ts")
 * })
 * ```
 */
```

### README.md

Include:
- Package purpose and overview
- Installation instructions
- Quick start examples
- API reference link
- Common recipes
- Migration guide from legacy

---

## Implementation Guidelines

### Effect v4 Patterns (from effect-smol)

1. **Service Definition:**
   ```typescript
   import * as Context from "effect/Context"

   export interface MyService {
     readonly operation: () => Effect.Effect<Result>
   }

   export const MyService = Context.GenericTag<MyService>("@beep/repo-utils/MyService")
   ```

2. **Layer Implementation:**
   ```typescript
   export const MyServiceLive = Layer.effect(
     MyService,
     Effect.gen(function* () {
       const dep = yield* Dependency

       return MyService.of({
         operation: () => Effect.gen(function* () {
           // implementation
         })
       })
     })
   )
   ```

3. **Error Handling:**
   ```typescript
   import * as Data from "effect/Data"

   export class MyError extends Data.TaggedError("MyError")<{
     readonly message: string
     readonly cause?: unknown
   }> {}
   ```

4. **Schema Definition:**
   ```typescript
   import * as S from "effect/Schema"

   export const MySchema = S.Struct({
     field: S.String,
     optional: S.optional(S.Number)
   })

   export type MyType = S.Schema.Type<typeof MySchema>
   ```

### Code Quality Standards

- ✅ All exports have @since tags
- ✅ All functions have JSDoc with examples
- ✅ Module-level documentation complete
- ✅ Tests use it.effect from @effect/vitest
- ✅ Proper error types (TaggedError)
- ✅ Layer composition for services
- ✅ Consistent naming (PascalCase for types/services, camelCase for functions)
- ✅ No direct file I/O - always through @effect/platform
- ✅ Proper resource cleanup

---

## Success Criteria

**Phase 1 Complete When:**
- ✅ Package builds successfully
- ✅ All Phase 1 tests passing
- ✅ FsUtils service working
- ✅ Root discovery working
- ✅ Workspace resolution working
- ✅ PackageJson schema validated

**Phase 2 Complete When:**
- ✅ Dependency extraction working
- ✅ Full dependency index builds
- ✅ Unique NPM deps collected

**Phase 3 Complete When:**
- ✅ Topological sort working
- ✅ Cycle detection working
- ✅ TsConfig discovery working

**Package Ready When:**
- ✅ All phases complete
- ✅ 80%+ test coverage
- ✅ API documentation complete
- ✅ Successfully used by @beep/repo-cli
- ✅ All scripts passing (build, test, lint, docgen)

---

## Next Steps

1. **Read this plan thoroughly**
2. **Set up package structure** (Phase 1.1)
3. **Implement Phase 1** utilities
4. **Test Phase 1** thoroughly before moving on
5. **Iterate through phases** sequentially
6. **Document as you go** - don't leave docs for the end
7. **Use @beep/repo-cli** as first consumer to validate API

---

## References

- **Legacy Inventory:** `specs/outputs/repo-utils-legacy-inventory.md`
- **Effect v4 Docs:** https://effect.website
- **effect-smol Patterns:** `.repos/effect-smol/packages/effect`
- **@effect/platform Guide:** https://effect.website/docs/platform
- **@beep/repo-cli Example:** `tooling/cli/`
