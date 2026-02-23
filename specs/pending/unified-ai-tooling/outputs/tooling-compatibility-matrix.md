# Tooling Compatibility Matrix (.beep v1)

Date: 2026-02-23

## Canonical Assumption

Canonical source is `.beep/` (project-only). Adapters generate committed, deterministic native files.

## Managed Target Matrix

| Tool | Instruction Targets | Config Targets | MCP Targets | Skill/Agent Targets | Notes |
|---|---|---|---|---|---|
| Claude Code | `CLAUDE.md` + generated nested `AGENTS.md` where needed | `.claude/*` (adapter-defined) | `.mcp.json` (or adapter-approved claude-native target) | `.agents/*` integration via canonical mapping | Must preserve CLAUDE compatibility; no symlinks |
| OpenAI Codex | `AGENTS.md` + nested `AGENTS.md` | `.codex/config.toml` | `.codex/config.toml` (`[mcp_servers.*]`) | Codex skills/agents mapped from canonical model | `.codex/` is committed (unignored) |
| Cursor | `AGENTS.md` and/or `.cursor/rules/*` | `.cursor/*` | `.cursor/mcp.json` (adapter-defined exact schema) | cursor-specific agent/rules rendering via overrides | Dynamic docs: keep adapter schema tests strict |
| Windsurf | `AGENTS.md` and/or Windsurf rules output | `.windsurf/*` | Windsurf MCP JSON target (adapter-defined) | skills/agents rendered via canonical model | Supports env interpolation for MCP config |
| JetBrains AI Assistant | `.aiassistant/rules/*.md` | project-level JetBrains AI artifacts via overrides | JetBrains project-level MCP JSON/settings artifacts | JetBrains prompt-library bundle artifacts in v1 by default; indexing artifacts via overrides | Default mode is deterministic bundle output; native-file mode only with fixture proof |

## Committed Managed Targets

Managed generation policy includes these committed outputs:

1. Root and managed nested `AGENTS.md` files.
2. Root `CLAUDE.md`.
3. `.codex/` managed files.
4. `.mcp.json`.
5. Tool-native managed files under `.cursor/`, `.windsurf/`, `.aiassistant/`.
6. Managed package-level `AGENTS.md` files for every workspace package.

## Mandatory v1 Invariants

1. One instruction source compiles to both `AGENTS.md` and `CLAUDE.md`.
2. No symlink strategy.
3. Generated outputs are deterministic and committed.
4. Project scope only (no user-level overlay).
5. Linux-only support.
6. Skills are first-class in canonical schema and generation.
7. Required secret resolution failures are fatal.
8. AGENTS generation scope covers every workspace package.
9. Adapters are capability-map driven; unsupported fields must warn/error explicitly.
10. Output serialization order is deterministic (stable sort + stable formatting).
11. Hash-aware writing skips unchanged files.
12. `revert` is mandatory in v1 runtime scope and only affects managed targets.

## Ownership and Drift Model

1. Managed targets default to full-file rewrite.
2. JSON targets use sidecar ownership metadata (no inline comment markers).
3. Managed file state tracks source hash, rendered hash, adapter version, and last write timestamp.
4. `beep-sync check` compares regenerated content against committed outputs and state metadata.
5. `beep-sync apply` performs orphan cleanup for previously managed files not emitted by the current graph.
6. `beep-sync validate` blocks invalid canonical config or unsupported critical mappings.

## Managed Marker Strategy

1. Markdown/text outputs include generated headers (`DO NOT EDIT`, source pointers).
2. Strict JSON outputs use sidecar metadata only.
3. Local-only generated outputs (if any) are handled via a bounded managed `.gitignore` block.

## Diagnostics and Strictness

1. All adapters emit structured diagnostics (`error`, `warning`, `info`) with target path and field.
2. Lossy conversion and unsupported-field drops are warnings by default (`W_UNSUPPORTED_FIELD` baseline).
3. `--strict` upgrades configured warning classes to errors and blocks output emission.
4. Required secret resolution failures are always errors (independent of strict mode).

## MCP Capability Map Contract

1. Canonical MCP schema remains tool-agnostic.
2. Each adapter declares supported MCP fields and normalization rules.
3. Unsupported fields are stripped and surfaced via diagnostics.
4. Tool-specific naming differences are normalized in adapters (for example snake_case vs camelCase).
5. Capability-map fixtures are mandatory for Cursor and Windsurf due higher doc drift risk.

## POC-Verified Baseline (2026-02-23)

### MCP field baseline (from POC-02)

| Tool | Supported MCP Fields (fixture-proven) | Unsupported Field Handling |
|---|---|---|
| Codex | `transport`, `command`, `args`, `url`, `env`, `env_headers` | warn by default, fail in `--strict` |
| Cursor | `transport`, `url`, `env_headers`, `env` | warn by default, fail in `--strict` |
| Windsurf | `transport`, `url`, `env` | warn by default, fail in `--strict` |

### JetBrains prompt-library baseline (from POC-03)

1. `bundle_only` remains default mode.
2. Bundle artifacts are deterministic and fixture-backed:
   - `.aiassistant/prompt-library/prompts.md`
   - `.aiassistant/prompt-library/prompts.json`
   - `.aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md`
3. `native_file` remains optional and probe-based, with deterministic metadata contract:
   - `nativeProbe.enabled`
   - `nativeProbe.path`
   - `nativeProbe.roundTripDeterministic`

### Operational baseline (from POC-04 and POC-06)

1. `revert` is managed-target-only and idempotent on second run.
2. No-arg `validate`, `apply --dry-run`, `check`, `doctor` contracts are deterministic.
3. Dry-run flow is no-churn against managed baseline snapshots.

## Open Implementation Notes

1. Cursor/Windsurf MCP baseline is frozen by current fixtures; add fields only with new fixture proof.
2. JetBrains direct native-file emission remains optional until official stable native path/format is documented.
3. Real authenticated secret-resolution success-path evidence (desktop + service-account) remains open and tracked in residual-risk closure.

## Source Pointers

- `outputs/preliminary-research.md`
- `outputs/subtree-synthesis.md`
- `outputs/residual-risk-closure.md`
