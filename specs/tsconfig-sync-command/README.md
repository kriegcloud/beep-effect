# tsconfig-sync-command

> CLI command to automate tsconfig reference, path alias, and dependency maintenance

**Complexity Score**: 48 (High) - updated to include transitive dependency hoisting
**Status**: ARCHIVED

---

## Status: ARCHIVED

This spec was completed through Phase 5. Additional completion work is documented in:
- [tsconfig-sync-completion](../tsconfig-sync-completion/README.md)

The command is now feature-complete and production-ready.

---

---

## Purpose

Add a `tsconfig-sync` command to `@beep/repo-cli` that automatically maintains:
1. **tsconfig files** - references and path aliases
2. **package.json dependencies** - transitive dependency hoisting and sorting

Eliminates manual updates when:
- Creating new packages
- Adding/removing dependencies in package.json
- Moving or renaming packages

---

## Problem Statement

Currently, developers must manually synchronize multiple locations when package dependencies change:

1. **package.json** - `dependencies` / `devDependencies` / `peerDependencies`
2. **tsconfig.base.jsonc** - `compilerOptions.paths` aliases
3. **Per-package tsconfig files** - `references` arrays
4. **Transitive dependencies** - peer deps of dependencies must be manually added

This manual process is:
- Error-prone (missing references cause confusing TypeScript errors)
- Time-consuming (requires understanding tsconfig hierarchy AND dependency graphs)
- Inconsistent (transitive deps often missing, causing resolution failures)

---

## Scope

### In Scope

| Feature | Description |
|---------|-------------|
| **Package.json → tsconfig sync** | Add tsconfig references for `@beep/*` dependencies |
| **Path alias management** | Add/remove aliases in `tsconfig.base.jsonc` |
| **Transitive dependency hoisting** | Automatically add all transitive peer/dev deps to consumer |
| **Dependency sorting** | Sort deps: workspace (topological) then third-party (alphabetical) |
| **Circular dependency detection** | Detect and report cycles in the dependency graph |
| **Validation mode** | `--check` flag to validate without modifying files |
| **Dry-run mode** | `--dry-run` flag to preview changes |
| **Per-package scope** | `--filter @beep/package` to sync specific package |

### Out of Scope

- Runtime module resolution changes
- Build order optimization (use `topo-sort` for that)

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Hoisting depth** | Fully recursive | A→B→C means A gets all C's deps. Matches TypeScript project references. |
| **Dependency type mapping** | Both peer AND dev | peerDeps for runtime, devDeps for development. Both need complete visibility. |
| **Third-party handling** | Include all | Hoist both `@beep/*` and third-party. TypeScript needs all type definitions. |
| **Version specifiers** | Enforced format | `workspace:^` for internal, `catalog:` for external. No explicit versions. |
| **Reference paths** | Root-relative | All paths traverse up to repo root, then use full path. Consistent and explicit. |
| **Reference sorting** | Topological | Dependencies appear before dependents in references array. |

### Version Specifier Enforcement

The command enforces consistent version specifiers:

```
@beep/*  packages → "workspace:^"
external packages → "catalog:"
```

If a package has explicit versions (e.g., `"effect": "^3.0.0"`), the command will:
1. Report in `--check` mode
2. Fix to `catalog:` in sync mode

### Root-Relative Reference Paths

All tsconfig `references` use root-relative paths for consistency:

**Example**: `packages/calendar/server/tsconfig.build.json`

```json
{
  "references": [
    { "path": "../../../packages/shared/domain/tsconfig.build.json" },
    { "path": "../../../packages/common/schema/tsconfig.build.json" },
    { "path": "../../../packages/calendar/domain/tsconfig.build.json" },
    { "path": "../../../packages/calendar/tables/tsconfig.build.json" },
    { "path": "../../../packages/shared/server/tsconfig.build.json" }
  ]
}
```

**Why root-relative?**
- Consistent pattern regardless of package nesting depth
- Easy to understand: always `../` up to root, then full path from root
- Avoids confusion with minimal relative paths like `../domain`

**Path calculation**:
```
From: packages/calendar/server/tsconfig.build.json
To:   packages/calendar/domain/tsconfig.build.json

1. Count depth from root: packages/calendar/server = 3 levels
2. Prepend "../" × 3 = "../../../"
3. Append target from root: "packages/calendar/domain/tsconfig.build.json"
4. Result: "../../../packages/calendar/domain/tsconfig.build.json"
```

### Topologically Sorted References

tsconfig `references` arrays are sorted topologically (deps before dependents):

```json
{
  "references": [
    // Dependencies first (leaf packages)
    { "path": "../../../packages/common/schema/tsconfig.build.json" },
    { "path": "../../../packages/shared/domain/tsconfig.build.json" },
    // Then packages that depend on the above
    { "path": "../../../packages/calendar/domain/tsconfig.build.json" },
    { "path": "../../../packages/calendar/tables/tsconfig.build.json" },
    // Then higher-level packages
    { "path": "../../../packages/shared/server/tsconfig.build.json" }
  ]
}
```

This ensures TypeScript processes references in correct dependency order during builds.

---

## Command Interface

```bash
# Sync all packages (tsconfig + package.json deps)
bun run repo-cli tsconfig-sync

# Sync specific package
bun run repo-cli tsconfig-sync --filter @beep/iam-server

# Validation only (CI/pre-commit)
bun run repo-cli tsconfig-sync --check

# Preview changes without writing
bun run repo-cli tsconfig-sync --dry-run

# Skip transitive hoisting (tsconfig-only mode)
bun run repo-cli tsconfig-sync --no-hoist

# Verbose output
bun run repo-cli tsconfig-sync --verbose
```

---

## Success Criteria

### tsconfig Sync
- [ ] Command syncs package.json `dependencies` → tsconfig `references`
- [ ] Command updates `tsconfig.base.jsonc` path aliases for new packages
- [ ] Circular dependencies detected and reported
- [ ] Preserves comments/formatting in tsconfig files (using jsonc-parser)
- [ ] References use root-relative paths (`../../../packages/...`)
- [ ] References are topologically sorted (deps before dependents)

### Transitive Dependency Hoisting
- [ ] All `@beep/*` transitive peer deps are added to consumer's peer/dev deps
- [ ] All third-party transitive peer deps are added to consumer's peer/dev deps
- [ ] Hoisting is fully recursive (A→B→C means A gets C's deps)

### Version Specifier Enforcement
- [ ] All `@beep/*` packages use `workspace:^`
- [ ] All third-party packages use `catalog:`
- [ ] Explicit versions (e.g., `"^3.0.0"`) are corrected automatically
- [ ] `--check` mode reports specifier violations

### Dependency Sorting
- [ ] Workspace packages (`@beep/*`) sorted topologically (deps before dependents)
- [ ] Third-party packages sorted alphabetically
- [ ] Sorting applies to `peerDependencies`, `devDependencies`, `dependencies`

### CLI Modes
- [ ] `--check` mode validates without modification (exit code 1 on drift)
- [ ] `--dry-run` mode shows planned changes
- [ ] `--filter` scopes to specific package
- [ ] `--no-hoist` skips transitive dep hoisting

### Quality
- [ ] Tests cover add/remove/circular/hoisting scenarios
- [ ] CLAUDE.md updated with command documentation
- [ ] Command completes full repo sync in <10 seconds

---

## Verification

### Pre-Implementation Discovery

```bash
# Count packages in workspace
find packages -name "package.json" -not -path "*/node_modules/*" | wc -l

# Check current tsconfig state
find packages -name "tsconfig.build.json" -exec grep -l "references" {} \; | head -5

# Verify CLI package builds
bun run check --filter @beep/repo-cli
```

### Post-Implementation Verification

```bash
# Command exists and shows help
bun run repo-cli tsconfig-sync --help

# Dry-run succeeds
bun run repo-cli tsconfig-sync --dry-run

# Check mode validates (should exit 0 if in sync)
bun run repo-cli tsconfig-sync --check

# Full sync (if needed)
bun run repo-cli tsconfig-sync

# Verify types still pass after sync
bun run check
```

### CI Integration

```yaml
# Add to CI workflow
- name: Validate tsconfig sync
  run: bun run repo-cli tsconfig-sync --check
```

---

## Technical Design

### Transitive Dependency Hoisting

When package A depends on `@beep/schema`, the command:

1. Collects all `peerDependencies` from `@beep/schema`
2. Recursively collects peer deps from those deps
3. Adds them to A's `peerDependencies` AND `devDependencies`
4. Preserves version specifiers (`workspace:^`, `catalog:`)

**Example**: If `@beep/new-package` depends on `@beep/schema`:

```json
// @beep/schema/package.json
{
  "peerDependencies": {
    "@beep/invariant": "workspace:^",
    "@beep/identity": "workspace:^",
    "@beep/utils": "workspace:^",
    "effect": "catalog:",
    "drizzle-orm": "catalog:"
  }
}
```

Results in `@beep/new-package/package.json`:

```json
{
  "peerDependencies": {
    // Workspace packages first (topological order)
    "@beep/invariant": "workspace:^",
    "@beep/identity": "workspace:^",
    "@beep/utils": "workspace:^",
    "@beep/schema": "workspace:^",
    // Third-party packages (alphabetical)
    "drizzle-orm": "catalog:",
    "effect": "catalog:"
  },
  "devDependencies": {
    // Same structure - workspace topological, then third-party alphabetical
    "@beep/invariant": "workspace:^",
    "@beep/identity": "workspace:^",
    "@beep/utils": "workspace:^",
    "@beep/schema": "workspace:^",
    "drizzle-orm": "catalog:",
    "effect": "catalog:"
  }
}
```

### Dependency Sorting Algorithm

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

### tsconfig Hierarchy (from research)

```
tsconfig.json (root)
├── extends: tsconfig.base.jsonc
├── references → tsconfig.slices/*.json
│
tsconfig.base.jsonc
├── compilerOptions.paths: @beep/* → ./packages/*
│
tsconfig.slices/[slice].json
├── references → packages/[slice]/*/tsconfig.build.json
│
packages/[slice]/[layer]/tsconfig.src.json
├── references → sibling layers, common/*, shared/*
```

### Sync Algorithm (Updated)

1. **Parse workspace** - Discover all packages via bun workspace
2. **Build dependency graph** - Extract all deps from package.json files
3. **Compute transitive closure** - For each package, collect all recursive peer deps
4. **Compute expected deps** - Direct deps + transitive closure
5. **Sort deps** - Apply topological (workspace) + alphabetical (external) sorting
6. **Diff with actual** - Compare expected vs current package.json
7. **Compute expected tsconfig refs** - Resolve dep names to tsconfig paths
8. **Diff tsconfig refs** - Compare expected vs current references
9. **Apply changes** - Update package.json deps + tsconfig refs (or report in check mode)
10. **Detect cycles** - Run DFS on graph, report if cycle found

### Reusable Components

> **See [EXISTING_UTILITIES.md](./EXISTING_UTILITIES.md) for detailed analysis (~78% boilerplate reduction).**

#### @beep/tooling-utils/repo (High-Value)

| Utility | Location | Replaces Planned |
|---------|----------|------------------|
| `resolveWorkspaceDirs` | `repo/Workspaces.ts` | `workspace-parser.ts` |
| `buildRepoDependencyIndex` | `repo/DependencyIndex.ts` | Dependency graph building |
| `extractWorkspaceDependencies` | `repo/Dependencies.ts` | Dependency extraction |
| `collectTsConfigPaths` | `repo/TsConfigIndex.ts` | `reference-resolver.ts` |
| `findRepoRoot` | `repo/Root.ts` | Root discovery |
| `mapWorkspaceToPackageJsonPath` | `repo/PackageJsonMap.ts` | Package.json mapping |

#### @beep/tooling-utils Schemas

| Schema | Purpose |
|--------|---------|
| `PackageJson` | Typed package.json with dependencies |
| `TsConfigJson` | Typed tsconfig with references |
| `WorkspacePkgKey` | `@beep/*` template literal type |
| `RepoDepMapValue` | Dependencies split into workspace/npm |

#### CLI Patterns

| Existing | Location | Purpose |
|----------|----------|---------|
| `ConfigUpdaterService` | `create-slice/utils/config-updater.ts` | jsonc-parser modifications |
| `topo-sort.ts` | `commands/topo-sort.ts` | Kahn's algorithm, topological sorting |
| `FsUtils` | `@beep/tooling-utils` | FileSystem operations |

---

## Phase Plan

| Phase | Agents | Deliverables | Status |
|-------|--------|--------------|--------|
| **P0a: Scaffolding** | orchestrator | README.md, spec structure | ✅ Complete |
| **P0b: Utility Improvements** | `effect-code-writer` | Graph.ts, DepSorter.ts, Paths.ts in @beep/tooling-utils | ✅ Complete |
| **P1: Implement Core** | `effect-code-writer` | Command definition + handler (using P0b utilities) | ✅ Complete |
| **P2: File Writing** | `effect-code-writer` | tsconfig-writer.ts, order-aware diff | ✅ Complete |
| **P3: Exhaustive Verification** | orchestrator | Verify ALL packages, document issues, create fix handoffs | **Ready** |
| **P4: Bug Fixes** | `effect-code-writer` | Fix issues identified in P3 | Blocked by P3 |
| **P5: Integration** | orchestrator | Update docs, CI integration | Blocked by P4 |

### P0b: Utility Improvements ✅ COMPLETE

Enhanced `@beep/tooling-utils` with reusable utilities (2026-01-22):

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

**Results**:
- ✅ 41 tests passing
- ✅ Type checks passing
- ✅ `topo-sort` command works with extracted utilities

**Impact**: Reduced P1 scope by ~65% (440 LOC → 155 LOC)

### P1: Command Implementation ✅ COMPLETE

Implemented command structure and orchestration (2026-01-22):

| File | Purpose | LOC |
|------|---------|-----|
| `index.ts` | Command definition with 5 options | ~82 |
| `handler.ts` | Orchestration using P0b utilities | ~166 |
| `schemas.ts` | `TsconfigSyncInput`, `getSyncMode` | ~30 |
| `errors.ts` | `DriftDetectedError`, `TsconfigSyncError` | ~25 |

**Results**:
- ✅ `bun run repo-cli tsconfig-sync --help` shows all options
- ✅ `bun run repo-cli tsconfig-sync --dry-run` reports 44 packages
- ✅ Handler uses all P0b utilities (no inline implementations)
- ✅ Lint passes for tsconfig-sync files

**Current limitations** (Phase 2 scope):
- Handler computes expected state but does NOT write files
- No tests exist yet

---

## File Structure (Revised - After P0b)

> Uses `@beep/tooling-utils` for workspace/dependency discovery AND graph/sorting utilities.
> See [EXISTING_UTILITIES.md](./EXISTING_UTILITIES.md) and [P0_UTILITY_IMPROVEMENTS.md](./handoffs/P0_UTILITY_IMPROVEMENTS.md).

### P0b Additions to @beep/tooling-utils

```
tooling/utils/src/repo/
├── Graph.ts              # NEW: topologicalSort, computeTransitiveClosure, detectCycles
├── DepSorter.ts          # NEW: sortDependencies, enforceVersionSpecifiers
└── Paths.ts              # NEW: buildRootRelativePath, calculateDepth
```

### P1 Command Implementation (Minimal)

```
tooling/cli/src/commands/tsconfig-sync/
├── index.ts              # Command definition (~40 LOC)
├── handler.ts            # Orchestration using utilities (~80 LOC)
├── schemas.ts            # Input validation (~20 LOC)
└── errors.ts             # Command-specific errors (~15 LOC)
```

**Total P1 scope**: ~155 LOC (down from ~440 LOC)

**Replaced by @beep/tooling-utils (existing)**:
- ~~workspace-parser.ts~~ → `resolveWorkspaceDirs`
- ~~dependency-graph.ts~~ → `buildRepoDependencyIndex`
- ~~reference-resolver.ts~~ → `collectTsConfigPaths`

**Replaced by @beep/tooling-utils (P0b additions)**:
- ~~transitive-closure.ts~~ → `computeTransitiveClosure`
- ~~dep-sorter.ts~~ → `sortDependencies`
- ~~reference-path-builder.ts~~ → `buildRootRelativePath`
- ~~cycle-detector.ts~~ → `detectCycles`

---

## Estimated Effort (Revised After P0b)

### P0b: Utility Improvements (@beep/tooling-utils)

| Component | Lines | Notes |
|-----------|-------|-------|
| Schema fixes | ~10 | Fix bug, add CatalogValue |
| Graph.ts | ~170 | topologicalSort (extract), transitiveClosure, detectCycles |
| DepSorter.ts | ~80 | sortDependencies, enforceVersionSpecifiers |
| Paths.ts | ~30 | buildRootRelativePath, calculateDepth |
| Tests | ~200 | @beep/testkit |
| **P0b Total** | **~490** | |

### P1: Command Implementation

| Component | Lines | Notes |
|-----------|-------|-------|
| index.ts | ~40 | Command definition |
| handler.ts | ~80 | Orchestration (utility calls) |
| schemas.ts | ~20 | Input validation |
| errors.ts | ~15 | Command-specific errors |
| Tests | ~150 | @beep/testkit |
| **P1 Total** | **~305** | |

### Summary

| Phase | Estimate | Notes |
|-------|----------|-------|
| Original (monolithic) | ~3,600 LOC | No reusable utilities |
| With existing utils | ~1,810 LOC | 50% reduction |
| **With P0b utilities** | **~795 LOC** | 78% reduction |

**P0b investment** (~490 LOC) creates reusable utilities for future commands.

---

## Edge Cases

### Hoisting Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Circular workspace deps** | Report error, don't hoist |
| **Explicit version found** | Fix to `catalog:` (external) or `workspace:^` (internal) |
| **Missing transitive** | Add with correct specifier format |
| **Self-reference** | Skip (package can't depend on itself) |
| **Deep recursion** | Full transitive closure (A→B→C→D means A gets all) |

### Version Specifier Edge Cases

| Scenario | Behavior |
|----------|----------|
| **`effect: "^3.0.0"`** | Fix to `effect: "catalog:"` |
| **`@beep/schema: "1.0.0"`** | Fix to `@beep/schema: "workspace:^"` |
| **`catalog:` already** | Preserve |
| **`workspace:^` already** | Preserve |

### Sorting Edge Cases

| Scenario | Behavior |
|----------|----------|
| **New workspace package** | Insert in topological position |
| **Unknown workspace dep** | Treat as external (alphabetical) |
| **Mixed case names** | Case-insensitive alphabetical sort |

### Reference Path Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Existing minimal path** (`../domain`) | Convert to root-relative |
| **Already root-relative** | Preserve as-is |
| **Incorrect depth** | Recalculate based on file location |
| **Non-existent target** | Report error, skip reference |

---

## Related

### Spec Files
- [QUICK_START.md](./QUICK_START.md) - 5-minute entry point
- [EXISTING_UTILITIES.md](./EXISTING_UTILITIES.md) - **@beep/tooling-utils analysis**
- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Full workflow orchestration
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - Sub-agent delegation prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Phase learnings and decisions
- [templates/](./templates/) - Handler and test templates

### Handoff Documents
- [handoffs/P0_UTILITY_IMPROVEMENTS.md](./handoffs/P0_UTILITY_IMPROVEMENTS.md) - P0b utility analysis (✅ Complete)
- [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) - P0b execution prompt (✅ Complete)
- [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) - Phase 1 completion details (✅ Complete)
- [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) - Phase 1 start prompt (✅ Complete)
- [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) - Phase 2 context (✅ Complete)
- [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) - Phase 2 start prompt (✅ Complete)
- [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) - **Phase 3 verification context (READY)**
- [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) - **Phase 3 loop prompt (uses ralph-wiggum)**

### Reference Documentation
- [Spec Guide](../_guide/README.md) - Spec creation standards
- [tooling/utils/AGENTS.md](../../tooling/utils/AGENTS.md) - @beep/tooling-utils patterns
- [CLI AGENTS.md](../../tooling/cli/AGENTS.md) - CLI patterns & registration
- [create-slice command](../../tooling/cli/src/commands/create-slice/) - Reference implementation
- [topo-sort command](../../tooling/cli/src/commands/topo-sort.ts) - Cycle detection reference
