# POC Command Templates (.beep)

Date: 2026-02-23
Status: templates

## 1. Usage

Run from:
- `/home/elpresidank/YeeBois/projects/beep-effect3`

Record outputs into corresponding `poc-0x-*-results.md` files.

## 2. POC-01 Canonical Compiler

```bash
# Expected once runtime exists
bun tooling/beep-sync/bin/beep-sync validate --fixtures tooling/beep-sync/fixtures/poc-01/valid
bun tooling/beep-sync/bin/beep-sync validate --fixtures tooling/beep-sync/fixtures/poc-01/invalid --expect-fail
bun tooling/beep-sync/bin/beep-sync normalize --input tooling/beep-sync/fixtures/poc-01/valid/config.yaml > /tmp/poc01-norm-1.json
bun tooling/beep-sync/bin/beep-sync normalize --input tooling/beep-sync/fixtures/poc-01/valid/config.yaml > /tmp/poc01-norm-2.json
diff -u /tmp/poc01-norm-1.json /tmp/poc01-norm-2.json
```

## 3. POC-02 MCP Capability Maps

```bash
bun tooling/beep-sync/bin/beep-sync generate --tool codex --fixture tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml
bun tooling/beep-sync/bin/beep-sync generate --tool cursor --fixture tooling/beep-sync/fixtures/poc-02/mcp-cursor.yaml
bun tooling/beep-sync/bin/beep-sync generate --tool windsurf --fixture tooling/beep-sync/fixtures/poc-02/mcp-windsurf.yaml
bun tooling/beep-sync/bin/beep-sync generate --tool cursor --strict --fixture tooling/beep-sync/fixtures/poc-02/mcp-cursor-unsupported.yaml
bun tooling/beep-sync/bin/beep-sync generate --tool windsurf --strict --fixture tooling/beep-sync/fixtures/poc-02/mcp-windsurf-unsupported.yaml
```

## 4. POC-03 JetBrains Prompt Library

```bash
# Bundle-only default
bun tooling/beep-sync/bin/beep-sync generate --tool jetbrains --fixture tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml

# Optional native probe (only if stable path/format is discovered)
bun tooling/beep-sync/bin/beep-sync generate --tool jetbrains --mode native_file --fixture tooling/beep-sync/fixtures/poc-03/jetbrains-native.yaml
```

## 5. POC-04 Managed Ownership + Revert

```bash
bun tooling/beep-sync/bin/beep-sync apply --fixture tooling/beep-sync/fixtures/poc-04/managed.yaml
bun tooling/beep-sync/bin/beep-sync check --fixture tooling/beep-sync/fixtures/poc-04/managed.yaml
bun tooling/beep-sync/bin/beep-sync revert --fixture tooling/beep-sync/fixtures/poc-04/managed.yaml
bun tooling/beep-sync/bin/beep-sync revert --fixture tooling/beep-sync/fixtures/poc-04/managed.yaml
```

## 6. POC-05 Secret Resolution

```bash
# Local desktop auth path
op whoami
bun tooling/beep-sync/bin/beep-sync validate --fixture tooling/beep-sync/fixtures/poc-05/secrets-required.yaml

# Automation/service-account path (example)
export OP_SERVICE_ACCOUNT_TOKEN='<set-in-shell>'
bun tooling/beep-sync/bin/beep-sync validate --fixture tooling/beep-sync/fixtures/poc-05/secrets-required.yaml

# Expected failure path (required missing)
bun tooling/beep-sync/bin/beep-sync validate --fixture tooling/beep-sync/fixtures/poc-05/secrets-missing.yaml
```

## 7. POC-06 End-to-End Dry Run

```bash
bun tooling/beep-sync/bin/beep-sync validate
bun tooling/beep-sync/bin/beep-sync apply --dry-run
bun tooling/beep-sync/bin/beep-sync check
bun tooling/beep-sync/bin/beep-sync doctor
```

## 8. Quality Suite Bundle

```bash
bun run beep-sync:test:unit
bun run beep-sync:test:fixtures
bun run beep-sync:test:integration
bun run beep-sync:test:coverage
```
