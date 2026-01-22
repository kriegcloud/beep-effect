# tsconfig-sync-completion

> Complete the tsconfig-sync command by implementing package.json dependency sync, refactoring for maintainability, and adding comprehensive tests.

**Status**: In Progress
**Priority**: High
**Complexity**: Medium (Score: 35)
**Parent Spec**: [tsconfig-sync-command](../tsconfig-sync-command/README.md)

---

## Background

The `tsconfig-sync` command was implemented through P0-P5 of the parent spec. While tsconfig reference syncing is complete for regular packages, **critical issues exist for Next.js apps** and **package.json dependency syncing was never implemented**.

### Current State Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| tsconfig.build.json sync | COMPLETE | Root-relative paths, topological sort |
| tsconfig.src.json sync | COMPLETE | Inherits from build |
| tsconfig.test.json sync | COMPLETE | Inherits from build |
| Next.js app tsconfig.json sync | **BROKEN** | Missing transitive dependency path aliases |
| package.json dependency sync | **NOT IMPLEMENTED** | Computed but not written |
| Version specifier enforcement | **NOT IMPLEMENTED** | Utility exists, never called |
| Code modularity | **NEEDS REFACTOR** | 772 LOC monolithic handler |
| Test coverage | **MINIMAL** | Only schema validation tests |

### CRITICAL: Next.js Path Alias Bug

The current implementation **only adds path aliases for direct dependencies** in Next.js apps. This causes build failures because:

1. **Next.js doesn't fully support TypeScript project references** — warns: "TypeScript project references are not fully supported. Attempting to build in incremental mode."
2. **Next.js relies solely on `paths` aliases** to resolve types at build time
3. **TypeScript `paths` in child configs override (not merge with) parent paths**

**Consequence**: When `apps/web` depends on `@beep/documents-server`, which depends on `@beep/documents-domain`, the app needs explicit path aliases for BOTH packages. Without them, Next.js build fails with cryptic "implicit any" type errors.

**Evidence**: Handler processes apps without transitive closure (lines 257-285):
```typescript
// CURRENT (BROKEN): Only direct deps
for (const dep of HashSet.toValues(beepDeps)) {  // beepDeps = direct deps only
  const aliases = buildSinglePathAlias(dep, pkgDirOption.value, appRelPath);
}

// REQUIRED: Transitive closure like regular packages (lines 455-460)
const closure = yield* computeTransitiveClosure(adjacencyList, pkg);
transitiveDeps = HashSet.union(directWorkspaceDeps, closure);
```

### Evidence of Missing Implementation

`tooling/cli/src/commands/tsconfig-sync/handler.ts` lines 534-536:
```typescript
const sortedDeps = yield* sortDependencies(allDeps, adjacencyList);
// TODO: In Phase 3, use mergedDeps to update package.json
void mergeSortedDeps(sortedDeps);  // <-- Result discarded!
```

The `package-json-writer.ts` utility (241 LOC) exists but is **never called** from the handler.

---

## Goals

1. **Implement package.json dependency sync** as specified in parent spec (lines 248-318)
2. **Refactor handler.ts** from monolithic 772 LOC to modular, testable functions
3. **Add comprehensive tests** for all sync modes
4. **Update documentation** in CLAUDE.md for the command

---

## Success Criteria

| Criterion | Verification |
|-----------|--------------|
| **Next.js builds succeed after sync** | `bun run build --filter @beep/web && bun run build --filter @beep/todox` |
| **Next.js apps have transitive path aliases** | Check `apps/web/tsconfig.json` includes deep deps like `@beep/shared-tables` |
| Package.json deps sorted | Workspace deps topological, external alphabetical |
| Transitive deps hoisted | Peer deps from dependencies added to devDependencies |
| Version specifiers enforced | `workspace:^` for internal, `catalog:` for external |
| Handler < 300 LOC | Extracted functions for each concern |
| Test coverage > 80% | Unit tests for each extracted function |
| All existing tests pass | `bun run test --filter @beep/repo-cli` |
| Check mode validates deps | `--check` reports package.json drift |
| Dry-run shows dep changes | `--dry-run` previews package.json updates |

---

## Phases

### Phase 0: Next.js Transitive Dependency Fix (CRITICAL)

**Objective**: Fix the broken Next.js app path alias generation to include transitive dependencies.

**Root Cause**: `processNextJsApps` (lines 202-354) only iterates over direct dependencies from `package.json`. It does NOT compute transitive closure like regular packages do (lines 455-460).

**Tasks**:
1. Pass `adjacencyList` to `processNextJsApps` function
2. Compute transitive closure for each app's dependencies
3. Build path aliases for ALL transitive dependencies (not just direct)
4. Build references for ALL transitive dependencies
5. Add integration test: verify `apps/web` tsconfig includes path aliases for deep transitive deps

**Implementation**:
```typescript
// In processNextJsApps, after reading direct deps:
const beepDeps = yield* readAppDependencies(appDir);

// ADD: Compute transitive closure
const transitiveDeps = yield* F.pipe(
  HashSet.toValues(beepDeps),
  A.flatMap((dep) => {
    const closure = yield* computeTransitiveClosure(adjacencyList, dep);
    return [dep, ...HashSet.toValues(closure)];
  }),
  HashSet.fromIterable
);

// CHANGE: Use transitiveDeps instead of beepDeps for path aliases AND references
for (const dep of HashSet.toValues(transitiveDeps)) {
  // ... build path aliases
}
```

**Verification**:
```bash
# After fix, sync should add missing transitive deps
bun run repo-cli tsconfig-sync --filter @beep/web --dry-run --verbose

# Build must succeed
bun run build --filter @beep/web
bun run build --filter @beep/todox

# Check mode should pass
bun run repo-cli tsconfig-sync --check
```

**Success Criteria**:
- `apps/web/tsconfig.json` has path aliases for `@beep/documents-domain`, `@beep/shared-tables`, etc.
- `apps/todox/tsconfig.json` has path aliases for `@beep/types`, `@beep/invariant`, etc.
- Both Next.js apps build without type errors
- `--check` mode passes on a freshly synced repo

---

### Phase 1: Package.json Dependency Sync

**Objective**: Implement the missing dependency sorting and writing functionality.

**Tasks**:
1. Replace `void mergeSortedDeps(sortedDeps)` with actual package.json writing
2. Call `writePackageJsonDeps` for `dependencies`, `devDependencies`, `peerDependencies`
3. Implement transitive dependency hoisting (add transitive peer deps to devDependencies)
4. Call `enforceVersionSpecifiers` before sorting
5. Add `--check` reporting for package.json drift
6. Add `--dry-run` preview for package.json changes

**Spec Reference**: [tsconfig-sync-command README lines 248-318](../tsconfig-sync-command/README.md#technical-design)

**Verification**:
```bash
# Before: package.json deps unsorted
bun run repo-cli tsconfig-sync --dry-run --verbose

# After: shows sorted deps preview
bun run repo-cli tsconfig-sync --filter @beep/schema --dry-run

# Check mode should detect drift
bun run repo-cli tsconfig-sync --check
```

### Phase 2: Handler Refactoring

**Objective**: Break monolithic handler into testable, focused functions.

**Current Issues**:
- `tsconfigSyncHandler` is 772 LOC
- Mixed concerns: discovery, cycle detection, iteration, writing
- Complex inline path normalization (lines 567-639)
- Duplicated logic between package and app processing

**Extraction Plan**:

| New Function | Lines to Extract | Purpose |
|--------------|------------------|---------|
| `discoverWorkspace` | 369-404 | Find packages, build dependency graph |
| `detectCycles` | 405-430 | Cycle detection with reporting |
| `computePackageReferences` | 462-520 | Calculate refs for a single package |
| `normalizeReferencePaths` | 567-639 | Convert relative to root-relative |
| `syncPackageConfig` | 654-738 | Sync build/src/test configs for one package |
| `syncPackageJsonDeps` | NEW | Sync package.json dependencies |

**Target**: Handler orchestrates, functions execute. Handler < 300 LOC.

**Verification**:
```bash
bun run lint --filter @beep/repo-cli
bun run check --filter @beep/repo-cli
bun run test --filter @beep/repo-cli
```

### Phase 3: Comprehensive Testing

**Objective**: Add unit and integration tests for all functionality.

**Test Files to Create**:
- `test/commands/tsconfig-sync/discover.test.ts` - Workspace discovery
- `test/commands/tsconfig-sync/references.test.ts` - Reference computation
- `test/commands/tsconfig-sync/package-json.test.ts` - Dependency sync
- `test/commands/tsconfig-sync/integration.test.ts` - Full workflow tests

**Test Coverage Targets**:

| Component | Coverage Target |
|-----------|-----------------|
| Workspace discovery | 90% |
| Cycle detection | 100% |
| Reference computation | 90% |
| Package.json writer | 90% |
| Handler orchestration | 80% |

**Testing Patterns** (from `@beep/testkit`):
```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("sortDependencies places workspace deps first", () =>
  Effect.gen(function* () {
    const deps = { "@beep/schema": "workspace:^", "effect": "catalog:" };
    const sorted = yield* sortDependencies(deps, adjacencyList);
    // ... assertions
  })
);
```

### Phase 4: Documentation & Cleanup

**Objective**: Update documentation and remove dead code.

**Tasks**:
1. Add `tsconfig-sync` command to `tooling/cli/AGENTS.md`
2. Add `tsconfig-sync` to `CLAUDE.md` Commands Reference
3. Remove TODO comment at handler.ts:535
4. Archive parent spec handoffs (mark as complete)
5. Create VERIFICATION_REPORT documenting final state

---

## File Map

| File | Changes |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | P0: Fix processNextJsApps transitive deps; P1: Add package.json calls; P2: Refactor |
| `tooling/cli/src/commands/tsconfig-sync/utils/package-json-writer.ts` | P1: Integrate into handler |
| `tooling/cli/src/commands/tsconfig-sync/discover.ts` | P2: NEW - extracted discovery |
| `tooling/cli/src/commands/tsconfig-sync/references.ts` | P2: NEW - extracted ref computation |
| `tooling/cli/src/commands/tsconfig-sync/app-sync.ts` | P2: NEW - extracted Next.js app processing |
| `tooling/cli/test/commands/tsconfig-sync/*.test.ts` | P3: NEW - comprehensive tests |
| `tooling/cli/test/commands/tsconfig-sync/nextjs-transitive.test.ts` | P0/P3: NEW - transitive dep verification |
| `tooling/cli/AGENTS.md` | P4: Add tsconfig-sync documentation |

---

## Dependency Graph

```
Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4
(nextjs)    (pkg.json)  (refactor)  (tests)     (docs)
```

**Phase 0 is CRITICAL and must be completed first** — it fixes a build-breaking bug.
Subsequent phases must be executed sequentially. Phase 2 refactoring enables Phase 3 testing.

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing tsconfig sync | High | Run full check suite after each change |
| Dependency order bugs | Medium | Add property-based tests for sorting |
| Turborepo cascading errors | Medium | Test individual packages in isolation first |
| Next.js path alias regression | **Critical** | Add integration test that verifies `bun run build --filter @beep/web` succeeds after sync |
| Deep transitive chains | Medium | Test with packages that have 4+ levels of transitive deps |
| Circular dependency in apps | Low | Apps shouldn't have cycles; add detection anyway |

---

## References

- [Parent Spec: tsconfig-sync-command](../tsconfig-sync-command/README.md)
- [P5 Verification Report](../tsconfig-sync-command/handoffs/VERIFICATION_REPORT_P5.md)
- [Effect Testing Patterns](../../.claude/commands/patterns/effect-testing-patterns.md)
- [tooling-utils Graph utilities](../../tooling/utils/src/repo/Graph.ts)
- [tooling-utils DepSorter](../../tooling/utils/src/repo/DepSorter.ts)
