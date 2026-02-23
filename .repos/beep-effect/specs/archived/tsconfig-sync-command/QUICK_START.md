# tsconfig-sync-command Quick Start

> 5-minute guide to continue this specification.

---

## Current Status

**Phase 0a: Scaffolding** - ✅ Complete
- README.md with full command design including transitive hoisting
- Research on existing CLI patterns complete
- Templates created for handler and tests

**Phase 0b: Utility Improvements** - ✅ Complete (2026-01-22)
- Added reusable utilities to `@beep/tooling-utils`
- Reduced P1 scope by ~65%
- 41 tests passing

**Phase 1: Core Implementation** - ✅ Complete (2026-01-22)
- Command definition with all 5 options
- Handler orchestration using P0b utilities
- Command registered in CLI

**Phase 2: Tests & File Writing** - **READY TO START**

---

## Immediate Next Steps

### Start Phase 2 (READY)

Copy-paste the orchestrator prompt:
```
specs/tsconfig-sync-command/handoffs/P2_ORCHESTRATOR_PROMPT.md
```

Phase 2 scope:
- Add file writing (tsconfig references, package.json deps)
- Add Effect-based tests using `@beep/testkit`
- Use `jsonc-parser` to preserve comments

**Estimated time**: 1-2 hours

---

## What's Already Done

### Command Working (Phase 1)

```bash
# All options available
bun run repo-cli tsconfig-sync --help

# Dry-run works (44 packages detected)
bun run repo-cli tsconfig-sync --dry-run

# Verbose output shows per-package counts
bun run repo-cli tsconfig-sync --verbose
```

### P0b Utilities Available

All utilities in `@beep/tooling-utils`:
- ✅ `Graph.ts` - topologicalSort, computeTransitiveClosure, detectCycles, CyclicDependencyError
- ✅ `DepSorter.ts` - sortDependencies, mergeSortedDeps, enforceVersionSpecifiers
- ✅ `Paths.ts` - buildRootRelativePath, calculateDepth, normalizePath, getDirectory

### Phase 1 Files Created

```
tooling/cli/src/commands/tsconfig-sync/
├── index.ts      # Command definition (~82 LOC)
├── handler.ts    # Orchestration (~166 LOC)
├── schemas.ts    # Input validation (~30 LOC)
└── errors.ts     # Error classes (~25 LOC)
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

## Phase 2 Files to Create

### Writer Utilities

```
tooling/cli/src/commands/tsconfig-sync/utils/
├── tsconfig-writer.ts     # Write tsconfig.build.json references
└── package-json-writer.ts # Write sorted package.json deps
```

### Tests

```
tooling/cli/test/commands/tsconfig-sync/
├── handler.test.ts  # Integration tests
└── utils.test.ts    # Unit tests for writers
```

---

## Reference Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| jsonc-parser | `tooling/cli/src/commands/create-slice/utils/config-updater.ts` | Preserve comments in tsconfig |
| Test patterns | `tooling/testkit/AGENTS.md` | Effect-based testing |
| Command pattern | `tooling/cli/src/commands/create-slice/index.ts` | CLI structure |

---

## Verification Commands

```bash
# Type check CLI package
bun run check --filter @beep/repo-cli

# Lint CLI package
bun run lint --filter @beep/repo-cli

# Test (after Phase 2)
bun run test --filter @beep/repo-cli

# Command verification (Phase 1 complete)
bun run repo-cli tsconfig-sync --help
bun run repo-cli tsconfig-sync --dry-run
bun run repo-cli tsconfig-sync --verbose
```

---

## Success Criteria Checklist

### P0b: Utility Improvements ✅ COMPLETE
- [x] All graph utilities implemented
- [x] All sorting utilities implemented
- [x] All path utilities implemented
- [x] 41 tests passing
- [x] `bun run repo-cli topo-sort` outputs 60 packages

### P1: Command Implementation ✅ COMPLETE
- [x] Command definition with all options
- [x] Handler using P0b utilities
- [x] `--check` mode
- [x] `--dry-run` mode
- [x] `--filter` scope
- [x] `--no-hoist` flag
- [x] Command registered in CLI

### P2: Tests & File Writing
- [ ] `TsconfigWriter` utility
- [ ] `PackageJsonWriter` utility
- [ ] Handler writes files in sync mode
- [ ] Effect-based tests
- [ ] `bun run test --filter @beep/repo-cli` passes

### Integration (P3)
- [ ] Update CLAUDE.md with command docs
- [ ] CI integration (`--check` in workflow)
- [ ] Full sync working end-to-end

---

## Related Files

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Full design document |
| [EXISTING_UTILITIES.md](./EXISTING_UTILITIES.md) | @beep/tooling-utils analysis |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Phase learnings and decisions |
| **P1 Handoffs (Complete)** | |
| [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 completion details |
| [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | Phase 1 execution prompt |
| **P2 Handoffs (Start Here)** | |
| [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | **Phase 2 full context** |
| [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | **Phase 2 execution prompt** |
| **Reference** | |
| [tooling/utils/AGENTS.md](../../tooling/utils/AGENTS.md) | @beep/tooling-utils patterns |
| [tooling/testkit/AGENTS.md](../../tooling/testkit/AGENTS.md) | Test patterns |
| [create-slice](../../tooling/cli/src/commands/create-slice/) | Reference CLI implementation |
| [CLI AGENTS.md](../../tooling/cli/AGENTS.md) | CLI patterns & registration |
