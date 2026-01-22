# Fix Handoff: Type-Only Import Detection

**Date**: 2026-01-22
**Severity**: High
**Category**: Missing Dependency Detection

---

## Problem Statement

The `tsconfig-sync` command only detects workspace dependencies from `package.json`, but TypeScript project references must include ALL imported packages, including **type-only imports** that may not be declared as runtime dependencies.

When a package uses `import type { X } from "@beep/other"` without declaring `@beep/other` in its package.json, the command removes the reference, breaking TypeScript compilation.

---

## Affected Packages

**Confirmed**:
- `@beep/identity` - imports `@beep/types` via `import type { StringTypes } from "@beep/types"` but doesn't declare it in package.json

**Potentially affected** (need verification):
- Any package using type-only imports from other workspace packages

---

## Root Cause Analysis

**File**: `tooling/cli/src/commands/tsconfig-sync/handler.ts`
**Lines**: 174-179

```typescript
// Get direct workspace dependencies
const directWorkspaceDeps = F.pipe(
  deps.dependencies.workspace,
  HashSet.union(deps.devDependencies.workspace),
  HashSet.union(deps.peerDependencies.workspace)
);
```

The handler builds the dependency set exclusively from `package.json` fields:
- `dependencies.workspace`
- `devDependencies.workspace`
- `peerDependencies.workspace`

It does NOT:
- Scan source files for `import` statements
- Preserve existing references that may be valid
- Detect type-only imports

---

## Spec Requirement

From `specs/tsconfig-sync-command/README.md`:

> **L169**: Every `@beep/*` dependency from package.json has a corresponding reference in tsconfig.build.json.

This requirement is met, but it's **incomplete**. TypeScript project references need ALL imports, not just those declared in package.json.

---

## Proposed Fixes

### Option 1: Fix package.json (Quick, Manual)

Add missing workspace dependencies to package.json for all type-only imports.

**Pros**: Simple, no code changes
**Cons**: Manual, doesn't prevent future issues, bloats package.json with compile-time deps

**Example for @beep/identity**:
```json
{
  "devDependencies": {
    "@beep/types": "workspace:^"
  }
}
```

### Option 2: Preserve Existing References (Recommended)

Modify the handler to **merge** computed refs with existing refs instead of overwriting.

**Algorithm**:
1. Compute expected refs from package.json deps
2. Read existing refs from tsconfig.build.json
3. Union the two sets (existing ∪ computed)
4. Only REMOVE refs that are explicitly contradicted (package removed from workspace)

**Pros**: Safe, preserves manually-added refs, backward compatible
**Cons**: May accumulate stale refs over time

**Implementation sketch**:
```typescript
// In handler.ts
const existingRefs = yield* readExistingReferences(buildTsconfigPath.value);
const computedRefs = expectedRefs;

// Union existing with computed, preserving both
const finalRefs = F.pipe(
  existingRefs,
  A.appendAll(computedRefs),
  A.dedupe
);
```

### Option 3: Scan Source Files (Thorough)

Parse TypeScript source files to detect all `import` statements.

**Algorithm**:
1. Use ts-morph to parse source files
2. Extract all `import` and `import type` statements
3. Filter to `@beep/*` imports
4. Add to dependency set before computing refs

**Pros**: Accurate, catches all imports
**Cons**: Expensive, adds ts-morph dependency, slower execution

---

## Files to Modify

| File | Changes |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Add existing ref preservation logic |
| `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` | Add `readExistingReferences` function |
| `packages/common/identity/package.json` | (Option 1 only) Add `@beep/types` devDep |

---

## Test Cases

### Unit Tests

1. **Preserve existing refs**: Given a tsconfig with manual refs not in package.json, sync should preserve them
2. **Remove stale refs**: Given a ref to a deleted package, sync should remove it
3. **Add new refs**: Given a new dep in package.json, sync should add the ref

### Integration Tests

1. **Build after sync**: Run `bun run build --filter @beep/identity` after sync, verify no errors
2. **Check after sync**: Run `bun run check --filter @beep/identity` after sync, verify no type errors
3. **Full repo**: Run `bun run check` after full repo sync, verify no regressions

---

## Verification Protocol

After implementing fix:

1. Restore all tsconfig files: `git checkout -- packages/`
2. Run full sync: `bun run repo-cli tsconfig-sync`
3. Run full build: `bun run build`
4. Run full check: `bun run check`
5. All must pass with no errors

---

## Priority

**High** - This bug breaks builds when tsconfig-sync is run, making the command dangerous to use in its current state.
