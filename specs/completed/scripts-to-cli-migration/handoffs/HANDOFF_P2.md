# Phase 2 Handoff: CLI Pattern Research

**Date**: 2026-02-05
**From**: Phase 0 (Scaffolding)
**To**: Phase 2 (CLI Pattern Research)
**Status**: Ready for implementation

---

## Working Context

**Current task**: Research and document the exact CLI command patterns in `tooling/cli/` to establish the blueprint for implementing four new commands.

**Success criteria**:
- Complete pattern documented with file paths and line numbers
- Utility services (FsUtils, RepoUtils) documented with relevant methods
- Layer composition chain documented
- Output written to `outputs/cli-pattern-research.md`

**Blocking issues**: None. P2 can run in parallel with P1.

---

## Episodic Context

Phase 0 created seed research in `outputs/cli-pattern-research.md` showing directory structure, runtime bootstrap, and command creation patterns. This seed data needs verification and expansion with exact file paths and line numbers.

---

## Semantic Context

- **CLI package**: `tooling/cli/` (package `@beep/repo-cli`)
- **Utilities**: `tooling/utils/` (package `@beep/utils`)
- **Single-file pattern**: `topo-sort.ts`, `agents-validate.ts`
- **Multi-file pattern**: `tsconfig-sync/` (index.ts, handler.ts, schemas.ts, errors.ts)
- **Runtime layers**: `BunContext.layer`, `BunTerminal.layer`, `FsUtilsLive`

---

## Procedural Context

- Seed research: `specs/scripts-to-cli-migration/outputs/cli-pattern-research.md`
- CLI source: `tooling/cli/src/`
- Utils source: `tooling/utils/src/`
- Effect CLI docs: Use `mcp-researcher` if needed
