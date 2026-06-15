# Effect Capability KG

## Status

Stage: `graduate`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

Effect v4 has rich, beautifully documented modules such as `Combiner`,
`Reducer`, and `Filter`, but this repo's agents and humans do not reliably know
when to reach for them. The exploration asks whether deterministic JSDoc/AST
facts, an ontology-shaped capability graph, specialist agent profiles, and
pre-write hook backpressure can make those capabilities discoverable and
eventually enforceable.

## Next Open Question

Seed goal
[`goals/effect-capability-kg-seed`](../../goals/effect-capability-kg-seed/README.md)
is scaffolded. After the seed proof, decide whether to graduate
`effect-capability-specialist-router`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-15: packet opened and run through capture, research, and
  grill-with-docs alignment. Stage -> shape; no blocking open questions.
- 2026-06-15: executed the shape stage by drafting `BRIEF.md`; packet remains
  in review at `shape` and will pause before any `./goals` scaffolding.
- 2026-06-15: executed `decompose` by drafting `MAP.md`, naming candidate
  goals, selecting `effect-capability-kg-seed` as the first vertical slice, and
  preserving the pause before any `./goals` scaffolding.
- 2026-06-15: graduated the first approved goal packet:
  [`goals/effect-capability-kg-seed`](../../goals/effect-capability-kg-seed/README.md).
  Exploration remains active for later candidate goals.
