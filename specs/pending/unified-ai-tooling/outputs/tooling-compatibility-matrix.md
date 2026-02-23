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
| JetBrains AI Assistant | `.aiassistant/rules/*.md` | project-level JetBrains AI artifacts via overrides | JetBrains project-level MCP JSON/settings artifacts | JetBrains prompt-library artifacts in v1; indexing artifacts via overrides | Full parity target includes rules + MCP + prompt-library in v1 |

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

## Ownership and Drift Model

1. Managed targets default to full-file rewrite.
2. JSON targets use sidecar ownership metadata (no inline comment markers).
3. `beep-sync check` compares regenerated content against committed outputs.
4. `beep-sync validate` blocks invalid canonical config or unsupported critical mappings.

## Open Implementation Notes

1. Cursor MCP exact field parity should be verified against runtime fixtures due dynamic docs.
2. JetBrains prompt-library file-level integration requires adapter fixture proofing.

## Source Pointers

- `outputs/preliminary-research.md`
