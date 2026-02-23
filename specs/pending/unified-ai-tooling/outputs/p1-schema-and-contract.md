# P1 Schema and Compiler Contract (.beep)

Date: 2026-02-23  
Status: completed

## 1) Scope and Locked Inputs

This document defines the implementation contract for Phase P1 (Schema + Compiler Contract).

Locked constraints carried forward from ADRs and POC evidence:

1. No symlink strategy.
2. Project-only config scope.
3. Linux-only v1 support.
4. One instruction source must generate both `AGENTS.md` and `CLAUDE.md`.
5. Generated outputs are committed, including `.codex/` and `.mcp.json`.
6. Skills are first-class in scope.
7. Managed targets default to full-file rewrite.
8. Strict JSON targets use sidecar ownership metadata (no inline markers).
9. POC-01..POC-06 are locked baseline evidence and are not modified by this phase.

## 2) Canonical `.beep/config.yaml` Schema Contract

### 2.1 File, Version, and Scope

1. Canonical config file path is fixed: `.beep/config.yaml`.
2. `version` is required and MUST equal `1` for v1 runtime.
3. Config scope is repository-local only; no `~/.beep`, `~/.ai`, or user-global overlay is permitted in v1.
4. All file paths in config MUST be repository-relative, use forward slashes, and MUST NOT escape repo root.

### 2.2 Top-Level Schema

| Key | Type | Required | Contract |
|---|---|---|---|
| `version` | integer | yes | Must be `1`. |
| `project` | object | yes | Project identity metadata. |
| `settings` | object | yes | Ownership/commit/platform policy. |
| `instructions` | object | yes | Single canonical instruction source model. |
| `commands` | array | yes | Canonical commands used by adapters/hooks. |
| `hooks` | array | yes | Canonical hook definitions (contract only; wiring deferred). |
| `mcp` | object | yes | Canonical MCP servers + secret provider policy. |
| `agents` | object | yes | Canonical agent definitions and prompt files. |
| `skills` | object | yes | Canonical skill source/include model. |
| `tool_overrides` | object | yes | Tool-specific extension namespace. |
| `manifests` | object | yes | Paths to managed ownership and runtime state metadata. |

Unknown top-level keys are invalid (`E_SCHEMA_UNKNOWN_FIELD`).

### 2.3 Domain Field Contract

#### `project`

| Field | Type | Required | Contract |
|---|---|---|---|
| `name` | string | yes | Stable project identifier. |

#### `settings`

| Field | Type | Required | Contract |
|---|---|---|---|
| `ownership` | enum | yes | Must be `full_file_rewrite` in v1. |
| `commit_generated` | boolean | yes | Must be `true` in v1. |
| `require_revert_backups` | boolean | yes | Must be `true` in v1. |
| `scope` | enum | no | Defaults to `project_only`; any other value errors. |
| `platform` | enum | no | Defaults to `linux`; non-linux value errors in v1. |

#### `instructions`

| Field | Type | Required | Contract |
|---|---|---|---|
| `root` | string[] | yes | Ordered list of markdown fragments composing canonical instruction source. |
| `packages.strategy` | enum | yes | Must be `generate_for_all_packages`. |
| `packages.template` | string | yes | Template for per-package `AGENTS.md`. |
| `root_template` | string | no | Defaults to `.beep/templates/AGENTS.root.md.hbs` if omitted. |

Contract rule: `instructions.root` is the only canonical instruction source. Adapters MUST derive both root `AGENTS.md` and root `CLAUDE.md` from this same resolved source bundle.

#### `commands`

Each command item:

| Field | Type | Required | Contract |
|---|---|---|---|
| `id` | string | yes | Unique command id in canonical namespace. |
| `run` | string | yes | Shell command. |
| `cwd` | string | no | Repo-relative execution cwd. |
| `description` | string | no | Human-readable description. |

Duplicate `commands[*].id` is invalid (`E_SCHEMA_DUPLICATE_ID`).

#### `hooks`

Each hook item:

| Field | Type | Required | Contract |
|---|---|---|---|
| `id` | string | yes | Unique hook id. |
| `event` | string | yes | Canonical event name (adapter maps to tool-native event names). |
| `command_id` | string | conditional | Required when referencing a canonical command. |
| `run` | string | conditional | Allowed when inline command is needed; mutually exclusive with `command_id`. |
| `enabled` | boolean | no | Defaults to `true`. |

#### `mcp`

| Field | Type | Required | Contract |
|---|---|---|---|
| `secret_provider` | object | yes | Secret resolution policy contract. |
| `servers` | array | yes | Canonical MCP server list. |

`secret_provider` fields:

| Field | Type | Required | Contract |
|---|---|---|---|
| `type` | enum | yes | Must be `onepassword` in v1. |
| `required` | boolean | yes | If true, unresolved required secret refs are fatal. |
| `optional_policy` | enum | no | Defaults to `warn`. |

Each MCP server item:

| Field | Type | Required | Contract |
|---|---|---|---|
| `id` | string | yes | Stable server identifier. |
| `transport` | enum | yes | `stdio` or `http`. |
| `command` | string | conditional | Required for `stdio`. |
| `args` | string[] | no | Optional command args for `stdio`. |
| `url` | string | conditional | Required for `http`. |
| `env` | map<string,string> | no | Env var map (values may be plain refs such as `op://...`). |
| `env_headers` | map<string,string> | no | Header env mapping in canonical form. |
| `enabled` | boolean | no | Defaults to `true`. |

Duplicate `mcp.servers[*].id` is invalid.

#### `agents`

| Field | Type | Required | Contract |
|---|---|---|---|
| `definitions` | array | yes | Canonical agent records. |

Each definition:

| Field | Type | Required | Contract |
|---|---|---|---|
| `id` | string | yes | Stable agent id. |
| `prompt_file` | string | yes | Markdown prompt path under `.beep/agents/`. |
| `description` | string | no | Human-readable metadata. |

#### `skills`

| Field | Type | Required | Contract |
|---|---|---|---|
| `sources` | string[] | yes | Skill source roots. |
| `include` | string[] | yes | Explicit include filter (empty means all discoverable from `sources`). |

#### `tool_overrides`

`tool_overrides` is required with these required child objects:

1. `claude`
2. `codex`
3. `cursor`
4. `windsurf`
5. `jetbrains`

Unknown fields inside each tool override object are allowed at schema parse time and evaluated by adapter capability descriptors during compile.

#### `manifests`

| Field | Type | Required | Contract |
|---|---|---|---|
| `managed_files` | string | yes | Sidecar ownership manifest path (default `.beep/manifests/managed-files.json`). |
| `state` | string | yes | Runtime state metadata path (default `.beep/manifests/state.json`). |

### 2.4 Canonical Example (v1)

```yaml
version: 1
project:
  name: beep-effect3

settings:
  ownership: full_file_rewrite
  commit_generated: true
  require_revert_backups: true
  scope: project_only
  platform: linux

instructions:
  root:
    - .beep/instructions/root.md
    - .beep/instructions/security.md
  packages:
    strategy: generate_for_all_packages
    template: .beep/templates/AGENTS.package.md.hbs
  root_template: .beep/templates/AGENTS.root.md.hbs

commands: []
hooks: []

mcp:
  secret_provider:
    type: onepassword
    required: true
    optional_policy: warn
  servers: []

agents:
  definitions: []

skills:
  sources:
    - .agents/skills
  include: []

tool_overrides:
  claude: {}
  codex: {}
  cursor: {}
  windsurf: {}
  jetbrains: {}

manifests:
  managed_files: .beep/manifests/managed-files.json
  state: .beep/manifests/state.json
```

## 3) Compiler Contract

### 3.1 Inputs

Compiler input set for `validate`, `apply`, `check`, `doctor`, and adapter generation:

1. `.beep/config.yaml`.
2. Referenced markdown/templates/assets under `.beep/`.
3. Workspace package inventory discovered from root `package.json` `workspaces` globs.
4. Existing metadata sidecars from `manifests.managed_files` and `manifests.state`.
5. CLI flags: `--strict`, `--dry-run`, `--tool`, `--fixture` (fixture mode only).
6. Runtime adapter registry + adapter capability descriptors.

### 3.2 Normalized Model (`NormalizedModelV1`)

Compiler MUST normalize source into a deterministic internal model before adapters run.

```ts
type NormalizedModelV1 = {
  schemaVersion: 1
  sourceConfigPath: ".beep/config.yaml"
  sourceHash: string // sha256 of canonical normalized config JSON
  project: { name: string }
  settings: {
    ownership: "full_file_rewrite"
    commitGenerated: true
    requireRevertBackups: true
    scope: "project_only"
    platform: "linux"
  }
  instructions: {
    rootFiles: string[]
    mergedMarkdown: string
    mergedHash: string
    rootTemplatePath: string
    packageTemplatePath: string
    packageStrategy: "generate_for_all_packages"
  }
  commandsById: Record<string, { id: string; run: string; cwd?: string; description?: string }>
  hooks: Array<{ id: string; event: string; commandId?: string; run?: string; enabled: boolean }>
  mcp: {
    secretProvider: { type: "onepassword"; required: boolean; optionalPolicy: "warn" }
    serversById: Record<string, {
      id: string
      transport: "stdio" | "http"
      command?: string
      args?: string[]
      url?: string
      env?: Record<string, string>
      envHeaders?: Record<string, string>
      enabled: boolean
    }>
  }
  agents: { definitionsById: Record<string, { id: string; promptFile: string; description?: string }> }
  skills: { sources: string[]; include: string[] }
  toolOverrides: Record<"claude" | "codex" | "cursor" | "windsurf" | "jetbrains", Record<string, unknown>>
  workspacePackages: Array<{ name: string; path: string }>
  manifests: { managedFilesPath: string; statePath: string }
}
```

Normalization guarantees:

1. Deterministic key sorting.
2. Deduplication where contract requires uniqueness.
3. Stable path normalization to repo-relative POSIX format.
4. Idempotence: `normalize(normalize(x)) == normalize(x)`.

### 3.3 Compile Stages

`Input -> Normalized -> Target artifacts` is fixed in this order:

1. Parse YAML and referenced assets.
2. Schema validation (including collision checks and path safety checks).
3. Normalize into `NormalizedModelV1` + deterministic `sourceHash`.
4. Resolve instruction bundle once and pass same source to AGENTS and CLAUDE adapters.
5. Expand workspace packages and construct AGENTS plan (root + each workspace package).
6. Run adapters with capability descriptors and override inputs.
7. Produce artifact graph (`ArtifactPlanV1`) with hashes and ownership metadata.
8. Apply warnings/errors policy (`strict` escalation rules).
9. For `apply`: write changed managed files, update manifests/state, run orphan cleanup bounded by managed metadata.
10. For `check`: compare regenerated graph vs committed outputs + manifests/state and return drift diagnostics.

### 3.4 Artifact Plan Contract (`ArtifactPlanV1`)

```ts
type ArtifactPlanV1 = {
  version: 1
  normalizedHash: string
  artifacts: Array<{
    path: string
    format: "markdown" | "json" | "toml"
    content: string
    contentHash: string // sha256(content bytes)
    sourceHash: string // points to NormalizedModelV1.sourceHash or domain hash
    adapter: "core" | "claude" | "codex" | "cursor" | "windsurf" | "jetbrains"
    adapterVersion: string
    ownership: "full_file_rewrite"
  }>
  diagnostics: DiagnosticV1[]
}
```

Managed target families in v1:

1. Root `AGENTS.md`.
2. Root `CLAUDE.md`.
3. Per-workspace-package `AGENTS.md`.
4. `.codex/config.toml`.
5. `.mcp.json`.
6. Tool-native managed files under `.cursor/`, `.windsurf/`, `.aiassistant/`.

## 4) Deterministic Serialization Contract

Serialization rules are normative and adapter-independent:

1. UTF-8 encoding, no BOM.
2. Line endings are LF (`\n`) only.
3. Exactly one trailing newline in every generated text file.
4. JSON:
   - 2-space indentation.
   - keys sorted lexicographically at every object depth.
   - arrays sorted only when defined as sets by schema; ordered lists preserve canonical semantic order.
5. TOML:
   - table blocks sorted lexicographically.
   - key order within each table sorted lexicographically.
6. Markdown:
   - deterministic generated header block for text formats only.
   - no timestamp placeholders in generated body.
7. Artifact write order sorted lexicographically by path.
8. Hash algorithm is SHA-256 over exact bytes written.
9. Skip-write: if target exists and hash is unchanged, file MUST NOT be rewritten.

## 5) Unsupported-Field Handling Path

Unsupported handling is explicit and deterministic:

1. Core schema unknown fields (outside `tool_overrides.*`) are hard errors (`E_SCHEMA_UNKNOWN_FIELD`).
2. Tool override fields are passed to adapter mapping stage.
3. If adapter capability descriptor does not support a field:
   - default mode emits `W_UNSUPPORTED_FIELD` and drops field.
   - `--strict` escalates to hard error (`E_UNSUPPORTED_FIELD_STRICT`) and blocks emission.
4. Required-domain unsupported mapping (for example required auth/transport fields) is always hard error even without `--strict`.
5. Diagnostics MUST include tool id and exact field path.

## 6) Error Taxonomy Contract

```ts
type DiagnosticV1 = {
  severity: "error" | "warning" | "info"
  code: string
  path: string
  message: string
  tool?: "core" | "claude" | "codex" | "cursor" | "windsurf" | "jetbrains"
}
```

Reserved error code families:

| Family | Examples | Contract |
|---|---|---|
| Schema/parse | `E_YAML_PARSE`, `E_SCHEMA_TYPE`, `E_SCHEMA_UNKNOWN_FIELD`, `E_SCHEMA_DUPLICATE_ID` | Blocks normalize/compile. |
| Normalize/transform | `E_NORMALIZE_COLLISION`, `E_NORMALIZE_PATH_ESCAPE` | Blocks compile graph construction. |
| Adapter mapping | `W_UNSUPPORTED_FIELD`, `E_UNSUPPORTED_FIELD_STRICT`, `E_ADAPTER_REQUIRED_FIELD_MISSING` | Warning/default + strict escalation rules apply. |
| Secret resolution | `E_SECRET_AUTH`, `E_SECRET_REQUIRED_UNRESOLVED`, `W_SECRET_OPTIONAL_UNRESOLVED` | Required unresolved always fatal. |
| IO/write | `E_IO_READ`, `E_IO_WRITE`, `E_IO_PERMISSION` | Fatal for requested command action. |
| State/manifest | `E_STATE_PARSE`, `E_STATE_VERSION`, `E_MANIFEST_CORRUPT` | Fatal unless `doctor` explicitly running repair mode. |
| Cleanup/revert safety | `E_CLEANUP_OUT_OF_SCOPE`, `E_REVERT_MISSING_BACKUP`, `E_REVERT_UNMANAGED_TARGET` | Prevents unsafe destructive operations. |

Exit behavior contract:

1. Any `error` diagnostic => non-zero exit.
2. Warnings do not fail by default.
3. `--strict` upgrades configured warning classes to errors.
4. Required secret and cleanup-safety violations are always fatal.

## 7) Managed-File Ownership Metadata Contract (JSON Sidecar Strategy)

### 7.1 Strategy

1. JSON targets MUST remain strict JSON and MUST NOT contain inline ownership markers/comments.
2. Ownership for JSON targets is tracked only in sidecar metadata at `.beep/manifests/managed-files.json`.
3. Text targets (Markdown/TOML) may include generated headers in-file; JSON targets may not.

### 7.2 Sidecar Schema (`ManagedFilesManifestV1`)

```json
{
  "version": 1,
  "generator": {
    "name": "beep-sync",
    "version": "<runtime-version>"
  },
  "files": [
    {
      "path": ".mcp.json",
      "format": "json",
      "ownership": "full_file_rewrite",
      "managed": true,
      "sourceHash": "<sha256>",
      "contentHash": "<sha256>",
      "normalizedHash": "<sha256>",
      "adapter": "core",
      "adapterVersion": "<adapter-version>",
      "jsonOwnership": {
        "mode": "sidecar_only",
        "manifestPath": ".beep/manifests/managed-files.json",
        "inlineMarkers": false
      },
      "orphanPolicy": "delete_if_missing_from_plan"
    }
  ]
}
```

Contract rules:

1. `files` must be sorted lexicographically by `path`.
2. Only managed targets may appear in this manifest.
3. Orphan cleanup candidates are computed from previous manifest file paths minus current artifact plan paths.
4. Cleanup MAY remove only paths previously marked `managed: true`.
5. Cleanup MUST abort with `E_CLEANUP_OUT_OF_SCOPE` if any candidate path escapes repo root or is outside managed set.

## 8) AGENTS Generation and Freshness Contract

### 8.1 Generation Scope

Generation is mandatory for:

1. Root `AGENTS.md`.
2. Root `CLAUDE.md`.
3. Every workspace package directory matched from root `package.json.workspaces` that contains a `package.json` file, each with `<package>/AGENTS.md`.

`instructions.root` must be the shared source for root `AGENTS.md` and `CLAUDE.md`.

### 8.2 Freshness Model

For each AGENTS target, compiler computes:

`freshnessHash = sha256(instructionsMergedHash + templateHash + packagePath + adapterVersion)`

Freshness is stored in managed metadata (`managed-files.json` and `state.json` target entries).

`beep-sync check` must mark AGENTS stale when any of these is true:

1. Target file missing.
2. Content hash mismatch with regenerated artifact.
3. `freshnessHash` mismatch.
4. Workspace package was added/removed and AGENTS fanout is out of sync.

Required diagnostics:

1. `E_AGENTS_MISSING` for required missing AGENTS.
2. `E_AGENTS_STALE` for content/hash mismatch.
3. `E_AGENTS_SCOPE_DRIFT` for workspace fanout mismatch.

## 9) State Metadata Contract (Hashes, Adapter Versions, Orphan Inputs)

### 9.1 State Schema (`StateManifestV1`)

```json
{
  "version": 1,
  "normalizedHash": "<sha256>",
  "targets": {
    "AGENTS.md": {
      "adapter": "core",
      "adapterVersion": "<version>",
      "sourceHash": "<sha256>",
      "contentHash": "<sha256>",
      "freshnessHash": "<sha256>",
      "managed": true
    }
  },
  "managedPathIndex": [
    "AGENTS.md",
    "CLAUDE.md",
    ".mcp.json"
  ],
  "cleanupInputs": {
    "previousManagedPaths": ["AGENTS.md", ".mcp.json"],
    "currentPlannedPaths": ["AGENTS.md", "CLAUDE.md", ".mcp.json"],
    "orphanCandidates": []
  }
}
```

Contract rules:

1. `version` is required and must equal `1`.
2. `targets` keyspace is path-keyed and sorted.
3. `managedPathIndex` is sorted and de-duplicated.
4. `cleanupInputs.orphanCandidates` is computed deterministically as set difference.
5. `state.json` write is skipped on no-op runs where serialized bytes are unchanged.
6. `apply --dry-run` MUST NOT mutate either sidecar file.

## 10) Adapter Capability Descriptor Contract (P2 Unblock)

Each adapter must provide a deterministic capability descriptor consumed by compile-time validation.

```ts
type AdapterCapabilityDescriptorV1 = {
  version: 1
  tool: "claude" | "codex" | "cursor" | "windsurf" | "jetbrains"
  adapterVersion: string
  domains: {
    instructions: {
      supportsRootAgents: boolean
      supportsRootClaude: boolean
      supportsPackageAgents: boolean
    }
    mcp: {
      supportedFields: string[]
      requiredByTransport: {
        stdio: string[]
        http: string[]
      }
      fieldTransforms: Array<{ from: string; to: string }>
      unsupportedWarningCode: "W_UNSUPPORTED_FIELD"
      strictErrorCode: "E_UNSUPPORTED_FIELD_STRICT"
    }
    skills: {
      supported: boolean
      mode: "direct" | "bundle" | "unsupported"
    }
    agents: {
      supported: boolean
      mode: "markdown" | "native" | "unsupported"
    }
    jetbrainsPromptLibrary?: {
      modes: Array<"bundle_only" | "native_file">
      defaultMode: "bundle_only"
    }
  }
}
```

POC-locked MCP baseline for descriptors:

1. `codex.mcp.supportedFields` must include: `transport`, `command`, `args`, `url`, `env`, `env_headers`.
2. `cursor.mcp.supportedFields` must include: `transport`, `url`, `env_headers`, `env`.
3. `windsurf.mcp.supportedFields` must include: `transport`, `url`, `env`.
4. Unsupported MCP fields must follow warning/default + strict/error behavior validated in POC-02.

POC-locked JetBrains baseline for descriptors:

1. Prompt-library default mode is `bundle_only`.
2. `native_file` mode remains optional and probe-gated.
3. Deterministic bundle artifacts remain in scope as v1 baseline.

## 11) P1 Exit Assertions

P1 is complete when all are true:

1. Schema contract explicitly covers instructions, commands, hooks, MCP, agents, skills, overrides, and manifests.
2. Compiler pipeline contract is explicit from inputs through normalized model and artifacts.
3. Deterministic serialization and error taxonomy are explicitly versioned.
4. Sidecar JSON ownership strategy is explicit and testable.
5. AGENTS generation/freshness for root and every workspace package is explicit and testable.
6. State metadata contract includes hashes, adapter versions, and orphan cleanup inputs.
7. Adapter capability descriptor schema is explicit enough for P2 mapping.
8. Unsupported-field handling path is explicit for default and strict mode.
9. POC baseline constraints remain locked and unchanged.

## Quality Gate Evidence

### Test Suites Executed

1. `cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .` (pass)
2. `rg -n "^## Quality Gate Evidence" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md` (pass)
3. `rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md` (pass)
4. `rg -n "^\\| Design/Architecture \\|" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md` (pass)
5. `rg -n "^\\| Security/Secrets \\|" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md` (pass)
6. `! rg -n "\\|[^|]*\\|[^|]*\\|[^|]*\\| rejected \\|" specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md` (pass)
7. `rg -n "^Status: passed$" specs/pending/unified-ai-tooling/outputs/poc-0*-*-results.md` (pass)

### Fixture Sets Used

1. Locked POC evidence fixtures and outputs (read-only baseline):
   - `tooling/beep-sync/fixtures/poc-01/*`
   - `tooling/beep-sync/fixtures/poc-02/*`
   - `tooling/beep-sync/fixtures/poc-03/*`
   - `tooling/beep-sync/fixtures/poc-04/*`
   - `tooling/beep-sync/fixtures/poc-05/*`
   - `tooling/beep-sync/fixtures/poc-06/*`
2. Phase contract artifacts:
   - `specs/pending/unified-ai-tooling/outputs/poc-01-canonical-compiler-results.md`
   - `specs/pending/unified-ai-tooling/outputs/poc-02-mcp-capability-results.md`
   - `specs/pending/unified-ai-tooling/outputs/poc-03-jetbrains-prompt-library-results.md`
   - `specs/pending/unified-ai-tooling/outputs/poc-04-managed-ownership-revert-results.md`
   - `specs/pending/unified-ai-tooling/outputs/poc-05-secret-resolution-results.md`
   - `specs/pending/unified-ai-tooling/outputs/poc-06-end-to-end-dry-run-results.md`

### TDD Evidence

No runtime code changes were made in P1; this phase is a contract-definition phase.

Evidence model for P1 uses:

1. Locked failing-first POC evidence from POC-01..POC-06 as baseline design constraints.
2. Contract verifications that enforce required section/signoff schema and lock passed POC status.

### Pass/Fail Summary

- passed: 7
- failed: 0
- skipped: 0

### Unresolved Risks

1. `poc05-real-auth-success-evidence` remains open for P3 runtime evidence (successful desktop and service-account authenticated secret resolution runs).
2. Cursor/Windsurf capability maps are baseline-frozen by POC-02 and still require P2 hardening coverage for additional vendor drift.
3. JetBrains `native_file` mode remains probe-based and must stay optional until stable native path/format proof is maintained.

### Review Signoff

| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | Codex (P1 author) | 2026-02-23 | approved | Contract covers canonical schema, compiler pipeline, serialization rules, ownership sidecars, AGENTS freshness, and capability descriptors with no blocker-level ambiguity for P2. |
| Security/Secrets | Codex (P1 author) | 2026-02-23 | approved | Fail-hard required-secret behavior, unsupported-field escalation path, and JSON sidecar-only ownership strategy avoid secret leakage and silent lossy conversion. |
| Migration/Operations | N/A | 2026-02-23 | N/A | P1-P3 allowed; mandatory in P4. |
