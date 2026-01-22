# tsconfig-sync-command

> CLI command to automate tsconfig reference, path alias, and dependency maintenance

**Complexity Score**: 48 (High) - updated to include transitive dependency hoisting
**Status**: Phase 0 - Scaffolding

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

- Version conflict resolution (uses existing specifier)
- Runtime module resolution changes
- Build order optimization (use `topo-sort` for that)

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

### Transitive Dependency Hoisting
- [ ] All `@beep/*` transitive peer deps are added to consumer's peer/dev deps
- [ ] All third-party transitive peer deps are added to consumer's peer/dev deps
- [ ] Hoisting is fully recursive (A→B→C means A gets C's deps)
- [ ] Version specifiers preserved (`workspace:^`, `catalog:`)

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

| Existing | Location | Purpose |
|----------|----------|---------|
| `ConfigUpdaterService` | `create-slice/utils/config-updater.ts` | jsonc-parser modifications |
| `topo-sort.ts` | `commands/topo-sort.ts` | Kahn's algorithm, topological sorting |
| `FsUtils` | `@beep/tooling-utils` | FileSystem operations |

---

## Phase Plan

| Phase | Agents | Deliverables |
|-------|--------|--------------|
| **P0: Scaffolding** | orchestrator | README.md (this file), structure |
| **P1: Design** | orchestrator | Detailed algorithm, file structure |
| **P2: Implement Core** | `effect-code-writer` | Command + tsconfig sync |
| **P3: Implement Hoisting** | `effect-code-writer` | Transitive deps + sorting |
| **P4: Test** | `test-writer` | Effect-based tests |
| **P5: Integrate** | orchestrator | Register command, update docs |

---

## File Structure (Planned)

```
tooling/cli/src/commands/tsconfig-sync/
├── index.ts              # Command definition
├── handler.ts            # Main orchestration
├── schemas.ts            # Input validation
├── errors.ts             # Error types
└── utils/
    ├── workspace-parser.ts     # Discover all packages
    ├── dependency-graph.ts     # Build graph + transitive closure
    ├── dep-sorter.ts           # Topological + alphabetical sorting
    ├── package-json-updater.ts # Update deps in package.json
    ├── reference-resolver.ts   # Resolve @beep/* to tsconfig paths
    ├── tsconfig-updater.ts     # Apply changes via jsonc-parser
    └── cycle-detector.ts       # DFS cycle detection
```

---

## Estimated Effort (Updated)

| Component | Lines | Complexity |
|-----------|-------|------------|
| CLI boilerplate | ~300 | Standard pattern |
| Handler | ~500 | Orchestration (more complex) |
| workspace-parser.ts | ~150 | Package discovery |
| dependency-graph.ts | ~350 | Graph + transitive closure |
| dep-sorter.ts | ~200 | Topo + alpha sorting |
| package-json-updater.ts | ~300 | JSON manipulation |
| reference-resolver.ts | ~300 | Path resolution |
| tsconfig-updater.ts | ~350 | jsonc-parser integration |
| cycle-detector.ts | ~150 | Graph algorithm |
| Tests | ~800 | @beep/testkit |
| **Total** | **~3,400** | |

---

## Edge Cases

### Hoisting Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Circular workspace deps** | Report error, don't hoist |
| **Conflicting versions** | Preserve consumer's existing specifier |
| **Missing transitive** | Add with source package's specifier |
| **Self-reference** | Skip (package can't depend on itself) |

### Sorting Edge Cases

| Scenario | Behavior |
|----------|----------|
| **New workspace package** | Insert in topological position |
| **Unknown workspace dep** | Treat as external (alphabetical) |
| **Mixed case names** | Case-insensitive alphabetical sort |

---

## Related

- [Spec Guide](../_guide/README.md)
- [CLI AGENTS.md](../../tooling/cli/CLAUDE.md)
- [create-slice command](../../tooling/cli/src/commands/create-slice/) - Reference implementation
- [topo-sort command](../../tooling/cli/src/commands/topo-sort.ts) - Cycle detection reference
