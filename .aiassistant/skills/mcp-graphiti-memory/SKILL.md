# MCP Graphiti Memory

Use this skill for Graphiti memory operations and startup diagnosis.

## Use When
- You need cross-session recall/write across coding sessions.
- Graphiti MCP appears connected but tool calls fail.

## Quick Smoke
1. Call `get_status`.
2. Call `search_memory_facts` with `group_ids: ["beep_dev"]`.

## Common Failures
- `group_ids` passed as string instead of list.
- Wrong URL path (`/mcp` mismatch).

## Fix Patterns
- Always pass `group_ids` as a list.
- Validate endpoint: `http://localhost:8000/mcp`.
- Retry with `get_status` before deeper calls.
