# Agent Guide

`@beep/acp` is the Effect-native Agent Client Protocol driver. Keep ACP wire
contracts, transport helpers, typed protocol errors, and driver-local layers
product-neutral; product-specific agent behavior belongs in the owning slice.
No `t3`, `$t3:`, `_x.ai` or other product strings in `src/`.

`src/_generated/*` is never exported; route generated access through the
`Schema` (v2), `SchemaV1` (v1) and `Compat` namespaces. `src/internal/*` has a
workspace-only export (`null` in `publishConfig.exports`, excluded from
docgen) so tests can import `@beep/acp/internal/normalize`; do not import it
from other packages.

Codegen uses `@beep/codegen-kit` and pins two ACP releases in
`scripts/generate.ts`: `schema-v2.0.0-alpha.9` (generation 2, caches
`spec/*.unstable.json`) and `schema-v1.26.0` (generation 1, caches
`spec/v1/*.unstable.json`). `bun run generate` reads the committed caches
without network access. `bun run generate -- --refresh` downloads the pinned
release assets, normalizes them, and regenerates `src/_generated/*.gen.ts`.
`bun run generate:check` stays offline and fails on generated-output drift.
Build/check must remain offline.

The protocol, client, agent and errors are ported from t3code
`packages/effect-acp` at `31dcc7c51309697af5fd5584d507a1359e0fb62f`; the
decision record and the deviations from upstream are in `README.md`
("Provenance and design decisions"). Keep span names `$I`-templated; the four
literal `AcpExtensions.*` span names are cataloged and must not change.
