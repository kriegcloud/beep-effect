# P4 Cross-Agent Transforms

## Status

Complete.

## Implementation

The package implements only V1 transform candidates with evidence:

| Transform candidate | Status | Implementation |
| --- | --- | --- |
| Codex MCP TOML to Claude-style `.mcp.json` | lossless | `codexMcpServersToClaudeMcpJson` |
| Claude-style `.mcp.json` to Codex MCP TOML | lossy | `claudeMcpJsonToCodexConfig`; Claude transport type is inferred/dropped |
| Claude-style `.mcp.json` to modeled Junie MCP JSON | lossless | `claudeMcpJsonToJunieMcpJson` |
| modeled Junie MCP JSON to Claude-style `.mcp.json` | lossless | `junieMcpJsonToClaudeMcpJson` |
| AGENTS.md-style instruction text | lossy | `normalizeInstructionDocument` |
| shared Agent Skills frontmatter | lossy | `normalizeAgentSkillFrontmatter` |
| Grok-native MCP | declined | blocked by `unknown_schema` |

The source of truth for this ledger is `V1_TRANSFORM_EVIDENCE`.

## Evidence

- `bun run --cwd packages/tooling/library/ai-sync test`
  - round-trips Codex-compatible MCP fields through Claude-style MCP JSON
  - round-trips the modeled Junie/Claude MCP shape
  - normalizes lossy instruction and skill-frontmatter candidates
  - asserts declined transform evidence exists

## Notes

Transforms do not claim unsupported native equivalence. The Claude-to-Codex MCP
path is explicitly lossy because Claude's transport `type` field has no native
Codex field in the modeled V1 TOML block.
