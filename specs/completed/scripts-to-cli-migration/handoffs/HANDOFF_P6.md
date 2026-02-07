# Phase 6 Handoff: Cleanup

**Date**: 2026-02-05
**From**: Phase 5 (Documentation Updates)
**To**: Phase 6 (Cleanup)
**Status**: Blocked on P5 completion

---

## Working Context

**Current task**: Delete the original four scripts after all previous phases pass.

**Success criteria**:
- Four scripts deleted
- CLI commands still work after deletion
- `scripts/` directory only contains `install-gitleaks.sh`

**Blocking issues**: All previous phases (P3 gate, P4 parity, P5 docs) must pass first.

---

## Episodic Context

All phases complete. Commands implemented (P3), tested for parity (P4), and documentation updated (P5). Safe to delete originals.

---

## Semantic Context

**Files to delete**:
```
scripts/analyze-agents-md.ts
scripts/analyze-readme-simple.ts
scripts/find-missing-agents.ts
scripts/sync-cursor-rules.ts
```

**Pre-deletion checklist**:
- P3 gate passes (`bun run check --filter @beep/repo-cli`)
- P4 parity testing passes
- P5 documentation updates complete
- All four `--help` commands work

---

## Procedural Context

- This is a small task -- orchestrator may execute directly
- Verify with `ls scripts/` after deletion
- Run `bun run repo-cli <command> --help` for each to confirm
