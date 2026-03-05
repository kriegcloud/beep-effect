---
name: mcp-lsmcp
description: "Use for lsmcp symbol and index workflows plus troubleshooting startup, handshake, and timeout issues."
---

# MCP LSMCP

## Use When
- You need symbol-aware exploration and LSP-backed code navigation.
- lsmcp startup fails or times out.

## Quick Smoke
1. Call `mcp__lsmcp__get_symbol_search_guidance`.
2. Call `mcp__lsmcp__list_memories` with this root:
   `/home/elpresidank/YeeBois/projects/beep-effect3`.

## Representative Calls
- Guidance/health: `get_symbol_search_guidance`, `lsp_check_capabilities`.
- Symbol flows: `search_symbols`, `get_symbol_details`.
- File-aware LSP: `lsp_get_definitions`, `lsp_find_references`.

## Common Failures
- Handshake closes with `initialize response`.
- Timeout on wider scans when root is the full monorepo.
- Runtime crash on `node:sqlite` when launched with `--bun`.

## Fix Patterns
- Launch args should be:
  `bunx -y @mizchi/lsmcp -p typescript`
- Do not include `--bun` in MCP config args.
- Use scoped roots for reliability (for example `tooling/configs` or a package path) instead of the repo root.
- Start with low-cost calls, then narrow scope (`file`, `paths`, `limit`).
