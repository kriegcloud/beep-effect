# Court Vocabulary Resolver

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

The `@beep/courtlistener` driver is a bare stub and beep has only placeholder
single-literal court/jurisdiction vocabularies, yet every citation, venue, and
provenance feature needs a real controlled court taxonomy plus a resolver that
turns messy free-text court mentions into canonical IDs. courts-db (~2,809
courts with CourtListener IDs, regex name variants, and a span-gated resolver)
is the ready-made seed for that vocabulary + resolver vertical.

## Next Open Question

**Q1: Build-vs-buy — reimplement the courts-db resolver in Effect, or adopt an
existing JS citation library?** This is the highest-leverage fork: it sets the
provenance posture (clean-room reimplement + re-derive vs copy-with-attribution)
that every downstream decision (slicing, vendoring, attribution) inherits. The
recommended answer and six more pre-drafted forks live in
[`DECISIONS.md`](./DECISIONS.md). Resolve via
`run /grill-with-docs court-vocabulary-resolver`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'Court / jurisdiction controlled vocabulary' (14 nuggets).
