# USPTO Patent Driver Depth

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

The hand-rolled `packages/drivers/uspto` already speaks ODP application-metadata
basics, but attorney-grade patent work needs real depth — a Lucene/ODP
query-DSL with injection-safe escaping, prosecution-timeline + status-code +
document-tier vocabularies, PTAB/assignment/priority endpoints, a 403→source-PDF
fallback, plus net-new international/full-text tiers (EPO OPS, BigQuery, ppubs,
Google Patents). Extend the existing driver in place; do not restart it.

## Next Open Question

**Q1: Driver-wave scope — in-place `@beep/uspto` depth only, or fan out to
net-new sibling drivers in this packet?** This is the highest-leverage fork: it
decides whether the exploration graduates as a single privilege-safe in-place
depth goal or a fan-out of credentialed driver goals, which shapes every
downstream slice. All seven branch-closing questions are pre-drafted with
recommended answers in [`DECISIONS.md`](./DECISIONS.md) — resolve them via
`/grill-with-docs uspto-patent-driver-depth`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'USPTO/patent driver depth (ODP, query DSL, File Wrapper, EPO, BigQuery)' (26 nuggets).
