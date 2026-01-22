# Phase 1 Handoff: tsconfig-sync Command

> Context document for implementing Phase 1 - Core Command Implementation

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

## Phase 0a Summary

**Completed**:
- Spec scaffolding with full design document (README.md)
- Research on existing CLI patterns (create-slice, topo-sort)
- Design decisions documented for all major features
- Templates created for handler and tests
- P0b utility improvement analysis

**Key Decisions Made**:
- Command name: `tsconfig-sync` (kebab-case)
- Transitive hoisting: fully recursive
- Version specifiers: `workspace:^` (internal), `catalog:` (external)
- Reference paths: root-relative (always traverse to repo root)
- Reference sorting: topological (deps before dependents)

---

## Phase 1 Objectives

Implement the command using `@beep/tooling-utils` utilities (both existing AND P0b additions).

> **CRITICAL**: P0b must be complete first. Verify: `bun run check --filter @beep/tooling-utils`

### Work Items (After P0b)

| # | Item | Priority | Est. LOC |
|---|------|----------|----------|
| 1 | Command definition (`index.ts`) | P0 | ~40 |
| 2 | Handler orchestration (`handler.ts`) | P0 | ~80 |
| 3 | Schemas & errors (`schemas.ts`, `errors.ts`) | P0 | ~35 |
| 4 | Basic tests | P1 | ~150 |
| **Total** | | | **~305** |

**Provided by @beep/tooling-utils (existing)**:
- `resolveWorkspaceDirs` - workspace discovery
- `buildRepoDependencyIndex` - dependency graph
- `collectTsConfigPaths` - tsconfig discovery

**Provided by @beep/tooling-utils (P0b additions)**:
- `topologicalSort` - Kahn's algorithm
- `computeTransitiveClosure` - recursive deps
- `detectCycles` - cycle detection
- `sortDependencies` - topo + alpha sorting
- `buildRootRelativePath` - path calculation

---

## Implementation Patterns

### Command Definition Pattern

Reference: `tooling/cli/src/commands/create-slice/index.ts`

```typescript
import * as Command from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import { handler } from "./handler.js";

const check = Options.boolean("check").pipe(
  Options.withDescription("Validate without modifying files (CI mode)")
);

const dryRun = Options.boolean("dry-run").pipe(
  Options.withDescription("Show changes without applying")
);

const filter = Options.text("filter").pipe(
  Options.optional,
  Options.withDescription("Sync only specified package (@beep/name)")
);

const noHoist = Options.boolean("no-hoist").pipe(
  Options.withDescription("Skip transitive dependency hoisting")
);

const verbose = Options.boolean("verbose").pipe(
  Options.withDescription("Show detailed output")
);

export const tsconfigSync = Command.make(
  "tsconfig-sync",
  { check, dryRun, filter, noHoist, verbose },
  (options) => handler(options)
).pipe(
  Command.withDescription("Sync tsconfig references and package.json dependencies")
);
```

### Error Definition Pattern

Reference: `tooling/cli/src/commands/create-slice/errors.ts`

```typescript
import * as S from "effect/Schema";

export class CircularDependencyError extends S.TaggedError<CircularDependencyError>()(
  "CircularDependencyError",
  { cycles: S.Array(S.Array(S.String)) }
) {}

export class DriftDetectedError extends S.TaggedError<DriftDetectedError>()(
  "DriftDetectedError",
  { driftCount: S.Number, details: S.String }
) {}

export class PackageNotFoundError extends S.TaggedError<PackageNotFoundError>()(
  "PackageNotFoundError",
  { packageName: S.String }
) {}
```

### Using @beep/tooling-utils (After P0b)

> **All complexity handled by utilities!** Handler is simple orchestration:

```typescript
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
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
  sortDependencies,
  buildRootRelativePath
} from "@beep/tooling-utils/repo";
import { FsUtils, FsUtilsLive } from "@beep/tooling-utils/FsUtils";

export const handler = Effect.gen(function* () {
  // 1. Discovery (existing)
  const workspaces = yield* resolveWorkspaceDirs;
  const depIndex = yield* buildRepoDependencyIndex;
  const tsconfigPaths = yield* collectTsConfigPaths;
  const repoRoot = yield* findRepoRoot;

  // 2. Cycle detection (P0b)
  const cycles = yield* detectCycles(depIndex);
  if (cycles.length > 0) {
    return yield* Effect.fail(new CircularDependencyError({ cycles }));
  }

  // 3. Compute transitive closure for each package (P0b)
  const transitiveMap = yield* computeTransitiveClosureAll(depIndex);

  // 4. Sort dependencies (P0b)
  const sortedDeps = yield* sortDependencies(deps, depIndex);

  // 5. Build root-relative references (P0b)
  const references = buildRootRelativePath(sourcePath, targetPath);

  // 6. Apply changes (check/dry-run/sync mode)
  // ...
}).pipe(Effect.provide(FsUtilsLive));
```

---

## Reference Files

### @beep/tooling-utils - Existing

| File | Purpose | Replaces |
|------|---------|----------|
| `tooling/utils/src/repo/Workspaces.ts` | `resolveWorkspaceDirs` | workspace-parser.ts |
| `tooling/utils/src/repo/DependencyIndex.ts` | `buildRepoDependencyIndex` | dependency-graph.ts |
| `tooling/utils/src/repo/TsConfigIndex.ts` | `collectTsConfigPaths` | reference-resolver.ts |
| `tooling/utils/src/repo/Root.ts` | `findRepoRoot` | Root discovery |
| `tooling/utils/src/FsUtils.ts` | File operations | Raw fs usage |
| `tooling/utils/AGENTS.md` | Full API guide | - |

### @beep/tooling-utils - P0b Additions

| File | Purpose | Replaces |
|------|---------|----------|
| `tooling/utils/src/repo/Graph.ts` | `topologicalSort`, `computeTransitiveClosure`, `detectCycles` | transitive-closure.ts, cycle-detector.ts |
| `tooling/utils/src/repo/DepSorter.ts` | `sortDependencies`, `enforceVersionSpecifiers` | dep-sorter.ts |
| `tooling/utils/src/repo/Paths.ts` | `buildRootRelativePath`, `calculateDepth` | reference-path-builder.ts |

### CLI Patterns

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `tooling/cli/src/commands/create-slice/index.ts` | Command definition | Options, Command.make |
| `tooling/cli/src/commands/create-slice/handler.ts` | Handler structure | Effect.gen, Layer composition |
| `tooling/cli/src/commands/create-slice/errors.ts` | Error types | S.TaggedError |
| `tooling/cli/src/commands/topo-sort.ts` | Topological sort | Kahn's algorithm |
| `tooling/cli/src/commands/create-slice/utils/config-updater.ts` | Config updates | jsonc-parser |

---

## Verification Steps

After each work item, run:

```bash
# Type check
bun run check --filter @beep/repo-cli

# Lint
bun run lint --filter @beep/repo-cli

# Test (when tests exist)
bun run test --filter @beep/repo-cli

# Manual verification
bun run repo-cli tsconfig-sync --help
bun run repo-cli tsconfig-sync --dry-run
```

---

## Success Criteria

### P0b Prerequisite (verify first)

- [ ] `bun run check --filter @beep/tooling-utils` passes
- [ ] `bun run repo-cli topo-sort` still works (topologicalSort extracted)

### P1 Success

- [ ] `bun run repo-cli tsconfig-sync --help` shows command with all options
- [ ] `bun run repo-cli tsconfig-sync --dry-run` runs without error
- [ ] `bun run repo-cli tsconfig-sync --check` validates current state
- [ ] Type check passes: `bun run check --filter @beep/repo-cli`
- [ ] Lint passes: `bun run lint --filter @beep/repo-cli`
- [ ] Handler correctly uses P0b utilities (no inline implementations)

---

## Known Issues & Gotchas

1. **Effect FileSystem**: NEVER use Node.js `fs` module. Always use `@effect/platform` FileSystem service.

2. **JSON with Comments**: Use `jsonc-parser` for tsconfig files to preserve comments.

3. **Path Aliases**: All imports should use `@beep/*` aliases, never relative `../../../`.

4. **Layer Composition**: Handler needs `BunFileSystem.layer` for FileSystem service.

5. **Command Registration**: After creating command, register in `tooling/cli/src/index.ts`.

---

## Context Budget Breakdown

| Memory Type | Token Budget | Actual | Content |
|-------------|--------------|--------|---------|
| Working | ≤2,000 | ~800 | Task list, success criteria, blocking issues |
| Episodic | ≤1,000 | ~300 | Phase 0 summary, design decisions |
| Semantic | ≤500 | ~100 | Project constants (CLI structure, Effect patterns) |
| Procedural | Links only | 0 | Documentation references |
| **Total** | **≤4,000** | **~1,200** | Well under degradation threshold |

---

## KV-Cache Optimization

This handoff uses stable section headers and append-only design:
- Phase Context (stable prefix)
- Work Items (append-only)
- Success Criteria (stable)
- Memory Breakdown (stable)

**Optimization Notes**:
- Timestamps placed at END of reflection entries to preserve prefix stability
- Section headers remain stable across phases (no renaming mid-spec)
- New content appended, never inserted mid-section

Stable prefixes enable KV-cache reuse across sessions.
