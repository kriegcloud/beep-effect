# Claude Hooks

This repo uses Claude Code hooks registered through project `.claude/settings.json`.

There is no `.claude/hooks.json` in the current hook system. Older docs that mention it are stale.

## Active Hook Programs

- `agent-init/run.sh`: `SessionStart` context bootstrap for the main agent
- `skill-suggester/run.sh`: `UserPromptSubmit` reminders and context hints
- `subagent-init/run.sh`: `PreToolUse` bootstrap for `Task` subagents
- `pattern-detector/run.sh`: `PreToolUse` and `PostToolUse` pattern checks

## Registration

Claude Code reads hooks from `.claude/settings.json`, `.claude/settings.local.json`, or `~/.claude/settings.json`.

The repo-local setup uses this shape:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/agent-init/run.sh"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/skill-suggester/run.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Task",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/subagent-init/run.sh"
          }
        ]
      },
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pattern-detector/run.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/pattern-detector/run.sh"
          }
        ]
      }
    ]
  }
}
```

## Testing

Run the hook package tests from the repo root:

```bash
cd .claude && bun run test
```

Run the pattern detector directly:

```bash
echo '{"hook_event_name":"PreToolUse","tool_name":"Bash","tool_input":{"command":"git push --force"}}' | \
  CLAUDE_PROJECT_DIR=. bun run .claude/hooks/pattern-detector/index.ts
```
