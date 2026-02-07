# Hook Parity Status (Deferred)

Status: `defer`

## Scope

Source runtime hooks are defined in `.claude/settings.json` for:
- `SessionStart`
- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `SubagentStop`

Equivalent Codex lifecycle hook wiring is not proven in-repo, so automated parity is deferred.

## Owner and status

- Owner: P2 Implementer (feasibility probe)
- Acceptance owner: Spec Maintainer
- Current status: Open; manual fallback enforced

## Manual fallback contract

### Session start
- Read `AGENTS.md` and `.codex/context-index.md` before first edit.

### Before tool/command execution
- Run `.codex/workflows/pattern-check.md` checklist.
- Apply deny list from `.codex/safety/permissions.md`.

### After edit/write operations
- Re-run pattern check on changed files.
- Run relevant verification commands (`bun run check`, focused tests/lint as needed).

### Session end
- Update spec output report and create required handoff pair for next phase.

## Closure condition

Hook parity may be reclassified only after an in-session feasibility proof demonstrates equivalent lifecycle automation in Codex.
