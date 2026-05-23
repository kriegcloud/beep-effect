# Sources Of Truth

This source map records the upstream evidence for `@beep/ai-sync`. It uses
live pins verified on 2026-05-22 where the source was easy to confirm, refreshes
ACP to `v0.13.3` during implementation, and preserves the prior Claude web
research as [claude-web-source-map.md](./claude-web-source-map.md).

The tier vocabulary is:

| Tier | Meaning | Drift mechanism |
| --- | --- | --- |
| Tier 1 | machine-readable schema or release metadata | version pin or content hash |
| Tier 2 | official docs without a machine-readable schema | semantic field diff or content hash |
| Tier 3 | public adapter or reference implementation | release tag or git SHA |
| Tier 4 | shipped package or plugin introspection | package or plugin version pin, unofficial |

## Agent And Domain Matrix

| Agent | Skills | Rules | Commands | Hooks | Plugins | MCP servers |
| --- | --- | --- | --- | --- | --- | --- |
| Claude Code | supported from Skills docs and Agent Skills | supported from memory/rules docs | supported from command docs and skill convergence docs | supported from hooks docs and settings schema | supported from SchemaStore and plugin docs | supported from docs and `.mcp.json` examples |
| Codex | supported from Codex Skills docs and config schema | supported from AGENTS.md docs and config knobs | N/A for user markdown command files | supported from generated hook schemas | supported from Codex plugin docs and config schema | supported from config schema |
| Grok Build | supported from xAI docs and Claude compatibility | supported from AGENTS.md and Claude compatibility | supported from xAI commands docs | `unknown_schema` for native payloads | `unknown_schema` for native manifest | `unknown_schema` for Grok-native shape; Claude-compatible MCP is supported |
| JetBrains AI Assistant | N/A | supported from `.aiassistant/rules/*.md` docs | supported only as IDE prompt-library metadata, not committed repo files | N/A | N/A for repo-committed plugin manifests | supported from IDE MCP JSON examples |
| Junie | supported from Junie Agent Skills docs | supported from Junie AGENTS/guidelines docs | supported from Junie custom slash command docs | N/A | N/A for V1 | supported from Junie MCP docs |

## Claude Code

Claude Code is closed-source, but public docs and SchemaStore mirrors cover most
configuration surfaces. The settings, plugin manifest, and marketplace schemas
are Tier 1 community mirrors. Hooks, skills, MCP, rules, and command behavior
come from official docs and should be treated as Tier 2 unless a SchemaStore
schema covers the exact native file.

Primary sources:

| Domain | Source | Tier | Pin | Drift |
| --- | --- | ---: | --- | --- |
| settings | https://json.schemastore.org/claude-code-settings.json | 1 | content hash | hash |
| plugin manifest | https://json.schemastore.org/claude-code-plugin-manifest.json | 1 | content hash | hash |
| marketplace | https://json.schemastore.org/claude-code-marketplace.json | 1 | content hash | hash |
| hooks | https://code.claude.com/docs/en/hooks | 2 | docs current on 2026-05-22 | semantic-field-diff |
| skills | https://code.claude.com/docs/en/skills | 2 | docs current on 2026-05-22 | semantic-field-diff |
| plugins | https://code.claude.com/docs/en/plugins-reference | 2 | docs current on 2026-05-22 | semantic-field-diff |
| MCP | https://code.claude.com/docs/en/mcp | 2 | docs current on 2026-05-22 | semantic-field-diff |
| rules | https://code.claude.com/docs/en/memory | 2 | docs current on 2026-05-22 | content hash |
| commands | https://raw.githubusercontent.com/anthropics/claude-code/main/plugins/plugin-dev/skills/command-development/references/frontmatter-reference.md | 3 | git SHA during implementation | content hash |
| npm package | https://registry.npmjs.org/@anthropic-ai/claude-code/latest | 4 | package version during implementation | version |

Fallback sources include public examples in `anthropics/claude-code`,
community schema work that flows into SchemaStore, and npm package
introspection. Tier-4 package introspection is unofficial.

## Codex

Codex is the strongest Tier-1 source because it publishes generated JSON Schema
from the open-source Rust workspace. Use the latest live-verified release pin
`rust-v0.133.0` for P1 unless the implementation session deliberately refreshes
the pin again.

Primary sources:

| Domain | Source | Tier | Pin | Drift |
| --- | --- | ---: | --- | --- |
| config | https://raw.githubusercontent.com/openai/codex/rust-v0.133.0/codex-rs/core/config.schema.json | 1 | `rust-v0.133.0` | version |
| hooks | https://github.com/openai/codex/tree/rust-v0.133.0/codex-rs/hooks/schema/generated | 1 | `rust-v0.133.0` | version and per-file hash |
| releases | https://github.com/openai/codex/releases/latest | 1 | `rust-v0.133.0` | release redirect |
| hosted config schema | https://developers.openai.com/codex/config-schema.json | 1 | always-latest | content hash |
| config docs | https://developers.openai.com/codex/config-reference | 2 | docs current on 2026-05-22 | semantic-field-diff |
| AGENTS.md docs | https://developers.openai.com/codex/guides/agents-md | 2 | docs current on 2026-05-22 | content hash |
| MCP docs | https://developers.openai.com/codex/mcp | 2 | docs current on 2026-05-22 | semantic-field-diff |
| skills docs | https://developers.openai.com/codex/skills | 2 | docs current on 2026-05-22 | semantic-field-diff |
| plugins docs | https://developers.openai.com/codex/plugins | 2 | docs current on 2026-05-22 | semantic-field-diff |
| rules source | https://github.com/openai/codex/tree/rust-v0.133.0/codex-rs/execpolicy | 3 | `rust-v0.133.0` | version |

Codex has built-in slash commands but no user-defined markdown command-file
surface for V1. Represent that cell as N/A rather than a schema.

## Grok Build

Grok Build is public but beta. Its docs describe Skills, Plugins,
Marketplaces, Hooks, Claude Code compatibility, and AGENTS.md compatibility,
but several native schemas are not documented. V1 should rely on documented
compatibility and mark unknown native surfaces explicitly.

Primary sources:

| Domain | Source | Tier | Pin | Drift |
| --- | --- | ---: | --- | --- |
| overview | https://docs.x.ai/build/overview | 2 | docs current on 2026-05-22 | content hash |
| skills/plugins | https://docs.x.ai/build/features/skills-plugins-marketplaces | 2 | last updated May 15, 2026 | semantic-field-diff |
| commands | https://docs.x.ai/build/modes-and-commands | 2 | docs current on 2026-05-22 | semantic-field-diff |
| headless | https://docs.x.ai/build/cli/headless-scripting | 2 | docs current on 2026-05-22 | content hash |
| installer | https://x.ai/cli/install.sh | 2 | content hash | hash |
| stable version | https://x.ai/cli/stable | 2 | plaintext version | version |
| alpha version | https://x.ai/cli/alpha | 2 | plaintext version | version |

Unknown cells:

| Domain | Status | Note |
| --- | --- | --- |
| hooks | `unknown_schema` | Docs confirm hooks exist, but native event payload schemas are not public. |
| plugins | `unknown_schema` | Docs confirm plugin locations, but native manifest schema is not public. |
| Grok-native MCP | `unknown_schema` | Grok reads Claude Code MCP zero-config; native Grok MCP shape needs `grok inspect` or upstream docs. |

The official Grok Build config surface should not be confused with community
`grok-cli` packages that use different files under `~/.grok`.

## JetBrains AI Assistant

JetBrains AI Assistant is closed-source and IDE-centered. V1 should model only
documented repo or user-operable config shapes. Project rules are committed
Markdown under `.aiassistant/rules/*.md`; MCP configuration is entered through
IDE settings as JSON snippets.

Primary sources:

| Domain | Source | Tier | Pin | Drift |
| --- | --- | ---: | --- | --- |
| rules | https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html | 2 | 2026.1 docs | semantic-field-diff |
| rules reference | https://www.jetbrains.com/help/ai-assistant/settings-reference-rules.html | 2 | 2026.1 docs | semantic-field-diff |
| prompt library | https://www.jetbrains.com/help/ai-assistant/prompt-library.html | 2 | 2026.1 docs | content hash |
| MCP | https://www.jetbrains.com/help/ai-assistant/mcp.html | 2 | 2026.1 docs | semantic-field-diff |
| MCP setup | https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html | 2 | 2026.1 docs | semantic-field-diff |
| ACP | https://www.jetbrains.com/help/ai-assistant/acp.html | 2 | 2026.1 docs | content hash |
| plugin updates | https://plugins.jetbrains.com/api/plugins/22282/updates | 2 | resolve during implementation | version |
| plugin JAR | https://plugins.jetbrains.com/plugin/download?pluginId=22282 | 4 | plugin version | introspection |

N/A cells:

| Domain | Status | Note |
| --- | --- | --- |
| Skills | N/A | No documented AI Assistant skill-package concept. |
| Hooks | N/A | No documented AI Assistant hook system. |
| Plugins | N/A | IDE plugin extension is not a repo-committed agent plugin manifest surface for V1. |

Fallback sources include `intellectronica/ruler` for JetBrains AI adapter
behavior. Tier-4 plugin JAR introspection is unofficial.

## Junie

Junie has official docs for project instructions, agent skills, custom slash
commands, subagents, MCP, and CLI configuration. V1 should model the
repo-committed file formats and mark non-repo plugin or hook concepts as N/A.

Primary sources:

| Domain | Source | Tier | Pin | Drift |
| --- | --- | ---: | --- | --- |
| IDE plugin | https://junie.jetbrains.com/docs/junie-ide-plugin.html | 2 | docs current on 2026-05-22 | content hash |
| rules | https://www.jetbrains.com/help/junie/customize-guidelines.html | 2 | docs current on 2026-05-22 | content hash |
| skills | https://junie.jetbrains.com/docs/agent-skills.html | 2 | docs current on 2026-05-22 | semantic-field-diff |
| commands | https://junie.jetbrains.com/docs/custom-slash-commands.html | 2 | docs current on 2026-05-22 | semantic-field-diff |
| subagents | https://junie.jetbrains.com/docs/junie-cli-subagents.html | 2 | docs current on 2026-05-22 | semantic-field-diff |
| MCP | https://junie.jetbrains.com/docs/junie-cli-mcp-configuration.html | 2 | docs current on 2026-05-22 | semantic-field-diff |
| CLI config | https://junie.jetbrains.com/docs/junie-cli-configuration.html | 2 | docs current on 2026-05-22 | semantic-field-diff |
| examples | https://github.com/JetBrains/junie-guidelines | 3 | git SHA during implementation | hash |
| plugin updates | https://plugins.jetbrains.com/api/plugins/26104/updates | 2 | resolve during implementation | version |

N/A cells:

| Domain | Status | Note |
| --- | --- | --- |
| Hooks | N/A | No documented Junie hook system for V1. |
| Plugins | N/A | Junie itself is a plugin, but V1 has no repo-committed Junie plugin manifest surface. |

Fallback sources include `intellectronica/ruler`, `dyoshikawa/rulesync`,
`JetBrains/junie-guidelines`, and real-world public examples.

## Cross-Vendor Primitives

These sources are not owned by a single target agent but shape the common
schemas and transforms.

| Primitive | Source | Tier | Pin | Drift |
| --- | --- | ---: | --- | --- |
| MCP schema | https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.json | 1 | `2025-11-25` | dated version |
| MCP TypeScript schema | https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.ts | 1 | `2025-11-25` | dated version |
| MCP releases | https://github.com/modelcontextprotocol/modelcontextprotocol/releases/latest | 1 | `2025-11-25` | release redirect |
| ACP schema | https://raw.githubusercontent.com/agentclientprotocol/agent-client-protocol/v0.13.3/schema/schema.json | 1 | `v0.13.3` | git tag |
| ACP releases | https://github.com/agentclientprotocol/agent-client-protocol/releases/latest | 1 | `v0.13.3` | release redirect |
| AGENTS.md | https://agents.md/ | 2 | content current on 2026-05-22 | content hash |
| AGENTS.md repo | https://github.com/agentsmd/agents.md | 3 | git SHA during implementation | hash |
| Agent Skills spec | https://agentskills.io/specification | 2 | content current on 2026-05-22 | semantic-field-diff |
| Agent Skills reference | https://github.com/agentskills/agentskills | 3 | git SHA during implementation | hash |
| Anthropic Skills reference | https://github.com/anthropics/skills | 3 | git SHA during implementation | hash |

AGENTS.md is Markdown with no required fields. Agent Skills uses a `SKILL.md`
file with YAML frontmatter and a directory of optional resources.

## OSS Adapter Fallbacks

| Tool | Source | Tier | Pin | Use |
| --- | --- | ---: | --- | --- |
| ruler | https://github.com/intellectronica/ruler | 3 | release tag during implementation | adapter fallback for many agents |
| rulesync | https://github.com/dyoshikawa/rulesync | 3 | release tag during implementation | adapter fallback and release schemas |
| rulesync config schema | https://github.com/dyoshikawa/rulesync/releases/latest/download/config-schema.json | 1 | latest release during implementation | unified-config fallback schema |
| rulesync MCP schema | https://github.com/dyoshikawa/rulesync/releases/latest/download/mcp-schema.json | 1 | latest release during implementation | MCP config fallback schema |
| vercel-labs skills | https://github.com/vercel-labs/skills | 3 | git SHA during implementation | skill adapter examples |

These tools are not competitors for V1. They are possible consumers or fallback
evidence sources.

## Machine-Readable Index

```yaml
sources:
  - agent: codex
    domain: config
    url: https://raw.githubusercontent.com/openai/codex/rust-v0.133.0/codex-rs/core/config.schema.json
    tier: 1
    drift_mechanism: version
    version_pin: rust-v0.133.0
    public: true
    isOfficial: true
  - agent: codex
    domain: hooks
    url: https://github.com/openai/codex/tree/rust-v0.133.0/codex-rs/hooks/schema/generated
    tier: 1
    drift_mechanism: version_and_hash
    version_pin: rust-v0.133.0
    public: true
    isOfficial: true
  - agent: mcp
    domain: schema
    url: https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.json
    tier: 1
    drift_mechanism: version
    version_pin: "2025-11-25"
    public: true
    isOfficial: true
  - agent: acp
    domain: schema
    url: https://raw.githubusercontent.com/agentclientprotocol/agent-client-protocol/v0.13.3/schema/schema.json
    tier: 1
    drift_mechanism: version
    version_pin: v0.13.3
    public: true
    isOfficial: true
  - agent: claude-code
    domain: settings
    url: https://json.schemastore.org/claude-code-settings.json
    tier: 1
    drift_mechanism: hash
    version_pin: null
    public: true
    isOfficial: false
  - agent: claude-code
    domain: plugin_manifest
    url: https://json.schemastore.org/claude-code-plugin-manifest.json
    tier: 1
    drift_mechanism: hash
    version_pin: null
    public: true
    isOfficial: false
  - agent: claude-code
    domain: marketplace
    url: https://json.schemastore.org/claude-code-marketplace.json
    tier: 1
    drift_mechanism: hash
    version_pin: null
    public: true
    isOfficial: false
  - agent: claude-code
    domain: hooks
    url: https://code.claude.com/docs/en/hooks
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-22"
    public: true
    isOfficial: true
  - agent: grok-build
    domain: hooks
    url: https://docs.x.ai/build/features/skills-plugins-marketplaces
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-15"
    public: true
    isOfficial: true
    support: unknown_schema
    note: Native event payload schema is not public.
  - agent: grok-build
    domain: plugins
    url: https://docs.x.ai/build/features/skills-plugins-marketplaces
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-15"
    public: true
    isOfficial: true
    support: unknown_schema
    note: Native plugin manifest schema is not public.
  - agent: grok-build
    domain: mcp
    url: https://docs.x.ai/build/features/skills-plugins-marketplaces
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-15"
    public: true
    isOfficial: true
    support: unknown_schema
    note: Claude-compatible MCP is documented; Grok-native MCP shape is not.
  - agent: jetbrains-ai-assistant
    domain: rules
    url: https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026.1"
    public: true
    isOfficial: true
  - agent: jetbrains-ai-assistant
    domain: mcp
    url: https://www.jetbrains.com/help/ai-assistant/mcp.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026.1"
    public: true
    isOfficial: true
  - agent: jetbrains-ai-assistant
    domain: skills
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    isOfficial: true
    support: not_applicable
  - agent: jetbrains-ai-assistant
    domain: hooks
    url: null
    tier: null
    drift_mechanism: null
    version_pin: null
    public: false
    isOfficial: true
    support: not_applicable
  - agent: junie
    domain: skills
    url: https://junie.jetbrains.com/docs/agent-skills.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-22"
    public: true
    isOfficial: true
  - agent: junie
    domain: commands
    url: https://junie.jetbrains.com/docs/custom-slash-commands.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-22"
    public: true
    isOfficial: true
  - agent: junie
    domain: mcp
    url: https://junie.jetbrains.com/docs/junie-cli-mcp-configuration.html
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-22"
    public: true
    isOfficial: true
  - agent: agents-md
    domain: rules
    url: https://agents.md/
    tier: 2
    drift_mechanism: hash
    version_pin: "2026-05-22"
    public: true
    isOfficial: true
  - agent: agent-skills
    domain: skills
    url: https://agentskills.io/specification
    tier: 2
    drift_mechanism: semantic_field_diff
    version_pin: "2026-05-22"
    public: true
    isOfficial: true
  - agent: anthropic-skills
    domain: reference_impl
    url: https://github.com/anthropics/skills
    tier: 3
    drift_mechanism: hash
    version_pin: git-sha-during-implementation
    public: true
    isOfficial: true
  - agent: ruler
    domain: adapter
    url: https://github.com/intellectronica/ruler
    tier: 3
    drift_mechanism: version
    version_pin: release-during-implementation
    public: true
    isOfficial: false
  - agent: rulesync
    domain: config_schema
    url: https://github.com/dyoshikawa/rulesync/releases/latest/download/config-schema.json
    tier: 1
    drift_mechanism: version
    version_pin: release-during-implementation
    public: true
    isOfficial: false
```
