# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 implementation.

---

## Prompt

You are implementing Phase 1 of the `tsconfig-sync` command spec.

### Context

**Phase 0a (Scaffolding)** ✅ Complete
**Phase 0b (Utility Improvements)** ✅ Complete (2026-01-22)

P0b added reusable utilities to `@beep/tooling-utils` that handle most complexity:

| Utility | File | Purpose |
|---------|------|---------|
| `topologicalSort` | `repo/Graph.ts` | Kahn's algorithm |
| `computeTransitiveClosure` | `repo/Graph.ts` | Recursive dep collection |
| `detectCycles` | `repo/Graph.ts` | Return cycle paths |
| `CyclicDependencyError` | `repo/Graph.ts` | Error with cycles array |
| `sortDependencies` | `repo/DepSorter.ts` | Topo + alpha sorting |
| `mergeSortedDeps` | `repo/DepSorter.ts` | Combine sorted deps to Record |
| `enforceVersionSpecifiers` | `repo/DepSorter.ts` | Ensure workspace:^ / catalog: |
| `buildRootRelativePath` | `repo/Paths.ts` | Root-relative path calculation |
| `calculateDepth` | `repo/Paths.ts` | Directory depth from root |
| `normalizePath` | `repo/Paths.ts` | Remove leading ./ and trailing / |
| `getDirectory` | `repo/Paths.ts` | Get directory containing file |

Spec design is finalized:
- Command: `tsconfig-sync` with `--check`, `--dry-run`, `--filter`, `--no-hoist`, `--verbose` flags
- Features: tsconfig reference sync, transitive dep hoisting, dep sorting, root-relative paths
- Complexity: 48 (High)

### Your Mission

Implement the core command structure in `tooling/cli/src/commands/tsconfig-sync/`:

1. **index.ts** (~40 LOC) - Command definition with all options
2. **handler.ts** (~80 LOC) - Effect-based handler using P0b utilities
3. **schemas.ts** (~20 LOC) - Input validation schemas
4. **errors.ts** (~15 LOC) - Command-specific error types (use CyclicDependencyError from @beep/tooling-utils)

**IMPORTANT**: Use the P0b utilities from `@beep/tooling-utils`! Do NOT reimplement:
- ~~workspace-parser.ts~~ → Use `resolveWorkspaceDirs` from @beep/tooling-utils
- ~~reference-path-builder.ts~~ → Use `buildRootRelativePath` from @beep/tooling-utils
- ~~transitive-closure.ts~~ → Use `computeTransitiveClosure` from @beep/tooling-utils
- ~~dep-sorter.ts~~ → Use `sortDependencies` from @beep/tooling-utils
- ~~cycle-detector.ts~~ → Use `detectCycles` from @beep/tooling-utils

### Critical Patterns

**Effect imports** (REQUIRED):
```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import { FileSystem } from "@effect/platform";
```

**Using P0b utilities** (REQUIRED):
```typescript
import {
  // Existing utilities
  resolveWorkspaceDirs,
  buildRepoDependencyIndex,
  collectTsConfigPaths,
  findRepoRoot,
  // P0b utilities
  topologicalSort,
  computeTransitiveClosure,
  detectCycles,
  CyclicDependencyError,
  sortDependencies,
  mergeSortedDeps,
  enforceVersionSpecifiers,
  buildRootRelativePath,
  calculateDepth,
} from "@beep/tooling-utils";
```

**Handler pattern** (using P0b utilities):
```typescript
export const handler = Effect.gen(function* () {
  // 1. Discovery (existing utilities)
  const workspaces = yield* resolveWorkspaceDirs;
  const depIndex = yield* buildRepoDependencyIndex;
  const tsconfigPaths = yield* collectTsConfigPaths;
  const repoRoot = yield* findRepoRoot;

  // 2. Cycle detection (P0b)
  const cycles = yield* detectCycles(depGraph);
  if (cycles.length > 0) {
    return yield* Effect.fail(new CyclicDependencyError({ packages: [...], cycles }));
  }

  // 3. Compute transitive closure (P0b)
  const transitiveDeps = yield* computeTransitiveClosure(depGraph, packageName);

  // 4. Sort dependencies (P0b)
  const sortedDeps = yield* sortDependencies(deps, depGraph);
  const mergedDeps = mergeSortedDeps(sortedDeps);

  // 5. Build root-relative references (P0b)
  const refPath = buildRootRelativePath(sourcePath, targetPath);

  // 6. Apply changes (check/dry-run/sync mode)
  // ...
});
```

**FileSystem usage** (REQUIRED):
```typescript
const fs = yield* FileSystem.FileSystem;
const content = yield* fs.readFileString(path);
```

### Reference Files

- `tooling/cli/src/commands/create-slice/` - Canonical command pattern
- `tooling/cli/src/commands/topo-sort.ts` - Updated to use Graph.ts utilities
- `tooling/utils/src/repo/Graph.ts` - P0b graph utilities
- `tooling/utils/src/repo/DepSorter.ts` - P0b sorting utilities
- `tooling/utils/src/repo/Paths.ts` - P0b path utilities
- `specs/tsconfig-sync-command/templates/` - Handler and test templates

### Verification

After each file:
```bash
bun run check --filter @beep/repo-cli
bun run lint --filter @beep/repo-cli
```

After all files:
```bash
bun run repo-cli tsconfig-sync --help
bun run repo-cli tsconfig-sync --dry-run
```

### Success Criteria

- [ ] Command shows in `--help` with all options
- [ ] `--dry-run` executes without error
- [ ] Handler uses P0b utilities (no inline implementations)
- [ ] Type check passes
- [ ] Lint passes

### Handoff Document

Read full context in: `specs/tsconfig-sync-command/handoffs/HANDOFF_P1.md`
