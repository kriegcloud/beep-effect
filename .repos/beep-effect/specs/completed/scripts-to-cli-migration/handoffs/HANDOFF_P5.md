# Phase 5 Handoff: Documentation Updates

**Date**: 2026-02-05
**From**: Phase 4 (Parity Testing)
**To**: Phase 5 (Documentation Updates)
**Status**: Blocked on P4 completion

---

## Working Context

**Current task**: Update all operational documentation that references `bun run scripts/<name>.ts` to use `bun run repo-cli <command>`.

**Success criteria**:
- `CLAUDE.md` updated with new CLI command for Cursor sync
- `.claude/standards/documentation.md` updated with new CLI commands
- `specs/_guide/PATTERN_REGISTRY.md` updated
- No operational docs reference `scripts/<name>.ts`

**Blocking issues**: P4 must pass first (commands must work correctly).

---

## Episodic Context

P1 verified the reference inventory. P3 implemented commands. P4 confirmed parity. Now update documentation so users invoke the new CLI commands.

**Key decision from P0**: Operational docs MUST update. Archival specs MAY be left as historical.

---

## Semantic Context

**Update rules**:

| Old Reference | New Reference |
|---------------|---------------|
| `bun run scripts/sync-cursor-rules.ts` | `bun run repo-cli sync-cursor-rules` |
| `bun run scripts/analyze-agents-md.ts` | `bun run repo-cli analyze-agents` |
| `bun run scripts/find-missing-agents.ts` | `bun run repo-cli find-missing-docs` |
| `bun run scripts/analyze-readme-simple.ts` | `bun run repo-cli analyze-readmes` |

**Priority tiers**:
- **Tier 1 (MUST)**: `CLAUDE.md`, `.claude/standards/documentation.md`
- **Tier 2 (SHOULD)**: `specs/_guide/PATTERN_REGISTRY.md`
- **Tier 3 (LEAVE)**: All archival specs -- historical artifacts

---

## Procedural Context

- Verified inventory: `specs/scripts-to-cli-migration/outputs/reference-inventory.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
