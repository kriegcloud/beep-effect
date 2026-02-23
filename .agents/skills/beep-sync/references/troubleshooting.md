# Troubleshooting

## Service Account Secret Refs

**Problem:** `op read` fails with `"isn't an item"` or `"not found"` when using
a 1Password service account, even though the item exists in the vault.

**Cause:** Service accounts resolve items by vault ID + item ID + field ID, not
by human-readable names. Name-based refs like `op://My Vault/My Item/password`
work in desktop mode but fail with service accounts that have restricted access.

**Fix:** Use vault/item/field UUIDs in your secret refs:

```yaml
# Name-based (works with desktop auth, may fail with service accounts)
secrets:
  required:
    - id: api_key
      ref: op://beep-dev/context7/CONTEXT7_API_KEY

# ID-based (works with both desktop and service account auth)
secrets:
  required:
    - id: api_key
      ref: op://abc123def456/ghi789jkl012/mno345pqr678
```

To find the IDs:

```bash
# List vaults (get vault ID)
op vault list --format=json

# List items in vault (get item ID)
op item list --vault <vault-id> --format=json

# Get item fields (get field ID)
op item get <item-id> --vault <vault-id> --format=json
```

---

## Validation Fails with E_YAML_PARSE

**Problem:** `validate` returns `E_YAML_PARSE` before checking schema.

**Cause:** The YAML file has syntax errors (bad indentation, tabs, unclosed quotes).

**Fix:** Run the file through a YAML linter first:

```bash
# Quick syntax check
bun -e "import YAML from 'yaml'; console.log(YAML.parse(require('fs').readFileSync('$FILE', 'utf8')))"
```

---

## Dry-Run Reports Changed but Apply Is No-Op

**Problem:** `apply --dry-run` reports `changed: true` but a subsequent real
`apply` shows no visible diff.

**Cause:** Whitespace or key ordering differences between the existing file and
the deterministic generated output. beep-sync normalizes all output (sorted keys,
stable JSON), so the first apply after manual edits may show churn.

**Fix:** This is expected behavior. After the first real apply, subsequent
dry-runs will report `changed: false`. To avoid initial churn, always use
beep-sync to write managed files instead of hand-editing.

---

## Check Fails Immediately After Apply

**Problem:** `check` returns `{ ok: false }` right after `apply`.

**Cause:** This is a beep-sync bug. The check command re-derives the expected
content and compares hashes. If they diverge immediately, the normalize/generate
pipeline is non-deterministic.

**Fix:** File a bug. Include the fixture path and the full output of both
`apply` and `check`.

---

## Revert Does Nothing

**Problem:** `revert` returns `changed: false` with message
`"no managed state present; revert is idempotent no-op"`.

**Cause:** No state file exists at the configured `state_path`. Either `apply`
was never run, or a previous `revert` already cleaned up.

**Fix:** This is expected. Revert is intentionally idempotent.

---

## MCP Generate Drops Fields

**Problem:** `generate --tool cursor` drops `command` and `args` from the output.

**Cause:** Each tool has a defined capability map. Cursor only supports
`transport`, `url`, `env_headers`, and `env`. Fields outside the capability map
are silently dropped (or cause failure with `--strict`).

**Fix:** Use `--strict` to surface warnings as errors, then adjust the fixture
to only include fields the target tool supports. Refer to the capability map in
[config-contracts.md](config-contracts.md#capability-map).

---

## Runtime Drift Exit Code

**Problem:** `check` exits with code `3` but no hard parser error is shown.

**Cause:** Runtime drift/staleness was detected (for example missing/stale managed targets)
and the command intentionally distinguishes drift (`3`) from hard failures (`1`).

**Fix:** Run `beep-sync apply` to converge managed outputs, then rerun `beep-sync check`.
