# Phase 4 Handoff: Parity Testing

**Date**: 2026-02-05
**From**: Phase 3 (Implement CLI Commands)
**To**: Phase 4 (Parity Testing)
**Status**: Blocked on P3 completion

---

## Working Context

**Current task**: Verify each new CLI command produces output functionally equivalent to its original script.

**Success criteria**:
- All four commands produce structurally equivalent output
- New commands discover at least as many files/packages as originals
- `sync-cursor-rules` produces byte-identical .mdc files
- `find-missing-docs --check` exits non-zero when docs are missing

**Blocking issues**: P3 must complete first (commands must exist).

---

## Episodic Context

P3 implemented four CLI commands. This phase validates they behave identically to the original scripts. Key caveat: original scripts have hardcoded paths to `beep-effect` (old repo name). Comparison should focus on structure and format, not exact path strings.

---

## Semantic Context

**Test strategy for each command**:

| Command | Original | New | Compare |
|---------|----------|-----|---------|
| `analyze-agents` | `bun run scripts/analyze-agents-md.ts` | `bun run repo-cli analyze-agents` | Table headers, analysis categories, issue types |
| `analyze-readmes` | `bun run scripts/analyze-readme-simple.ts` | `bun run repo-cli analyze-readmes` | Table structure, compliance checks |
| `find-missing-docs` | `bun run scripts/find-missing-agents.ts` | `bun run repo-cli find-missing-docs` | Two sections, summary format |
| `sync-cursor-rules` | `bun run scripts/sync-cursor-rules.ts` | `bun run repo-cli sync-cursor-rules` | Byte-identical .mdc files |

---

## Procedural Context

- Original scripts: `scripts/` directory
- New commands: `tooling/cli/src/commands/`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
