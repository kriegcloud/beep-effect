# P1 Source-of-Truth Pinning And Tier-1 Codegen

## Status

Complete.

## Implementation

`@beep/ai-sync` now lives at `packages/tooling/library/ai-sync` with
`beep.family = "tooling"` and `beep.kind = "library"`.

The package generator fetches Tier-1 sources and writes committed generated
artifacts under `src/_generated`:

- `src/_generated/schemas.gen.ts`
- `src/_generated/source-metadata.gen.ts`

Pinned/generated Tier-1 sources:

- Codex config at `rust-v0.133.0`
- Codex generated hook schema listing at `rust-v0.133.0`
- MCP schema `2025-11-25`
- ACP schema `v0.13.3`
- Claude Code SchemaStore settings, plugin manifest, and marketplace schemas
- rulesync release config and MCP schema assets

ACP was deliberately refreshed from the packet's initial `v0.13.2` pin to the
current `v0.13.3` release during implementation.

## Evidence

- `bun run --cwd packages/tooling/library/ai-sync generate`
  - generated 9 AI sync source pins
- `bun run --cwd packages/tooling/library/ai-sync check`
  - typechecked package source and tests
  - validated committed generated artifacts offline
  - validated `.codex/config.toml` with `codex-config`
- `bun run --cwd packages/tooling/library/ai-sync test`
  - 1 test file, 7 tests passing

## Notes

The V1 generator emits a focused generated schema subset plus generated source
metadata hashes. The full upstream JSON Schema documents are pinned by URL,
version, and content hash so future broadening can happen as a refresh rather
than a new source-discovery pass.
