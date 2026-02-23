---
name: beep-sync
description: >
  Trigger on beep-sync, .beep config generation, MCP config generation,
  managed ownership/revert, secret validation, deterministic dry-run/no-churn checks.
version: 0.0.0-scaffold
status: scaffold
---

# beep-sync Skill

## Trigger Conditions

Activate this skill when the user:

- Mentions `beep-sync`, `beep sync`, or asks to synchronize AI tool configs
- Asks to generate, validate, or apply `.beep/config.yaml` or MCP server configs
- Asks to generate configs for Codex, Cursor, Windsurf, or JetBrains
- Asks about managed file ownership, backup/revert, or drift detection
- Asks to validate 1Password secret references
- Asks about deterministic output or no-churn guarantees

## Current Status

> **beep-sync is in scaffold mode.** The CLI validates inputs, emits deterministic
> placeholder output, and exercises the full command surface. Real generation logic
> is deferred to P1-P3 implementation phases.

## Workflow

The canonical workflow follows this pipeline:

```
validate -> generate/apply -> check/doctor -> revert
```

### 1. Validate

Parse and validate a canonical config YAML against the schema contract.
Returns structured diagnostics (error/warning with code, path, message).

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  validate --fixture <path-to-config.yaml>
```

- Exits 0 on success, 1 on validation failure, 2 on missing paths.
- Use `--expect-fail` to assert that invalid fixtures produce diagnostics.
- POC-05 fixtures validate 1Password secret references (required/optional with policy).

### 2. Normalize

Produce a deterministic normalized envelope (JSON) from a valid canonical config.
Sorts keys, deduplicates instructions, and computes a content-addressable SHA-256 hash.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  normalize --input <path-to-config.yaml>
```

### 3. Generate

Generate tool-specific config from a canonical fixture.

**MCP configs (Codex / Cursor / Windsurf):**

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool codex --fixture <mcp-fixture.yaml>
```

- `--tool`: `codex` (TOML), `cursor` (JSON), `windsurf` (JSON)
- `--strict`: fail on unsupported-field warnings instead of dropping silently.

**JetBrains prompt library:**

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool jetbrains --fixture <jetbrains-fixture.yaml> [--mode bundle_only|native_file]
```

- Produces `prompts.md`, `prompts.json`, and `IMPORT_INSTRUCTIONS.md` artifacts.
- Computes per-artifact SHA-256 and a bundle hash for determinism checks.

### 4. Apply

Write managed targets to disk. Backs up existing files before overwriting.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  apply --fixture <managed-fixture.yaml> [--dry-run]
```

- `--dry-run`: report what would change without writing to disk.
- Creates a state file (`.beep/managed-files.json`) tracking managed/unmanaged hashes.
- Always creates `.bak` backup before overwriting managed files.

### 5. Check

Verify managed state is consistent (no drift since last apply).

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  check --fixture <managed-fixture.yaml>
```

- Detects managed file drift (content changed after apply).
- Detects unmanaged file hash changes.
- Returns `{ ok: false }` with descriptive messages on inconsistency.

### 6. Doctor

Placeholder command. Will perform end-to-end health checks in P1+.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  doctor
```

### 7. Revert

Restore managed files from backup and remove managed state.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  revert --fixture <managed-fixture.yaml>
```

- Restores from `.bak` if backup exists.
- If no backup but managed hash matches, removes the managed file.
- Removes state file and cleans up empty state directories.
- Idempotent: reverts are no-ops when no managed state exists.

## Determinism / No-Churn Guardrails

beep-sync enforces deterministic output through:

1. **Stable key sorting**: All object keys are recursively sorted before serialization.
2. **Content-addressable hashing**: SHA-256 of normalized JSON produces a `hash` field
   in the envelope. Re-running on identical input always yields the same hash.
3. **Dry-run parity**: `apply --dry-run` computes the same generated content as a real
   apply, so `changed: false` means a real apply would be a no-op.
4. **Check after apply**: Running `check` immediately after `apply` must always return
   `{ ok: true }`. If it does not, this is a beep-sync bug.
5. **Sorted diagnostics**: Diagnostic output is sorted by path then code for stable
   comparison across runs.

## Reference Documents

- [Config Contracts](references/config-contracts.md) - Schema and fixture examples
- [Commands](references/commands.md) - Full command reference with absolute-path examples
- [Troubleshooting](references/troubleshooting.md) - Common issues and fixes
