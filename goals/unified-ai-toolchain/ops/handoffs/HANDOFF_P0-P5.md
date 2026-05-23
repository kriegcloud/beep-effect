# Unified AI Toolchain P0-P5 Handoff

## Status

Superseded by the completed V1 implementation. The closeout evidence now lives
in `history/outputs/p1-*` through `history/outputs/p5-*`.

## Mission

Complete the unified AI toolchain schema library from packet bootstrap to V1
dogfooding in beep-effect. V1 closes only when
`@beep/ai-sync` validates at least one real repo agent config
during `bun run check`.

## Starting State

P0 packet creation has begun. The repo contains the prior research artifact at
[research/claude-web-source-map.md](../../research/claude-web-source-map.md),
the source map at [research/sources-of-truth.md](../../research/sources-of-truth.md),
and the current-state output at
[history/outputs/p0-current-state.md](../../history/outputs/p0-current-state.md).

The target package does not exist yet. The implementation base should be
created at:

```txt
packages/tooling/library/ai-sync
```

The key precedent already exists in the repo:

```txt
packages/drivers/acp/scripts/generate.ts
```

Real dogfooding candidates already exist:

- `.codex/config.toml`
- `.mcp.json`
- `.claude/settings.json`
- `AGENTS.md`
- `CLAUDE.md`

## Decisions To Preserve

- The target is a tooling library, not a product slice, shared-kernel package,
  driver, or foundation package.
- The package metadata must declare `beep.family = "tooling"` and
  `beep.kind = "library"`.
- The package is named `@beep/ai-sync`, but V1 sync means schema agreement and
  validated semantic transforms, not file fanout.
- The codegen pattern follows `@beep/acp`: pinned source constants, Effect
  `Command.run`, generated files under `src/_generated`, no-edit banners, and
  curated public exports.
- Tier-1 sources are generated from machine-readable schemas.
- Tier-2 sources are hand-authored from official docs with source URL
  annotations.
- Tier-3 adapter code is fallback evidence, not the default source of truth.
- Tier-4 introspection is last resort and must be marked `isOfficial: false`.
- Unknown or undocumented cells become `unknown_schema`; do not invent native
  shapes.
- V1 ships only the schema library, drift checks, transforms, and dogfooding
  validation.
- V1 does not ship a CLI, file fanout tool, reverse-roundtrip native emitter,
  marketplace installer, or additional-agent expansion.

## Phase Instructions

P0 initiative bootstrap and current state:

- completed enough for implementation to start once this packet is accepted
- preserve the current-state report as the baseline
- if new source research materially changes phase decomposition, pause and
  update the packet before coding

P1 source-of-truth pinning and Tier-1 codegen:

- create `@beep/ai-sync` under the tooling library family
- use the `@beep/acp` generator as the implementation model
- pin Codex config and hooks at `rust-v0.133.0`
- pin MCP at `2025-11-25`
- pin ACP at `v0.13.3`
- include Claude Code SchemaStore mirrors and rulesync release schemas where
  they are machine-readable
- keep normal package check offline
- record generated source metadata and golden-file evidence in a P1 output

P2 Tier-2 semantic-field-diff schemas:

- hand-author schemas only from official docs or documented fallback evidence
- annotate hand-authored schemas with upstream documentation URLs
- cover every target agent by domain cell
- mark JetBrains AI Assistant Skills and Hooks as N/A
- mark Grok Build undocumented hook payloads, plugin manifest, and native MCP
  shape as `unknown_schema`
- mark any additional unknowns explicitly instead of accepting vague objects as
  finished support

P3 drift detection pipeline:

- implement local `--check`, networked `--strict`, and refresh-oriented
  `--refresh` modes
- keep pre-commit or lint-staged checks fast and network-free
- add synthetic drift tests that prove the affected source and domain are
  reported
- make strict CI compare current upstream state against committed pins and
  source metadata

P4 cross-agent transforms:

- implement transforms only where source semantics match
- classify every transform as lossy or lossless
- test every transform pair with round-trip fixtures
- preserve unknown and N/A cells as non-transformable
- keep canonical shapes internal to the schema library until a later
  reverse-roundtrip phase

P5 first real consumer:

- wire beep-effect's own config through the schemas
- prefer `.codex/config.toml` as the first mandatory validation target
- add root `bun run check` integration
- prove a deliberately invalid config fails with a typed Effect Schema error
- record the closeout evidence in `history/outputs/p5-first-real-consumer.md`

## Stop Conditions

Stop and record the blocker if:

- implementation starts outside the schema-library scope for V1
- a package under `packages/` is created with a family or kind that contradicts
  `standards/architecture/07-non-slice-families.md`
- the implementation starts building a CLI, fanout tool, reverse-roundtrip
  emitter, or additional-agent support before P5 closes
- a source-of-truth discovery materially changes the P0-P5 phase decomposition
- an undocumented native surface is being modeled from guesswork instead of
  marked `unknown_schema`
- local validation would print secret values, private home paths, raw headers,
  or full instruction documents in CI output

## Required Evidence

Each completed phase output must record:

- files changed
- commands run
- upstream pins or hashes used
- generated files added or refreshed
- schemas added, N/A cells, and `unknown_schema` cells
- drift checks performed
- dogfooding config files validated
- deliberate failure evidence where applicable
- remaining gaps or explicit deferrals
