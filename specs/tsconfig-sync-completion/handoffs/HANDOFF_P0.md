# Phase 0 Handoff: Next.js Transitive Dependency Fix (CRITICAL)

**From**: Spec Creation (Post-Mortem Analysis)
**To**: P0 Implementation
**Date**: 2026-01-22

---

## Executive Summary

**CRITICAL BUG**: `tsconfig-sync` generates broken Next.js app configs that cause build failures. The command only adds path aliases for DIRECT dependencies, but Next.js requires path aliases for ALL transitive dependencies because it doesn't support TypeScript project references.

**Priority**: Must fix before any other work. Both `apps/web` and `apps/todox` will fail to build after running `tsconfig-sync` until this is fixed.

---

## Problem Statement

### Symptom

After running `bun run repo-cli tsconfig-sync`, Next.js builds fail:

```bash
$ bun run build --filter @beep/web
error TS7006: Parameter 'table' implicitly has an 'any' type.
```

The error appears in files like `Discussion.repo.ts` where Drizzle's relational query callback needs types from transitive dependencies.

### Root Cause

**Regular packages** get transitive closure (handler.ts:455-460):
```typescript
const closure = yield* computeTransitiveClosure(adjacencyList, pkg);
transitiveDeps = HashSet.union(directWorkspaceDeps, closure);
```

**Next.js apps** do NOT (handler.ts:257-285):
```typescript
const beepDeps = yield* readAppDependencies(appDir);  // DIRECT ONLY!
for (const dep of HashSet.toValues(beepDeps)) {
  const aliases = buildSinglePathAlias(dep, ...);  // Missing transitives
}
```

### Why This Matters

Next.js explicitly warns: "TypeScript project references are not fully supported. Attempting to build in incremental mode."

This means Next.js ignores `references` in tsconfig.json and relies SOLELY on `paths` to resolve types. If a path alias is missing, the type resolution fails.

---

## Implementation Plan

### Step 1: Pass adjacencyList to processNextJsApps

**File**: `tooling/cli/src/commands/tsconfig-sync/handler.ts`

**Current** (line 743):
```typescript
yield* processNextJsApps(input, mode, repoRoot, tsconfigPaths, {
  onChangeNeeded: () => { changesNeeded++; },
  onChangeApplied: () => { changesApplied++; },
});
```

**Change to**:
```typescript
yield* processNextJsApps(input, mode, repoRoot, tsconfigPaths, adjacencyList, {
  onChangeNeeded: () => { changesNeeded++; },
  onChangeApplied: () => { changesApplied++; },
});
```

### Step 2: Update processNextJsApps Signature

**Current** (line 202-210):
```typescript
const processNextJsApps = (
  input: TsconfigSyncInput,
  mode: "check" | "dry-run" | "sync",
  repoRoot: string,
  tsconfigPaths: HashMap.HashMap<string, A.NonEmptyReadonlyArray<string>>,
  callbacks: {
    onChangeNeeded: () => void;
    onChangeApplied: () => void;
  }
) =>
```

**Change to**:
```typescript
const processNextJsApps = (
  input: TsconfigSyncInput,
  mode: "check" | "dry-run" | "sync",
  repoRoot: string,
  tsconfigPaths: HashMap.HashMap<string, A.NonEmptyReadonlyArray<string>>,
  adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>,
  callbacks: {
    onChangeNeeded: () => void;
    onChangeApplied: () => void;
  }
) =>
```

### Step 3: Compute Transitive Closure for App Dependencies

**After line 258** (after `const beepDeps = yield* readAppDependencies(appDir);`):

```typescript
// Compute transitive closure for all @beep/* dependencies
// This ensures path aliases exist for transitive deps that Next.js needs
const transitiveDeps = yield* F.pipe(
  HashSet.toValues(beepDeps),
  Effect.reduce(HashSet.empty<string>(), (acc, dep) =>
    Effect.map(
      computeTransitiveClosure(adjacencyList, dep),
      (closure) => F.pipe(
        acc,
        HashSet.add(dep),
        HashSet.union(closure)
      )
    )
  )
);
```

### Step 4: Use transitiveDeps for Path Aliases

**Change lines 277-285**:

**From**:
```typescript
for (const dep of HashSet.toValues(beepDeps)) {
  const pkgDirOption = HashMap.get(pkgDirMap, dep);
  if (O.isSome(pkgDirOption)) {
    const aliases = buildSinglePathAlias(dep, pkgDirOption.value, appRelPath);
    for (const [key, value] of aliases) {
      beepPaths[key] = [...value];
    }
  }
}
```

**To**:
```typescript
for (const dep of HashSet.toValues(transitiveDeps)) {  // CHANGED: use transitiveDeps
  const pkgDirOption = HashMap.get(pkgDirMap, dep);
  if (O.isSome(pkgDirOption)) {
    const aliases = buildSinglePathAlias(dep, pkgDirOption.value, appRelPath);
    for (const [key, value] of aliases) {
      beepPaths[key] = [...value];
    }
  }
}
```

### Step 5: Use transitiveDeps for References

**Change lines 303-309**:

**From**:
```typescript
for (const dep of HashSet.toValues(beepDeps)) {
  const pkgDirOption = HashMap.get(pkgDirMap, dep);
  if (O.isSome(pkgDirOption)) {
    const refPath = `${appRelPath}/${pkgDirOption.value}/tsconfig.build.json`;
    depRefs.push(refPath);
  }
}
```

**To**:
```typescript
for (const dep of HashSet.toValues(transitiveDeps)) {  // CHANGED: use transitiveDeps
  const pkgDirOption = HashMap.get(pkgDirMap, dep);
  if (O.isSome(pkgDirOption)) {
    const refPath = `${appRelPath}/${pkgDirOption.value}/tsconfig.build.json`;
    depRefs.push(refPath);
  }
}
```

---

## Verification Steps

### 1. Pre-check current state

```bash
# Record current path count in apps/web
grep -c "@beep/" apps/web/tsconfig.json

# Record current path count in apps/todox
grep -c "@beep/" apps/todox/tsconfig.json
```

### 2. Run sync and verify path count increased

```bash
# Run sync
bun run repo-cli tsconfig-sync --verbose

# Verify more paths were added (should increase significantly)
grep -c "@beep/" apps/web/tsconfig.json
grep -c "@beep/" apps/todox/tsconfig.json
```

### 3. Verify builds succeed

```bash
# CRITICAL: Both must pass
bun run build --filter @beep/web
bun run build --filter @beep/todox
```

### 4. Verify check mode passes

```bash
# Should exit 0
bun run repo-cli tsconfig-sync --check
```

### 5. Run full test suite

```bash
bun run test --filter @beep/repo-cli
bun run check
```

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| Path count increased | `apps/web/tsconfig.json` paths > 50 (was ~40) |
| Deep transitives present | Verify `@beep/shared-tables`, `@beep/documents-domain` in apps/web |
| web build passes | `bun run build --filter @beep/web` exits 0 |
| todox build passes | `bun run build --filter @beep/todox` exits 0 |
| Check mode passes | `bun run repo-cli tsconfig-sync --check` exits 0 |
| Existing tests pass | `bun run test --filter @beep/repo-cli` all green |

---

## Gotchas

1. **Effect.reduce vs A.reduce**: Use `Effect.reduce` from `effect/Effect` for effectful operations, not `A.reduce`
2. **HashSet operations**: `HashSet.add` returns a new set, doesn't mutate
3. **Adjacency list direction**: `computeTransitiveClosure(adjacencyList, pkg)` finds deps OF pkg, not dependents
4. **Self-reference**: Apps may have self-referential paths like `@beep/web/*` → `./src/*`; preserve these

---

## Files Modified

| File | Line Range | Changes |
|------|------------|---------|
| `handler.ts` | 202-210 | Add `adjacencyList` parameter to `processNextJsApps` |
| `handler.ts` | 258-260 | Add transitive closure computation |
| `handler.ts` | 277-285 | Change loop to use `transitiveDeps` |
| `handler.ts` | 303-309 | Change loop to use `transitiveDeps` |
| `handler.ts` | 743 | Pass `adjacencyList` to function call |

---

## Rollback Plan

If the fix causes issues:

1. Revert `handler.ts` changes
2. Manually restore `apps/web/tsconfig.json` and `apps/todox/tsconfig.json` from git
3. Document failure in REFLECTION_LOG.md

---

## References

- REFLECTION_LOG.md: Full root cause analysis
- README.md: Phase 0 specification
- Parent spec: `specs/tsconfig-sync-command/README.md`
- Effect docs: `computeTransitiveClosure` utility in `@beep/tooling-utils`
