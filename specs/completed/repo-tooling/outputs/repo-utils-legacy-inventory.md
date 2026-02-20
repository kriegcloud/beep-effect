# Legacy Utils Package Inventory

**Date:** 2026-02-19
**Status:** ✅ Analysis Complete
**Purpose:** Document most useful utilities from legacy `@beep/tooling-utils` for Effect v4 reimplementation

---

## Executive Summary

The legacy utils package provides **industrial-grade monorepo tooling** with:
- Effect-based filesystem operations with observability
- Sophisticated dependency graph analysis (topological sort, cycle detection)
- Type-safe workspace and package.json discovery
- Comprehensive build automation primitives

**Total Utilities Analyzed:** 30+ functions across 8 modules
**Recommended for Migration:** 20 high-value utilities
**New Dependencies Required:** @effect/platform, Effect v4 APIs

---

## High-Priority Utilities (Tier 1)

### 1. Filesystem Operations (FsUtils)

**Module:** `src/FsUtils.ts`
**Purpose:** Effect-first filesystem operations with span instrumentation

| Function             | Signature                                        | Use Case                                          |
|----------------------|--------------------------------------------------|---------------------------------------------------|
| `glob`               | `(pattern, options?) => Effect<string[]>`        | Match files/directories against glob patterns     |
| `globFiles`          | `(pattern, options?) => Effect<string[]>`        | Like glob but ensures only files (no directories) |
| `modifyFile`         | `(path, transform) => Effect<void>`              | Read file, apply transform, write only if changed |
| `modifyGlob`         | `(pattern, transform, options?) => Effect<void>` | Apply transform to all matching files             |
| `readJson`           | `(path) => Effect<unknown>`                      | Parse JSON file with error handling               |
| `writeJson`          | `(path, json) => Effect<void>`                   | Write JSON with stable 2-space formatting         |
| `copyIfExists`       | `(from, to) => Effect<void>`                     | Copy if source exists, no-op otherwise            |
| `rmAndCopy`          | `(from, to) => Effect<void>`                     | Delete destination and copy source recursively    |
| `existsOrThrow`      | `(path) => Effect<void>`                         | Verify path exists or fail with error             |
| `isDirectory`        | `(path) => Effect<boolean>`                      | Check if path is a directory                      |
| `isFile`             | `(path) => Effect<boolean>`                      | Check if path is a file                           |
| `getParentDirectory` | `(path) => Effect<string>`                       | Get parent directory with existence check         |

**Value:** Core primitives for all file-based automation
**Dependencies:** FileSystem, Path from @effect/platform
**Complexity:** Medium (wrapping platform APIs with span instrumentation)

---

### 2. Repository Root Discovery

**Module:** `src/repo/Root.ts`
**Purpose:** Locate monorepo root by walking upward until marker found

| Function       | Signature                        | Use Case                                     |
|----------------|----------------------------------|----------------------------------------------|
| `findRepoRoot` | `(startPath?) => Effect<string>` | Walk upward until `.git` or `bun.lock` found |

**Algorithm:**
1. Start from CWD or provided path
2. Check for `.git` or `bun.lock` in current directory
3. If not found, move to parent directory
4. Repeat until found or reach filesystem root
5. Return absolute path or `NoSuchFileError`

**Value:** Essential for all repo-aware tooling
**Dependencies:** FsUtils
**Complexity:** Low

---

### 3. Workspace Resolution

**Module:** `src/repo/Workspaces.ts`
**Purpose:** Expand workspace glob patterns from root package.json

| Function               | Signature                                       | Use Case                                   |
|------------------------|-------------------------------------------------|--------------------------------------------|
| `resolveWorkspaceDirs` | `() => Effect<HashMap<PackageName, Directory>>` | Expand workspaces globs to HashMap         |
| `getWorkspaceDir`      | `(workspace) => Effect<string>`                 | Look up single workspace directory by name |

**Algorithm:**
1. Read root package.json
2. Extract `workspaces` array (e.g., `["packages/*", "tooling/*"]`)
3. Expand globs using filesystem glob matching
4. For each directory, read package.json and extract name
5. Return HashMap<packageName, absoluteDirectory>
6. Ignores: node_modules, dist, build, .turbo, .tsbuildinfo

**Value:** Foundation for multi-package operations
**Dependencies:** FsUtils, PackageJson schema
**Complexity:** Medium

---

### 4. Package.json Schema

**Module:** `src/schemas/PackageJson.ts`
**Purpose:** Type-safe package.json parsing with validation

**Schema Fields:**
```typescript
{
  name: string              // Required
  version?: string
  description?: string
  keywords?: string[]
  license?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  bin?: Record<string, string> | string
  exports?: unknown
  files?: string[]
  engines?: Record<string, string>
  workspaces?: string[]
  author?: string | { name: string, email?: string }
  repository?: string | { type: string, url: string, directory?: string }
  bugs?: string | { url: string, email?: string }
  funding?: unknown
  // ... allows additional unknown properties
}
```

**Static Methods:**
- `PackageJson.decode(unknown)` - Decode with validation
- `PackageJson.decodeUnknown(unknown)` - Decode or throw

**Value:** Prevents runtime errors from malformed package.json
**Dependencies:** @effect/schema (v4: Schema.Struct)
**Complexity:** Low (schema definition)

---

### 5. Dependency Extraction

**Module:** `src/repo/Dependencies.ts`
**Purpose:** Extract and classify dependencies from package.json

| Function                       | Signature                            | Use Case                                     |
|--------------------------------|--------------------------------------|----------------------------------------------|
| `extractWorkspaceDependencies` | `(pkgJsonPath) => Effect<TypedDeps>` | Extract all dependencies, classified by type |

**Returns:**
```typescript
{
  dependencies: {
    workspace: HashSet<string>,  // e.g., "@beep/shared-domain"
    npm: HashSet<string>          // e.g., "effect", "lodash"
  },
  devDependencies: {
    workspace: HashSet<string>,
    npm: HashSet<string>
  },
  peerDependencies: {
    workspace: HashSet<string>,
    npm: HashSet<string>
  }
}
```

**Classification Logic:**
- Workspace deps: Package name starts with `@beep/` or matches workspace pattern
- NPM deps: All other dependencies

**Value:** Enables workspace-aware dependency analysis
**Dependencies:** FsUtils, PackageJson schema
**Complexity:** Medium

---

### 6. Repository Dependency Index

**Module:** `src/repo/DependencyIndex.ts`
**Purpose:** Build complete dependency map for entire monorepo

| Function                   | Signature                                    | Use Case                              |
|----------------------------|----------------------------------------------|---------------------------------------|
| `buildRepoDependencyIndex` | `() => Effect<HashMap<PackageName, DepMap>>` | Build index for all workspaces + root |

**Output Structure:**
```typescript
HashMap {
  "@beep/root" => { dependencies, devDependencies, peerDependencies },
  "@beep/shared-domain" => { dependencies, devDependencies, peerDependencies },
  "@beep/iam-domain" => { dependencies, devDependencies, peerDependencies },
  // ... for all workspaces
}
```

**Value:** Single source of truth for dependency analysis
**Dependencies:** resolveWorkspaceDirs, extractWorkspaceDependencies
**Complexity:** Medium

---

### 7. Graph Analysis (Critical)

**Module:** `src/repo/Graph.ts`
**Purpose:** Sophisticated dependency graph algorithms

| Function                   | Signature                                         | Use Case                       |
|----------------------------|---------------------------------------------------|--------------------------------|
| `topologicalSort`          | `(adjacencyList) => Effect<PackageName[]>`        | Kahn's algorithm - build order |
| `detectCycles`             | `(adjacencyList) => Effect<CyclePath[]>`          | DFS cycle detection            |
| `computeTransitiveClosure` | `(adjacencyList, pkg) => Effect<HashSet<string>>` | Deep dependency analysis       |

**Topological Sort:**
- Input: `HashMap<package, HashSet<dependencies>>`
- Output: `Array<package>` in dependency-first order
- Use: Determine correct build sequence
- Fails if cycles detected

**Cycle Detection:**
- Returns: `Array<[pkg1, pkg2, pkg3, pkg1]>` (cycle paths)
- Use: Pre-flight validation before builds

**Transitive Closure:**
- Input: Package name
- Output: All direct + indirect dependencies
- Use: Understand full dependency footprint, calculate build impact

**Value:** Essential for build orchestration and dependency management
**Dependencies:** HashMap utilities
**Complexity:** High (advanced algorithms)

---

### 8. Unique NPM Dependencies Collection

**Module:** `src/repo/UniqueDependencies.ts`
**Purpose:** Union all NPM dependencies across entire repo

| Function                       | Signature                     | Use Case                             |
|--------------------------------|-------------------------------|--------------------------------------|
| `collectUniqueNpmDependencies` | `() => Effect<UniqueNpmDeps>` | Gather all unique NPM deps from repo |

**Returns:**
```typescript
{
  dependencies: string[],      // All runtime NPM deps
  devDependencies: string[]    // All dev NPM deps
}
```

**Algorithm:**
1. Build dependency index for all workspaces
2. Extract NPM deps (not workspace deps) from each package
3. Union all sets, deduplicate
4. Return sorted arrays

**Value:** Dependency auditing, lockfile reconciliation, version management
**Dependencies:** buildRepoDependencyIndex
**Complexity:** Low

---

### 9. TypeScript Configuration Discovery

**Module:** `src/repo/TsConfigIndex.ts`
**Purpose:** Gather all tsconfig.json paths in monorepo

| Function               | Signature                                           | Use Case                |
|------------------------|-----------------------------------------------------|-------------------------|
| `collectTsConfigPaths` | `() => Effect<HashMap<PackageName, TsConfigPaths>>` | Find all tsconfig files |

**Discovers:**
- **Per workspace:** tsconfig.json, tsconfig.build.json, tsconfig.test.json, tsconfig.src.json
- **Root:** tsconfig.json, tsconfig.build.json, tsconfig.base.jsonc

**Returns:**
```typescript
HashMap {
  "@beep/root" => ["tsconfig.json", "tsconfig.base.jsonc"],
  "@beep/shared-domain" => ["tsconfig.json", "tsconfig.build.json"],
  // ... for all workspaces
}
```

**Value:** Monorepo-wide TypeScript configuration updates
**Dependencies:** resolveWorkspaceDirs, FsUtils
**Complexity:** Medium

---

## Medium-Priority Utilities (Tier 2)

### 10. Additional FsUtils Functions

| Function         | Use Case                                               |
|------------------|--------------------------------------------------------|
| `rmAndMkdir`     | Delete and recreate directory as empty                 |
| `mkdirCached`    | Create directory recursively with caching              |
| `copyGlobCached` | Copy glob matches with relative structure preservation |
| `dirHasFile`     | Check if directory contains specific filename          |

**Value:** Helpful for advanced build scripts
**Complexity:** Low-Medium

---

### 11. RepoUtils Service

**Module:** `src/RepoUtils.ts`
**Purpose:** High-level convenience service combining multiple utilities

**Exposes:**
- `REPOSITORY_ROOT: string` - Cached absolute path to root
- `RepoWorkspaceMap: HashMap<PackageName, Directory>` - Cached workspace map
- `getWorkspaceDir(workspace): Effect<string>` - Quick workspace lookup

**Layer:** `RepoUtilsLive` - Single composition point

**Value:** One-stop shop for common operations
**Dependencies:** All repo utilities
**Complexity:** Low (composition layer)

---

## Lower-Priority Utilities (Tier 3)

### 12. Additional Schemas

| Schema                  | Purpose                   |
|-------------------------|---------------------------|
| `RootPackageJson`       | Root package.json variant |
| `TsConfigJson`          | TypeScript configuration  |
| `DotEnv`                | .env file parsing         |
| `Json` / `JsonLiteral`  | JSON primitive schemas    |
| `WorkspaceDependencies` | Typed dependency sets     |

**Value:** Useful for specific use cases
**Complexity:** Low

### 13. Error Types

| Error                   | Purpose                         |
|-------------------------|---------------------------------|
| `NoSuchFileError`       | File not found (path, message)  |
| `DomainError`           | Generic domain error with cause |
| `CyclicDependencyError` | Dependency cycle detected       |

**Value:** Consistent error handling
**Complexity:** Low

---

## Implementation Complexity Analysis

| Utility                  | Lines of Code | Dependencies             | Complexity | Estimated Hours |
|--------------------------|---------------|--------------------------|------------|-----------------|
| FsUtils (core functions) | ~300          | @effect/platform         | Medium     | 8-12            |
| Root discovery           | ~50           | FsUtils                  | Low        | 2-3             |
| Workspace resolution     | ~100          | FsUtils, glob            | Medium     | 4-6             |
| PackageJson schema       | ~150          | Effect Schema            | Low        | 3-4             |
| Dependency extraction    | ~80           | FsUtils, schemas         | Medium     | 4-5             |
| Dependency index         | ~60           | Workspaces, Dependencies | Medium     | 3-4             |
| Graph algorithms         | ~200          | HashMap utilities        | High       | 8-12            |
| Unique deps collection   | ~40           | Dependency index         | Low        | 2-3             |
| TsConfig discovery       | ~80           | Workspaces, FsUtils      | Medium     | 3-4             |
| **Total**                | **~1,060**    | -                        | -          | **37-53 hours** |

---

## Migration Recommendations

### Phase 1: Foundation (Priority 1)
1. ✅ FsUtils core functions (glob, readJson, writeJson, modifyFile)
2. ✅ Root discovery
3. ✅ PackageJson schema
4. ✅ Workspace resolution

**Estimated:** 15-20 hours
**Enables:** Basic file operations and workspace discovery

### Phase 2: Dependency Analysis (Priority 2)
5. ✅ Dependency extraction
6. ✅ Dependency index
7. ✅ Unique NPM deps collection

**Estimated:** 10-12 hours
**Enables:** Dependency auditing and analysis

### Phase 3: Advanced Analysis (Priority 3)
8. ✅ Graph algorithms (topological sort, cycle detection, transitive closure)
9. ✅ TsConfig discovery

**Estimated:** 12-16 hours
**Enables:** Build orchestration and sophisticated dependency management

### Phase 4: Polish (Optional)
10. Additional FsUtils functions
11. RepoUtils convenience service
12. Additional schemas and error types

**Estimated:** 5-8 hours
**Enables:** Enhanced developer experience

---

## Effect v4 Migration Considerations

### Breaking Changes from Effect v3
1. **Schema API**: `Schema.struct` → `Schema.Struct`
2. **HashMap**: Import paths may differ
3. **Effect.gen**: Should work the same
4. **Layer composition**: Check v4 Layer API changes

### New Opportunities
1. **Better span instrumentation**: Effect v4 may have improved observability APIs
2. **Resource safety**: Ensure proper resource cleanup with new APIs
3. **Error channel types**: More precise error typing

### Dependencies to Validate
- `@effect/platform` v4 compatibility
- `@effect/platform-bun` v4 availability
- `glob` library ESM compatibility
- Effect v4 HashMap/HashSet APIs

---

## Testing Strategy

### Unit Tests (Per Module)
- FsUtils: Test each function with temp directories
- Root discovery: Test with various directory structures
- Workspace resolution: Test with mock monorepo
- Schemas: Test valid/invalid package.json structures
- Graph algorithms: Test with known graphs, cycles, DAGs

### Integration Tests
- Full dependency index build on real monorepo
- Topological sort on actual workspace dependencies
- TsConfig discovery on complete project structure

### Property Tests (Optional)
- Graph algorithms with random DAGs
- Cycle detection with random graphs
- Transitive closure correctness

---

## Documentation Requirements

### API Documentation
- JSDoc for all exported functions
- @since tags for docgen
- @example for complex functions
- Mental models in module-level docs

### Usage Examples
- Common patterns document
- CLI tool examples using utils
- Build script recipes
- Migration guide from legacy utils

---

## Success Criteria

**Package is ready when:**
- ✅ All Phase 1 utilities implemented and tested
- ✅ At least 80% test coverage
- ✅ API documentation complete with examples
- ✅ Successfully used by @beep/repo-cli
- ✅ No Effect v3 dependencies
- ✅ Passes all linting and type checking
- ✅ Documented migration guide from legacy utils

---

## References

- **Legacy Package:** `.repos/beep-effect/tooling/utils`
- **Effect v4 Docs:** https://effect.website
- **@effect/platform Docs:** https://effect.website/docs/platform
- **effect-smol Patterns:** `.repos/effect-smol/packages/effect`
