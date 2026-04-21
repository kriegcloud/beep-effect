---
name: mcp-jetbrains
description: "Use for JetBrains MCP operations in this repo, including project introspection, file access, and startup diagnosis."
---

# MCP JetBrains

## Use When
- You need IDE-indexed reads, searches, symbol info, or safe refactors.
- You need a low-noise project health check.

## Quick Smoke
1. Call `mcp__jetbrains__get_project_modules` with `projectPath` set.
2. Call `mcp__jetbrains__get_all_open_file_paths`.

## Representative Calls
- Structure: `list_directory_tree`, `get_project_modules`.
- Code read/search: `get_file_text_by_path`, `search_in_files_by_text`.
- Refactor/edit: `rename_refactoring`, `replace_text_in_file`.

## Common Failures
- Wrong or missing `projectPath`.
- JetBrains IDE not running proxy-side services.
- Warnings for unsupported resource list endpoints.

## Fix Patterns
- Use the active checkout path, for example:
  `/home/elpresidank/YeeBois/projects/beep-effect`
  or `/home/elpresidank/YeeBois/projects/beep-effect-worktrees/playground`.
- Treat `resources/list` unsupported warnings as non-fatal.
- Validate availability with `get_project_modules` first.
