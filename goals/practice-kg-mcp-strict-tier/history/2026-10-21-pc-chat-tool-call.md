# 2026-10-21 — 0.5.0 tool calls from chats on `tom-pc-1`

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
- The first attempt through the ChatGPT remote computer-use project was
  wrongly judged undrivable; the agent route is
  `chatgpt-session send <bridge thread>` (see "Claude Desktop" below).

## Claude Desktop

The same proof through the Claude Desktop window, driven by ChatGPT's native
Computer Use on the PC (a bridge thread sent from the workstation; the prompt
allowed only starting Claude Desktop, one new chat, one message, and a
one-time permission for `kg_provenance`; no sign-in or other window touched).

- The PC had rebooted at 03:51 local, so Claude Desktop was not running; it was
  started from the Start menu. The live bundle was backed up first
  (`C:\PracticeKG\bundle-backup-2026-10-21`), because a Claude Code session on
  the PC already had a server open on it and the host opens both stores
  read-write.
- Message: "Use the Beep Practice Knowledge Graph tool kg_provenance to report
  the bundle status. Reply with the bundle version and the name of the tool you
  called."
- Claude Desktop showed the call "Beep Practice Knowledge Graph: Kg provenance"
  with response bundle version `2026-10-07-04`, count 15003,
  `derived-from-official-records`; no error and no permission prompt.
- Reply: "Bundle version: 2026-10-07-04 (built 2026-10-07 14:56 UTC, 15,003
  records, status complete, derived from official records). Tool called:
  kg_provenance (Beep Practice Knowledge Graph)."

The screenshots are kept on the PC (`C:\PracticeKG\desktop-proof-0.5.0\`),
not in this repository: the Claude Desktop sidebar in them lists the attorney's
other chats.
