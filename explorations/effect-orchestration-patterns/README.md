# Effect Orchestration Patterns

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

beep already documents the conceptual laws for Effect orchestration (EF-25/26
retry-Schedule, EF-27 bounded fan-out, EF-31 failure-vs-defect) and implements
them inline per-driver, but has never factored them into shared machinery. This
explores consolidating a single retry-policy/`Schedule` library plus
`Layer.unwrapEffect`-based provider selection that every LLM and gov-data driver
can reuse.

## Sources & provenance

Full source ledger — the 8 gold nuggets (upstream repo + `file:line`), upstream
licenses, external citations, and the in-repo `@beep/*` bricks this packet
composes — lives in [`research/SOURCES.md`](./research/SOURCES.md). Mined from the
gold-intake cluster "Effect orchestration patterns (Schedule, Layer provider,
bounded fan-out)" ([ROUTING.md](../_gold-intake/ROUTING.md),
[GOLD_SYNTHESIS.md](../_gold-intake/GOLD_SYNTHESIS.md)).

## Next Open Question

**Q1: Scope boundary** — does this packet ship only the pure-`Schedule` layer
(retry-policy module + `Layer.unwrap` selector + `decode→die` helper + degraded-batch
combinator) now, or also the heavier stateful resilience stack (circuit breaker,
retry-budget, bulkhead, served-while-open cache, per-key rate limiter)? This fork
gates package placement, appetite, and review surface for every other decision.

DECISIONS.md is pre-drafted with 7 open forks, each carrying a RECOMMENDED answer.
Resolve them via `/grill-with-docs effect-orchestration-patterns`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

<Dated one-liners, newest first: what each session did and where it stopped.>

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'Effect orchestration patterns (Schedule, Layer provider, bounded fan-out)' (8 nuggets).
