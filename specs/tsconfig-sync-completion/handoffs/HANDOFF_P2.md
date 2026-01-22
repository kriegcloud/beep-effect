# Phase 2 Handoff: Handler Refactoring

**From**: P1 (Package.json Sync)
**To**: P2 (Handler Refactoring)
**Date**: 2026-01-22

---

## Executive Summary

After P0 fixes Next.js transitive deps and P1 adds package.json sync, the handler will be even larger (~900+ LOC). P2 refactors into modular, testable functions. The goal is handler < 300 LOC with extracted functions for each concern.

---

## Pre-requisites

- **P0 complete**: Next.js apps build successfully
- **P1 complete**: package.json sync working
- All tests passing
- `--check` mode validates tsconfig AND package.json

**Verification**:
```bash
bun run build --filter @beep/web
bun run build --filter @beep/todox
bun run repo-cli tsconfig-sync --check
bun run test --filter @beep/repo-cli
```

---

## Current Handler Structure (Post-P0 and P1)

```
tsconfigSyncHandler (~900 LOC)
├── 202-354: processNextJsApps (P0: now with transitive closure)
├── 369-404: Workspace discovery
├── 405-430: Cycle detection
├── 435-450: Package filtering
├── 458-520: Transitive closure computation
├── 523-600: Package.json sync (NEW from P1)
├── 560-640: Reference path normalization
├── 654-738: tsconfig sync (build/src/test)
└── 741-800: Next.js app processing (calls processNextJsApps with adjacencyList)
```

**Note**: P0 changes added transitive closure logic to `processNextJsApps`, so this function should be extracted as a separate module `app-sync.ts` in addition to the other modules.

---

## Extraction Plan

### Module 1: `discover.ts`

Extract workspace discovery logic.

```typescript
// tooling/cli/src/commands/tsconfig-sync/discover.ts

export interface WorkspaceContext {
  readonly packages: readonly string[];
  readonly adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>;
  readonly tsconfigPaths: HashMap.HashMap<string, readonly string[]>;
  readonly pkgDirMap: HashMap.HashMap<string, string>;
  readonly repoRoot: string;
}

/**
 * Discover all workspace packages and build dependency graph.
 */
export const discoverWorkspace: Effect.Effect<
  WorkspaceContext,
  TsconfigSyncError,
  FsUtils
>;

/**
 * Detect circular dependencies in the workspace.
 * Returns cycles if found, empty array if none.
 */
export const detectCycles: (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
) => Effect.Effect<readonly string[][], never>;
```

**Lines to extract**: 369-430

### Module 2: `references.ts`

Extract reference computation logic.

```typescript
// tooling/cli/src/commands/tsconfig-sync/references.ts

/**
 * Compute tsconfig references for a single package.
 * Returns root-relative paths to dependency tsconfig.build.json files.
 */
export const computePackageReferences: (
  pkg: string,
  deps: DependencySet,
  transitiveClosure: HashSet.HashSet<string>,
  context: WorkspaceContext
) => Effect.Effect<readonly string[], TsconfigSyncError>;

/**
 * Normalize existing reference paths to root-relative format.
 * Converts package-relative refs like ../types/tsconfig.build.json
 * to root-relative ../../../packages/common/types/tsconfig.build.json
 */
export const normalizeReferencePaths: (
  existingRefs: readonly string[],
  pkgDir: string,
  context: WorkspaceContext
) => readonly string[];

/**
 * Merge computed refs with preserved existing refs.
 * Handles type-only imports that aren't in package.json.
 */
export const mergeReferences: (
  computed: readonly string[],
  existing: readonly string[],
  options: { preserveManual: boolean }
) => readonly string[];
```

**Lines to extract**: 462-640

### Module 3: `package-sync.ts`

Extract package.json synchronization (from P1).

```typescript
// tooling/cli/src/commands/tsconfig-sync/package-sync.ts

export interface PackageJsonSyncResult {
  readonly changed: boolean;
  readonly depsReordered: number;
  readonly devDepsReordered: number;
  readonly peerDepsReordered: number;
}

/**
 * Sync package.json dependencies for a single package.
 * Handles check, dry-run, and sync modes.
 */
export const syncPackageJson: (
  pkg: string,
  pkgDir: string,
  deps: DependencySet,
  transitiveClosure: HashSet.HashSet<string>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>,
  mode: SyncMode,
  options: { verbose: boolean; noHoist: boolean }
) => Effect.Effect<PackageJsonSyncResult, TsconfigSyncError | DriftDetectedError, FileSystem.FileSystem>;
```

**Lines to extract**: P1 additions (~523-600)

### Module 4: `tsconfig-sync.ts`

Extract tsconfig file synchronization.

```typescript
// tooling/cli/src/commands/tsconfig-sync/tsconfig-sync.ts

export interface TsconfigSyncResult {
  readonly buildUpdated: boolean;
  readonly srcUpdated: boolean;
  readonly testUpdated: boolean;
}

/**
 * Sync tsconfig files (build, src, test) for a single package.
 */
export const syncPackageTsconfigs: (
  pkg: string,
  pkgDir: string,
  references: readonly string[],
  mode: SyncMode,
  options: { verbose: boolean }
) => Effect.Effect<TsconfigSyncResult, TsconfigSyncError | DriftDetectedError, FileSystem.FileSystem>;
```

**Lines to extract**: 654-738

---

## Refactored Handler Structure

```typescript
// handler.ts (~250 LOC)

export const tsconfigSyncHandler = (input: TsconfigSyncInput) =>
  Effect.gen(function* () {
    // 1. Discover workspace (~5 lines)
    const context = yield* discoverWorkspace;

    // 2. Detect cycles (~10 lines)
    const cycles = yield* detectCycles(context.adjacencyList);
    if (cycles.length > 0) {
      yield* Effect.fail(new CyclicDependencyError({ cycles }));
    }

    // 3. Filter packages (~10 lines)
    const packagesToProcess = filterPackages(context.packages, input);

    // 4. Process each package (~50 lines)
    for (const pkg of packagesToProcess) {
      // 4a. Compute transitive closure
      const transitiveClosure = input.noHoist
        ? HashSet.empty<string>()
        : yield* computeTransitiveClosure(pkg, context.adjacencyList);

      // 4b. Sync package.json
      yield* syncPackageJson(pkg, pkgDir, deps, transitiveClosure, context, mode, options);

      // 4c. Compute references
      const refs = yield* computePackageReferences(pkg, deps, transitiveClosure, context);

      // 4d. Sync tsconfig files
      yield* syncPackageTsconfigs(pkg, pkgDir, refs, mode, options);
    }

    // 5. Process Next.js apps (~20 lines)
    if (!input.packagesOnly) {
      yield* processNextJsApps(context, mode, options);
    }

    // 6. Report results (~10 lines)
    yield* reportResults(results, mode);
  });
```

---

## Migration Strategy

1. **Extract one module at a time** - Don't do all at once
2. **Keep handler working** - Run tests after each extraction
3. **Maintain exact behavior** - No logic changes, just reorganization
4. **Update imports** - Handler imports from new modules

### Extraction Order

1. `discover.ts` - Standalone, no deps on other extractions
2. `references.ts` - Depends on discover types
3. `package-sync.ts` - Uses existing utilities
4. `tsconfig-sync.ts` - Uses references output

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Handler < 300 LOC | `wc -l handler.ts` |
| All functions exported | Each extracted module exports its functions |
| Types defined | WorkspaceContext, SyncResult types in types.ts |
| No behavior changes | `bun run repo-cli tsconfig-sync --check` passes |
| All tests pass | `bun run test --filter @beep/repo-cli` |
| Lint passes | `bun run lint --filter @beep/repo-cli` |

---

## Files to Create

| File | Purpose |
|------|---------|
| `tsconfig-sync/discover.ts` | Workspace discovery |
| `tsconfig-sync/references.ts` | Reference computation |
| `tsconfig-sync/package-sync.ts` | package.json sync |
| `tsconfig-sync/tsconfig-sync.ts` | tsconfig file sync |
| `tsconfig-sync/types.ts` | Shared types |

---

## Gotchas

1. **Shared state**: `adjacencyList`, `tsconfigPaths` used across functions - pass via context
2. **Effect dependencies**: Ensure FileSystem service available in all extracted functions
3. **Import cycles**: types.ts should have no imports from other tsconfig-sync modules
4. **Error handling**: Preserve existing error types and behaviors
