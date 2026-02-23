# Config Contracts

## Canonical Config (POC-01)

The canonical config is the single-source-of-truth YAML that beep-sync validates,
normalizes, and generates tool-specific configs from.

### Schema

```yaml
version: <integer>         # Required. Schema version (currently 1).
instructions:
  base: <string[]>         # Optional. Sorted, deduplicated list of instruction file paths.
commands:
  - id: <string>           # Required. Non-empty command identifier.
    run: <string>          # Required. Non-empty shell command.
    cwd: <string>          # Optional. Working directory override.
mcp_servers:
  <server-name>:
    transport: <string>    # Required. Non-empty ("http", "stdio", etc.).
    url: <string>          # Optional. Server URL (HTTP transport).
    command: <string>      # Optional. Binary to spawn (stdio transport).
    args: <string[]>       # Optional. Arguments to command.
```

### Valid Example

Source: `tooling/beep-sync/fixtures/poc-01/valid/config.yaml`

```yaml
version: 1
instructions:
  base:
    - .beep/instructions/core.md
commands:
  - id: test
    run: bun test
mcp_servers:
  context7:
    transport: http
    url: https://mcp.context7.com
```

### Normalized Envelope

After normalization, the config is wrapped in a versioned envelope with a
content-addressable hash:

```json
{
  "version": 1,
  "hash": "<sha256-of-stable-json-config>",
  "config": {
    "version": 1,
    "instructions": { "base": [".beep/instructions/core.md"] },
    "commands": [{ "id": "test", "run": "bun test" }],
    "mcp_servers": {
      "context7": { "transport": "http", "url": "https://mcp.context7.com" }
    }
  }
}
```

### Validation Diagnostics

Diagnostic codes follow the pattern `E_<SECTION>_<ISSUE>`:

| Code | Path | Meaning |
|------|------|---------|
| `E_ROOT_TYPE` | `$` | Root value is not an object |
| `E_VERSION_TYPE` | `version` | Missing or non-integer version |
| `E_INSTRUCTIONS_TYPE` | `instructions` | Not an object |
| `E_INSTRUCTIONS_BASE_TYPE` | `instructions.base` | Not an array of strings |
| `E_COMMANDS_TYPE` | `commands` | Not an array |
| `E_COMMAND_ENTRY_TYPE` | `commands[N]` | Entry is not an object |
| `E_COMMAND_ID_TYPE` | `commands[N].id` | Missing or non-string id |
| `E_COMMAND_RUN_TYPE` | `commands[N].run` | Missing or non-string run |
| `E_MCP_SERVERS_TYPE` | `mcp_servers` | Not an object map |
| `E_MCP_SERVER_ENTRY_TYPE` | `mcp_servers.<name>` | Entry is not an object |
| `E_MCP_TRANSPORT_TYPE` | `mcp_servers.<name>.transport` | Missing or empty transport |

---

## MCP Servers Fixture (POC-02)

Defines MCP server entries. beep-sync generates tool-specific output
(Codex TOML, Cursor JSON, Windsurf JSON) from this fixture.

### Schema

```yaml
servers:
  <server-name>:
    transport: <string>
    command: <string>
    args: <string[]>
    url: <string>
    env: <Record<string, string>>
    env_headers: <Record<string, string>>
```

### Capability Map

Not all tools support all fields. Unsupported fields are dropped (or fail with `--strict`):

| Field | Codex | Cursor | Windsurf |
|-------|-------|--------|----------|
| `transport` | Y | Y | Y |
| `command` | Y | - | - |
| `args` | Y | - | - |
| `url` | Y | Y | Y |
| `env` | Y | Y | Y |
| `env_headers` | Y | Y | - |

### Example

Source: `tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml`

```yaml
servers:
  repo-docs:
    transport: stdio
    command: npx
    args:
      - -y
      - '@modelcontextprotocol/server-filesystem'
      - .
```

---

## JetBrains Prompt Library Fixture (POC-03)

Defines prompts for JetBrains AI Assistant prompt library generation.

### Schema

```yaml
jetbrains:
  prompt_library:
    mode: bundle_only | native_file   # Generation mode
    prompts:
      - id: <string>                  # Non-empty prompt identifier
        title: <string>               # Non-empty display title
        prompt_file: <string>         # Non-empty path to prompt source
```

### Example

Source: `tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml`

```yaml
jetbrains:
  prompt_library:
    mode: bundle_only
    prompts:
      - id: reviewer
        title: Code Review
        prompt_file: .beep/prompts/reviewer.md
```

### Generated Artifacts

| Artifact | Content |
|----------|---------|
| `.aiassistant/prompt-library/prompts.md` | Markdown listing of prompts |
| `.aiassistant/prompt-library/prompts.json` | Machine-readable prompt manifest |
| `.aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md` | Setup instructions |

---

## Managed Targets (POC-04)

Defines which files beep-sync owns and manages, plus where to store state.

### Schema

```yaml
managed_targets:
  - path: <string>          # Relative path to managed file
state_path: <string>        # Optional. Default: .beep/managed-files.json
```

### Example

Source: `tooling/beep-sync/fixtures/poc-04/managed.yaml`

```yaml
managed_targets:
  - path: .codex/config.toml
  - path: .cursor/mcp.json
state_path: .beep/managed-files.json
```

### State File

After `apply`, the state file records:

```json
{
  "version": 1,
  "managedFile": "<absolute-path>",
  "backupFile": "<absolute-path>.bak",
  "managedHash": "<sha256>",
  "unmanagedFile": "<absolute-path>",
  "unmanagedHashAtApply": "<sha256|null>",
  "lastAction": "apply"
}
```

---

## Secrets (POC-05)

Defines 1Password secret references to validate before generation.

### Schema

```yaml
secrets:
  required:
    - id: <string>          # Logical name for the secret
      ref: <string>         # 1Password reference (op://vault/item/field)
  optional:
    - id: <string>
      ref: <string>
  optional_policy: warn     # Currently only "warn" is supported
```

### Example

Source: `tooling/beep-sync/fixtures/poc-05/secrets-required.yaml`

```yaml
secrets:
  required:
    - id: context7_api_key
      ref: op://beep-dev/context7/CONTEXT7_API_KEY
    - id: auth_secret
      ref: op://beep-dev/auth/AUTH_SECRET
```

### Resolution Modes

| Mode | Trigger | Behavior |
|------|---------|----------|
| `mock` | `BEEP_SYNC_SECRET_MODE=mock` | Pattern-based: refs with `DOES_NOT_EXIST` or `/missing/` fail |
| `desktop` | Default (no service account token) | Runs `op read <ref>` with desktop auth |
| `service_account` | `OP_SERVICE_ACCOUNT_TOKEN` set | Runs `op read <ref>` with service account |

### Resolution Result

```json
{
  "ok": true,
  "source": "desktop",
  "optionalPolicy": "warn",
  "required": { "resolved": ["context7_api_key"], "missing": [] },
  "optional": { "resolved": [], "missing": [] },
  "diagnostics": [],
  "redaction": { "valuesExposed": false }
}
```
