# Deterministic Doc-Structure Extraction & Streaming Candidate Gate

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

A non-LLM-in-the-loop logic tier for legal documents: deterministic regex
extractors (defined terms, Section/Article/Exhibit cross-refs, corporate-suffix
parties + roles, amendment recitals, court captions, PACER header stamps, a
statute/case/court legal-entity catalog) that emit verbatim text + char offsets
as cheap pre-LLM candidate seeders — so a parse miss is an absent row, never a
wrong fact. Paired with a `Partial`(candidate)/`Complete`(authoritative)
Effect-Stream gate where fallible partial extractions surface to the UI but only
the finalized, scored object crosses into authority.

## Next Open Question

**Q1: Scope boundary — which of the 10 netNew themes does THIS packet own, vs
route to neighbor goals?** Highest-leverage fork: it gates the first slice (Q2)
and package placement (Q3). RESEARCH.md is synthesized and `DECISIONS.md` holds
all eight load-bearing forks pre-drafted with recommended answers, each `open`.
Resolve them by running `/grill-with-docs deterministic-doc-structure-extraction`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'Anti-inference structured extraction + deterministic doc-structure' (10 nuggets).
