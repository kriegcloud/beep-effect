# Phase 0: Utility Improvements for tsconfig-sync

> Pre-requisite improvements to `@beep/tooling-utils` that will reduce Phase 1 implementation scope by ~40%.

**STATUS**: ✅ COMPLETE (2026-01-22)

---

## Executive Summary

Analysis of the current `@beep/tooling-utils` package reveals several gaps that, if addressed, would significantly simplify the `tsconfig-sync` command implementation. This document identifies 4 improvement areas with specific implementation tasks.

**Impact**: Implementing these utilities reduces P1 scope from ~8 new files to ~4 files, with most graph/sorting logic becoming simple utility calls.

**Results**:
- ✅ All utilities implemented and tested
- ✅ 41 tests passing
- ✅ Type checks passing
- ✅ `topo-sort` command still works with extracted utilities

---

## Improvement Areas

### 1. Schema Fixes & Enhancements

**Location**: `tooling/utils/src/schemas/WorkspaceDependencies.ts`

#### 1.1 Fix Duplicate Literal Bug

**Current** (line ~15):
```typescript
export const WorkspacePkgValue = S.Literal("workspace:^", "workspace:^"); // BUG: both args identical
```

**Required**:
```typescript
export const WorkspacePkgValue = S.Literal("workspace:^");
```

#### 1.2 Add `catalog:` Support

**Current**: Only `workspace:^` and `^x.y.z` are modeled. External packages using `catalog:` are not supported.

**Evidence**: `grep -r "catalog:" packages/*/package.json` shows widespread usage.

**Required additions**:
```typescript
// Catalog specifier for external packages managed by pnpm catalog
export const CatalogValue = S.Literal("catalog:");

// Union of all valid version specifiers
export const VersionSpecifier = S.Union(
  WorkspacePkgValue,   // "workspace:^"
  CatalogValue,        // "catalog:"
  NpmDepValue          // "^x.y.z"
);

// Branded type for sorted dependency records
export const SortedDependencies = S.Record({
  key: S.String,
  value: VersionSpecifier
}).pipe(S.brand("SortedDependencies"));
```

---

### 2. Graph Utilities Extraction

**Source**: `tooling/cli/src/commands/topo-sort.ts` (lines 79-210)

**Target**: `tooling/utils/src/repo/Graph.ts` (new file)

#### 2.1 Extract `topologicalSort`

The existing `topo-sort.ts` command contains a well-tested Kahn's algorithm implementation that should be extracted as a reusable utility.

**Current location**: Embedded in CLI command
**Proposed location**: `@beep/tooling-utils/repo/Graph`

```typescript
// tooling/utils/src/repo/Graph.ts
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";

export class CyclicDependencyError extends S.TaggedError<CyclicDependencyError>()(
  "CyclicDependencyError",
  {
    packages: S.Array(S.String),
    cycles: S.Array(S.Array(S.String)), // Enhanced: include cycle paths
  }
) {}

/**
 * Topologically sort packages using Kahn's algorithm.
 * Returns packages in dependency order (dependencies before dependents).
 */
export const topologicalSort: (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
) => Effect.Effect<Array<string>, CyclicDependencyError>;
```

#### 2.2 Add `computeTransitiveClosure`

**Purpose**: Given a dependency index, compute all transitive dependencies for a package.

```typescript
/**
 * Compute transitive closure of dependencies for a package.
 * Returns all direct and indirect dependencies.
 */
export const computeTransitiveClosure: (
  depIndex: HashMap.HashMap<string, RepoDepMapValue>,
  packageName: string
) => Effect.Effect<{
  workspace: HashSet.HashSet<string>;
  npm: HashSet.HashSet<string>;
}, CyclicDependencyError>;
```

#### 2.3 Add `detectCycles`

**Purpose**: Detect cycles in dependency graph and return the cycle paths.

```typescript
/**
 * Detect cycles in dependency graph.
 * Returns empty array if acyclic, otherwise returns cycle paths.
 */
export const detectCycles: (
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
) => Effect.Effect<Array<Array<string>>>;
```

---

### 3. Dependency Sorting Utilities

**Target**: `tooling/utils/src/repo/DepSorter.ts` (new file)

#### 3.1 `sortDependencies`

**Purpose**: Sort dependency records with workspace packages first (topological order), then external packages (alphabetical).

```typescript
// tooling/utils/src/repo/DepSorter.ts
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";

export interface SortedDeps {
  readonly workspace: Array<readonly [string, string]>; // Topological order
  readonly external: Array<readonly [string, string]>;  // Alphabetical order
}

/**
 * Sort dependencies with workspace packages in topological order
 * and external packages in alphabetical order.
 */
export const sortDependencies: (
  deps: Record<string, string>,
  depIndex: HashMap.HashMap<string, RepoDepMapValue>
) => Effect.Effect<SortedDeps, CyclicDependencyError>;

/**
 * Merge sorted deps back into a single Record preserving order.
 * Workspace packages first, then external.
 */
export const mergeSortedDeps: (
  sorted: SortedDeps
) => Record<string, string>;
```

#### 3.2 `enforceVersionSpecifiers`

**Purpose**: Ensure correct version specifiers are used.

```typescript
/**
 * Enforce version specifier conventions:
 * - @beep/* packages → "workspace:^"
 * - External packages → "catalog:" (or preserve existing)
 */
export const enforceVersionSpecifiers: (
  deps: Record<string, string>,
  workspacePackages: HashSet.HashSet<string>
) => Record<string, string>;
```

---

### 4. Path Utilities

**Target**: `tooling/utils/src/repo/Paths.ts` (new file)

#### 4.1 `buildRootRelativePath`

**Purpose**: Calculate root-relative paths for tsconfig references.

```typescript
// tooling/utils/src/repo/Paths.ts

/**
 * Build a root-relative reference path.
 *
 * @example
 * buildRootRelativePath(
 *   "packages/calendar/server/tsconfig.build.json",
 *   "packages/calendar/domain/tsconfig.build.json"
 * )
 * // Returns: "../../../packages/calendar/domain/tsconfig.build.json"
 */
export const buildRootRelativePath: (
  sourcePath: string,
  targetPath: string
) => string;

/**
 * Calculate depth from repo root (number of directory levels).
 */
export const calculateDepth: (path: string) => number;
```

---

## Implementation Order

| Priority | Task | Est. LOC | Dependencies | Status |
|----------|------|----------|--------------|--------|
| 1 | Fix WorkspacePkgValue bug | 1 | None | ✅ |
| 2 | Add CatalogValue schema | 10 | None | ✅ |
| 3 | Extract topologicalSort | 80 | None | ✅ |
| 4 | Add computeTransitiveClosure | 50 | topologicalSort | ✅ |
| 5 | Add detectCycles | 40 | None | ✅ |
| 6 | Add sortDependencies | 60 | topologicalSort | ✅ |
| 7 | Add buildRootRelativePath | 20 | None | ✅ |

**Total**: ~260 LOC across 3 new files + 1 fix
**Actual**: ~450 LOC (including additional utilities and tests)

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `tooling/utils/src/repo/Graph.ts` | topologicalSort, computeTransitiveClosure, detectCycles |
| `tooling/utils/src/repo/DepSorter.ts` | sortDependencies, enforceVersionSpecifiers, mergeSortedDeps |
| `tooling/utils/src/repo/Paths.ts` | buildRootRelativePath, calculateDepth |

### Modified Files

| File | Changes |
|------|---------|
| `tooling/utils/src/schemas/WorkspaceDependencies.ts` | Fix bug, add CatalogValue, add VersionSpecifier |
| `tooling/utils/src/repo/index.ts` | Re-export new modules |
| `tooling/cli/src/commands/topo-sort.ts` | Import from Graph.ts instead of inline |

---

## Verification ✅ COMPLETE

All verification steps passed:

```bash
# Type check ✅
bun run check --filter @beep/tooling-utils

# Test ✅ (41 tests passing)
bun run test --filter @beep/tooling-utils

# Verify topo-sort still works ✅ (60 packages output)
bun run repo-cli topo-sort
```

**Additional tests created**:
- `Graph.test.ts` - 12 tests for topologicalSort, detectCycles, computeTransitiveClosure
- `DepSorter.test.ts` - 9 tests for sortDependencies, mergeSortedDeps, enforceVersionSpecifiers
- `Paths.test.ts` - 16 tests for calculateDepth, buildRootRelativePath, normalizePath, getDirectory

---

## Impact on P1 Scope

### Before P0 (Current P1 Scope)

| File | Purpose | Est. LOC |
|------|---------|----------|
| `index.ts` | Command definition | 40 |
| `handler.ts` | Orchestration | 120 |
| `errors.ts` | Tagged errors | 30 |
| `schemas.ts` | Input validation | 20 |
| `utils/transitive-closure.ts` | Recursive dep collection | 80 |
| `utils/dep-sorter.ts` | Topo + alpha sorting | 70 |
| `utils/reference-path-builder.ts` | Root-relative paths | 30 |
| `utils/cycle-detector.ts` | DFS cycle detection | 50 |
| **Total** | | **~440 LOC** |

### After P0 (Reduced P1 Scope)

| File | Purpose | Est. LOC |
|------|---------|----------|
| `index.ts` | Command definition | 40 |
| `handler.ts` | Orchestration (uses utilities) | 80 |
| `errors.ts` | Command-specific errors only | 15 |
| `schemas.ts` | Input validation | 20 |
| **Total** | | **~155 LOC** |

**Reduction**: ~65% less code in P1, with reusable utilities available for other commands.

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [EXISTING_UTILITIES.md](../EXISTING_UTILITIES.md) | Current utility analysis |
| [P0_ORCHESTRATOR_PROMPT.md](./P0_ORCHESTRATOR_PROMPT.md) | Copy-paste prompt for P0 |
| [HANDOFF_P1.md](./HANDOFF_P1.md) | Phase 1 context (updated after P0) |
