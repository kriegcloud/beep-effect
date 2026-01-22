# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Pre-requisite: Phase 0 Complete

**VERIFY P0 is done before starting P1**:
```bash
# All three must pass
bun run build --filter @beep/web
bun run build --filter @beep/todox
bun run repo-cli tsconfig-sync --check
```

If any fail, complete P0 first (see `HANDOFF_P0.md`).

---

## Prompt

You are implementing Phase 1 of the `tsconfig-sync-completion` spec: **Package.json Dependency Sync**.

### Context

The `tsconfig-sync` command currently syncs tsconfig references but **does not sync package.json dependencies**. The sorting utilities exist and are tested, but the handler discards the results:

```typescript
// handler.ts lines 534-536
const sortedDeps = yield* sortDependencies(allDeps, adjacencyList);
// TODO: In Phase 3, use mergedDeps to update package.json
void mergeSortedDeps(sortedDeps);  // <-- FIX THIS
```

### Your Mission

1. **Replace the void call** at handler.ts:536 with actual package.json writing
2. **Integrate transitive deps** into the sorting (currently computed but not used for pkg.json)
3. **Call enforceVersionSpecifiers** to fix `workspace:^` and `catalog:` specifiers
4. **Support all three modes**: sync, check, dry-run for package.json
5. **Remove the TODO comment** when complete

### Critical Patterns

**Use existing utilities - don't reinvent**:
```typescript
import { writePackageJsonDeps, checkPackageJsonDeps, computeDependencyDiff, readPackageJson } from "./utils/package-json-writer";
import { sortDependencies, mergeSortedDeps, enforceVersionSpecifiers } from "@beep/tooling-utils/repo/DepSorter";
```

**Match the sync mode pattern already used for tsconfig**:
```typescript
const syncMode = getSyncMode(input);  // Already exists

if (syncMode === "check") {
  // Validate deps without writing
} else if (syncMode === "dry-run") {
  // Report what would change
} else {
  // Write sorted deps
}
```

**Sorting order** (from spec):
1. Workspace packages (`@beep/*`) in topological order
2. External packages alphabetically

### Reference Files

Read these files to understand the implementation:
- `tooling/cli/src/commands/tsconfig-sync/handler.ts` - Main handler (modify around line 534)
- `tooling/cli/src/commands/tsconfig-sync/utils/package-json-writer.ts` - Utilities to use
- `tooling/utils/src/repo/DepSorter.ts` - Sorting algorithms
- `specs/tsconfig-sync-completion/handoffs/HANDOFF_P1.md` - Full implementation plan

### Verification

After implementation:
```bash
# Test dry-run mode
bun run repo-cli tsconfig-sync --dry-run --filter @beep/schema --verbose

# Apply changes
bun run repo-cli tsconfig-sync --filter @beep/schema

# Verify check mode passes
bun run repo-cli tsconfig-sync --check --filter @beep/schema

# Ensure existing tests still pass
bun run test --filter @beep/repo-cli
```

### Success Criteria

- [ ] `void mergeSortedDeps(...)` replaced with actual write calls
- [ ] `--check` mode detects unsorted package.json dependencies
- [ ] `--dry-run` mode shows what would change in package.json
- [ ] Sync mode writes sorted dependencies to package.json
- [ ] Version specifiers enforced (`workspace:^`, `catalog:`)
- [ ] TODO comment removed from handler.ts:535
- [ ] All existing tests pass
- [ ] tsconfig sync behavior unchanged

### Handoff Document

Read full implementation details in: `specs/tsconfig-sync-completion/handoffs/HANDOFF_P1.md`
