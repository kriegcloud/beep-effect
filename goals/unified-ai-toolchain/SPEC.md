# Unified AI Toolchain Specification

## Status

**V1 COMPLETE**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-05-22
- **Updated:** 2026-05-23

## Purpose

The repo needs a durable schema layer for AI coding agent configuration. The
first data product is not a new file distribution system. It is a typed schema
and transform package that answers:

- is this agent config valid for the agent that will read it?
- can this config shape be transformed into another agent's native shape
  without losing meaning?
- which upstream source of truth backs each field?
- has an upstream schema or documentation surface drifted since the package was
  generated?
- can beep-effect validate its own agent-facing configuration during normal
  checks?

The target package is
`packages/tooling/library/ai-sync`, published as
`@beep/ai-sync`.

## Scope

In scope:

- Claude Code, Codex, Grok Build, JetBrains AI Assistant, and Junie
- Skills, Rules, Commands, Hooks, Plugins, and MCP server configuration
  domains where each agent supports them
- explicit N/A and `unknown_schema` metadata for unsupported or undocumented
  cells
- generated Effect Schemas from Tier-1 JSON Schema sources
- hand-authored Effect Schemas for Tier-2 documentation-backed domains
- Tier-3 adapter-code and Tier-4 introspection metadata for fallback sources
- bidirectional transforms where semantics are proven and documented
- drift detection against pinned upstream sources
- validation of beep-effect's own agent config files during `bun run check`

Out of scope for v1:

- a CLI package for creating or editing agent config files
- file fanout, sync, or distribution workflows that compete with `ruler` or
  `rulesync`
- reverse-roundtrip emission from a canonical config into every native agent
  file
- additional agents such as Cursor, Gemini CLI, Copilot, Aider, or Windsurf
- runtime control of agents, agent sessions, MCP servers, or IDEs
- secret resolution, plugin installation, marketplace publishing, or managed
  enterprise policy rollout

## Architectural Boundaries

`@beep/ai-sync` is a non-slice tooling library. It lives at
`packages/tooling/library/ai-sync` and declares
`beep.family = "tooling"` and `beep.kind = "library"`.

This placement follows the non-slice family grammar in
`standards/architecture/07-non-slice-families.md`: repo operations,
generators, policy support, and automation route to `tooling`, and reusable
support code routes to the `library` kind. Tooling libraries may depend on
foundation packages and other tooling libraries. They must not depend on
product slices or `shared/*`.

The package may depend on foundation modeling helpers such as `@beep/schema`,
identity helpers, repo utility packages, `effect`, and codegen dependencies. It
may not own product semantics, app runtime composition, server adapters, slice
ports, or shared-kernel language.

The codegen script follows the `@beep/acp` precedent in
`packages/drivers/acp/scripts/generate.ts`: pinned upstream version constants
near the top, generated outputs under `src/_generated`, Effect-TS v4
`Command.run` entrypoint, generated no-edit banners, and curated public exports
instead of direct `_generated/*` package exports.

Closed-source agents require layered evidence. Where no upstream JSON Schema
exists, the package uses official documentation first, then public adapter code,
then last-resort npm package or JetBrains plugin introspection metadata. All
Tier-4 metadata must be marked `isOfficial: false`.

## Canonical Decisions

- Package home: `packages/tooling/library/ai-sync`.
- Published name: `@beep/ai-sync`.
- Name posture: V1 treats sync as schema agreement and validated semantic
  transforms, not file fanout.
- Family and kind: `tooling` / `library`.
- V1 surface: schemas, source metadata, drift checks, and validated transforms.
- V1 non-goals: CLI, fanout, sync, marketplace install, reverse-roundtrip, and
  additional agents.
- Codegen precedent: `@beep/acp` generator and generated schema packaging.
- Tier-1 posture: generate Effect Schemas from pinned machine-readable JSON
  Schema sources.
- Tier-2 posture: hand-author schemas from official docs and attach upstream
  documentation URLs through JSDoc annotations.
- Tier-3 posture: use public adapter implementations as fallback evidence, not
  as canonical truth when official docs disagree.
- Tier-4 posture: introspect shipped package or plugin artifacts only when
  higher tiers are absent, and mark the result unofficial.
- Unknown posture: use explicit `unknown_schema` metadata rather than inventing
  schemas for undocumented surfaces.
- Completion posture: V1 closes only when beep-effect validates at least one of
  its own real agent configs during `bun run check`.

## Data Products

The primary data product is the schema package. It must publish typed Effect
Schemas for native agent configuration cells and metadata that explains source
tier, upstream URL, pin, drift mechanism, and support status.

Minimum schema dimensions:

- agent id
- domain id
- native file shape
- source tier
- official or unofficial source status
- version pin or content hash strategy
- support status: supported, N/A, or `unknown_schema`
- lossy or lossless transform status where a transform exists
- validation error surface suitable for CI output

The secondary data product is the drift report. It must distinguish local
generated-file drift, pinned-source movement, documentation field drift, and
unknown-schema cells that remain blocked by absent upstream docs.

The V1 dogfooding product is a repo validation report for at least one real
agent config file, with `.codex/config.toml` as the preferred first target and
`.mcp.json`, `.claude/settings.json`, `AGENTS.md`, and `CLAUDE.md` as additional
candidate inputs.

## Privacy Contract

Agent configuration can include private local paths, tokens by environment
variable name, MCP headers, marketplace URLs, internal plugin names, command
arguments, and repository-specific instructions. The schema package must treat
validated config files as sensitive inputs.

Validation output may include file paths relative to the repo, schema paths,
field names, typed error tags, and bounded excerpts of invalid scalar values
only when those values are not recognized as secret-shaped. It must not print
secret values, raw header values, bearer tokens, private home paths, or full
instruction documents in CI output.

The default validation posture is local, read-only, and offline. `--check`
style validation uses committed schemas and local files only. Network drift
checks are a separate strict CI or scheduled workflow and must not upload local
configuration contents to upstream services.

Tier-4 introspection is part of the privacy boundary. Shipped npm or plugin
artifacts may be downloaded and inspected for schema discovery, but no local
user configuration should be sent to those tools or vendors during validation.

## Deployment Contract

V1 deploys as a repo package and check integration, not as a service. The
package must build, test, lint, and generate schemas in the normal monorepo
tooling flow.

The package-local generate command fetches pinned Tier-1 upstream sources and
emits committed generated files. The package-local check command validates the
committed generated files against source metadata without network access. The
strict drift command runs in CI or scheduled automation and may contact
upstream sources to compare current versions or content hashes.

`bun run check` must include the dogfooding validation gate before V1 closes.
That gate validates selected repo-local config files through
`@beep/ai-sync` and fails with a typed schema error when a config
field violates the relevant native schema.

## Completion Criteria

The initiative is complete only when:

- `@beep/ai-sync` exists with correct tooling library metadata
- codegen from Tier-1 sources follows the `@beep/acp` pattern
- Codex config and hooks schemas are generated from a pinned Codex tag
- MCP and ACP schemas are generated from pinned upstream revisions
- Claude Code SchemaStore mirrors are generated or represented with pinned
  source metadata
- rulesync release schemas are generated or represented as Tier-1 fallback
  unified-config sources
- Tier-2 hand-authored schemas cover documentation-backed cells
- every domain by agent cell is supported, N/A, or `unknown_schema`
- unknown Grok Build hook, plugin, and Grok-native MCP shapes remain explicit
  until `grok inspect` or upstream docs provide evidence
- transforms exist only where semantic mapping is proven and are tested for
  round-trip behavior
- drift detection has local, strict, and refresh modes
- this repo validates at least one real config file during `bun run check`
- V1 closeout evidence records a deliberate invalid config failing with a typed
  Effect Schema error
