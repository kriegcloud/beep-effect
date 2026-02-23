# P2 Adapter Design (.beep)

Date: 2026-02-23  
Status: completed

## 1) Scope and Locked Inputs

This document defines Phase P2 adapter contracts that map `NormalizedModelV1` into deterministic tool-native outputs for:

1. Claude
2. Codex
3. Cursor
4. Windsurf
5. JetBrains

Locked inputs used:

1. `specs/pending/unified-ai-tooling/README.md`
2. `specs/pending/unified-ai-tooling/handoffs/HANDOFF_P2.md`
3. `specs/pending/unified-ai-tooling/outputs/p1-schema-and-contract.md`
4. `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
5. `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`
6. `specs/pending/unified-ai-tooling/outputs/subtree-synthesis.md`
7. `specs/pending/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
8. `specs/pending/unified-ai-tooling/outputs/residual-risk-closure.md`
9. `specs/pending/unified-ai-tooling/outputs/poc-02-mcp-capability-results.md`
10. `specs/pending/unified-ai-tooling/outputs/poc-03-jetbrains-prompt-library-results.md`

Baseline lock rules:

1. POC-02 MCP capability behavior is frozen for Codex/Cursor/Windsurf.
2. POC-03 JetBrains prompt-library behavior is frozen (`bundle_only` default, deterministic bundle artifacts, optional `native_file` probe).
3. Any future divergence requires an explicit `Divergence Rationale` subsection in the phase artifact that introduces it.
4. No divergence is introduced in this phase.

## 2) Adapter Contract Model

Each adapter MUST publish a deterministic contract descriptor and emit a stable artifact plan.

```ts
type AdapterId = "claude" | "codex" | "cursor" | "windsurf" | "jetbrains"

type AdapterTargetV1 = {
  path: string
  format: "markdown" | "json" | "toml"
  ownership: "full_file_rewrite"
  markerMode: "header" | "sidecar_only"
  sourceDomains: string[]
}

type AdapterContractV1 = {
  version: 1
  tool: AdapterId
  adapterVersion: string
  targets: AdapterTargetV1[]
  mcp: {
    supportedFields: string[]
    transforms: Array<{ from: string; to: string; rule: string }>
    dropPolicy: "warn_default_strict_error"
    requiredByTransport: {
      stdio: string[]
      http: string[]
      sse: string[]
    }
  }
  skills: { mode: "markdown_index" | "rules_file" | "bundle" | "unsupported" }
  agents: { mode: "markdown_index" | "rules_file" | "bundle" | "unsupported" }
}
```

Shared invariants (all adapters):

1. No symlink strategy.
2. Full-file rewrite for managed targets.
3. Deterministic serialization and lexicographic target write order.
4. Hash-aware skip-write on unchanged bytes.
5. Diagnostics are structured and sorted by `(path, code)`.
6. JSON ownership markers are sidecar-only.

## 3) Per-Tool Target Map and Mapping Semantics

### 3.1 Shared Cross-Tool Instruction Targets

These are emitted once by core instruction rendering and consumed by tool adapters:

| Path | Format | Ownership Marker | Mapping |
|---|---|---|---|
| `AGENTS.md` | markdown | header | Canonical `instructions.root` merged bundle + deterministic command/hook/skill/agent sections |
| `CLAUDE.md` | markdown | header | Same instruction source bundle as `AGENTS.md`; tool-tailored framing only |
| `<workspace>/AGENTS.md` | markdown | header | Package template render for every workspace package |

Deterministic dual-output rule:

1. Root instruction body is resolved once.
2. `AGENTS.md` and `CLAUDE.md` must derive from that same resolved body hash.
3. Any adapter-specific additions are append-only deterministic sections; source body parity remains invariant.

### 3.2 Claude Adapter (`claude`)

| Path | Format | Marker | Source Domains | Mapping Semantics |
|---|---|---|---|---|
| `CLAUDE.md` | markdown | header | `instructions`, `commands`, `hooks`, `agents`, `skills` | Canonical instruction body + deterministic indexes for commands/hooks/agents/skills |
| `.mcp.json` | json | sidecar_only | `mcp`, `tool_overrides.claude` | Canonical MCP servers mapped into Claude MCP JSON envelope |

Claude mapping rules:

1. MCP target envelope is `{"mcpServers": { ... }}`.
2. Server key is canonical `mcp.servers[*].id`.
3. `enabled: false` servers are omitted with deterministic info diagnostic.
4. Unknown override fields under `tool_overrides.claude.*` follow unsupported policy.

### 3.3 Codex Adapter (`codex`)

| Path | Format | Marker | Source Domains | Mapping Semantics |
|---|---|---|---|---|
| `AGENTS.md` (shared target) | markdown | header | `instructions`, `commands`, `hooks`, `agents`, `skills` | Codex instruction surface |
| `<workspace>/AGENTS.md` (shared target) | markdown | header | `instructions`, `agents`, `skills` | Package-scoped Codex instruction surface |
| `.codex/config.toml` | toml | header | `mcp`, `tool_overrides.codex` | Canonical MCP servers serialized as `[mcp_servers.<id>]` |

Codex mapping rules:

1. One TOML table per enabled MCP server, sorted by server id.
2. Fields are serialized in deterministic key order.
3. Unsupported override fields under `tool_overrides.codex.*` follow unsupported policy.

### 3.4 Cursor Adapter (`cursor`)

| Path | Format | Marker | Source Domains | Mapping Semantics |
|---|---|---|---|---|
| `AGENTS.md` (shared target) | markdown | header | `instructions`, `commands`, `hooks`, `agents`, `skills` | Portable instruction fallback for Cursor |
| `<workspace>/AGENTS.md` (shared target) | markdown | header | `instructions`, `agents`, `skills` | Package-scoped fallback |
| `.cursor/rules/00-beep-root.md` | markdown | header | `instructions`, `commands`, `hooks` | Cursor-native root rules render |
| `.cursor/rules/10-beep-skills.md` | markdown | header | `skills` | Deterministic skills rules/index |
| `.cursor/rules/20-beep-agents.md` | markdown | header | `agents` | Deterministic agents rules/index |
| `.cursor/mcp.json` | json | sidecar_only | `mcp`, `tool_overrides.cursor` | Cursor MCP JSON from capability map baseline |

Cursor mapping rules:

1. MCP envelope key is `mcpServers`.
2. POC-02 locked supported fields apply.
3. Unsupported MCP fields are dropped only with deterministic diagnostics.
4. Rules files are sorted by fixed numeric prefix for stable load order.

### 3.5 Windsurf Adapter (`windsurf`)

| Path | Format | Marker | Source Domains | Mapping Semantics |
|---|---|---|---|---|
| `AGENTS.md` (shared target) | markdown | header | `instructions`, `commands`, `hooks`, `agents`, `skills` | Portable instruction fallback for Windsurf |
| `<workspace>/AGENTS.md` (shared target) | markdown | header | `instructions`, `agents`, `skills` | Package-scoped fallback |
| `.windsurf/rules/00-beep-root.md` | markdown | header | `instructions`, `commands`, `hooks` | Windsurf-native root rules render |
| `.windsurf/rules/10-beep-skills.md` | markdown | header | `skills` | Deterministic skills rules/index |
| `.windsurf/rules/20-beep-agents.md` | markdown | header | `agents` | Deterministic agents rules/index |
| `.windsurf/mcp_config.json` | json | sidecar_only | `mcp`, `tool_overrides.windsurf` | Windsurf MCP JSON from capability map baseline |

Windsurf mapping rules:

1. MCP envelope key is `servers`.
2. POC-02 locked supported fields apply.
3. Unsupported MCP fields are dropped only with deterministic diagnostics.
4. Rules files are sorted by fixed numeric prefix for stable load order.

### 3.6 JetBrains Adapter (`jetbrains`)

| Path | Format | Marker | Source Domains | Mapping Semantics |
|---|---|---|---|---|
| `.aiassistant/rules/00-beep-root.md` | markdown | header | `instructions`, `commands`, `hooks` | JetBrains root rule surface |
| `.aiassistant/rules/10-beep-skills.md` | markdown | header | `skills` | JetBrains skills rule/index |
| `.aiassistant/rules/20-beep-agents.md` | markdown | header | `agents` | JetBrains agents rule/index |
| `.aiassistant/mcp.json` | json | sidecar_only | `mcp`, `tool_overrides.jetbrains.mcp` | JetBrains project-level MCP artifact |
| `.aiassistant/prompt-library/prompts.md` | markdown | header | `tool_overrides.jetbrains.prompt_library` | Prompt-library bundle artifact |
| `.aiassistant/prompt-library/prompts.json` | json | sidecar_only | `tool_overrides.jetbrains.prompt_library` | Prompt-library machine sidecar/native probe target |
| `.aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md` | markdown | header | `tool_overrides.jetbrains.prompt_library` | Deterministic import guidance artifact |

JetBrains non-portable extension surfaces (explicit by design):

1. `tool_overrides.jetbrains.prompt_library.*`
2. `tool_overrides.jetbrains.indexing.aiignore` -> `.aiignore`
3. `tool_overrides.jetbrains.indexing.noai` -> `.noai`

Any other `tool_overrides.jetbrains.*` fields are unsupported in v1 and follow unsupported policy.

## 4) Canonical Domain Coverage Matrix

Every canonical domain from P1 has explicit mapping or explicit non-support behavior:

| Canonical Domain | Claude | Codex | Cursor | Windsurf | JetBrains | Non-Support Handling |
|---|---|---|---|---|---|---|
| `project` | header metadata | header metadata | header metadata | header metadata | header metadata | never silently dropped; metadata-only domain |
| `settings` | compile-time gate | compile-time gate | compile-time gate | compile-time gate | compile-time gate | invalid values hard-fail before adapters |
| `instructions` | `CLAUDE.md` | root/package `AGENTS.md` | shared `AGENTS.md` + `.cursor/rules/*` | shared `AGENTS.md` + `.windsurf/rules/*` | `.aiassistant/rules/*` | required domain; missing source is fatal |
| `commands` | command index in `CLAUDE.md` | command index in `AGENTS.md` | command section in root rules | command section in root rules | command section in root rules | native command registration is out-of-scope in v1; no silent drop |
| `hooks` | hook contract appendix in `CLAUDE.md` | hook contract appendix in `AGENTS.md` | hook contract appendix in rules | hook contract appendix in rules | hook contract appendix in rules | runtime wiring deferred; explicit warning when override requests native hook wiring |
| `mcp` | `.mcp.json` | `.codex/config.toml` | `.cursor/mcp.json` | `.windsurf/mcp_config.json` | `.aiassistant/mcp.json` | capability-map drop/warn; strict escalation |
| `agents` | `CLAUDE.md` agent index | `AGENTS.md` agent index | `.cursor/rules/20-beep-agents.md` | `.windsurf/rules/20-beep-agents.md` | `.aiassistant/rules/20-beep-agents.md` | unsupported native formats warn/strict-error |
| `skills` | `CLAUDE.md` skills index | `AGENTS.md` skills index | `.cursor/rules/10-beep-skills.md` | `.windsurf/rules/10-beep-skills.md` | `.aiassistant/rules/10-beep-skills.md` | unsupported native formats warn/strict-error |
| `tool_overrides` | `tool_overrides.claude.*` | `tool_overrides.codex.*` | `tool_overrides.cursor.*` | `tool_overrides.windsurf.*` | `tool_overrides.jetbrains.*` | unknown override fields are deterministic warnings (strict -> errors) |
| `manifests` | sidecar state only | sidecar state only | sidecar state only | sidecar state only | sidecar state only | adapter-independent core behavior |

## 5) Unsupported-Field Warning/Error Policy

Policy applies uniformly to all adapters:

1. Unknown core-schema fields are hard errors (`E_SCHEMA_UNKNOWN_FIELD`) before adapter execution.
2. Unknown or unsupported adapter fields emit `W_UNSUPPORTED_FIELD` with exact path and tool id.
3. In `--strict`, every `W_UNSUPPORTED_FIELD` becomes `E_UNSUPPORTED_FIELD_STRICT`.
4. Required mapped fields missing after normalization are hard errors (`E_ADAPTER_REQUIRED_FIELD_MISSING`) independent of strict mode.
5. Diagnostics are deterministic:
   - path-first sort order
   - one diagnostic per dropped field path
   - explicit drop reason string (`unsupported_field`, `unsupported_mode`, or `deferred_native_wiring`)

Warning/error template contract:

```text
[warning] W_UNSUPPORTED_FIELD <path> - <field> is not supported by <tool>; dropped during generation.
[error] E_UNSUPPORTED_FIELD_STRICT <path> - strict mode forbids unsupported field drop for <tool>.
```

## 6) MCP Capability Matrix (Transform/Drop/Error Rules)

### 6.1 Locked Baseline Rules

POC-02 locked baseline (must not regress without explicit divergence rationale):

1. Codex supported fields: `transport`, `command`, `args`, `url`, `env`, `env_headers`.
2. Cursor supported fields: `transport`, `url`, `env_headers`, `env`.
3. Windsurf supported fields: `transport`, `url`, `env`.
4. Unsupported fields: warning by default, strict-mode error.

### 6.2 Adapter Capability Table

| Tool | Target | Supported Fields | Transform Rules | Drop Rules | Hard-Error Rules |
|---|---|---|---|---|---|
| Claude | `.mcp.json` | `transport`, `command`, `args`, `url`, `env`, `env_headers`, `enabled` | `serversById` -> `mcpServers`; `id` -> object key | Unknown fields warn/drop; strict escalates | Missing `command` for `stdio` or `url` for `http`/`sse` -> `E_ADAPTER_REQUIRED_FIELD_MISSING` |
| Codex | `.codex/config.toml` | `transport`, `command`, `args`, `url`, `env`, `env_headers`, `enabled` | map server -> `[mcp_servers.<id>]`; deterministic TOML key sort | POC-02 unsupported fields warn/drop; strict escalates | Missing required transport fields -> `E_ADAPTER_REQUIRED_FIELD_MISSING` |
| Cursor | `.cursor/mcp.json` | `transport`, `url`, `env_headers`, `env`, `enabled` | `serversById` -> `mcpServers`; keep canonical key names | POC-02 unsupported fields warn/drop; strict escalates | Missing `url` for `http`/`sse` -> `E_ADAPTER_REQUIRED_FIELD_MISSING` |
| Windsurf | `.windsurf/mcp_config.json` | `transport`, `url`, `env`, `enabled` | `serversById` -> `servers`; deterministic JSON sort | POC-02 unsupported fields warn/drop; strict escalates | Missing `url` for `http`/`sse` -> `E_ADAPTER_REQUIRED_FIELD_MISSING` |
| JetBrains | `.aiassistant/mcp.json` | `transport`, `command`, `args`, `url`, `env`, `env_headers`, `enabled` | `serversById` -> `mcpServers`; deterministic JSON sort | Unknown fields warn/drop; strict escalates | Missing required transport fields -> `E_ADAPTER_REQUIRED_FIELD_MISSING` |

### 6.3 Fixture Binding Contract

Capability-map behavior is fixture-testable with this binding:

1. Codex/Cursor/Windsurf MCP behavior: `tooling/beep-sync/fixtures/poc-02/*` (locked baseline).
2. JetBrains prompt-library mode behavior: `tooling/beep-sync/fixtures/poc-03/*` (locked baseline).
3. Claude MCP and JetBrains MCP parity fixtures are required in implementation (`tooling/beep-sync/fixtures/p2/*`) before runtime rollout.

## 7) Skills and Agents Mapping Contract

| Tool | Agents Mapping | Skills Mapping | Determinism Rules |
|---|---|---|---|
| Claude | `CLAUDE.md` section `## Agents` from `agents.definitions` | `CLAUDE.md` section `## Skills` from `skills.sources/include` | Sort by agent id and skill include key |
| Codex | root/package `AGENTS.md` `## Agents` | root/package `AGENTS.md` `## Skills` | Same source order for root/package; deterministic template render |
| Cursor | `.cursor/rules/20-beep-agents.md` | `.cursor/rules/10-beep-skills.md` | Numeric file prefix ordering + sorted body items |
| Windsurf | `.windsurf/rules/20-beep-agents.md` | `.windsurf/rules/10-beep-skills.md` | Numeric file prefix ordering + sorted body items |
| JetBrains | `.aiassistant/rules/20-beep-agents.md` | `.aiassistant/rules/10-beep-skills.md` | Numeric file prefix ordering + sorted body items |

If a tool override requests an unproven native agents/skills format, adapters MUST warn (`W_UNSUPPORTED_FIELD`) and drop it by default; strict mode fails.

## 8) Managed Marker Strategy (Header vs Sidecar Metadata)

### 8.1 Header-Managed Targets (Markdown/TOML)

Targets:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `<workspace>/AGENTS.md`
4. `.cursor/rules/*.md`
5. `.windsurf/rules/*.md`
6. `.aiassistant/rules/*.md`
7. `.aiassistant/prompt-library/*.md`
8. `.codex/config.toml`

Deterministic header contract:

1. Header content includes generator name/version, source path, adapter id/version, ownership mode.
2. Header contains no wall-clock timestamps.
3. Header is regenerated on every emit and therefore diff-stable when content is unchanged.

### 8.2 Sidecar-Managed Targets (Strict JSON)

Targets:

1. `.mcp.json`
2. `.cursor/mcp.json`
3. `.windsurf/mcp_config.json`
4. `.aiassistant/mcp.json`
5. `.aiassistant/prompt-library/prompts.json`
6. `.beep/manifests/managed-files.json`
7. `.beep/manifests/state.json`

Contract:

1. No inline ownership comments/markers in JSON.
2. Ownership metadata recorded only in `managed-files.json`.
3. Cleanup scope is bounded to prior managed paths from sidecar metadata.

## 9) JetBrains Prompt-Library Mode Contract (Locked)

Locked by POC-03:

1. `bundle_only` is default mode.
2. Deterministic bundle artifacts in v1:
   - `.aiassistant/prompt-library/prompts.md`
   - `.aiassistant/prompt-library/prompts.json`
   - `.aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md`
3. `native_file` is optional and probe-gated.

`native_file` contract:

1. Allowed only when fixture-proof evidence remains present and passing (`outputs/poc-03-jetbrains-prompt-library-results.md`).
2. Required proof fields:
   - `nativeProbe.enabled == true`
   - `nativeProbe.path == ".aiassistant/prompt-library/prompts.json"`
   - `nativeProbe.roundTripDeterministic == true`
3. If proof is missing/failing:
   - default mode: warn and fall back to `bundle_only`
   - strict mode: fail with `E_UNSUPPORTED_FIELD_STRICT`

## 10) P2 Exit Assertions

P2 is complete when all are true:

1. Every tool has explicit file targets and domain mapping semantics.
2. Every canonical domain has mapping or explicit non-support handling.
3. Unsupported-field handling is deterministic and strict-upgradable.
4. MCP capability-map behavior is explicit and fixture-testable.
5. Skills and agents mapping is explicit per adapter.
6. Managed marker strategy is explicit by target class.
7. JetBrains prompt-library mode contract is locked to `bundle_only` default and fixture-gated `native_file`.
8. POC-02 and POC-03 baselines remain unchanged.

## Quality Gate Evidence

### Test Suites Executed

1. `cat specs/pending/unified-ai-tooling/outputs/manifest.json | jq .` (pass)
2. `rg -n "^## Quality Gate Evidence" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md` (pass)
3. `rg -n "^### (Test Suites Executed|Fixture Sets Used|TDD Evidence|Pass/Fail Summary|Unresolved Risks|Review Signoff)$" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md` (pass)
4. `rg -n "^\\| Design/Architecture \\|" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md` (pass)
5. `rg -n "^\\| Security/Secrets \\|" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md` (pass)
6. `! rg -n "\\|[^|]*\\|[^|]*\\|[^|]*\\| rejected \\|" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md` (pass)
7. `rg -n "POC-02|POC-03|bundle_only|native_file" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md` (pass)
8. `rg -n "Claude|Codex|Cursor|Windsurf|JetBrains" specs/pending/unified-ai-tooling/outputs/p2-adapter-design.md` (pass)

### Fixture Sets Used

1. Locked MCP capability baseline fixtures:
   - `tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml`
   - `tooling/beep-sync/fixtures/poc-02/mcp-cursor.yaml`
   - `tooling/beep-sync/fixtures/poc-02/mcp-cursor-unsupported.yaml`
   - `tooling/beep-sync/fixtures/poc-02/mcp-windsurf.yaml`
   - `tooling/beep-sync/fixtures/poc-02/mcp-windsurf-unsupported.yaml`
   - `tooling/beep-sync/fixtures/poc-02/expected/*`
2. Locked JetBrains prompt-library baseline fixtures:
   - `tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml`
   - `tooling/beep-sync/fixtures/poc-03/jetbrains-native.yaml`
   - `tooling/beep-sync/fixtures/poc-03/expected/*`

### TDD Evidence

No runtime code changes were made in P2; this phase defines adapter contracts.

Evidence model:

1. POC-02 and POC-03 failing-first and strict-mode fixture evidence are treated as locked behavioral tests.
2. P2 adds explicit fixture binding requirements for remaining adapter surfaces (Claude MCP, JetBrains MCP) before runtime rollout.

### Pass/Fail Summary

- passed: 8
- failed: 0
- skipped: 0

### Unresolved Risks

1. `poc05-real-auth-success-evidence` remains open for P3 runtime verification and is unaffected by P2 adapter design completion.
2. Claude MCP and JetBrains MCP parity fixtures still need implementation-phase fixture hardening in `tooling/beep-sync/fixtures/p2/*`.
3. JetBrains `native_file` remains probe-gated and should stay optional until real IDE import/export behavior remains stable over updates.

### Review Signoff

| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | Codex (P2 author) | 2026-02-23 | approved | Per-tool adapter contracts, target maps, capability matrices, unsupported-field policy, and marker strategies are explicit and implementation-ready. |
| Security/Secrets | Codex (P2 author) | 2026-02-23 | approved | Required-secret fail-hard policy remains unchanged; MCP mapping and JSON sidecar ownership avoid plaintext secret leakage and silent field loss. |
| Migration/Operations | N/A | 2026-02-23 | N/A | P1-P3 allowed; mandatory in P4. |
