# 2026-10-21 — 0.5.0 tool call from a chat on `tom-pc-1`

The last proof for #1933: a Claude chat on the attorney's PC calls a tool on
the installed 0.5.0 extension and gets a result.

## What ran

- Host: `tom-pc-1`, the attorney's Windows user, console session (a one-shot
  interactive scheduled task started from SSH, as in the install runbook's
  telemetry smoke section).
- Client: Claude Code 2.1.306 on the PC, headless (`claude -p … --strict-mcp-config
  --mcp-config <file> --allowedTools mcp__practice-kg__kg_provenance
  --output-format stream-json`).
- Server: the installed extension's `practice-kg-mcp.exe` (0.5.0, sha256
  `de30e68c…5ccd8a`), started with the extension folder as its working directory,
  against a copy of bundle `2026-10-07-04` so the run did not open the store the
  running Claude Desktop servers hold. The copy was deleted afterwards.

## Result

| Step | Evidence |
| --- | --- |
| MCP init | `practice-kg` status `connected` |
| `initialize` (separate raw probe) | `serverInfo: {"name":"beep-practice-kg","version":"0.5.0"}` |
| Tool call | `mcp__practice-kg__kg_provenance {}` |
| Tool result | not an error; `bundle_version` `2026-10-07-04`, one bundle row, count 15003, `tier` `complete`, `truncated` false |
| Final reply | "Bundle version 2026-10-07-04, from `mcp__practice-kg__kg_provenance`." (3 turns, exit 0) |

`kg_provenance` was chosen because its bundle-status answer carries no client
data, so it can be recorded here; a matter lookup exercises the same server
path.

## Findings

- The exe resolves its DuckDB native addon from the current directory, not its
  own folder: started from any other directory it exits with
  `Cannot find module '@duckdb/node-bindings-win32-x64/duckdb.node'`, which a
  client reports as "Connection closed". Claude Desktop starts it from the
  extension folder, so the installed extension is unaffected. Tracked in #1959.
- The ChatGPT remote computer-use project could not be driven from the
  orchestrating session, so the chat ran through Claude Code on the PC rather
  than the Claude Desktop window. Claude Desktop's own load of 0.5.0 is in its
  log on 2026-10-21 (server started, `initialize` and `tools/list` answered, no
  errors since).
