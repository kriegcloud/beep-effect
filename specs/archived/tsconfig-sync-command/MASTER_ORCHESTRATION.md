# tsconfig-sync-command: Master Orchestration

> Complete workflow orchestration for implementing the tsconfig-sync CLI command.

---

## Overview

This document provides the full orchestration workflow from Phase 0 through completion.

**Complexity**: Medium (Score: 48)
**Phases**: 5 (P0 Scaffolding → P1 Core → P2 Hoisting → P3 Test → P4 Integration)
**Agents**: `effect-code-writer`, `test-writer`, `code-reviewer`

---

## Phase State Machine

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PHASE FLOW                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐       │
│  │ P0       │───▶│ P1       │───▶│ P2       │───▶│ P3       │       │
│  │Scaffold  │    │ Core     │    │ Hoisting │    │ Test     │       │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘       │
│       │               │               │               │              │
│       ▼               ▼               ▼               ▼              │
│  README.md       index.ts        dep-graph.ts   *.test.ts           │
│  REFLECTION     handler.ts       dep-sorter.ts  coverage            │
│  templates/     schemas.ts       pkg-updater.ts                      │
│  handoffs/      errors.ts                                            │
│                 ws-parser.ts                                         │
│                 ref-path.ts                                          │
│                                                                      │
│                              ┌──────────┐                            │
│                              │ P4       │                            │
│                         ───▶│ Integrate│                            │
│                              └──────────┘                            │
│                                   │                                  │
│                                   ▼                                  │
│                             CLI register                             │
│                             CLAUDE.md                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0a: Scaffolding (COMPLETE)

**Status**: ✅ Complete

### Deliverables
- [x] README.md - Full design document
- [x] REFLECTION_LOG.md - Phase learnings
- [x] QUICK_START.md - Entry point
- [x] templates/ - Handler and test templates
- [x] handoffs/ - P1 handoff documents
- [x] MASTER_ORCHESTRATION.md - This file

### Exit Criteria
- All required files exist
- README contains complete design decisions
- Phase 1 handoff ready

---

## Phase 0b: Utility Improvements (COMPLETE)

**Status**: ✅ Complete (2026-01-22)

### Objectives

Add reusable utilities to `@beep/tooling-utils` to reduce P1 implementation scope by ~65%.

### Deliverables

- [x] **Schema Fixes** (`WorkspaceDependencies.ts`)
  - [x] Fixed duplicate `S.Literal("workspace:^", "workspace:^")` bug
  - [x] Added `CatalogValue = S.Literal("catalog:")`
  - [x] Added `VersionSpecifier = S.Union(WorkspacePkgValue, CatalogValue, NpmDepValue)`

- [x] **Graph Utilities** (`repo/Graph.ts`) - NEW FILE
  - [x] `topologicalSort` - Kahn's algorithm (extracted from topo-sort.ts)
  - [x] `detectCycles` - DFS cycle detection returning cycle paths
  - [x] `computeTransitiveClosure` - All transitive dependencies for a package
  - [x] `CyclicDependencyError` - Enhanced with `cycles` array

- [x] **Dependency Sorting** (`repo/DepSorter.ts`) - NEW FILE
  - [x] `sortDependencies` - Topological for workspace, alphabetical for external
  - [x] `mergeSortedDeps` - Combine sorted deps back to Record
  - [x] `enforceVersionSpecifiers` - Ensure correct version specifiers

- [x] **Path Utilities** (`repo/Paths.ts`) - NEW FILE
  - [x] `calculateDepth` - Count directory levels
  - [x] `buildRootRelativePath` - Root-relative paths for tsconfig refs
  - [x] `normalizePath` - Remove leading "./" and trailing "/"
  - [x] `getDirectory` - Get directory containing a file

- [x] **Configuration Updates**
  - [x] Updated `repo/index.ts` exports
  - [x] Updated `topo-sort.ts` to use extracted utilities
  - [x] Fixed `tsconfig.test.json` to reference testkit

- [x] **Tests** (41 tests total)
  - [x] `Graph.test.ts` - 12 tests
  - [x] `DepSorter.test.ts` - 9 tests
  - [x] `Paths.test.ts` - 16 tests

### Exit Criteria
- [x] `bun run check --filter @beep/tooling-utils` passes
- [x] `bun run test --filter @beep/tooling-utils` passes (41 tests)
- [x] `bun run repo-cli topo-sort` outputs 60 packages correctly

### Bug Fixes Found
- `A.replicate("..", 0)` in Effect returns `[".."]` not `[]` - fixed in `buildRootRelativePath`

---

## Phase 1: Core Implementation

**Status**: 🔜 Next
**Agent**: `effect-code-writer`
**Work Items**: 6

### Objectives

Implement the command skeleton and core utilities.

### Work Item Table

| # | Item | File | Est. Lines | Agent |
|---|------|------|-----------|-------|
| 1.1 | Command definition | `index.ts` | ~80 | effect-code-writer |
| 1.2 | Handler skeleton | `handler.ts` | ~150 | effect-code-writer |
| 1.3 | Input schemas | `schemas.ts` | ~50 | effect-code-writer |
| 1.4 | Error types | `errors.ts` | ~60 | effect-code-writer |
| 1.5 | Workspace parser | `workspace-parser.ts` | ~150 | effect-code-writer |
| 1.6 | Reference path builder | `reference-path-builder.ts` | ~100 | effect-code-writer |

### Agent Delegation

```
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator                                                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Read HANDOFF_P1.md context                                   │
│  2. Delegate to effect-code-writer for items 1.1-1.6            │
│  3. After each file: bun run check --filter @beep/repo-cli      │
│  4. Delegate to code-reviewer after handler.ts                  │
│  5. Update REFLECTION_LOG.md with learnings                     │
│  6. Create HANDOFF_P2.md + P2_ORCHESTRATOR_PROMPT.md            │
└─────────────────────────────────────────────────────────────────┘
```

### Verification Commands

```bash
# After each file
bun run check --filter @beep/repo-cli

# After all files
bun run repo-cli tsconfig-sync --help
bun run repo-cli tsconfig-sync --dry-run

# Code review gate
# Delegate to code-reviewer agent for handler.ts review
```

### Exit Criteria
- [ ] `bun run repo-cli tsconfig-sync --help` shows all options
- [ ] `bun run repo-cli tsconfig-sync --dry-run` executes without error
- [ ] Type check passes
- [ ] HANDOFF_P2.md created

---

## Phase 2: Hoisting Implementation

**Status**: ⏳ Pending
**Agent**: `effect-code-writer`
**Work Items**: 4

### Objectives

Implement transitive dependency hoisting and sorting.

### Work Item Table

| # | Item | File | Est. Lines | Agent |
|---|------|------|-----------|-------|
| 2.1 | Dependency graph | `dependency-graph.ts` | ~350 | effect-code-writer |
| 2.2 | Dependency sorter | `dep-sorter.ts` | ~200 | effect-code-writer |
| 2.3 | Package.json updater | `package-json-updater.ts` | ~300 | effect-code-writer |
| 2.4 | Cycle detector | `cycle-detector.ts` | ~150 | effect-code-writer |

### Agent Delegation

```
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator                                                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Read HANDOFF_P2.md context                                   │
│  2. Delegate to effect-code-writer for items 2.1-2.4            │
│  3. After each file: bun run check --filter @beep/repo-cli      │
│  4. Test transitive closure: create mock dep graph, verify      │
│  5. Update REFLECTION_LOG.md with learnings                     │
│  6. Create HANDOFF_P3.md + P3_ORCHESTRATOR_PROMPT.md            │
└─────────────────────────────────────────────────────────────────┘
```

### Verification Commands

```bash
# After implementation
bun run repo-cli tsconfig-sync --dry-run --verbose

# Test hoisting
bun run repo-cli tsconfig-sync --filter @beep/iam-server --dry-run
```

### Exit Criteria
- [ ] Transitive closure computed correctly
- [ ] Dependencies sorted (workspace topo, third-party alpha)
- [ ] Cycles detected and reported
- [ ] HANDOFF_P3.md created

---

## Phase 3: Test Implementation

**Status**: ⏳ Pending
**Agent**: `test-writer`
**Work Items**: 5

### Objectives

Create comprehensive test coverage.

### Work Item Table

| # | Item | Test File | Coverage Target |
|---|------|-----------|-----------------|
| 3.1 | Workspace parser tests | `workspace-parser.test.ts` | 90% |
| 3.2 | Dependency graph tests | `dependency-graph.test.ts` | 95% |
| 3.3 | Reference path tests | `reference-path-builder.test.ts` | 100% |
| 3.4 | Handler integration | `handler.test.ts` | 80% |
| 3.5 | Edge case coverage | `edge-cases.test.ts` | N/A |

### Agent Delegation

```
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator                                                     │
├─────────────────────────────────────────────────────────────────┤
│  1. Read HANDOFF_P3.md context                                   │
│  2. Delegate to test-writer for items 3.1-3.5                   │
│  3. After each file: bun run test --filter @beep/repo-cli       │
│  4. Verify coverage meets targets                                │
│  5. Update REFLECTION_LOG.md with learnings                     │
│  6. Create HANDOFF_P4.md + P4_ORCHESTRATOR_PROMPT.md            │
└─────────────────────────────────────────────────────────────────┘
```

### Test Scenarios

| Category | Scenarios |
|----------|-----------|
| **Sync** | Add ref, remove ref, update ref, preserve comments |
| **Hoisting** | Transitive depth 2, depth 3, circular, self-ref |
| **Sorting** | Workspace only, third-party only, mixed |
| **Paths** | Root-relative conversion, depth 2, depth 4 |
| **Modes** | --check pass, --check fail, --dry-run, --filter |

### Exit Criteria
- [ ] All tests pass
- [ ] Coverage targets met
- [ ] Edge cases verified
- [ ] HANDOFF_P4.md created

---

## Phase 4: Integration

**Status**: ⏳ Pending
**Agent**: Orchestrator (manual)
**Work Items**: 3

### Objectives

Register command, update documentation, finalize.

### Work Item Table

| # | Item | File | Description |
|---|------|------|-------------|
| 4.1 | Register command | `tooling/cli/src/index.ts` | Add to CLI |
| 4.2 | Update CLAUDE.md | `tooling/cli/CLAUDE.md` | Document command |
| 4.3 | Final verification | N/A | Full repo sync test |

### Verification Commands

```bash
# Full integration test
bun run repo-cli tsconfig-sync --check

# If changes needed, sync
bun run repo-cli tsconfig-sync

# Verify repo still builds
bun run check
bun run test
```

### Exit Criteria
- [ ] Command registered in CLI
- [ ] CLAUDE.md updated
- [ ] Full repo sync works
- [ ] All checks pass

---

## Quality Gates

### Per-Phase Gates

| Gate | Check | Pass Criteria |
|------|-------|---------------|
| Type Safety | `bun run check --filter @beep/repo-cli` | Exit 0 |
| Lint | `bun run lint --filter @beep/repo-cli` | Exit 0 |
| Tests | `bun run test --filter @beep/repo-cli` | All pass |
| Handoff | Both files exist | P[N+1] docs created |

### Final Gates

| Gate | Check | Pass Criteria |
|------|-------|---------------|
| Full Repo Check | `bun run check` | Exit 0 |
| Full Repo Test | `bun run test` | All pass |
| Sync Validation | `tsconfig-sync --check` | Exit 0 |
| Documentation | CLAUDE.md updated | Complete |

---

## Agent Coordination

### Agent Selection Matrix

| Task Type | Agent | Trigger |
|-----------|-------|---------|
| Source implementation | `effect-code-writer` | New .ts files |
| Test implementation | `test-writer` | New .test.ts files |
| Code review | `code-reviewer` | After handler.ts, after P2 |
| Architecture check | `architecture-pattern-enforcer` | After P2, before P4 |

### Delegation Patterns

**effect-code-writer prompt template**:
```
Implement [FILE] for tsconfig-sync command.

Context:
- Read: specs/tsconfig-sync-command/handoffs/HANDOFF_P[N].md
- Pattern: tooling/cli/src/commands/create-slice/[SIMILAR_FILE]
- Template: specs/tsconfig-sync-command/templates/command-handler.template.ts

Requirements:
[SPECIFIC REQUIREMENTS]

Verify: bun run check --filter @beep/repo-cli
```

**test-writer prompt template**:
```
Create tests for [FILE] in tsconfig-sync command.

Context:
- Read: specs/tsconfig-sync-command/handoffs/HANDOFF_P[N].md
- Pattern: Use @beep/testkit (effect, layer, scoped)
- Template: specs/tsconfig-sync-command/templates/command.test.template.ts

Scenarios:
[SPECIFIC TEST CASES]

Verify: bun run test --filter @beep/repo-cli
```

---

## Context Budget Summary

| Phase | Handoff Tokens | Work Items | Sessions |
|-------|---------------|------------|----------|
| P1 | ~1,200 | 6 | 1 |
| P2 | ~1,000 | 4 | 1 |
| P3 | ~1,000 | 5 | 1 |
| P4 | ~500 | 3 | 1 |
| **Total** | **~3,700** | **18** | **4** |

All phases within 4,000 token budget per handoff.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Circular deps in graph | Medium | High | DFS detection early in P2 |
| Large repo performance | Low | Medium | Stream processing, early exit |
| jsonc-parser edge cases | Low | Low | Test with real repo files |
| Version specifier formats | Medium | Low | Strict validation + error messages |

---

## Related Documents

- [README.md](./README.md) - Design document
- [QUICK_START.md](./QUICK_START.md) - Entry point
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Learnings
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - Sub-agent prompts
- [handoffs/](./handoffs/) - Phase handoffs
- [templates/](./templates/) - Implementation templates
