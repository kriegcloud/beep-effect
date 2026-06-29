# Gov/Legal Data Drivers + OpenAPI Codegen

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

Four gov/legal driver packages (`@beep/courtlistener|ecfr|dol|federal-register`)
are bare `VERSION='0.0.0'` skeletons and `@beep/govinfo` is schema-only — yet a
single OpenAPI→(Effect SDK + MCP server) codegen pass plus a shared
auth/retry/cache client layer could light all five up at once. The itch: build
that codegen pipeline and the per-source auth matrix on beep's
Effect/effect-Schema/HttpApi stack rather than vendoring Orval/axios/Zod.

## Next Open Question

**Q1: Codegen engine — one generator for all five drivers, or a tiered
per-driver strategy keyed on spec availability?** (the build-vs-buy fork the
whole pipeline hinges on). All eight branch-closing questions are pre-drafted
with recommended answers in [`DECISIONS.md`](./DECISIONS.md) — resolve them via
`/grill-with-docs gov-legal-data-driver-codegen`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'Gov/legal data drivers + OpenAPI codegen' (19 nuggets).
