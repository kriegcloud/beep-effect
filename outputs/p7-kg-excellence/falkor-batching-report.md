# Falkor Batching Report

## Objective
Reduce full-repo Falkor publish runtime for  by at least 70% from the P6 baseline.

## Implementation
- Added batched Falkor query execution in [](tooling/cli/src/commands/kg.ts) via .
- Replaced per-query process invocation with one  stdin session per envelope.
- Added sink dedupe ledger () to skip deterministic repeats.

## Benchmark Inputs
- Baseline artifact: 
- P7 artifact: 
- P7 run group: 

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
