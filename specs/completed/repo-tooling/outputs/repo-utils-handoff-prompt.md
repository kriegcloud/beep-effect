# @beep/repo-utils Implementation Handoff

**Date:** 2026-02-19
**Agent Task:** Implement @beep/repo-utils package from scratch using Effect v4
**Estimated Time:** 37-53 hours across 4 phases

---

## Your Mission

You will implement a **from-scratch** monorepo utilities package following Effect v4 and effect-smol patterns. This package provides essential primitives for repository analysis, workspace discovery, and dependency management.

**Critical Requirements:**
- ✅ DO NOT reference legacy code at `.repos/beep-effect/tooling/utils`
- ✅ DO follow effect-smol patterns from `.repos/effect-smol/packages/effect`
- ✅ DO use Effect v4 APIs exclusively
- ✅ DO write comprehensive tests with @effect/vitest
- ✅ DO document everything with @since tags and JSDoc

---

## Context You Need

### 1. Read These Documents First

**Required Reading** (in order):
1. `specs/outputs/repo-utils-legacy-inventory.md` - What utilities exist and why
2. `specs/outputs/repo-utils-implementation-plan.md` - Detailed implementation plan
3. `specs/completed/effect-v4-migration/design-discussions/005-lessons-learned-creating-repo-cli.md` - Lessons from creating first package

**Reference Examples:**
- `tooling/cli/` - Example package following our standards
- `.repos/effect-smol/packages/effect/` - Effect v4 patterns to follow

### 2. Repository Standards

**Package Structure:**
- Extends `tsconfig.base.json` with explicit `outDir` and `rootDir`
- Uses `vitest.config.ts` extending shared config
- Imports test utilities from `@effect/vitest`, not `vitest`
- All exports need `@since` tags (including re-exports)
- Module-level JSDoc with Mental model, Common tasks, Quickstart
- Uses catalog dependencies: `"effect": "catalog:"`

**Script Standards:**
- `build` - TypeScript + Babel pure annotations
- `check` - Type checking only
- `test` - Vitest tests with it.effect
- `docgen` - Generate documentation
- `lint` / `lint:fix` - Inherited from root

### 3. Effect v4 Patterns to Follow

**Service Definition:**
```typescript
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export interface FsUtils {
  readonly glob: (pattern: string) => Effect.Effect<string[]>
  // ... other operations
}

export const FsUtils = Context.GenericTag<FsUtils>("@beep/repo-utils/FsUtils")
```

**Layer Implementation:**
```typescript
export const FsUtilsLive = Layer.effect(
  FsUtils,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    return FsUtils.of({
      glob: (pattern) =>
        Effect.gen(function* () {
          // implementation
        }),
      // ... other operations
    })
  })
).pipe(
  Layer.provide(NodeFileSystem.layer),
  Layer.provide(NodePath.layer)
)
```

**Error Types:**
```typescript
import * as Data from "effect/Data"

export class NoSuchFileError extends Data.TaggedError("NoSuchFileError")<{
  readonly path: string
  readonly message: string
}> {}
```

**Schema Definition:**
```typescript
import * as Schema from "effect/Schema"

export const PackageJson = Schema.Struct({
  name: Schema.String,
  version: Schema.optional(Schema.String),
  // ... other fields
})

export type PackageJson = Schema.Schema.Type<typeof PackageJson>
```

**Test Pattern:**
```typescript
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

describe("FsUtils", () => {
  it.effect("should glob files", () =>
    Effect.gen(function* () {
      const fs = yield* FsUtils
      const files = yield* fs.glob("src/**/*.ts")
      expect(files.length).toBeGreaterThan(0)
    }).pipe(Effect.provide(FsUtilsLive))
  )
})
```

---

## Implementation Phases

### Phase 1: Foundation (15-20 hours)

**Goal:** Basic file operations and workspace discovery

**Tasks:**
1. **Package Setup** (2 hours)
   - Create directory structure at `tooling/repo-utils/`
   - Create package.json following `tooling/cli/package.json` pattern
   - Add dependencies to root catalog (effect, @effect/platform, glob)
   - Create tsconfig.json, vitest.config.ts, docgen.json
   - Verify all scripts work (build, check, test, docgen)

2. **Error Types** (1 hour)
   - `src/errors/NoSuchFileError.ts`
   - `src/errors/DomainError.ts`
   - `src/errors/index.ts` with @since tags

3. **PackageJson Schema** (3 hours)
   - `src/schemas/PackageJson.ts`
   - Use `Schema.Struct` with proper field types
   - Support all common package.json fields
   - Write validation tests

4. **Root Discovery** (2 hours)
   - `src/Root.ts`
   - `findRepoRoot` function walks upward looking for .git or bun.lock
   - Returns Effect with NoSuchFileError on failure
   - Write tests with mock directory structures

5. **FsUtils Core** (8 hours)
   - `src/FsUtils.ts`
   - Service definition with Context.GenericTag
   - Layer implementation providing all operations
   - Functions: glob, globFiles, readJson, writeJson, modifyFile, existsOrThrow, isDirectory, isFile, getParentDirectory
   - Comprehensive tests with temp directories

6. **Workspace Resolution** (4 hours)
   - `src/Workspaces.ts`
   - `resolveWorkspaceDirs` expands workspace globs from root package.json
   - `getWorkspaceDir` looks up single workspace
   - Returns `HashMap<PackageName, Directory>`
   - Write tests with mock monorepo

**Completion Criteria:**
- All Phase 1 tests passing
- Package builds successfully
- FsUtils, Root, Workspaces all working
- Can discover workspaces in real monorepo

---

### Phase 2: Dependency Analysis (10-12 hours)

**Goal:** Extract and index dependencies across monorepo

**Tasks:**
1. **WorkspaceDeps Schema** (2 hours)
   - `src/schemas/WorkspaceDeps.ts`
   - Schema for typed dependency sets (workspace vs npm)
   - TypedDependencies schema with all dep types

2. **Dependency Extraction** (4 hours)
   - `src/Dependencies.ts`
   - `extractWorkspaceDependencies` reads package.json and classifies deps
   - Distinguish workspace deps (e.g., @beep/*) from npm deps
   - Returns typed structure with HashSets
   - Write tests for classification logic

3. **Dependency Index** (4 hours)
   - `src/DependencyIndex.ts`
   - `buildRepoDependencyIndex` builds HashMap for entire repo
   - Includes root as "@beep/root"
   - Returns HashMap<PackageName, TypedDependencies>
   - Test with mock monorepo

4. **Unique NPM Dependencies** (2 hours)
   - `src/UniqueDeps.ts`
   - `collectUniqueNpmDependencies` unions all NPM deps
   - Returns sorted arrays of unique dependencies
   - Test deduplication and sorting

**Completion Criteria:**
- Can extract dependencies from any package.json
- Full repo dependency index builds successfully
- Unique NPM deps collected correctly
- All Phase 2 tests passing

---

### Phase 3: Advanced Analysis (12-16 hours)

**Goal:** Graph algorithms and TypeScript configuration discovery

**Tasks:**
1. **Graph Algorithms** (10 hours)
   - `src/Graph.ts`
   - `topologicalSort` - Kahn's algorithm for build order
   - `detectCycles` - DFS-based cycle detection
   - `computeTransitiveClosure` - Deep dependency analysis
   - Error type: `CyclicDependencyError`
   - Extensive tests:
     - DAG sorting works
     - Cycle detection finds all cycles
     - Transitive closure computes correctly
     - Edge cases (empty graph, single node, disconnected)

2. **TsConfig Discovery** (3 hours)
   - `src/TsConfig.ts`
   - `collectTsConfigPaths` finds all tsconfig files
   - Checks root (tsconfig.json, tsconfig.build.json, tsconfig.base.jsonc)
   - Checks workspaces (tsconfig.json, tsconfig.build.json, tsconfig.test.json, tsconfig.src.json)
   - Returns HashMap<PackageName, string[]>
   - Test with mock configs

**Completion Criteria:**
- Topological sort produces correct build order
- Cycle detection finds all cycles
- TsConfig discovery finds all configs
- All Phase 3 tests passing

---

### Phase 4: Polish (5-8 hours, Optional)

**Goal:** Additional utilities and convenience

**Tasks:**
1. **Additional FsUtils** (3 hours)
   - `rmAndCopy`, `copyIfExists`, `rmAndMkdir`
   - `mkdirCached` (with caching to prevent repeated ops)
   - `modifyGlob` (apply transform to multiple files)

2. **Convenience Service** (2 hours)
   - `src/RepoUtils.ts`
   - Service combining common operations
   - Cached REPOSITORY_ROOT and workspace map
   - Easy one-stop access

3. **Additional Schemas** (2 hours)
   - TsConfigJson schema
   - DotEnv schema

---

## Step-by-Step Workflow

### Step 1: Package Setup

```bash
# From repository root
cd /home/elpresidank/YeeBois/projects/beep-effect2

# Create package directory
mkdir -p tooling/repo-utils/{src,test,dtslint,src/errors,src/schemas,test/fixtures}

# Create package.json
# Use tooling/cli/package.json as reference
# Update name, description, and dependencies
```

**Key Package.json Fields:**
```json
{
  "name": "@beep/repo-utils",
  "version": "0.0.0",
  "description": "Effect-based monorepo utilities for repository analysis and workspace management",
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

**Add to Root Catalog** (if not already present):
```json
{
  "catalog": {
    "@effect/platform": "^4.0.0-beta.5",
    "glob": "^13.0.0"
  }
}
```

### Step 2: Create Core Files

Create these files in order:

1. **src/errors/NoSuchFileError.ts**
2. **src/errors/DomainError.ts**
3. **src/errors/index.ts** (export both with @since tags)
4. **src/schemas/PackageJson.ts**
5. **src/schemas/index.ts** (export with @since tags)
6. **src/Root.ts**
7. **src/FsUtils.ts**
8. **src/Workspaces.ts**
9. **src/index.ts** (export all modules with @since tags)

### Step 3: Write Tests

Create tests for each module in `test/`:
- `test/errors/` - Error type tests
- `test/schemas/PackageJson.test.ts` - Schema validation
- `test/Root.test.ts` - Root discovery
- `test/FsUtils.test.ts` - Filesystem operations
- `test/Workspaces.test.ts` - Workspace resolution

**Test Fixture Structure:**
```
test/fixtures/mock-monorepo/
├── package.json         # Root with workspaces: ["packages/*"]
├── bun.lock             # Marker file
└── packages/
    ├── a/
    │   └── package.json # { "name": "@beep/a", "dependencies": { "@beep/b": "*" } }
    └── b/
        └── package.json # { "name": "@beep/b" }
```

### Step 4: Verify Everything Works

```bash
cd tooling/repo-utils

# Type check
bun run check

# Build
bun run build

# Run tests
bun test

# Generate docs
bun run docgen

# Lint
cd ../.. && bun run lint tooling/repo-utils
```

### Step 5: Continue Through Phases

- Complete Phase 1 fully before starting Phase 2
- Test thoroughly after each module
- Update documentation as you go
- Use real monorepo for integration testing

---

## Critical Implementation Details

### FsUtils Service

**Glob Implementation:**
```typescript
glob: (pattern, options) =>
  Effect.gen(function* () {
    const { glob: globFn } = yield* Effect.promise(() => import("glob"))
    const matches = yield* Effect.tryPromise({
      try: () => globFn(pattern, { ...options, absolute: true }),
      catch: (error) =>
        new DomainError({
          message: `Failed to glob pattern: ${pattern}`,
          cause: error
        })
    })
    return matches
  })
```

**ReadJson Implementation:**
```typescript
readJson: (filePath) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const content = yield* fs.readFileString(filePath)
    const parsed = yield* Effect.try({
      try: () => JSON.parse(content),
      catch: (error) =>
        new DomainError({
          message: `Failed to parse JSON: ${filePath}`,
          cause: error
        })
    })
    return parsed
  })
```

**ModifyFile Implementation:**
```typescript
modifyFile: (filePath, transform) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    // Read current content
    const oldContent = yield* fs.readFileString(filePath)

    // Apply transform
    const newContent = transform(oldContent)

    // Only write if changed (optimization)
    if (oldContent !== newContent) {
      yield* fs.writeFileString(filePath, newContent)
    }
  })
```

### Root Discovery

```typescript
export const findRepoRoot = (startPath?: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const path = yield* Path.Path

    let current = startPath ?? process.cwd()

    while (true) {
      // Check for markers
      const gitPath = path.join(current, ".git")
      const lockPath = path.join(current, "bun.lock")

      const hasGit = yield* fs.exists(gitPath)
      const hasLock = yield* fs.exists(lockPath)

      if (hasGit || hasLock) {
        return current
      }

      // Move to parent
      const parent = path.dirname(current)
      if (parent === current) {
        // Reached root
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

### Workspace Resolution

```typescript
export const resolveWorkspaceDirs = Effect.gen(function* () {
  const fs = yield* FsUtils
  const root = yield* findRepoRoot()

  // Read root package.json
  const rootPkgJsonPath = `${root}/package.json`
  const rootPkgJson = yield* fs.readJson(rootPkgJsonPath)
  const rootPkg = yield* Schema.decode(PackageJson)(rootPkgJson)

  if (!rootPkg.workspaces || rootPkg.workspaces.length === 0) {
    return HashMap.empty<string, string>()
  }

  // Expand workspace globs
  let workspaceMap = HashMap.empty<string, string>()

  for (const pattern of rootPkg.workspaces) {
    const searchPattern = `${root}/${pattern}/package.json`
    const matches = yield* fs.glob(searchPattern)

    for (const pkgJsonPath of matches) {
      // Skip node_modules, dist, etc.
      if (
        pkgJsonPath.includes("/node_modules/") ||
        pkgJsonPath.includes("/dist/") ||
        pkgJsonPath.includes("/.turbo/")
      ) {
        continue
      }

      const pkgJson = yield* fs.readJson(pkgJsonPath)
      const pkg = yield* Schema.decode(PackageJson)(pkgJson)

      const dir = yield* fs.getParentDirectory(pkgJsonPath)
      workspaceMap = HashMap.set(workspaceMap, pkg.name, dir)
    }
  }

  return workspaceMap
})
```

### Topological Sort

```typescript
export const topologicalSort = <K extends string>(
  adjacencyList: HashMap.HashMap<K, HashSet.HashSet<K>>
): Effect.Effect<K[], CyclicDependencyError> =>
  Effect.gen(function* () {
    // Build in-degree map
    const inDegree = new Map<K, number>()

    // Initialize all nodes with in-degree 0
    for (const [node] of HashMap.toIterable(adjacencyList)) {
      inDegree.set(node, 0)
    }

    // Count incoming edges
    for (const [_node, deps] of HashMap.toIterable(adjacencyList)) {
      for (const dep of HashSet.toIterable(deps)) {
        inDegree.set(dep, (inDegree.get(dep) ?? 0) + 1)
      }
    }

    // Queue nodes with no incoming edges
    const queue: K[] = []
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(node)
      }
    }

    // Process queue
    const sorted: K[] = []

    while (queue.length > 0) {
      const node = queue.shift()!
      sorted.push(node)

      // Reduce in-degree for dependencies
      const deps = HashMap.get(adjacencyList, node)
      if (Option.isSome(deps)) {
        for (const dep of HashSet.toIterable(deps.value)) {
          const newDegree = inDegree.get(dep)! - 1
          inDegree.set(dep, newDegree)
          if (newDegree === 0) {
            queue.push(dep)
          }
        }
      }
    }

    // Check if all nodes were processed
    if (sorted.length !== HashMap.size(adjacencyList)) {
      // Cycles detected
      const cycles = yield* detectCycles(adjacencyList)
      return yield* Effect.fail(
        new CyclicDependencyError({
          message: "Cyclic dependencies detected",
          cycles
        })
      )
    }

    return sorted
  })
```

---

## Testing Guidelines

### Test Setup

```typescript
import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import { FsUtils, FsUtilsLive } from "../src/FsUtils.js"

describe("FsUtils", () => {
  it.effect("should read and write JSON", () =>
    Effect.gen(function* () {
      const fs = yield* FsUtils

      const testPath = "/tmp/test.json"
      const testData = { foo: "bar" }

      yield* fs.writeJson(testPath, testData)
      const result = yield* fs.readJson(testPath)

      expect(result).toEqual(testData)
    }).pipe(Effect.provide(FsUtilsLive))
  )
})
```

### Test Fixtures

Create mock monorepo in `test/fixtures/mock-monorepo/`:

**package.json:**
```json
{
  "name": "@beep/root",
  "version": "0.0.0",
  "workspaces": ["packages/*", "tooling/*"]
}
```

**packages/a/package.json:**
```json
{
  "name": "@beep/a",
  "version": "0.0.0",
  "dependencies": {
    "@beep/b": "workspace:*",
    "effect": "^4.0.0-beta.5"
  }
}
```

**packages/b/package.json:**
```json
{
  "name": "@beep/b",
  "version": "0.0.0",
  "dependencies": {
    "effect": "^4.0.0-beta.5"
  }
}
```

### Integration Tests

Test with real monorepo:
```typescript
it.effect("should resolve actual workspaces", () =>
  Effect.gen(function* () {
    const workspaces = yield* resolveWorkspaceDirs

    // Should find tooling/cli, tooling/repo-utils, etc.
    expect(HashMap.has(workspaces, "@beep/repo-cli")).toBe(true)
    expect(HashMap.has(workspaces, "@beep/repo-utils")).toBe(true)
  })
)
```

---

## Documentation Standards

### Module Documentation

```typescript
/**
 * Filesystem utilities for Effect-based file operations.
 *
 * ## Mental model
 *
 * - **All operations return Effect** - Enables composition and error handling
 * - **Platform-agnostic** - Uses @effect/platform abstractions
 * - **Observable** - All operations instrumented with spans
 *
 * ## Common tasks
 *
 * - **Match files**: {@link FsUtils.glob}
 * - **Read JSON**: {@link FsUtils.readJson}
 * - **Write JSON**: {@link FsUtils.writeJson}
 * - **Transform files**: {@link FsUtils.modifyFile}
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

```typescript
/**
 * Match files against a glob pattern.
 *
 * Returns absolute paths to all matching files and directories.
 * Use {@link globFiles} to match only files.
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
 *   console.log(`Found ${files.length} TypeScript files`)
 * })
 * ```
 */
glob: (pattern: string, options?: GlobOptions) => Effect.Effect<string[], DomainError>
```

---

## Common Pitfalls to Avoid

### ❌ DON'T: Import from vitest
```typescript
import { describe, it } from "vitest" // ❌ Wrong!
```

### ✅ DO: Import from @effect/vitest
```typescript
import { describe, it, expect } from "@effect/vitest" // ✅ Correct!
```

---

### ❌ DON'T: Use Promise-based APIs directly
```typescript
const files = await glob(pattern) // ❌ Not Effect-based!
```

### ✅ DO: Wrap with Effect
```typescript
const files = yield* Effect.promise(() => glob(pattern)) // ✅ Effect-based!
```

---

### ❌ DON'T: Forget @since tags
```typescript
export * from "./FsUtils.js" // ❌ docgen will fail!
```

### ✅ DO: Add @since tags to all exports
```typescript
/**
 * @since 0.0.0
 */
export * from "./FsUtils.js" // ✅ docgen works!
```

---

### ❌ DON'T: Use old Schema.struct
```typescript
const MySchema = Schema.struct({ field: Schema.string }) // ❌ Effect v3 API!
```

### ✅ DO: Use Schema.Struct
```typescript
const MySchema = Schema.Struct({ field: Schema.String }) // ✅ Effect v4 API!
```

---

### ❌ DON'T: Direct filesystem access
```typescript
const content = fs.readFileSync(path, "utf-8") // ❌ Not testable!
```

### ✅ DO: Use @effect/platform
```typescript
const content = yield* fs.readFileString(path) // ✅ Platform-agnostic!
```

---

## Success Checklist

**Before considering Phase 1 complete:**
- [ ] Package builds without errors (`bun run build`)
- [ ] Type checking passes (`bun run check`)
- [ ] All tests pass (`bun test`)
- [ ] Documentation generates (`bun run docgen`)
- [ ] Linting passes (`bun run lint tooling/repo-utils`)
- [ ] Can discover repository root
- [ ] Can resolve all workspaces
- [ ] Can read/write JSON files
- [ ] Can glob files with patterns

**Before considering Phase 2 complete:**
- [ ] Can extract dependencies from package.json
- [ ] Dependencies classified correctly (workspace vs npm)
- [ ] Full repository dependency index builds
- [ ] Unique NPM dependencies collected
- [ ] All Phase 2 tests passing

**Before considering Phase 3 complete:**
- [ ] Topological sort produces correct build order
- [ ] Cycle detection finds all cycles
- [ ] Transitive closure computes correctly
- [ ] TsConfig files discovered
- [ ] All Phase 3 tests passing

**Before considering package complete:**
- [ ] All phases implemented and tested
- [ ] 80%+ test coverage
- [ ] API documentation complete
- [ ] README.md written
- [ ] Successfully used by @beep/repo-cli
- [ ] All scripts passing

---

## Questions to Ask if Stuck

1. **"How does effect-smol implement similar functionality?"**
   - Look at `.repos/effect-smol/packages/effect/` for patterns

2. **"What does the test error actually mean?"**
   - Read the error message carefully
   - Check if you're using correct Effect v4 APIs
   - Verify @effect/vitest is imported correctly

3. **"Why is docgen failing?"**
   - Check if all exports have @since tags
   - Verify JSDoc syntax is correct
   - Look for missing documentation

4. **"Why won't it build?"**
   - Check tsconfig.json extends base correctly
   - Verify all imports use .js extensions
   - Check for missing dependencies in package.json

5. **"Why are tests failing?"**
   - Check if using it.effect from @effect/vitest
   - Verify Effect.provide is used correctly
   - Check test fixtures are set up properly

---

## Getting Help

If you get stuck or need clarification:

1. **Re-read the documentation** - Implementation plan, inventory, and this handoff doc
2. **Check effect-smol** - See how similar functionality is implemented
3. **Review @beep/repo-cli** - See how a complete package is structured
4. **Test incrementally** - Don't implement everything before testing
5. **Ask specific questions** - Include error messages, code snippets, and what you've tried

---

## Final Notes

This is a **foundational package** that other tooling will depend on. Take your time to:
- Write clean, well-documented code
- Test thoroughly
- Follow Effect v4 patterns correctly
- Document as you go (not at the end)

The quality of this package directly impacts the quality of all tooling built on top of it.

**Good luck! 🚀**

---

## Appendix: Quick Reference

### Effect v4 APIs

```typescript
// Context & Services
import * as Context from "effect/Context"
import * as Layer from "effect/Layer"

// Effects
import * as Effect from "effect/Effect"

// Data structures
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as Option from "effect/Option"

// Schemas
import * as Schema from "effect/Schema"

// Errors
import * as Data from "effect/Data"

// Platform
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
```

### Common Effect Patterns

**Accessing service:**
```typescript
const fs = yield* FsUtils
```

**Failing with error:**
```typescript
return yield* Effect.fail(new MyError({ message: "..." }))
```

**Try/catch:**
```typescript
yield* Effect.try({
  try: () => operation(),
  catch: (error) => new MyError({ cause: error })
})
```

**Promise to Effect:**
```typescript
yield* Effect.promise(() => asyncOperation())
```

**Conditional Effect:**
```typescript
if (condition) {
  yield* doSomething
} else {
  yield* doSomethingElse
}
```

### Testing Patterns

**Basic test:**
```typescript
it.effect("description", () =>
  Effect.gen(function* () {
    // test implementation
  }).pipe(Effect.provide(RequiredLayers))
)
```

**With service:**
```typescript
it.effect("description", () =>
  Effect.gen(function* () {
    const service = yield* MyService
    const result = yield* service.operation()
    expect(result).toBe(expected)
  }).pipe(Effect.provide(MyServiceLive))
)
```
