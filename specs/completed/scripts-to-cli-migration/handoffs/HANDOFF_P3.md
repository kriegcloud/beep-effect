# Phase 3 Handoff: Implement CLI Commands

**Date**: 2026-02-05
**From**: Phase 2 (CLI Pattern Research)
**To**: Phase 3 (Implement CLI Commands)
**Status**: Blocked on P2 completion

---

## Working Context

**Current task**: Implement four CLI commands following patterns documented in P2. Each command is independent and can be implemented in parallel.

**Success criteria**:
- All four commands created following established patterns
- `bun run check --filter @beep/repo-cli` passes
- Each command registered in `tooling/cli/src/index.ts`
- Each command uses Effect patterns (no `node:fs`, no hardcoded paths)

**Immediate dependencies**:
- `outputs/cli-pattern-research.md` (verified patterns from P2)
- Original scripts in `scripts/` (behavior reference)

---

## Episodic Context

P1 verified the documentation reference inventory. P2 documented exact CLI patterns with file:line references. Phase 3 uses these patterns to implement four commands.

**Key decision**: `analyze-agents` and `analyze-readmes` use multi-file pattern (complex logic). `find-missing-docs` and `sync-cursor-rules` use single-file pattern.

---

## Semantic Context

**Command specifications**:

| Command | Source Script | Location | Key Changes |
|---------|-------------|----------|-------------|
| `analyze-agents` | `analyze-agents-md.ts` | `commands/analyze-agents/` | Dynamic discovery via glob, `--format`/`--filter`/`--verbose` options |
| `analyze-readmes` | `analyze-readme-simple.ts` | `commands/analyze-readmes/` | `RepoWorkspaceMap` discovery, `--output` option, no hardcoded path |
| `find-missing-docs` | `find-missing-agents.ts` | `commands/find-missing-docs.ts` | `--check` flag for CI, `--type` filter |
| `sync-cursor-rules` | `sync-cursor-rules.ts` | `commands/sync-cursor-rules.ts` | `--dry-run`, `--verbose`, wrap existing Effect logic |

---

## Procedural Context

- CLI patterns: `specs/scripts-to-cli-migration/outputs/cli-pattern-research.md`
- Original scripts: `scripts/analyze-agents-md.ts`, `scripts/analyze-readme-simple.ts`, `scripts/find-missing-agents.ts`, `scripts/sync-cursor-rules.ts`
- Effect patterns: `.claude/rules/effect-patterns.md`
- CLI source: `tooling/cli/src/`
