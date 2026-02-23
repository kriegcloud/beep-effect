# Hook Parity Status

Status: `proven-in-session`

## Scope

Source runtime hooks are defined in `.claude/settings.json` for:
- `SessionStart`
- `UserPromptSubmit`
- `PreToolUse`
- `PostToolUse`
- `SubagentStop`

Codex lifecycle execution is now implemented via `.codex/hooks/lifecycle.ts` and wrapper `.codex/hooks/run.sh`.

## Implemented Codex hook runtime

Entry points:
- `bun run .codex/hooks/lifecycle.ts session-start`
- `bun run .codex/hooks/lifecycle.ts user-prompt-submit`
- `bun run .codex/hooks/lifecycle.ts pre-tool-use`
- `bun run .codex/hooks/lifecycle.ts post-tool-use`
- `bun run .codex/hooks/lifecycle.ts subagent-stop`
- `bun run .codex/hooks/lifecycle.ts run -- <command...>`

Automation behavior:
- `run` executes `PreToolUse` checks before command execution.
- `run` executes `PostToolUse` checks after command execution.
- Deny-list enforcement mirrors `.codex/safety/permissions.md` intent.
- Pattern evaluation reads `.codex/patterns/**` for `PreToolUse` and `PostToolUse`.
- Session and tool events are persisted to `.codex/runtime/hook-events.jsonl`.

## In-session feasibility proof requirement

Closure condition is met when evidence demonstrates:
1. Pre-tool enforcement blocks denied command paths.
2. Allowed command paths execute and still emit pre/post events.
3. Session lifecycle events are emitted and persisted.

## Evidence artifacts

- `specs/codex-claude-parity/outputs/validation-evidence/P6.hook-automation-proof.out`
- `.codex/runtime/hook-events.jsonl`

## Notes

- This is repository-level hook automation, not Codex product-native event wiring.
- Operational parity is achieved via deterministic wrapper invocation in-session.
