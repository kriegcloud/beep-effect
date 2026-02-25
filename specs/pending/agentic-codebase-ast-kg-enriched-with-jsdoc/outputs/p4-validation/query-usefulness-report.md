# P4 Query Usefulness Report

## Scope
Validate query usefulness and hook latency requirements for KG-assisted context injection.

## Inputs Reviewed
- `outputs/p2-design/query-and-hook-contract.md`
- `outputs/p2-design/evaluation-design.md`
- `outputs/p3-execution/integration-log.md`

## Additional Validation Runs (2026-02-25)
1. Hook no-throw / packet presence drill
- Prompt with no snapshot keyword hit -> output remains valid JSON and omits `<kg-context>`.
- Prompt with snapshot keyword hit -> output remains valid JSON and includes `<kg-context>`.

2. Hook latency sample (local, warm-ish)
- 30 runs of `.claude/hooks/skill-suggester/index.ts` with snapshot available.
- Observed: `p95=431ms`, `p99=469ms`, median `280ms`.

## Threshold Status

| Metric | Target | Measured | Status | Evidence |
|---|---:|---:|---|---|
| Top-5 hit rate on curated prompt set | >= 80% | Not measured | BLOCKED | Curated usefulness benchmark output absent |
| Hook KG relevance (human review) | >= 4.0/5 | Not measured | BLOCKED | No reviewer panel scores in artifacts |
| Hook latency p95 (warm) | <= 1.5s | 0.431s | PASS | 30-run hook latency sample |
| Hook latency p99 | <= 2.5s | 0.469s | PASS | 30-run hook latency sample |

## Conclusion
Latency targets pass on current local validation sample, and no-throw behavior is confirmed. Query usefulness gates remain blocked until top-5 hit rate and relevance scoring are produced.
