---
name: mcp-graphiti-memory
description: "Use for Graphiti MCP memory workflows including startup checks, fact search, episode logging, and handshake diagnosis."
---

# MCP Graphiti Memory

## Use When
- You need cross-session memory lookup or writeback.
- You see Graphiti MCP startup or handshake failures.

## Quick Smoke
1. Call `mcp__graphiti-memory__get_status`.
2. Call `mcp__graphiti-memory__search_memory_facts` with `group_ids: "[\"beep-dev\"]"` when the wrapper exposes `group_ids` as a string. If the tool accepts native arrays, `["beep-dev"]` is also valid.

## Representative Calls
- Read status: `get_status`.
- Recall facts: `search_memory_facts`.
- Save findings: `add_memory`.

## Common Failures
- `group_ids` type error.
- HTTP endpoint mismatch for `/mcp`.
- Handshake closes before `initialize` completes.

## Fix Patterns
- The server expects `group_ids` to decode to a list. Never pass the plain string `"beep-dev"`.
- If the MCP tool schema exposes `group_ids` as `string`, pass the JSON array literal string `"[\"beep-dev\"]"`.
- If the MCP tool schema exposes `group_ids` as an array, pass `["beep-dev"]`.
- Confirm URL is `http://localhost:8000/mcp`.
- Retest with a lightweight call (`get_status`) before deeper calls.
