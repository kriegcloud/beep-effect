# Quick Start: scripts-to-cli-migration

> 5-minute orientation for agents working on this spec.

---

## What

Migrate 4 ad-hoc scripts from `scripts/` into `@effect/cli` commands in `tooling/cli/`.

| Script | New Command | Pattern |
|--------|-------------|---------|
| `analyze-agents-md.ts` | `analyze-agents` | Multi-file |
| `analyze-readme-simple.ts` | `analyze-readmes` | Multi-file |
| `find-missing-agents.ts` | `find-missing-docs` | Single-file |
| `sync-cursor-rules.ts` | `sync-cursor-rules` | Single-file |

## Why

Scripts use hardcoded paths, `node:fs`, and lack CLI options. CLI commands use Effect patterns, `@effect/platform`, dynamic discovery, and proper error handling.

## Phases

| Phase | Agent | Task |
|-------|-------|------|
| P1 | `codebase-researcher` | Verify documentation reference inventory |
| P2 | `codebase-researcher` | Research CLI patterns in `tooling/cli/` |
| P3 | `effect-code-writer` | Implement 4 commands |
| P4 | `test-writer` | Parity test old vs new |
| P5 | `doc-writer` | Update documentation references |
| P6 | orchestrator | Delete original scripts |

## Key Files

- **Spec README**: `specs/scripts-to-cli-migration/README.md`
- **Reference inventory**: `outputs/reference-inventory.md`
- **CLI patterns**: `outputs/cli-pattern-research.md`
- **CLI entry point**: `tooling/cli/src/index.ts`
- **Example command**: `tooling/cli/src/commands/tsconfig-sync/`
- **Utilities**: `tooling/utils/src/FsUtils.ts`, `tooling/utils/src/RepoUtils.ts`

## Start Here

1. Read `README.md` for full phase details
2. Check `handoffs/` for your phase's orchestrator prompt
3. Check `outputs/` for prior research
4. Run `bun run check --filter @beep/repo-cli` to verify after changes
