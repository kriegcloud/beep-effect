# MCP LSMCP

Use this skill for TypeScript symbol indexing/search and lsmcp startup diagnosis.

## Use When
- You need fast symbol-level navigation across repo files.
- lsmcp startup reports handshake close or times out.

## Quick Smoke
1. `get_symbol_search_guidance`.
2. `list_memories` for repo root.

## Common Failures
- Startup closes during initialize.
- Slow/heavy calls timeout.
- `--bun` launch args crash on `node:sqlite`.

## Fix Patterns
- Use launch args: `bunx -y @mizchi/lsmcp -p tsgo`.
- Remove `--bun` from MCP config.
- Prefer lightweight calls first, then narrow query scope.
