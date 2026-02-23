# Phase 1 Handoff: tsconfig-sync Command

> Context document for implementing Phase 1 - Core Command Implementation

**STATUS**: ✅ COMPLETE (2026-01-22)

---

## Phase 1 Summary

**Completed**:
- Command definition with all 5 options (`--check`, `--dry-run`, `--filter`, `--no-hoist`, `--verbose`)
- Handler orchestration using P0b utilities (no inline implementations)
- Input validation schemas (`TsconfigSyncInput`, `getSyncMode`)
- Command-specific errors (`DriftDetectedError`, `TsconfigSyncError`)
- Command registered in CLI

**Files Created**:
- `tooling/cli/src/commands/tsconfig-sync/index.ts` (~82 LOC)
- `tooling/cli/src/commands/tsconfig-sync/handler.ts` (~166 LOC)
- `tooling/cli/src/commands/tsconfig-sync/schemas.ts` (~30 LOC)
- `tooling/cli/src/commands/tsconfig-sync/errors.ts` (~25 LOC)

**Verification Results**:
- ✅ `bun run repo-cli tsconfig-sync --help` shows command with all options
- ✅ `bun run repo-cli tsconfig-sync --dry-run` runs successfully (44 packages would be updated)
- ✅ `bun run repo-cli tsconfig-sync --verbose` shows per-package reference counts
- ✅ `bun run lint --filter @beep/repo-cli` passes for tsconfig-sync files
- ⚠️ Type check has pre-existing TS35 warnings in other commands (not from this change)

---

## Prerequisites

### P0b: Utility Improvements ✅ COMPLETE

**Status**: ✅ Complete (2026-01-22)

P0b added reusable utilities to `@beep/tooling-utils`:

| Utility | File | Purpose | Status |
|---------|------|---------|--------|
| `topologicalSort` | `repo/Graph.ts` | Kahn's algorithm (extracted from topo-sort.ts) | ✅ |
| `computeTransitiveClosure` | `repo/Graph.ts` | Recursive dep collection | ✅ |
| `detectCycles` | `repo/Graph.ts` | Return cycle paths | ✅ |
| `CyclicDependencyError` | `repo/Graph.ts` | Enhanced with cycles array | ✅ |
| `sortDependencies` | `repo/DepSorter.ts` | Topo + alpha sorting | ✅ |
| `mergeSortedDeps` | `repo/DepSorter.ts` | Combine sorted deps to Record | ✅ |
| `enforceVersionSpecifiers` | `repo/DepSorter.ts` | Ensure workspace:^ / catalog: | ✅ |
| `buildRootRelativePath` | `repo/Paths.ts` | Root-relative path calculation | ✅ |
| `calculateDepth` | `repo/Paths.ts` | Directory depth from root | ✅ |
| `normalizePath` | `repo/Paths.ts` | Remove leading ./ and trailing / | ✅ |
| `getDirectory` | `repo/Paths.ts` | Get directory containing file | ✅ |

**Verification completed**:
- ✅ `bun run check --filter @beep/tooling-utils` passes
- ✅ `bun run test --filter @beep/tooling-utils` passes (41 tests)
- ✅ `bun run repo-cli topo-sort` outputs 60 packages correctly

---

## Implementation Details

### Key Technical Decisions

1. **Filter option handling**: Used `O.getOrUndefined(filter)` to convert `Option<string>` to `string | undefined` for the input schema

2. **Error catching strategy**: Used `Effect.catchIf` with predicate for `DriftDetectedError` instead of `catchTag` due to identity string format:
   ```typescript
   Effect.catchIf(
     (err): err is DriftDetectedError =>
       "_tag" in err && (err as { _tag: string })._tag.endsWith("DriftDetectedError"),
     (err) => /* handle */
   )
   ```

3. **Build config discovery**: Created `findBuildConfig` helper to extract `tsconfig.build.json` from the path array returned by `collectTsConfigPaths`:
   ```typescript
   const findBuildConfig = (paths: A.NonEmptyReadonlyArray<string>): O.Option<string> =>
     F.pipe(paths, A.findFirst(Str.endsWith("tsconfig.build.json")));
   ```

4. **Adjacency list building**: Handler builds adjacency list from dependency index for graph operations, skipping `@beep/root` synthetic package

### Utilities Used from P0b

The handler uses all planned P0b utilities:
- `buildRepoDependencyIndex` - workspace discovery
- `collectTsConfigPaths` - tsconfig discovery
- `detectCycles` - cycle detection
- `computeTransitiveClosure` - transitive dep hoisting
- `sortDependencies` - topological + alphabetical sorting
- `mergeSortedDeps` - combine sorted deps
- `buildRootRelativePath` - reference path calculation

### Current Limitations (Phase 2 Scope)

The handler currently:
- ✅ Computes expected tsconfig references
- ✅ Detects cycles
- ✅ Reports drift in check mode
- ❌ Does NOT write changes to tsconfig files (Phase 2)
- ❌ Does NOT update package.json dependencies (Phase 2)
- ❌ Does NOT have tests (Phase 2)

---

## Success Criteria ✅ COMPLETE

### P0b Prerequisite ✅ VERIFIED

- [x] `bun run check --filter @beep/tooling-utils` passes
- [x] `bun run test --filter @beep/tooling-utils` passes (41 tests)
- [x] `bun run repo-cli topo-sort` still works (topologicalSort extracted)

### P1 Success ✅ VERIFIED

- [x] `bun run repo-cli tsconfig-sync --help` shows command with all options
- [x] `bun run repo-cli tsconfig-sync --dry-run` runs without error
- [x] Handler correctly uses P0b utilities (no inline implementations)
- [x] Lint passes for tsconfig-sync files

### Known Issues

- Pre-existing TS35 warnings in other CLI commands (`docgen`, `env`, `sync`, `topo-sort`) cause type check to exit with code 2. These warnings existed before Phase 1 and are unrelated to tsconfig-sync implementation.

---

## Phase 2 Scope

Phase 2 will implement:
1. **File writing** - Actually write changes to tsconfig files using `jsonc-parser`
2. **Package.json updates** - Update dependencies with sorted, hoisted deps
3. **Tests** - Effect-based tests using `@beep/testkit`

See [HANDOFF_P2.md](./HANDOFF_P2.md) for Phase 2 context.

---

## Reference Files

### Created in Phase 1

| File | Purpose |
|------|---------|
| `tooling/cli/src/commands/tsconfig-sync/index.ts` | Command definition with options |
| `tooling/cli/src/commands/tsconfig-sync/handler.ts` | Orchestration using P0b utilities |
| `tooling/cli/src/commands/tsconfig-sync/schemas.ts` | Input validation |
| `tooling/cli/src/commands/tsconfig-sync/errors.ts` | Command-specific errors |

### @beep/tooling-utils - P0b Additions

| File | Purpose |
|------|---------|
| `tooling/utils/src/repo/Graph.ts` | `topologicalSort`, `computeTransitiveClosure`, `detectCycles` |
| `tooling/utils/src/repo/DepSorter.ts` | `sortDependencies`, `enforceVersionSpecifiers` |
| `tooling/utils/src/repo/Paths.ts` | `buildRootRelativePath`, `calculateDepth` |

### CLI Patterns

| File | Purpose |
|------|---------|
| `tooling/cli/src/commands/create-slice/` | Reference implementation |
| `tooling/cli/src/index.ts` | Command registration |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [README.md](../README.md) | Spec overview |
| [P0_UTILITY_IMPROVEMENTS.md](./P0_UTILITY_IMPROVEMENTS.md) | P0b utility analysis |
| [HANDOFF_P2.md](./HANDOFF_P2.md) | Phase 2 context (Next) |
| [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md) | Phase 2 start prompt |
