# P4 Orchestrator Prompt: Critical tsconfig-sync Fixes

## Mission

You are the P4 implementation orchestrator for the `tsconfig-sync` command. Your task is to fix THREE critical bugs that make the command dangerous to use, then verify ALL packages pass build and check.

---

## Critical Bugs to Fix

### Bug 1: Type-Only Import Detection
- Command removes valid references not in package.json
- Fix: Preserve existing refs by merging with computed refs
- Helper `getExistingReferencePaths` already exists in `tsconfig-writer.ts`

### Bug 2: Missing tsconfig Types
- Command only syncs `tsconfig.build.json`
- Must also sync `tsconfig.src.json` and `tsconfig.test.json`
- Test configs need special handling (local src ref + testkit)

### Bug 3: Path Format Inconsistency
- Command generates root-relative (`../../../packages/...`) - THIS IS CORRECT
- Existing configs use package-relative (`../types/...`) - THIS IS WRONG
- Standardize ALL configs to root-relative format

### Bug 4: Reference Target for src.json & test.json
- `tsconfig.build.json` references should point to `tsconfig.build.json` files
- `tsconfig.src.json` and `tsconfig.test.json` should reference **package root**, NOT `tsconfig.build.json`
- Example: `../../../packages/common/types` (NOT `../../../packages/common/types/tsconfig.build.json`)

### Bug 5: Dependency Sorting and Grouping
- References must be sorted per spec (README.md L248-319):
  1. Workspace packages FIRST (topologically sorted - deps before dependents)
  2. External packages SECOND (alphabetically sorted)
- Example order: `@beep/invariant` → `@beep/utils` → `@beep/schema` (topo order)

---

## Required Reading (Do This First)

```bash
# Read these files in order:
cat specs/tsconfig-sync-command/handoffs/HANDOFF_P4.md
cat specs/tsconfig-sync-command/handoffs/FIX_TYPE_ONLY_IMPORTS.md
cat tooling/cli/src/commands/tsconfig-sync/handler.ts
cat tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts
```

---

## Implementation Steps

### Step 1: Path Format (DECIDED)

**Root-relative is correct**. The current generation is the standard:
- `../../../packages/common/types/tsconfig.build.json` for `tsconfig.build.json` refs
- `../../../packages/common/types` for `tsconfig.src.json` and `tsconfig.test.json` refs (package root, NOT tsconfig.build.json)

No changes needed to `buildRootRelativePath`. Existing package-relative configs will be corrected during sync.

### Step 2: Preserve Existing References

In `handler.ts`, integrate existing ref preservation:

```typescript
// After computing expectedRefs, merge with existing:
const existingRefs = yield* getExistingReferencePaths(buildTsconfigPath.value);
const mergedRefs = mergeReferences(existingRefs, expectedRefs);
```

### Step 3: Expand to All tsconfig Types

Modify handler to process all three config types with **different reference targets**:

```typescript
const configTypes = [
  { type: "build", file: "tsconfig.build.json" },
  { type: "src", file: "tsconfig.src.json" },
  { type: "test", file: "tsconfig.test.json" },
];

for (const config of configTypes) {
  const configPath = `${pkgDir}/${config.file}`;

  // CRITICAL: Different reference targets per config type
  let refs = config.type === "build"
    ? expectedRefs  // Points to tsconfig.build.json (e.g., ../../../packages/common/types/tsconfig.build.json)
    : expectedRefs.map(ref => ref.replace(/\/tsconfig\.build\.json$/, ""));  // Points to package root (e.g., ../../../packages/common/types)

  if (config.type === "test") {
    // Prepend local src reference
    refs = ["tsconfig.src.json", ...refs];
    // Ensure testkit is included (keep tsconfig.build.json for testkit)
  }

  yield* writeTsconfigReferences(configPath, refs);
}
```

**Key difference**:
- `tsconfig.build.json` → refs end in `/tsconfig.build.json`
- `tsconfig.src.json` & `tsconfig.test.json` → refs point to package root (no `/tsconfig.build.json` suffix)

### Step 4: Verify Each Package

After implementing fixes, verify with build/check:

```bash
# Test on known problematic package first
git checkout -- packages/common/identity/
bun run repo-cli tsconfig-sync --filter @beep/identity --verbose
bun run build --filter @beep/identity
bun run check --filter @beep/identity
```

---

## Verification Loop

Use this loop to verify ALL packages:

```bash
# For each package in topological order:
PKG="@beep/package-name"

# 1. Restore to clean state
git checkout -- packages/

# 2. Sync this package
bun run repo-cli tsconfig-sync --filter "$PKG" --verbose

# 3. Build (catches missing refs)
bun run build --filter "$PKG"

# 4. Check (catches type errors)
bun run check --filter "$PKG"

# 5. If any fail, investigate and fix before continuing
```

---

## Package Order (Topological)

Process in this order (leaves first):

```
# Common Layer (test these first - they're simpler)
@beep/types
@beep/invariant
@beep/identity      # Known problematic - test fix here
@beep/utils
@beep/schema
@beep/constants
@beep/errors
@beep/wrap

# Shared Layer
@beep/shared-domain
@beep/shared-env
@beep/shared-tables
@beep/shared-server
@beep/shared-client
@beep/shared-ai

# Domain Slices (domain -> tables -> server -> client -> ui)
@beep/iam-domain, @beep/iam-tables, @beep/iam-server, @beep/iam-client, @beep/iam-ui
@beep/documents-domain, @beep/documents-tables, @beep/documents-server, ...
@beep/calendar-domain, ...
@beep/comms-domain, ...
@beep/customization-domain, ...
@beep/knowledge-domain, ...

# UI Layer
@beep/ui-core
@beep/ui
@beep/ui-editor

# Runtime
@beep/runtime-client
```

---

## Success Criteria

P4 is complete when:

1. ✅ All three tsconfig types synced (build, src, test)
2. ✅ Existing refs preserved (type-only imports work)
3. ✅ Path format is root-relative across all configs
4. ✅ `tsconfig.build.json` refs point to `tsconfig.build.json` files
5. ✅ `tsconfig.src.json` and `tsconfig.test.json` refs point to **package root** (NOT `tsconfig.build.json`)
6. ✅ Test configs include local src ref (`tsconfig.src.json`)
7. ✅ References sorted: workspace (topo) first, then external (alpha)
8. ✅ `bun run build` passes for ALL packages
9. ✅ `bun run check` passes for ALL packages
10. ✅ VERIFICATION_REPORT_P4.md created

---

## Key Commands

```bash
# Restore all configs
git checkout -- packages/

# Sync single package
bun run repo-cli tsconfig-sync --filter @beep/identity --verbose

# Build single package
bun run build --filter @beep/identity

# Check single package
bun run check --filter @beep/identity

# Full repo sync
bun run repo-cli tsconfig-sync

# Full repo build
bun run build

# Full repo check
bun run check
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Main fixes |
| `tooling/cli/src/commands/tsconfig-sync/utils/tsconfig-writer.ts` | May need updates |
| `tooling/utils/src/repo/Paths.ts` | Path format changes if needed |

---

## Output Deliverables

1. **Code fixes** in handler.ts and related files
2. **VERIFICATION_REPORT_P4.md** with:
   - All packages verified (with build/check results)
   - Any remaining issues documented
   - Summary of changes made
3. **Updated spec** if requirements changed

---

## Start Here

```bash
# 1. Read the handoff
cat specs/tsconfig-sync-command/handoffs/HANDOFF_P4.md

# 2. Read current handler
cat tooling/cli/src/commands/tsconfig-sync/handler.ts

# 3. Test current behavior on identity (will fail)
git checkout -- packages/common/identity/
bun run repo-cli tsconfig-sync --filter @beep/identity --verbose
bun run check --filter @beep/identity  # This should fail

# 4. Implement fixes

# 5. Test again (should pass)
git checkout -- packages/common/identity/
bun run repo-cli tsconfig-sync --filter @beep/identity --verbose
bun run check --filter @beep/identity  # This should now pass
```
