# tsconfig-sync-command Quick Start

> 5-minute guide to continue this specification.

---

## Current Status

**Phase 0a: Scaffolding** - Complete
- README.md with full command design including transitive hoisting
- Research on existing CLI patterns complete
- Templates created for handler and tests

**Phase 0b: Utility Improvements** - **NEXT**
- Add reusable utilities to `@beep/tooling-utils`
- Reduces P1 scope by ~65%

**Phase 1: Core Implementation** - Blocked by P0b

---

## Immediate Next Steps

### Start Phase 0b (Recommended)

Copy-paste the orchestrator prompt:
```
specs/tsconfig-sync-command/handoffs/P0_ORCHESTRATOR_PROMPT.md
```

This adds reusable utilities to `@beep/tooling-utils`:
- `Graph.ts` - topologicalSort, computeTransitiveClosure, detectCycles
- `DepSorter.ts` - sortDependencies, enforceVersionSpecifiers
- `Paths.ts` - buildRootRelativePath

**Estimated time**: 1.5-2 hours

### After P0b Completes

Then execute P1 using:
```
specs/tsconfig-sync-command/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

---

## Key Features

### 1. tsconfig Sync
```bash
bun run repo-cli tsconfig-sync         # Sync all packages
bun run repo-cli tsconfig-sync --check # Validate without changes (CI)
```

### 2. Transitive Dependency Hoisting
When `@beep/new-pkg` depends on `@beep/schema`, it automatically gets:
- All `@beep/schema`'s peer deps
- All recursive transitive peer deps
- Both workspace (`@beep/*`) and third-party (`effect`, `drizzle-orm`)

### 3. Dependency Sorting
```json
{
  "peerDependencies": {
    // Workspace packages first (topological order)
    "@beep/invariant": "workspace:^",
    "@beep/utils": "workspace:^",
    "@beep/schema": "workspace:^",
    // Third-party packages (alphabetical)
    "drizzle-orm": "catalog:",
    "effect": "catalog:"
  }
}
```

### 4. Root-Relative Reference Paths
All tsconfig references use consistent root-relative paths:
```json
// packages/calendar/server/tsconfig.build.json
{
  "references": [
    { "path": "../../../packages/common/schema/tsconfig.build.json" },
    { "path": "../../../packages/calendar/domain/tsconfig.build.json" }
  ]
}
```
- Always traverse up to repo root (`../../../`)
- Then use full path from root (`packages/calendar/domain/...`)

### 5. Topologically Sorted References
tsconfig `references` arrays sorted with deps before dependents.

---

## Files to Create (After P0b)

> **CRITICAL**: P0b adds utilities to `@beep/tooling-utils` that handle most complexity.

### P1 Command (Minimal)

```
tooling/cli/src/commands/tsconfig-sync/
├── index.ts          # Command definition (~40 LOC)
├── handler.ts        # Orchestration using utilities (~80 LOC)
├── schemas.ts        # Input validation (~20 LOC)
└── errors.ts         # Command-specific errors (~15 LOC)
```

### P0b Utilities (in @beep/tooling-utils)

```
tooling/utils/src/repo/
├── Graph.ts          # topologicalSort, computeTransitiveClosure, detectCycles
├── DepSorter.ts      # sortDependencies, enforceVersionSpecifiers
└── Paths.ts          # buildRootRelativePath, calculateDepth
```

---

## Reference Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| ConfigUpdaterService | `tooling/cli/src/commands/create-slice/utils/config-updater.ts` | jsonc-parser modifications |
| topo-sort.ts | `tooling/cli/src/commands/topo-sort.ts` | Source for Graph.ts extraction |
| Command pattern | `tooling/cli/src/commands/create-slice/index.ts` | CLI structure |

---

## Verification Commands

```bash
# Check current tsconfig state (discovery)
find packages -name "tsconfig.build.json" -exec grep -l "references" {} \; | head -5

# Count packages needing sync
find packages -name "package.json" -not -path "*/node_modules/*" | wc -l

# Type check CLI package
bun run check --filter @beep/repo-cli

# Lint CLI package
bun run lint --filter @beep/repo-cli

# Test command (after implementation)
bun run repo-cli tsconfig-sync --help
bun run repo-cli tsconfig-sync --dry-run
```

---

## Success Criteria Checklist

### P0b: Utility Improvements
- [ ] Fix WorkspacePkgValue duplicate literal bug
- [ ] Add CatalogValue schema
- [ ] Extract topologicalSort to Graph.ts
- [ ] Add computeTransitiveClosure to Graph.ts
- [ ] Add detectCycles to Graph.ts
- [ ] Add sortDependencies to DepSorter.ts
- [ ] Add buildRootRelativePath to Paths.ts
- [ ] `bun run repo-cli topo-sort` still works

### P1: Command Implementation
- [ ] Command definition with all options
- [ ] Handler using P0b utilities
- [ ] `--check` mode (exit code 1 on drift)
- [ ] `--dry-run` mode
- [ ] `--filter` scope
- [ ] `--no-hoist` flag

### Integration
- [ ] package.json deps → tsconfig references
- [ ] tsconfig.base.jsonc path alias updates
- [ ] Root-relative reference paths
- [ ] Topologically sorted references
- [ ] Transitive dependency hoisting

---

## Anti-Pattern Awareness

This spec actively avoids common pitfalls documented in the spec guide:

| Anti-Pattern | Status | Evidence |
|--------------|--------|----------|
| Giant documents | Avoided | All files <500 lines |
| Unbounded scope | Avoided | Explicit out-of-scope list in README |
| Static prompts | Avoided | 5 prompt iteration entries in REFLECTION_LOG |
| Missing handoffs | Avoided | Both HANDOFF_P1.md AND P1_ORCHESTRATOR_PROMPT.md present |
| Context budget exceeded | Avoided | ~3,200 tokens (under 4K limit) |

See [Anti-Patterns Guide](../_guide/patterns/anti-patterns.md) for complete list.

---

## Related Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Full design document |
| [EXISTING_UTILITIES.md](./EXISTING_UTILITIES.md) | @beep/tooling-utils analysis |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Phase learnings and decisions |
| **P0b Handoffs (Start Here)** | |
| [handoffs/P0_UTILITY_IMPROVEMENTS.md](./handoffs/P0_UTILITY_IMPROVEMENTS.md) | P0b detailed analysis |
| [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | **P0b execution prompt** |
| **P1 Handoffs (After P0b)** | |
| [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 full context |
| [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | Phase 1 execution prompt |
| **Templates** | |
| [templates/command-handler.template.ts](./templates/command-handler.template.ts) | Handler structure template |
| [templates/command.test.template.ts](./templates/command.test.template.ts) | Test structure template |
| **Reference** | |
| [tooling/utils/AGENTS.md](../../tooling/utils/AGENTS.md) | @beep/tooling-utils patterns |
| [topo-sort.ts](../../tooling/cli/src/commands/topo-sort.ts) | Source for Graph.ts extraction |
| [create-slice](../../tooling/cli/src/commands/create-slice/) | Reference CLI implementation |
| [CLI AGENTS.md](../../tooling/cli/AGENTS.md) | CLI patterns & registration |
