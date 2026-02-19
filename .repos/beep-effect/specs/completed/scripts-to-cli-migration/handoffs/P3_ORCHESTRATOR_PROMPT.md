# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the scripts-to-cli-migration spec.

### Context

P1 verified documentation references. P2 documented exact CLI patterns in `outputs/cli-pattern-research.md`. Phase 3 implements four CLI commands using those patterns.

### Your Mission

Implement four CLI commands. Each is independent -- delegate to `effect-code-writer` agents in parallel (one per command).

**Command 1: `analyze-agents`** (multi-file at `commands/analyze-agents/`):
- Replaces `scripts/analyze-agents-md.ts`
- Dynamic discovery via `FsUtils.glob("**/AGENTS.md")`
- Options: `--format` (table|json|summary), `--filter` (glob), `--verbose`
- Files: index.ts, handler.ts, schemas.ts, errors.ts

**Command 2: `analyze-readmes`** (multi-file at `commands/analyze-readmes/`):
- Replaces `scripts/analyze-readme-simple.ts`
- Uses `RepoUtils.RepoWorkspaceMap` for package discovery
- Options: `--format`, `--filter`, `--output` (file path, default stdout)
- Files: index.ts, handler.ts, schemas.ts, errors.ts

**Command 3: `find-missing-docs`** (single-file at `commands/find-missing-docs.ts`):
- Replaces `scripts/find-missing-agents.ts`
- Options: `--check` (exit non-zero if missing), `--type` (all|agents|readme)

**Command 4: `sync-cursor-rules`** (single-file at `commands/sync-cursor-rules.ts`):
- Replaces `scripts/sync-cursor-rules.ts`
- Wrap existing Effect logic in `@effect/cli` Command
- Options: `--dry-run`, `--verbose`

**Registration**: Add all four commands to `tooling/cli/src/index.ts`

### Critical Patterns

Read `outputs/cli-pattern-research.md` for exact patterns. Key rules:
- Use `RepoUtils.REPOSITORY_ROOT` (never hardcoded paths)
- Use `@effect/platform` FileSystem (never `node:fs`)
- Use namespace imports (`import * as Effect from "effect/Effect"`)
- Tag errors with `$RepoCliId`

### Reference Files

- CLI patterns: `specs/scripts-to-cli-migration/outputs/cli-pattern-research.md`
- Original scripts: `scripts/` (for behavior reference)
- Multi-file example: `tooling/cli/src/commands/tsconfig-sync/`
- Single-file example: `tooling/cli/src/commands/topo-sort.ts`

### Verification

After each command:
```bash
bun run check --filter @beep/repo-cli
```

### Success Criteria

- [ ] `analyze-agents` command created and registered
- [ ] `analyze-readmes` command created and registered
- [ ] `find-missing-docs` command created and registered
- [ ] `sync-cursor-rules` command created and registered
- [ ] `bun run check --filter @beep/repo-cli` passes
- [ ] All commands have `--help` output
- [ ] `REFLECTION_LOG.md` updated

### Handoff Document

Read full context in: `specs/scripts-to-cli-migration/handoffs/HANDOFF_P3.md`

### Next Phase

After completing Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create/update handoff for Phase 4 (Parity Testing)
