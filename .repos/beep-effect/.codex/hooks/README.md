# Codex Lifecycle Hooks

Executable hook runtime for Codex parity validation.

## Commands

- `session-start`
- `user-prompt-submit`
- `pre-tool-use`
- `post-tool-use`
- `subagent-stop`
- `run -- <command...>` (wraps command with automatic pre/post execution)

## Usage

```bash
bun run .codex/hooks/lifecycle.ts session-start --session-id p6
bun run .codex/hooks/lifecycle.ts user-prompt-submit --session-id p6 --prompt "continue hardening"
bun run .codex/hooks/lifecycle.ts run --session-id p6 -- echo hello
```

Wrapper script:

```bash
.codex/hooks/run.sh run --session-id p6 -- echo hello
```

## Output and Evidence

- Hook event log: `.codex/runtime/hook-events.jsonl`
- Hook state: `.codex/.hook-state.json`

## Safety Behavior

- Enforces explicit deny-list in `.codex/safety/permissions.md` intent.
- Evaluates `.codex/patterns/**` PreToolUse patterns before command execution.
- Evaluates `.codex/patterns/**` PostToolUse context patterns after command execution.
