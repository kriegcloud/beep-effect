# Effect Capability KG

## Status

Stage: `decompose`
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

Does [`MAP.md`](./MAP.md) choose the right first goal
(`effect-capability-kg-seed`) and sequencing? If yes, the next action is
graduation/scaffolding, but pause for explicit approval before creating any
`./goals` packets.

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
