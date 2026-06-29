# Citation Grounding & Hallucination Guard

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

Legal/IP answers must never cite from memory: an eyecite-style citation parser
emits exact char spans, every citation must resolve to a real authority and
carry a verbatim-verified grounding span before it may be emitted, and that
ground-before-cite contract is the hallucination guard the legal runtime
hangs everything else on.

## Next Open Question

**Q2: Scope boundary** — does this packet ship the full guard (parser +
lifecycle + verbatim gate + straddle + matter carrier + fence enforcement +
court vocab), or own only the grounding core and compose/defer the rest? This is
the highest-leverage fork: it bounds the packet's surface area and conditions
every other open question (build-vs-buy, first-slice, placement). RESEARCH flags
multiple routing items here as "NOT yet settled." Run
`/grill-with-docs citation-grounding-hallucination-guard` to resolve the open
questions one at a time (recommended answers pre-drafted in
[`DECISIONS.md`](./DECISIONS.md)).

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'Citation lookup + verbatim-span grounding (hallucination guard)' (11 nuggets).
