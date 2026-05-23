# P0 Current State

## Status

Completed by V1 implementation. This file preserves the packet-creation audit
from 2026-05-22 and records the post-implementation state.

## Current Repo Landscape

`@beep/ai-sync` now exists at `packages/tooling/library/ai-sync`.

The repo does have a strong precedent for this goal in `@beep/acp`:

- package: `packages/drivers/acp`
- generator: `packages/drivers/acp/scripts/generate.ts`
- generated outputs: `src/_generated`
- pattern: pinned upstream release constant, Effect `Command.run`, generated
  no-edit banner, generated schemas hidden behind curated package exports

The package belongs at:

```txt
packages/tooling/library/ai-sync
```

The package publishes as `@beep/ai-sync` and declares:

```json
{
  "beep": {
    "family": "tooling",
    "kind": "library"
  }
}
```

This matches `standards/architecture/07-non-slice-families.md`: repo
operations, generators, policy support, and automation route to `tooling`, and
reusable support code routes to the `library` kind.

## Current Dogfooding Candidates

The checkout already contains real agent-facing configuration files that can
become V1 validation inputs:

- `.codex/config.toml`
- `.mcp.json`
- `.claude/settings.json`
- `AGENTS.md`
- `CLAUDE.md`

The preferred first V1 gate is `.codex/config.toml` because Codex publishes a
Tier-1 JSON Schema for its config.

## Source Tier Summary

The full source map is recorded in
[research/sources-of-truth.md](../../research/sources-of-truth.md).

Tier-1 sources are machine-readable schemas that can feed codegen:

- Codex config schema at `openai/codex` tag `rust-v0.133.0`
- Codex hook schemas at `openai/codex` tag `rust-v0.133.0`
- MCP schema `2025-11-25`
- ACP schema `v0.13.3`
- Claude Code SchemaStore mirrors for settings, plugin manifest, and
  marketplace
- rulesync release schema assets as unified-config fallback

Tier-2 sources are official documentation pages that require semantic
field-diff parsing:

- Claude Code docs
- Codex docs where JSON Schema is not enough
- Grok Build docs
- JetBrains AI Assistant docs
- Junie docs
- AGENTS.md and Agent Skills documentation

Tier-3 sources are public adapter or reference repositories:

- `intellectronica/ruler`
- `dyoshikawa/rulesync`
- `agentsmd/agents.md`
- `agentskills/agentskills`
- `anthropics/skills`
- `JetBrains/junie-guidelines`

Tier-4 sources are last-resort package or plugin introspection targets:

- `@anthropic-ai/claude-code` npm package metadata or shipped artifacts
- JetBrains AI Assistant marketplace plugin JAR metadata
- Junie marketplace plugin JAR metadata

Tier-4 sources are not official unless the vendor explicitly documents them as
the source of truth.

## Verified Pins At Packet Creation

Packet creation used live verification on 2026-05-22 for the highest-drift
pins:

- Codex latest release: `rust-v0.133.0`
- Codex pinned source for P1: `rust-v0.133.0`
- MCP latest release: `2025-11-25`
- MCP pinned source for P1: `2025-11-25`
- ACP latest release at packet creation: `v0.13.2`
- ACP pinned source refreshed during implementation: `v0.13.3`
- Grok Build skills/plugins docs: last updated May 15, 2026

The preserved Claude web artifact had older pins for Codex and ACP. The packet
uses the live pins above.

## Known Gaps

- Grok Build hook event schemas, plugin manifest schema, and Grok-native MCP
  shape are undocumented and must remain `unknown_schema` until upstream docs
  or `grok inspect` evidence exists.
- JetBrains AI Assistant has no committed Skills or Hooks concept.
- Junie has no V1 Hooks or Plugins concept in the target matrix.
- P6+ operator workflows, adapter integrations, reverse-roundtrip emission, and
  additional agents are intentionally non-blocking follow-ups.

## Next Phase

P0 through P5 are complete. P6+ follow-ups should be opened deliberately as
separate work rather than folded back into the V1 schema-library gate.
