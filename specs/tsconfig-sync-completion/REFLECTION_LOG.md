# Reflection Log

> Cumulative learnings from spec execution.

---

## Phase 0: Spec Creation (2026-01-22)

### Context
Created this spec to complete the tsconfig-sync command after identifying missing functionality in the parent spec implementation.

### Key Findings

1. **Package.json sync was designed but never implemented**
   - `package-json-writer.ts` (241 LOC) exists with complete utilities
   - Handler computes sorted deps but discards them with `void`
   - TODO comment explicitly marks this as incomplete

2. **Transitive dependency hoisting is computed but not persisted**
   - `computeTransitiveClosure` collects all peer deps transitively
   - Results used only for tsconfig references, not package.json

3. **Handler needs refactoring for testability**
   - 772 LOC monolithic function
   - Mixed concerns: discovery, detection, computation, writing
   - Complex inline path resolution duplicates utility functions

### Decisions Made

1. **Scoped to completion only** - This spec addresses missing functionality, not redesign
2. **Sequential phases** - Refactoring enables testing, so order matters
3. **Preserve existing behavior** - tsconfig sync is working; don't break it

### Patterns to Follow

1. Use existing `package-json-writer.ts` utilities - they're well-designed
2. Follow extraction pattern from `tsconfig-writer.ts` for modularity
3. Use `@beep/testkit` patterns for all new tests

### Anti-patterns to Avoid

1. Don't add more code to handler.ts - extract instead
2. Don't change sorting algorithm - it's correct, just not called
3. Don't modify tsconfig sync logic while adding package.json sync

---

## CRITICAL Discovery: Next.js Transitive Dependency Bug (2026-01-22)

### Symptom

After running `tsconfig-sync`, Next.js apps (`@beep/web`, `@beep/todox`) fail to build with cryptic type errors like:
- "Parameter 'table' implicitly has an 'any' type"
- "The project root is ambiguous, but is required to resolve export map entry"

These errors appear ONLY during `next build`, NOT in IDE or package-level `bun run check`.

### Root Cause Analysis

1. **Next.js limitation**: TypeScript project references are NOT fully supported
   - Warning: "TypeScript project references are not fully supported. Attempting to build in incremental mode."
   - Next.js relies **solely** on `compilerOptions.paths` to resolve types at build time

2. **TypeScript paths behavior**: Child `tsconfig.json` paths **override** (not merge with) parent paths
   - When `apps/web/tsconfig.json` defines its own `paths`, the base `tsconfig.base.jsonc` paths are ignored

3. **Bug location**: `processNextJsApps` (handler.ts:202-354)
   - Line 258: Reads only DIRECT dependencies from `package.json`
   - Lines 277-285: Builds path aliases only for those direct deps
   - **Missing**: Transitive closure computation that regular packages get (lines 455-460)

4. **Consequence**: If `apps/web` depends on `@beep/documents-server`, which depends on `@beep/documents-domain`, the app's tsconfig.json gets:
   - ✅ `@beep/documents-server` path alias (direct dep)
   - ❌ `@beep/documents-domain` path alias (transitive dep - MISSING!)
   - Next.js build fails when trying to resolve types from the missing transitive dep

### Evidence

**Regular packages (CORRECT)**:
```typescript
// handler.ts lines 455-460
const closure = yield* computeTransitiveClosure(adjacencyList, pkg);
transitiveDeps = HashSet.union(directWorkspaceDeps, closure);
```

**Next.js apps (BROKEN)**:
```typescript
// handler.ts lines 257-285
const beepDeps = yield* readAppDependencies(appDir);  // Direct deps only!
for (const dep of HashSet.toValues(beepDeps)) {
  // Builds aliases for DIRECT deps, ignores transitive
}
```

### Manual Fix Applied (for reference)

Added these entries to `apps/web/tsconfig.json`:
- `@beep/documents-domain` + `@beep/documents-domain/*`
- `@beep/documents-tables` + `@beep/documents-tables/*`
- `@beep/shared-tables` + `@beep/shared-tables/*`
- `@beep/shared-server` + `@beep/shared-server/*`
- And all other transitive dependencies...

Added to `apps/todox/tsconfig.json`:
- `@beep/types` + `@beep/types/*`
- `@beep/invariant` + `@beep/invariant/*`

After manual fixes, both apps build successfully.

### Fix Required (Phase 0)

Pass `adjacencyList` to `processNextJsApps` and compute transitive closure for each app's dependencies:

```typescript
// Compute transitive closure for ALL @beep/* dependencies
const transitiveDeps = yield* Effect.reduce(
  HashSet.toValues(beepDeps),
  HashSet.empty<string>(),
  (acc, dep) =>
    Effect.map(
      computeTransitiveClosure(adjacencyList, dep),
      (closure) => HashSet.union(acc, HashSet.add(HashSet.add(closure, dep), dep))
    )
);

// Use transitiveDeps (not beepDeps) for path aliases AND references
```

### Lessons Learned

1. **Next.js + TypeScript project references = fragile**: Always test with `next build`, not just `tsc`
2. **Transitive deps matter for bundlers**: What works with `tsc --build` may fail with Next.js/webpack
3. **IDE vs build discrepancy**: If types work in IDE but fail in build, suspect config inheritance issues
4. **Test the actual build**: Add `bun run build --filter @beep/web` as a post-sync verification step

---

## Phase 0: [Pending - Critical Fix]

---

## Phase 1: [Pending]

---

## Phase 2: [Pending]

---

## Phase 3: [Pending]

---

## Phase 4: [Pending]
