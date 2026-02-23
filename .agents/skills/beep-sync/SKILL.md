---
name: beep-sync
description: >
  Trigger on beep-sync, .beep config generation, MCP config generation,
  managed ownership/revert, secret validation, deterministic dry-run/no-churn checks.
version: 0.1.0
status: active
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

`beep-sync` is in runtime mode for v1 command surface:

- real `validate`, `apply`, `check`, `doctor`, and `revert` handlers
- deterministic managed artifact planning and hash-aware skip-write behavior
- managed-target-scoped revert with backup restoration and no-backup safe-removal path
- skill sync from `.beep/skills/*` to `.agents/skills/*`

## Workflow

The canonical workflow follows this pipeline:

```
validate -> generate/apply -> check/doctor -> revert
```

### 1. Validate

Parse and validate canonical `.beep/config.yaml` plus required secret resolution semantics.
Returns structured diagnostics.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  validate
```

- Exits 0 on success, 1 on runtime hard failure, 2 on path/usage error.
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

Generate fixture-only compatibility outputs (POC adapter checks).

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

Write managed targets from canonical `.beep/config.yaml`.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  apply [--dry-run]
```

- `--dry-run`: report what would change without writing to disk.
- Writes manifest/state sidecars at `.beep/manifests/managed-files.json` and `.beep/manifests/state.json`.
- Creates per-target backups before overwrite when required by settings.

### 5. Check

Verify managed state and planned artifacts are consistent.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  check
```

- Detects missing/stale managed targets and freshness drift.
- Returns exit code `3` on drift warnings when no hard errors are present.

### 6. Doctor

Runs runtime preflight checks for config readability, manifest/state parse health, and AGENTS fanout coverage.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  doctor
```

### 7. Revert

Restore managed files from backup and remove managed state.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  revert [--dry-run]
```

- Restores managed targets from state-backed backups when present.
- Removes generated-only managed targets when no backup exists and hash matches.
- Never mutates unmanaged targets.
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
