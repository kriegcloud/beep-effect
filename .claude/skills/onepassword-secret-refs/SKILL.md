---
name: onepassword-secret-refs
description: "Safe 1Password workflows for Claude/Codex: Developer Environment MCP first, op:// secret-reference lookup, .env/.env.example rewrites, BEEP_SECRETS inventory, and auth diagnostics without exposing raw secret values."
metadata:
  short-description: 1Password MCP/op secret refs without raw values
---

# 1Password Secret References

Use this skill when a task mentions 1Password, `op://` secret references,
Developer Environments, `op` CLI, `.env`, `.env.example`, `BEEP_SECRETS`, or
secret-reference inventory.

## Non-Negotiables

- Never ask the user to paste raw secret values.
- Never print, summarize, or store raw secret values.
- Never use `--reveal`.
- Prefer 1Password MCP for 1Password Developer Environments.
- If the MCP server is unavailable, insufficient for vault item inspection, or
  blocked by the local approval client, fall back to sanitized `op` CLI metadata
  commands and report that MCP was skipped for that part.
- When reading 1Password item JSON, pipe through a filter that emits only field
  labels, section labels, field ids, item/vault names, and `.reference`.
- Keep tracked examples commit-safe. `.env.example` should contain placeholders,
  documentation, or secret references only; never real secret values.

## Fast Diagnosis

Before retrying a failed MCP auth loop, check the live host state:

```bash
claude mcp list
codex mcp list
pgrep -a -f '1Password|onepassword-mcp|op daemon' || true
op --version
op whoami
```

Interpretation:

- `op whoami` says the account is not signed in: ask the user to unlock/sign in
  through 1Password desktop, then retry the narrow operation.
- 1Password desktop is running but MCP auth says the desktop app is not running:
  treat the MCP approval path as blocked for this session, especially inside
  nested agent harnesses.
- `BinaryPermissions` means 1Password does not trust the caller path. Prefer the
  machine's trusted Claude/Codex path and avoid user-writable Node/NVM launch
  parents.
- `no top level process found` or `executable path is missing for caller
  process` means the nested harness is a poor approval client. Stop repeating
  the same MCP auth call; use sanitized `op` metadata if it satisfies the task.

## MCP Usage

For Developer Environment tasks, authenticate once with the 1Password MCP server
and then use its environment tools. If auth fails, do not loop. Record the
sanitized failure and use the CLI fallback only when the task can be completed
without raw secret values.

The current agent 1Password MCP tools may not expose general vault item/field
inspection. For vault item secret references, use the `op` fallback below.

## Secret-Reference Lookup

To find refs for fields in the `BEEP_SECRETS` vault and the `BEEP_SECRETS` item,
emit only reference metadata:

```bash
op item get "BEEP_SECRETS" \
  --vault "BEEP_SECRETS" \
  --format json \
  | jq -r '
      .fields[]
      | select(.reference != null)
      | [
          (.section.label // ""),
          (.label // ""),
          (.id // ""),
          .reference
        ]
      | @tsv
    '
```

If item lookup by title is ambiguous, resolve the item id without showing
values:

```bash
op item list --vault "BEEP_SECRETS" --format json \
  | jq -r '.[] | select(.title == "BEEP_SECRETS") | [.id, .title] | @tsv'
```

Do not run commands that output unfiltered item JSON into chat or tool results.

## `.env` And `.env.example`

When redesigning env files:

- Inventory required variables from scripts, package configs, tests, and docs.
- Group variables by subsystem with short comments only where useful.
- Use empty values or placeholder refs in `.env.example`.
- Use actual `op://BEEP_SECRETS/BEEP_SECRETS/...` references in ignored `.env`.
- Prefer stable field names over duplicate aliases unless the code requires both.
- If runtime tooling expects plaintext values, document the wrapper command:

```bash
op run --env-file=.env -- <command>
```

## Safe Closeout

Report:

- Whether MCP was used successfully or skipped.
- Whether `op` was signed in.
- Which files changed.
- That only secret references were written or displayed.
- Any remaining user action, such as unlocking 1Password desktop.
