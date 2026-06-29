# Gov/Legal Data Drivers + OpenAPI Codegen

## Status

Stage: `capture`
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

None — ready for research.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: packet opened from gold-intake cluster 'Gov/legal data drivers + OpenAPI codegen' (19 nuggets).
