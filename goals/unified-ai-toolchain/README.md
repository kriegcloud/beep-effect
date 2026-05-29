# Unified AI Toolchain

## Status

V1 complete; P6+ follow-ups deferred

## Overview

This initiative owns the schema layer for repo-facing AI coding agent
configuration. It produces an Effect Schema package for Claude Code, Codex,
Grok Build, JetBrains AI Assistant, and Junie, with native schemas,
cross-agent transforms where the semantics are real, and drift detection
against pinned upstream sources.

Production-complete V1 means `@beep/ai-sync` exists as a
tooling library, covers the six configured domains for the five target agents
with explicit N/A and unknown-schema cells, validates against pinned upstream
sources in CI, and dogfoods the result by validating this repo's own agent
configuration during `bun run check`.

The library is not a file fanout or distribution tool. `ruler`, `rulesync`, and
similar tools may consume the schemas later, but V1 only ships canonical
schemas, metadata, drift checks, and validated transforms.

The `@beep/ai-sync` name reserves room for later sync workflows. In V1, sync
means schema agreement and validated semantic transforms, not writing native
agent files.

## Read This First

- [SPEC.md](./SPEC.md) - authoritative contract
- [PLAN.md](./PLAN.md) - phased execution plan and progress
- [ops/manifest.json](./ops/manifest.json) - machine-readable phase and gate
  tracking
- [history/outputs/p0-current-state.md](./history/outputs/p0-current-state.md)
  - current repo state, upstream source tiers, and open gaps
- [research/sources-of-truth.md](./research/sources-of-truth.md) - per-agent
  source map with pins and drift mechanisms
- [research/codegen-and-drift-architecture.md](./research/codegen-and-drift-architecture.md)
  - codegen and drift-check architecture
- [research/claude-web-source-map.md](./research/claude-web-source-map.md) -
  preserved prior research artifact
- [ops/handoffs/HANDOFF_P0-P5.md](./ops/handoffs/HANDOFF_P0-P5.md) - execution
  handoff for the implementation session

## Current Progress

P0 through P5 are complete for V1. The implementation lives in
`packages/tooling/library/ai-sync` as the private package `@beep/ai-sync`.

The package now owns:

- Tier-1 source pins and committed generated metadata hashes
- native V1 schema coverage metadata for Claude Code, Codex, Grok Build,
  JetBrains AI Assistant, and Junie
- explicit `na` and `unknown_schema` cells for unsupported or undocumented
  surfaces
- local and strict drift checks, plus a refresh/generate path
- tested cross-agent transform helpers with lossy/lossless evidence
- mandatory dogfooding validation of this repo's `.codex/config.toml` during
  package and root checks

P6+ remains intentionally out of scope for V1. Future work can add a dedicated
operator CLI, `ruler`/`rulesync` interoperability, reverse-roundtrip emission,
or additional agents without reopening the V1 schema-library gate.

## Completion Standard

This initiative is done only when all are true:

- `@beep/ai-sync` exists under
  `packages/tooling/library/ai-sync`
- native schemas exist for Skills, Rules, Commands, Hooks, Plugins, and MCP
  servers across Claude Code, Codex, Grok Build, JetBrains AI Assistant, and
  Junie
- every unsupported or unknown cell is explicitly represented as N/A or
  `unknown_schema` with rationale
- Tier-1 sources are pinned, generated, and drift-checked
- Tier-2, Tier-3, and Tier-4 sources have documented drift mechanisms
- supported cross-agent transforms have tests and lossy/lossless metadata
- this repo validates at least one real on-disk agent config through the
  package during `bun run check`
- V1 evidence records a deliberate invalid config failing with a typed Effect
  Schema error that points at the offending field
