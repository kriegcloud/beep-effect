# Unified AI Toolchain Plan

This plan executes [SPEC.md](./SPEC.md). P0 through P5 are complete for V1.
P6+ records follow-up work that is intentionally outside the V1 schema-library
gate.

## P0: Initiative Bootstrap And Current State

Status: complete

- Create the goal packet under `goals/unified-ai-toolchain`.
- Preserve the prior web research artifact as
  [research/claude-web-source-map.md](./research/claude-web-source-map.md).
- Audit the current repo landscape:
  - `@beep/acp` exists and provides the codegen precedent
  - `@beep/ai-sync` did not yet exist at packet creation
  - `.codex/config.toml`, `.mcp.json`, `.claude/settings.json`, `AGENTS.md`,
    and `CLAUDE.md` are available dogfooding candidates
- Record current state in
  [history/outputs/p0-current-state.md](./history/outputs/p0-current-state.md).
- Record the full source map in
  [research/sources-of-truth.md](./research/sources-of-truth.md).

Acceptance gate: the packet exists, `goals/README.md` lists the goal, and the
P0 output records Tier-1 through Tier-4 sources with pins, drift mechanisms,
and public accessibility.

## P1: Source-of-Truth Pinning And Tier-1 Codegen

Status: complete

- Create `packages/tooling/library/ai-sync` as a tooling library.
- Pin Tier-1 machine-readable sources:
  - Codex `codex-rs/core/config.schema.json` at `rust-v0.133.0`
  - Codex `codex-rs/hooks/schema/generated/*.json` at `rust-v0.133.0`
  - MCP `schema/2025-11-25/schema.json`
  - ACP `schema/schema.json` at `v0.13.3`
  - Claude Code SchemaStore mirrors for settings, plugin manifest, and
    marketplace
  - rulesync release schema assets for unified-config fallback
- Build the codegen pipeline in the same style as
  `packages/drivers/acp/scripts/generate.ts`.
- Emit generated Effect Schema modules under
  `src/_generated/<agent>/<domain>.gen.ts`.
- Document the codegen architecture in
  [research/codegen-and-drift-architecture.md](./research/codegen-and-drift-architecture.md).

Evidence: [history/outputs/p1-source-of-truth-pinning-and-tier-1-codegen.md](./history/outputs/p1-source-of-truth-pinning-and-tier-1-codegen.md).

Acceptance gate: Tier-1 generated schemas are reproducible from pinned sources,
generated files carry a no-edit banner, and normal package check remains
offline.

## P2: Tier-2 Semantic-Field-Diff Schemas

Status: complete

- Hand-author Effect Schemas for domains without Tier-1 sources.
- Cover Claude Code hooks, skills, commands, rules, plugin component metadata,
  and MCP docs where SchemaStore is incomplete.
- Cover JetBrains AI Assistant rules, prompt-library commands, and IDE MCP
  JSON snippets; mark Skills, Hooks, and Plugins as N/A where the product has
  no committed concept.
- Cover Junie skills, rules, commands, and MCP from official docs; mark Hooks
  and Plugins as N/A for V1.
- Cover Grok Build documented skills, rules, commands, hooks, plugins, and
  MCP compatibility surfaces; mark undocumented native schemas as
  `unknown_schema`.
- Attach each hand-authored schema to its upstream documentation URL through
  JSDoc annotation.

Evidence: [history/outputs/p2-tier-2-semantic-field-diff-schemas.md](./history/outputs/p2-tier-2-semantic-field-diff-schemas.md).

Acceptance gate: schema coverage is complete across the matrix without
inventing unsupported shapes.

## P3: Drift Detection Pipeline

Status: complete

- Implement layered drift checks:
  - `--check`: fast local check, no network, validates generated files and
    local config against committed schemas
  - `--strict`: CI mode, fetches upstream metadata and compares pins, hashes,
    and semantic fields
  - `--refresh`: regenerates from upstream pins or refreshed pins and prepares
    the diff for PR automation
- Integrate the fast check into the existing Husky lint-staged path only for
  relevant config or package files.
- Add CI coverage for strict drift checks.
- Add synthetic drift tests that replace a pinned response and prove the drift
  checker reports the affected source and domain.

Evidence: [history/outputs/p3-drift-detection-pipeline.md](./history/outputs/p3-drift-detection-pipeline.md).

Acceptance gate: drift is visible before schemas silently become stale.

## P4: Cross-Agent Transforms

Status: complete

- Implement bidirectional `Schema.transform` pairs only where semantics are
  real.
- Prioritize mappings with clear correspondence:
  - AGENTS.md-style rules and agent instruction documents
  - Codex `[mcp_servers.*]` TOML and Claude-style `.mcp.json`
  - Junie project MCP JSON and Claude-compatible MCP JSON
  - shared Agent Skills frontmatter where Claude Code, Codex, Grok Build, and
    Junie overlap
- Record lossy and lossless transform metadata.
- Refuse transforms for unknown or unsupported cells until source evidence
  exists.

Evidence: [history/outputs/p4-cross-agent-transforms.md](./history/outputs/p4-cross-agent-transforms.md).

Acceptance gate: transforms do not pretend that incompatible agent concepts are
equivalent.

## P5: First Real Consumer

Status: complete

- Wire beep-effect's own agent config files through
  `@beep/ai-sync`.
- Prefer `.codex/config.toml` as the first mandatory dogfooding file because it
  has a Tier-1 upstream schema.
- Add `.mcp.json`, `.claude/settings.json`, `AGENTS.md`, and `CLAUDE.md` as
  supported dogfooding candidates when their schemas are ready.
- Add a root `bun run check` gate that validates the selected files.
- Record failure evidence from a deliberate invalid config mutation in a safe
  test fixture or disposable copy.

Evidence: [history/outputs/p5-first-real-consumer.md](./history/outputs/p5-first-real-consumer.md).

Acceptance gate: V1 is not complete until the repo uses the package on its own
agent configuration in CI.

## P6+: Non-V1-Blocking Follow-Ups

Status: pending

- Add a CLI package such as `packages/tooling/tool/agent-configs` for operator
  workflows.
- Add interoperability helpers for `ruler` and `rulesync`.
- Add reverse-roundtrip emission from canonical schema data into native agent
  files.
- Add additional agents such as Cursor, Gemini CLI, Copilot, Aider, Windsurf,
  OpenCode, or Goose.
- Add automated PR creation for `--refresh` drift updates.

Acceptance gate: none for V1. These phases are explicitly non-blocking until
the schema library and dogfooding gate are complete.

## Required Checks

- `bun run check`
- `bun run --cwd packages/tooling/library/ai-sync check`
- `bun run --cwd packages/tooling/library/ai-sync generate`
- `bun run --cwd packages/tooling/library/ai-sync drift --strict`
- dogfooding validation through root `bun run check`
