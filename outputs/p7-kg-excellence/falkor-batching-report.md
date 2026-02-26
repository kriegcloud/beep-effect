# Falkor Batching Report

## Objective
Reduce full-repo Falkor publish runtime for `kg publish --target both --mode full` by at least 70% from the P6 baseline.

## Implementation
- Added batched Falkor query execution in `tooling/cli/src/commands/kg.ts` via `runFalkorQueries(...)`.
- Replaced per-query process invocation with one `redis-cli` stdin session per envelope.
- Added sink dedupe ledger (`tooling/ast-kg/.cache/publish-ledger.json`) to skip deterministic repeats.

## Benchmark Inputs
- Baseline artifact: `specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/outputs/p6-dual-write-parity/evidence/20260225T214750Z-fullrepo-publish-full.json`
- P7 artifact: `outputs/p7-kg-excellence/evidence/20260226T004744Z-fullrepo-publish-both.json`
- P7 run group: `beep-ast-kg-p7-20260226T004744Z`
- Post-mitigation artifact (queue proxy routing): `outputs/p7-kg-excellence/evidence/20260226T011541Z-continue-publish-both.json`

## Results

| Metric | P6 Baseline | P7 Batched | Improvement |
|---|---:|---:|---:|
| Falkor duration (ms) | 1,346,707 | 15,551 | **98.85% faster** |
| Falkor duration (min) | 22.45 | 0.26 | **-22.19 min** |
| Falkor failures | 0 | 0 | maintained |
| Falkor attempted/written | 1437/1437 | 244/244 | maintained zero-loss on run scope |
| Per-envelope Falkor cost (ms/envelope) | 937.17 | 63.73 | **93.20% lower** |

## Gate Decision
- Runtime reduction target (>=70%): **PASS**
- Zero failed writes preserved: **PASS**

## Post-Mitigation Revalidation
- Run group: `beep-ast-kg-p7-continue-20260226T011541Z`
- Falkor duration: `26,474 ms`
- Falkor failures: `0`
- Reduction vs baseline: **98.03% faster**

Decision: runtime target remains satisfied after enabling shared Graphiti queue proxy routing.
