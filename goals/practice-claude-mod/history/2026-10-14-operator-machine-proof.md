# Operator-machine proof — 2026-10-14

First vertical slice (plain-language rows + verdict capture), loaded from
`apps/practice-claude-mod/dist/plugin` on the operator's Linux machine.

## Setup

- Claude Code 2.1.299, interactive terminal session, plugin loaded with
  `--plugin-dir dist/plugin`.
- practice-kg registered for the session only (`--mcp-config`,
  `--strict-mcp-config`), pointed at a reflink copy of bundle
  `2026-10-07-04` under `~/.cache/beep/` (the staging bundle was held open by
  the always-on docket-intake service).
- Prompt: "How many clients does the practice knowledge graph list? Use the
  practice-kg kg_clients tool once and answer with just the number."

## What the screen showed

```text
● I'll load the practice-kg kg_clients tool and call it once.
Listing the firm's clients

● 31

✻ Baked for 33s · done 6:56 AM
Last answer: [ Right ] [ Wrong ] [ Partly ] Undo      [-]
```

- The practice-kg tool row drew as a plain sentence; no tool name or JSON.
- After the answer, the band offered the verdict controls (D14).

## Automated checks at the same commit

- `claude plugin validate dist/plugin`: passed; calls within the D9/D18
  envelope (`$.clock.now`, `$.command.register`, `$.fs.write`,
  `$.session.id`, `$.session.messages`, `$.store.get/set`,
  `$.ui.invalidate/resolve/toast`).
- `claude plugin test dist/plugin`: 6 pass (verdict commands, export, tool
  row on terminal and desktop, other servers' rows untouched).
- `vitest`: 11 pass (phrases, verdict log revisions, lock refusal, export).
- Headless `claude -p --plugin-dir dist/plugin "/wrong"`: the plugin answered
  "There is no answer to mark yet."

## Still to prove

- Pressing the band buttons by hand (the verdict path itself is covered by
  `claude plugin test`).
- The attorney's Windows PC (P2 delivery).

## Attorney PC delivery (same day)

- Copied `dist/.claude-plugin/marketplace.json` and `dist/plugin/` (manifest,
  hooks, tests) into a directory marketplace on the attorney's Windows PC.
  Engine type files the operator's interactive session had written into
  `dist/plugin/.claude-plugin/types/` were removed from the copy; the
  delivery runbook copies only the release files.
- `claude plugin marketplace add <folder>` and
  `claude plugin install oip-practice@oip-practice-local --scope user`:
  installed, enabled, "Read from" the marketplace folder (updates are a
  re-copy plus `/reload-plugins`).
- Claude Code 2.1.299 on the PC, headless `claude -p "/wrong"` in the
  working folder answered "oip-practice: There is no answer to mark yet."
  The hooks load and run on Windows. The drawn rows and band on the PC are
  confirmed at the next attorney session.

## Slice 2 delivery (same day)

- The #1756 merge commit was built (`bun run plugin:test`: 15 engine tests
  pass) and only the release files (marketplace, manifest, hooks, skills) were
  copied to the attorney PC's marketplace folder, replacing the slice-1 copy.
- `claude plugin list` there: enabled, read from the marketplace folder.
- Headless `claude -p "/time"` answered "Timer is stopped." and
  `claude -p "/matter"` answered "No matter is selected."; the five skills ship
  in the plugin. Drawn band and rows on the PC are confirmed at the next sitting.
