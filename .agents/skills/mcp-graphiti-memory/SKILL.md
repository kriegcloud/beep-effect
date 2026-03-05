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
2. Call `mcp__graphiti-memory__search_memory_facts` with `group_ids: ["beep-dev"]`.

## Representative Calls
- Read status: `get_status`.
- Recall facts: `search_memory_facts`.
- Save findings: `add_memory`.

## Common Failures
- `group_ids` type error.
- HTTP endpoint mismatch for `/mcp`.
- Handshake closes before `initialize` completes.

## Fix Patterns
- Always pass `group_ids` as an array, for example `["beep-dev"]`.
- Confirm URL is `http://localhost:8000/mcp`.
- Retest with a lightweight call (`get_status`) before deeper calls.
