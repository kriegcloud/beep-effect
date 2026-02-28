# P3 Implementation Checklist

## Locked Interface Surfaces
- [x] CLI command surface preserved: `bun run beep kg index --mode full` and `bun run beep kg index --mode delta --changed <paths>`
- [x] Node ID shape preserved: `<workspace>::<file>::<symbol>::<kind>::<signature-hash>`
- [x] Edge provenance values preserved: `ast | type | jsdoc`
- [x] Semantic tag-edge mapping preserved:
  - `@category -> IN_CATEGORY`
  - `@module -> IN_MODULE`
  - `@domain -> IN_DOMAIN`
  - `@provides -> PROVIDES`
  - `@depends -> DEPENDS_ON`
  - `@errors -> THROWS_DOMAIN_ERROR`
- [x] Graphiti envelope version preserved: `AstKgEpisodeV1`
- [x] Hook failure behavior preserved: no-throw, emit no KG block on unavailable context

## P3 Core Delivery
- [x] Implemented `kg` CLI command tree in `tooling/cli` and wired into root command.
- [x] Implemented full and delta indexing modes with deterministic artifact hashing.
- [x] Implemented deterministic snapshot JSONL + manifest + reverse-deps + symbol-index caches under `tooling/ast-kg/.cache/*`.
- [x] Implemented Graphiti replay ledger and deterministic UUID conflict policy.
- [x] Implemented outage spool fallback at `tooling/ast-kg/.cache/graphiti-spool/<commitSha>.jsonl`.
- [x] Implemented hook KG packet injection (`<kg-context>`) from local snapshot cache with bounded output and no-throw behavior.
- [x] Added `tooling/cli` tests covering full+delta smoke, replay idempotency, and outage spool fallback.

## Required Checks
- [x] Full + delta indexing smoke checks pass.
- [x] Graphiti write path idempotency on replay passes.
- [x] Hook fallback no-throw integration check passes.
- [x] Interface lock surfaces unchanged.
- [x] P4 handoff prompt set authored.
