# Commands Reference

All examples use absolute paths rooted at the workspace.

**Binary location:**

```
/home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts
```

**Fixture base:**

```
/home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures
```

---

## validate

Validate canonical config YAML against the schema contract.

```bash
# Validate a single valid config
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  validate --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-01/valid/config.yaml

# Validate a directory of fixtures
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  validate --fixtures /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-01/valid

# Expect validation failure (for testing invalid fixtures)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  validate --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-01/invalid/bad.yaml \
  --expect-fail

# Validate secret references (POC-05)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  validate --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-05/secrets-required.yaml
```

**Exit codes:** 0 = pass, 1 = validation failure, 2 = missing path.

---

## normalize

Produce a deterministic JSON envelope from a valid canonical config.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  normalize --input /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-01/valid/config.yaml
```

Output is written to stdout as pretty-printed JSON with a stable SHA-256 `hash` field.

---

## generate

Generate tool-specific config from a canonical fixture.

### MCP configs

```bash
# Codex (TOML output)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool codex \
  --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml

# Cursor (JSON output)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool cursor \
  --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml

# Windsurf (JSON output)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool windsurf \
  --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml

# Strict mode (fail on unsupported field warnings)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool cursor \
  --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml \
  --strict
```

### JetBrains prompt library

```bash
# Bundle-only mode (default)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool jetbrains \
  --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml

# Native file mode
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  generate --tool jetbrains \
  --fixture /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml \
  --mode native_file
```

---

## apply

Write managed targets from canonical `.beep/config.yaml` with backup and state tracking.

```bash
# Dry run (report changes without writing)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  apply --dry-run

# Real apply (writes files, creates backups and state)
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  apply
```

---

## check

Verify managed state consistency (no drift since last apply).

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  check
```

Returns `exitCode=0` when clean and `exitCode=3` when drift is detected without hard errors.

---

## doctor

Runtime health check for config readability, manifest/state parse health, and AGENTS fanout.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  doctor
```

---

## revert

Restore managed files from backup/state and clean up sidecars.

```bash
bun run /home/elpresidank/YeeBois/projects/beep-effect3/tooling/beep-sync/src/bin.ts \
  revert
```

- Restores `.bak` backup if it exists
- Removes managed file if hash matches (no backup case)
- Removes state file and empty state directories
- Idempotent: no-op when no managed state exists
