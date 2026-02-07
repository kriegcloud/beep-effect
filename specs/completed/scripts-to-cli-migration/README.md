# Spec: scripts-to-cli-migration

> Migrate ad-hoc scripts from `scripts/` into `@effect/cli` commands in `tooling/cli/`, update documentation references, and delete originals.

**Status**: **Complete**
**Complexity**: Medium (Score: 39)

---

## Problem Statement

Four utility scripts in `scripts/` use hardcoded paths, raw `node:fs`, and lack CLI options. They should be proper CLI commands invocable via `bun run repo-cli <command>`.

| Script | New Command | Pattern |
|--------|-------------|---------|
| `analyze-agents-md.ts` | `analyze-agents` | Multi-file |
| `analyze-readme-simple.ts` | `analyze-readmes` | Multi-file |
| `find-missing-agents.ts` | `find-missing-docs` | Single-file |
| `sync-cursor-rules.ts` | `sync-cursor-rules` | Single-file |

## Goals

1. Each script becomes a CLI command with proper options, error handling, and Effect patterns
2. All documentation references updated from `bun run scripts/<name>.ts` to `bun run repo-cli <command>`
3. 100% functional parity with existing scripts
4. Original scripts deleted

---

## Complexity Calculation

```
Phase Count:       6 phases    x 2 = 12
Agent Diversity:   4 agents    x 3 = 12
Cross-Package:     2 (cli,utils) x 4 =  8
External Deps:     0           x 3 =  0
Uncertainty:       1 (low)     x 5 =  5
Research Required: 1 (light)   x 2 =  2
                                    ----
Total Score:                        39 -> Medium
```

**Required structure**: README, REFLECTION_LOG, QUICK_START, outputs/, handoffs/

---

## Phase Overview

| Phase | Name | Agent | Gate | Output |
|-------|------|-------|------|--------|
| P1 | Reference Inventory | `codebase-researcher` | Verified inventory | `outputs/reference-inventory.md` |
| P2 | CLI Pattern Research | `codebase-researcher` | Documented patterns | `outputs/cli-pattern-research.md` |
| P3 | Implement Commands | `effect-code-writer` | `bun run check --filter @beep/repo-cli` | 4 CLI commands |
| P4 | Parity Testing | `test-writer` / manual | Output comparison | Parity report |
| P5 | Documentation Updates | `doc-writer` | No stale references | Updated docs |
| P6 | Cleanup | orchestrator (direct) | Commands work, scripts gone | Deleted scripts |

**Dependencies**: P1-P2 can run in parallel (both are read-only research with no shared state). P3 depends on P2. P4 depends on P3. P5 depends on P4. P6 depends on P5.

---

## Delegation Matrix

| Task Type | Delegate To | Orchestrator Action |
|-----------|-------------|---------------------|
| Reference search (38+ files) | `codebase-researcher` | Synthesize results |
| CLI pattern research | `codebase-researcher` | Verify findings |
| Command implementation | `effect-code-writer` | Review output, run gate |
| Parity testing | `test-writer` | Compare outputs |
| Doc updates | `doc-writer` | Verify no stale refs |
| Script deletion (≤4 files, ≤5 tool calls, no research) | orchestrator (direct) | Delete 4 files, verify CLI |

---

## Phase Details

### P1: Reference Inventory
Verify and complete the pre-researched reference inventory. See `outputs/reference-inventory.md` for the seed data.

**Acceptance**: All references verified current. New references found. Each categorized as operational/archival.

### P2: CLI Pattern Research
Research existing CLI command patterns in `tooling/cli/`. See `outputs/cli-pattern-research.md` for seed data.

**Acceptance**: Complete pattern documented with file paths, line numbers. Utility services documented. Layer composition chain documented.

### P3: Implement CLI Commands
Implement four commands following patterns from P2. Each P3 sub-task (one per command) can run in parallel.

**Acceptance**: All commands created. `bun run check --filter @beep/repo-cli` passes. Commands registered in `tooling/cli/src/index.ts`.

### P4: Parity Testing
Verify each new command produces output functionally equivalent to the original script.

**Acceptance**: Structurally equivalent output. New commands discover >= as many files as originals.

### P5: Documentation Updates
Update operational docs (`CLAUDE.md`, `.claude/standards/documentation.md`). Leave archival specs as historical.

**Acceptance**: No operational docs reference `scripts/<name>.ts`.

### P6: Cleanup
Delete original scripts after all gates pass.

**Acceptance**: Scripts deleted. CLI commands still work. `scripts/` only contains `install-gitleaks.sh`.

---

## Key References

| Resource | Path |
|----------|------|
| Quick start | `QUICK_START.md` |
| Reference inventory | `outputs/reference-inventory.md` |
| CLI pattern research | `outputs/cli-pattern-research.md` |
| Phase handoffs | `handoffs/HANDOFF_P[1-6].md` |
| Orchestrator prompts | `handoffs/P[1-6]_ORCHESTRATOR_PROMPT.md` |
| Reflection log | `REFLECTION_LOG.md` |
| CLI entry point | `tooling/cli/src/index.ts` |
| Example multi-file command | `tooling/cli/src/commands/tsconfig-sync/` |
| Example single-file command | `tooling/cli/src/commands/topo-sort.ts` |
| Shared utilities | `tooling/utils/src/FsUtils.ts`, `tooling/utils/src/RepoUtils.ts` |

---

## Orchestration Notes

- P1 and P2 are read-only research; can run in parallel
- P3 has 4 independent sub-tasks (one per command); parallelize with 4 agents
- Each phase creates handoff docs before completion
- Context budget: <=4000 tokens per handoff
