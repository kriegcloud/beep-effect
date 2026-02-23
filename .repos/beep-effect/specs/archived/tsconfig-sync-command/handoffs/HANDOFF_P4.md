# Phase 4 Handoff: Critical tsconfig-sync Fixes

**Date**: 2026-01-22
**From**: P3 Verification Session
**To**: P4 Implementation Session
**Priority**: CRITICAL - Command is broken in current state

---

## Executive Summary

The `tsconfig-sync` command has **FIVE critical bugs** that make it dangerous to use:

1. **Type-only import detection**: Removes valid references not in package.json
2. **Missing tsconfig types**: Only syncs `tsconfig.build.json`, ignores `tsconfig.src.json` and `tsconfig.test.json`
3. **Path format inconsistency**: Existing configs use wrong package-relative format
4. **Reference target format**: `src.json` & `test.json` reference `tsconfig.build.json` instead of package root
5. **Dependency sorting**: Not properly sorting/grouping peer, dev & prod dependencies per spec

---

## Bug 1: Type-Only Import Detection

### Problem

The handler only detects workspace dependencies from `package.json`, but TypeScript project references must include ALL imported packages, including **type-only imports**.

**Example**: `@beep/identity` has:
```typescript
// packages/common/identity/src/types.ts
import type { StringTypes } from "@beep/types";
```

But `@beep/types` is NOT in `@beep/identity/package.json`. The command removes the reference → build breaks.

### Root Cause

`tooling/cli/src/commands/tsconfig-sync/handler.ts:174-179`:
```typescript
const directWorkspaceDeps = F.pipe(
  deps.dependencies.workspace,
  HashSet.union(deps.devDependencies.workspace),
  HashSet.union(deps.peerDependencies.workspace)
);
```

### Required Fix

**Option A (Recommended)**: Preserve existing references

Merge computed refs with existing refs instead of overwriting:
```typescript
// Pseudocode
const existingRefs = yield* getExistingReferencePaths(tsconfigPath);
const computedRefs = /* from package.json deps */;
const finalRefs = union(existingRefs, computedRefs);
```

A helper function `getExistingReferencePaths` was already added to `tsconfig-writer.ts` but NOT yet integrated into the handler.

**Option B**: Scan source files for imports (more complex, use ts-morph)

---

## Bug 2: Missing tsconfig Types

### Problem

The command ONLY syncs `tsconfig.build.json`, but packages have THREE config files with workspace references:

| File | Purpose | Has Workspace Refs? | Currently Synced? |
|------|---------|---------------------|-------------------|
| `tsconfig.build.json` | Build output | YES | ✅ YES |
| `tsconfig.src.json` | Source compilation | YES | ❌ NO |
| `tsconfig.test.json` | Test compilation | YES | ❌ NO |

### Evidence (Current - WRONG)

```bash
$ cat packages/common/identity/tsconfig.src.json
{
  "references": [
    { "path": "../types/tsconfig.build.json" },        # WRONG - refs tsconfig.build.json
    { "path": "../invariant/tsconfig.build.json" }     # WRONG - refs tsconfig.build.json
  ]
}

$ cat packages/common/identity/tsconfig.test.json
{
  "references": [
    { "path": "tsconfig.src.json" },                   # CORRECT - local ref
    { "path": "../types/tsconfig.build.json" },        # WRONG - refs tsconfig.build.json
    { "path": "../invariant/tsconfig.build.json" },    # WRONG - refs tsconfig.build.json
    { "path": "../../../tooling/testkit/tsconfig.build.json" }  # Keep as-is for testkit
  ]
}
```

### Correct Format (AFTER sync)

```bash
$ cat packages/common/identity/tsconfig.src.json
{
  "references": [
    { "path": "../../../packages/common/types" },      # Package root, not tsconfig.build.json
    { "path": "../../../packages/common/invariant" }   # Package root, not tsconfig.build.json
  ]
}

$ cat packages/common/identity/tsconfig.test.json
{
  "references": [
    { "path": "tsconfig.src.json" },                   # Local ref to source
    { "path": "../../../packages/common/types" },      # Package root
    { "path": "../../../packages/common/invariant" },  # Package root
    { "path": "../../../tooling/testkit/tsconfig.build.json" }  # Testkit ref
  ]
}
```

### Required Fix

Expand the command to sync all three tsconfig types with DIFFERENT reference targets:

1. **tsconfig.build.json**: References point to `tsconfig.build.json` (e.g., `../../../packages/common/types/tsconfig.build.json`)
2. **tsconfig.src.json**: References point to **package root** (e.g., `../../../packages/common/types`)
3. **tsconfig.test.json**: References point to **package root** + ALWAYS include:
   - `{ "path": "tsconfig.src.json" }` (local reference)
   - `@beep/testkit` reference if package has tests

### Implementation Approach

```typescript
// In handler.ts, after computing expectedRefs for build:

const tsconfigTypes = ["build", "src", "test"] as const;

for (const configType of tsconfigTypes) {
  const configPath = `${pkgDir}/tsconfig.${configType}.json`;

  // Transform refs based on config type
  let refs = configType === "build"
    ? expectedRefs  // Points to tsconfig.build.json
    : expectedRefs.map(ref => ref.replace(/\/tsconfig\.build\.json$/, ""));  // Points to package root

  if (configType === "test") {
    // Add local src reference
    refs = ["tsconfig.src.json", ...refs];
    // Ensure testkit is included (keep tsconfig.build.json for testkit)
    if (!refs.some(r => r.includes("testkit"))) {
      refs = [...refs, testkitPath];
    }
  }

  yield* writeTsconfigReferences(configPath, refs);
}
```

---

## Bug 3: Path Format Inconsistency

### Problem

Existing configs use **package-relative paths** (`../types/tsconfig.build.json`) but the **correct format** is **root-relative paths** (`../../../packages/common/types/tsconfig.build.json`) as generated by the command.

### Evidence

**Existing (WRONG)**:
```json
{ "path": "../types/tsconfig.build.json" }
```

**Generated (CORRECT)**:
```json
{ "path": "../../../packages/common/types/tsconfig.build.json" }
```

### Decision: Root-Relative is Correct

Standardize on **root-relative paths** because:
- Explicit and unambiguous
- Matches current command generation
- Avoids confusion about relative path base
- Existing package-relative convention is being corrected

**Action**: Update ALL existing configs to use root-relative format when synced.

---

## Bug 4: Reference Target Format (src.json & test.json)

### Problem

`tsconfig.src.json` and `tsconfig.test.json` currently reference `tsconfig.build.json` directly:

```json
{ "path": "../types/tsconfig.build.json" }
```

### Correct Format

These configs should reference the **package root**, NOT `tsconfig.build.json`:

```json
{ "path": "../../../packages/common/types" }
```

TypeScript will automatically resolve to the appropriate tsconfig at that path.

### Summary of Reference Targets

| Config File | Reference Target | Example |
|-------------|------------------|---------|
| `tsconfig.build.json` | `tsconfig.build.json` | `../../../packages/common/types/tsconfig.build.json` |
| `tsconfig.src.json` | Package root | `../../../packages/common/types` |
| `tsconfig.test.json` | Package root (+ local src) | `../../../packages/common/types` |

---

## Bug 5: Dependency Sorting and Grouping

### Problem

The command is not properly sorting and grouping dependencies as specified in the spec (README.md L248-319).

### Spec Requirements

From `specs/tsconfig-sync-command/README.md`:

```
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

### Expected Order in tsconfig references

References should be ordered:
1. **Workspace dependencies** (topologically sorted - deps before dependents)
2. **External dependencies** (if any, alphabetically sorted)

### Implementation Note

The topological sort should use Kahn's algorithm with workspace packages appearing BEFORE their dependents:
- `@beep/invariant` before `@beep/utils` before `@beep/schema`

Verify the existing `topo-sort` logic is being correctly applied to the reference ordering.

---

## Required Files to Modify

| File | Changes |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | 1. Integrate existing ref preservation<br>2. Loop over all tsconfig types<br>3. Handle test-specific refs |
| `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` | Already has `getExistingReferencePaths` |
| `tooling/utils/src/repo/Paths.ts` | May need to adjust path calculation for package-relative |

---

## Verification Protocol

**CRITICAL**: After EACH package sync, run:

```bash
# 1. Sync single package
bun run repo-cli tsconfig-sync --filter @beep/package-name

# 2. Verify build works
bun run build --filter @beep/package-name

# 3. Verify type check works
bun run check --filter @beep/package-name

# 4. If either fails, the sync broke something - investigate and fix
```

### Full Repo Verification

After all fixes implemented:

```bash
# 1. Restore all configs to git state
git checkout -- packages/

# 2. Run full sync
bun run repo-cli tsconfig-sync

# 3. Run full build (will take time)
bun run build

# 4. Run full check
bun run check

# 5. ALL must pass
```

---

## Test Cases to Add

### Unit Tests (`tooling/cli/test/commands/tsconfig-sync/`)

1. **Preserve existing refs**: Given tsconfig with refs not in package.json, sync preserves them
2. **Sync all config types**: Given a package, all three tsconfigs are updated
3. **Test config has src ref**: tsconfig.test.json always includes tsconfig.src.json
4. **Test config has testkit**: tsconfig.test.json includes testkit if tests exist

### Integration Tests

1. **Build after sync**: `bun run build --filter @beep/identity` passes
2. **Check after sync**: `bun run check --filter @beep/identity` passes
3. **Full repo**: `bun run check` passes after full sync

---

## Acceptance Criteria

P4 is complete when:

- [ ] Type-only imports preserved (existing refs merged with computed)
- [ ] All three tsconfig types synced (build, src, test)
- [ ] Test configs include local src reference (`tsconfig.src.json`)
- [ ] Path format is root-relative for ALL configs
- [ ] `tsconfig.build.json` refs point to `tsconfig.build.json` files
- [ ] `tsconfig.src.json` & `tsconfig.test.json` refs point to **package root** (NOT `tsconfig.build.json`)
- [ ] References sorted: workspace (topological) first, external (alphabetical) second
- [ ] `bun run build` passes after full sync
- [ ] `bun run check` passes after full sync
- [ ] Unit tests added for new behavior
- [ ] VERIFICATION_REPORT_P4.md created with results

---

## Key Files to Read First

1. `specs/tsconfig-sync-command/README.md` - Original spec
2. `specs/tsconfig-sync-command/handoffs/VERIFICATION_REPORT_P3.md` - P3 findings
3. `specs/tsconfig-sync-command/handoffs/FIX_TYPE_ONLY_IMPORTS.md` - Detailed bug analysis
4. `tooling/cli/src/commands/tsconfig-sync/handler.ts` - Main handler
5. `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` - File I/O utilities

---

## Commands Reference

```bash
# Restore to clean state
git checkout -- packages/

# Sync single package (verbose)
bun run repo-cli tsconfig-sync --filter @beep/identity --verbose

# Check mode (no writes)
bun run repo-cli tsconfig-sync --check

# Build single package
bun run build --filter @beep/identity

# Type check single package
bun run check --filter @beep/identity

# Full repo build
bun run build

# Full repo check
bun run check
```

---

## Suggested Implementation Order

1. **Fix path format first** - Decide on standard, update `buildRootRelativePath` or create `buildPackageRelativePath`
2. **Add existing ref preservation** - Integrate `getExistingReferencePaths` into handler
3. **Expand to all tsconfig types** - Loop over build/src/test
4. **Handle test-specific refs** - Add local src ref and testkit
5. **Add post-sync verification** - Optionally run build/check after each package
6. **Test on @beep/identity first** - Known problematic package
7. **Full repo verification** - Run on all packages with build/check validation
