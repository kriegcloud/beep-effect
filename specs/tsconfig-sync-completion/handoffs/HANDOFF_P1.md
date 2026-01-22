# Phase 1 Handoff: Package.json Dependency Sync

**From**: P0 (Next.js Transitive Fix)
**To**: P1 Implementation
**Date**: 2026-01-22
**Status**: ✅ COMPLETED (2026-01-22)

## Completion Summary

P1 implementation is complete:
- ✅ `void mergeSortedDeps(...)` replaced with actual package.json sync logic
- ✅ `--check` mode detects unsorted package.json dependencies
- ✅ `--dry-run` mode shows what would change in package.json
- ✅ Sync mode writes sorted dependencies to package.json
- ✅ Version specifiers enforced (`workspace:^` for @beep/* packages)
- ✅ All 433 existing tests pass
- ✅ tsconfig sync behavior unchanged

**Note**: Build failures for @beep/web and @beep/todox are pre-existing (missing `OntologyParseError` export), unrelated to P1 changes.

---

## Pre-requisite: Phase 0 Complete

**CRITICAL**: P0 must be completed first. P0 fixes the Next.js transitive dependency bug that causes build failures. Verify P0 completion:

```bash
# Both must pass before starting P1
bun run build --filter @beep/web
bun run build --filter @beep/todox
bun run repo-cli tsconfig-sync --check
```

---

## Executive Summary

Implement the missing package.json dependency sync functionality. The utilities exist (`package-json-writer.ts`), but are never called from the handler. The sorting algorithm is correct and tested. This phase connects the existing pieces.

---

## Current State

### What Exists

| Component | Location | Status |
|-----------|----------|--------|
| `sortDependencies` | `@beep/tooling-utils/repo/DepSorter.ts` | Working, tested |
| `mergeSortedDeps` | `@beep/tooling-utils/repo/DepSorter.ts` | Working, tested |
| `enforceVersionSpecifiers` | `@beep/tooling-utils/repo/DepSorter.ts` | Working, tested |
| `writePackageJsonDeps` | `tsconfig-sync/utils/package-json-writer.ts` | Implemented, never called |
| `checkPackageJsonDeps` | `tsconfig-sync/utils/package-json-writer.ts` | Implemented, never called |
| `computeDependencyDiff` | `tsconfig-sync/utils/package-json-writer.ts` | Implemented, never called |

### The Missing Link

`handler.ts` lines 534-536:
```typescript
const sortedDeps = yield* sortDependencies(allDeps, adjacencyList);
// TODO: In Phase 3, use mergedDeps to update package.json
void mergeSortedDeps(sortedDeps);  // <-- RESULT DISCARDED
```

### Spec Requirements (from parent spec)

From `specs/tsconfig-sync-command/README.md` lines 301-318:

```
Dependency Sorting Algorithm:

1. Separate deps into two groups:
   - workspace: packages matching @beep/*
   - external: all other packages

2. Sort workspace packages topologically:
   - Use existing topo-sort logic (Kahn's algorithm)
   - Deps appear before dependents
   - Example: @beep/invariant before @beep/utils before @beep/schema

3. Sort external packages alphabetically:
   - Standard lexicographic sort
   - Example: drizzle-orm, effect, next, uuid

4. Concatenate: workspace first, then external
```

---

## Implementation Plan

### Step 1: Read Package.json Dependencies

Add after line 520 (after transitive closure computation):

```typescript
// Read current package.json
const pkgJsonPath = `${pkgDir}/package.json`;
const currentPkgJson = yield* readPackageJson(pkgJsonPath).pipe(
  Effect.catchAll(() => Effect.succeed({ dependencies: {}, devDependencies: {}, peerDependencies: {} }))
);
```

### Step 2: Build Complete Dependency Sets

The current `allDeps` on line 523 only includes direct deps. Extend to include transitive:

```typescript
// Collect all deps (direct + transitive)
const workspaceDeps = F.pipe(
  deps.dependencies.workspace,
  HashSet.union(transitiveClosure),  // Add transitive deps
  HashSet.toValues,
  A.reduce({} as Record<string, string>, (acc, dep) => ({ ...acc, [dep]: "workspace:^" }))
);

const externalDeps = F.pipe(
  deps.dependencies.npm,
  HashSet.toValues,
  A.reduce({} as Record<string, string>, (acc, dep) => ({ ...acc, [dep]: "catalog:" }))
);

const allDeps = { ...workspaceDeps, ...externalDeps };
```

### Step 3: Enforce Version Specifiers

Add call to `enforceVersionSpecifiers` before sorting:

```typescript
import { enforceVersionSpecifiers } from "@beep/tooling-utils/repo/DepSorter";

// Enforce correct version specifiers
const enforcedDeps = yield* enforceVersionSpecifiers(currentPkgJson.dependencies ?? {});
const enforcedDevDeps = yield* enforceVersionSpecifiers(currentPkgJson.devDependencies ?? {});
const enforcedPeerDeps = yield* enforceVersionSpecifiers(currentPkgJson.peerDependencies ?? {});
```

### Step 4: Sort and Merge Dependencies

```typescript
// Sort each dependency type
const sortedDeps = yield* sortDependencies(enforcedDeps, adjacencyList);
const sortedDevDeps = yield* sortDependencies(enforcedDevDeps, adjacencyList);
const sortedPeerDeps = yield* sortDependencies(enforcedPeerDeps, adjacencyList);

// Convert back to Record format
const mergedDeps = mergeSortedDeps(sortedDeps);
const mergedDevDeps = mergeSortedDeps(sortedDevDeps);
const mergedPeerDeps = mergeSortedDeps(sortedPeerDeps);
```

### Step 5: Write or Check Based on Mode

```typescript
import { writePackageJsonDeps, checkPackageJsonDeps, computeDependencyDiff } from "./utils/package-json-writer";

const syncMode = getSyncMode(input);

if (syncMode === "check") {
  // Check for drift
  const depsDrift = computeDependencyDiff(currentPkgJson.dependencies ?? {}, mergedDeps);
  const devDepsDrift = computeDependencyDiff(currentPkgJson.devDependencies ?? {}, mergedDevDeps);
  const peerDepsDrift = computeDependencyDiff(currentPkgJson.peerDependencies ?? {}, mergedPeerDeps);

  if (depsDrift.hasChanges || devDepsDrift.hasChanges || peerDepsDrift.hasChanges) {
    yield* Effect.fail(new DriftDetectedError({ package: pkg, reason: "package.json dependencies out of order" }));
  }
} else if (syncMode === "dry-run") {
  // Report what would change
  const diff = computeDependencyDiff(currentPkgJson.dependencies ?? {}, mergedDeps);
  if (diff.hasChanges) {
    yield* Console.log(color.yellow(`  ${pkg} package.json: would reorder ${Struct.keys(mergedDeps).length} dependencies`));
  }
} else {
  // Sync mode - write changes
  yield* writePackageJsonDeps(pkgJsonPath, {
    dependencies: mergedDeps,
    devDependencies: mergedDevDeps,
    peerDependencies: mergedPeerDeps
  });

  if (input.verbose) {
    yield* Console.log(color.green(`  ${pkg} package.json: synced dependency order`));
  }
}
```

### Step 6: Add --no-hoist Effect on package.json

When `--no-hoist` is set, skip transitive dependency hoisting:

```typescript
const transitiveClosure = input.noHoist
  ? HashSet.empty<string>()  // Skip hoisting
  : yield* computeTransitiveClosure(...);
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `handler.ts` | Replace void call with actual writes |
| `utils/package-json-writer.ts` | No changes needed (already complete) |
| `schemas.ts` | No changes needed |

---

## API Reference

### From `@beep/tooling-utils/repo/DepSorter`

```typescript
// Sort dependencies: workspace topological, external alphabetical
export const sortDependencies: (
  deps: Record<string, string>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>
) => Effect.Effect<SortedDependencies, CyclicDependencyError>

// Convert sorted back to Record
export const mergeSortedDeps: (sorted: SortedDependencies) => Record<string, string>

// Enforce workspace:^ and catalog: specifiers
export const enforceVersionSpecifiers: (
  deps: Record<string, string>
) => Effect.Effect<Record<string, string>, never>
```

### From `utils/package-json-writer.ts`

```typescript
// Read package.json
export const readPackageJson: (
  path: string
) => Effect.Effect<PackageJson, TsconfigSyncError, FileSystem.FileSystem>

// Compute diff between current and desired
export const computeDependencyDiff: (
  current: Record<string, string>,
  desired: Record<string, string>
) => { hasChanges: boolean; added: string[]; removed: string[]; reordered: boolean }

// Write dependencies to package.json preserving format
export const writePackageJsonDeps: (
  path: string,
  deps: { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; peerDependencies?: Record<string, string> }
) => Effect.Effect<void, TsconfigSyncError, FileSystem.FileSystem>

// Check mode - validate without writing
export const checkPackageJsonDeps: (
  path: string,
  expected: { dependencies?: Record<string, string>; devDependencies?: Record<string, string>; peerDependencies?: Record<string, string> }
) => Effect.Effect<boolean, TsconfigSyncError, FileSystem.FileSystem>
```

---

## Testing Strategy

### Manual Verification

```bash
# Before changes - see current state
cat packages/common/schema/package.json | jq '.dependencies, .devDependencies, .peerDependencies'

# Run with dry-run to see proposed changes
bun run repo-cli tsconfig-sync --dry-run --filter @beep/schema --verbose

# Apply changes
bun run repo-cli tsconfig-sync --filter @beep/schema --verbose

# Verify sorting applied
cat packages/common/schema/package.json | jq '.dependencies, .devDependencies, .peerDependencies'

# Check mode should pass
bun run repo-cli tsconfig-sync --check --filter @beep/schema
```

### Expected Result

For `@beep/schema`, dependencies should be sorted:
```json
{
  "peerDependencies": {
    "@beep/invariant": "workspace:^",
    "@beep/identity": "workspace:^",
    "@beep/utils": "workspace:^",
    "drizzle-orm": "catalog:",
    "effect": "catalog:"
  }
}
```

Workspace packages in topological order (deps before dependents), then external alphabetically.

---

## Success Criteria

| Criterion | Test |
|-----------|------|
| Dependencies sorted correctly | Manual inspection of package.json files |
| Check mode detects unsorted deps | `--check` fails on unsorted, passes after sync |
| Dry-run shows changes | `--dry-run` prints what would change |
| Existing tests pass | `bun run test --filter @beep/repo-cli` |
| tsconfig sync still works | `bun run repo-cli tsconfig-sync --check` passes |

---

## Gotchas

1. **Don't break tsconfig sync**: Test tsconfig behavior before and after changes
2. **Preserve package.json formatting**: Use jsonc-parser to maintain indentation/newlines
3. **Handle missing dep sections**: Some packages lack peerDependencies
4. **Handle empty deps**: `mergeSortedDeps` returns empty Record for no deps

---

## Files to Reference

| File | Purpose |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Main file to modify |
| `tooling/cli/src/commands/tsconfig-sync/utils/package-json-writer.ts` | Utilities to call |
| `tooling/utils/src/repo/DepSorter.ts` | Sorting algorithms |
| `specs/tsconfig-sync-command/README.md` | Original spec (lines 248-318) |
| `packages/common/schema/package.json` | Good test case |
