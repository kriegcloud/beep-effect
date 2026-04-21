# MCP JetBrains

Use this skill for IDE-indexed reads/search/refactors via JetBrains MCP.

## Use When
- You need semantic project introspection in WebStorm/IntelliJ context.
- You need precise symbol/file operations with `projectPath`.

## Quick Smoke
1. `get_project_modules` for project root.
2. `get_all_open_file_paths`.

## Common Failures
- Missing/incorrect `projectPath`.
- IDE proxy process not available.
- `resources/list` unsupported warnings.

## Fix Patterns
- Use the active checkout path, for example:
  `/home/elpresidank/YeeBois/projects/beep-effect`
  or `/home/elpresidank/YeeBois/projects/beep-effect-worktrees/playground`.
- Treat unsupported resource-list warnings as non-fatal.
- Start with `get_project_modules` to validate server health.
