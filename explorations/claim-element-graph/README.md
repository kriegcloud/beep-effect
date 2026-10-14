# Claim Element Graph

## Status

<!-- BEGIN GENERATED: EXPLORATION STATUS -->
Stage: `align`
Status: `active`
<!-- END GENERATED: EXPLORATION STATUS -->

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

IPRally's invention-graph paper ([arXiv 2610.01553](https://arxiv.org/abs/2610.01553)) made a
gap visible. beep-effect models a patent claim's number, dependency, preamble and transition, but
its `body` is one opaque string. Three pieces of work already assume a claim-element layer that
does not exist:
- the drafting ledger's ordered `ClaimLimitationSupportSet`
- `Distinction.missing_limitation`, which is free text
- the research-corpus-synthesis R2-062 consumer gate

The literature points one way: a typed claim-element graph anchored to exact source spans, built
by deterministic rules first, extended by an LLM second, and scored strictly.

## Next Open Question

Align round 1 has seven questions, each with a recommended answer in the manifest:
- Where do elements live: inside `PatentClaim` or in a sibling projection?
- Deterministic-first or LLM-first?
- Which metric is primary?
- Is NC-licensed data acceptable for internal evaluation?
- Is Markush in scope for the first slice?
- Which consumer comes first?
- How large a US labelled set do we need?

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json): machine state, stage, and the align frontier.
2. [`CAPTURE.md`](./CAPTURE.md): the operator's request and the anchor paper.
3. [`RESEARCH.md`](./RESEARCH.md): the landscape scoped to claim elements, the in-repo bricks,
   and the constraints.
4. [`research/SWEEP-2026-10-14.md`](./research/SWEEP-2026-10-14.md): the full sweep report, with
   its post-acquisition addendum and fact-check appendix.
5. [`research/CATALOG.md`](./research/CATALOG.md): every one of the 139 papers read, with a
   tier and disposition (in scope, routed to an owner, or background).
6. [`research/SOURCES.md`](./research/SOURCES.md): the provenance ledger. It lists the 21
   sources acquired into the research library and the licenses read from each cloned repo.
7. [`research/ANCHOR-2610.01553.md`](./research/ANCHOR-2610.01553.md): the deep-dive on the
   anchor paper and its code release.
8. [`research/OPPORTUNITIES.md`](./research/OPPORTUNITIES.md): friction receipts.
9. [`DECISIONS.md`](./DECISIONS.md): the align log. No rounds have run yet.

## Trail

- 2026-10-14: packet opened from a 57-agent literature sweep anchored on arXiv 2610.01553. A
  15-claim refutation pass found 8 claims confirmed and 7 partly wrong; corrections are applied.
  The 21 core sources were acquired into the research library (verify: 0 missing, 0 integrity
  failures). IPRally's eval data was inspected: claims only, 13.5% US, not lemmatized, and no
  word-level gold. Research is complete, and the packet stops at the start of align.
