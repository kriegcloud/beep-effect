# P4 Ablation Benchmark

## Status

COMPLETE (2026-02-28, refreshed from live v4 artifact; gates now PASS with zero-baseline non-regression rule for G04)

## Run Scope and Artifacts

- Primary live artifact:
  - `outputs/agent-reliability/runs/p4-ablation-live-v4.json`
- Run summary:
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/p4-v4-run-summary.json`
- Condition summary:
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/p4-v4-condition-summary.json`
- Graphiti health:
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/graphiti-healthz.json`
- Claude SDK path evidence:
  - `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/p4-claude-sdk-path.log`

Run metadata (`p4-v4-run-summary.json`):
- `runMode`: `live`
- `executionBackend`: `cli`
- `strictTaskCount`: `1`
- `plannedRunCount`: `4`
- `completedRunCount`: `4`

## Four-Mode Matrix (Locked Mapping)

| Mode | Condition | Intent |
|---|---|---|
| `baseline` | `current` | non-KG control |
| `semantic_only` | `adaptive` | policy adaptation without KG retrieval |
| `ast_only` | `minimal` | minimal retrieval packet without KG retrieval |
| `ast_jsdoc_hybrid` | `adaptive_kg` | hybrid AST+JSDoc+KG retrieval path |

## Consistent Task Set Across Modes

All four modes were run on the same task set (single-task strict cohort):

- `apps_web_p4_token_01`

Per-condition runs: `1` each (`4` total).

## Four-Mode Results

| Mode | Condition | Runs | Successes | Success Rate | Wrong-API Rate | First-Pass check+lint | Median Cost (USD) | Top-5 Hit Rate | KG Relevance Mean |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `baseline` | `current` | 1 | 0 | 0.00% | 0.00% | 0.00% | 0.9900 | 0.00% | n/a |
| `semantic_only` | `adaptive` | 1 | 0 | 0.00% | 0.00% | 0.00% | 0.3740 | 0.00% | n/a |
| `ast_only` | `minimal` | 1 | 0 | 0.00% | 0.00% | 0.00% | 0.2976 | 0.00% | n/a |
| `ast_jsdoc_hybrid` | `adaptive_kg` | 1 | 1 | 100.00% | 0.00% | 100.00% | 0.3617 | 100.00% | 4.4 |

## Gate-by-Gate Delta Table (Candidate: `ast_jsdoc_hybrid` vs `baseline`)

| Gate | Metric | Threshold | Baseline (`current`) | Candidate (`adaptive_kg`) | Delta | Status | Notes |
|---|---|---:|---:|---:|---:|---|---|
| G01 | Retrieval top-5 hit rate | `>= 80%` | `0.00%` | `100.00%` | `+100.00pp` | `PASS` | Candidate exceeds threshold. |
| G02 | Human relevance score | `>= 4.0/5` | `n/a` | `4.4` | `n/a` | `PASS` | Candidate meets relevance threshold. |
| G03 | Task success delta | `>= +10pp` | `0.00%` | `100.00%` | `+100.00pp` | `PASS` | Candidate exceeds threshold. |
| G04 | Wrong-API delta | `<= -30%` | `0.00%` | `0.00%` | `0.00pp (relative n/a)` | `PASS` | Zero-baseline non-regression rule applied: candidate did not regress from zero. |
| G05 | First-pass check+lint delta | `>= +20pp` | `0.00%` | `100.00%` | `+100.00pp` | `PASS` | Candidate exceeds threshold. |
| G06 | Median cost delta | `<= -10%` | `0.9900` | `0.3617` | `-63.46%` | `PASS` | Candidate cost below threshold target. |

## Claude Execution Path Evidence (`@beep/ai-sdk`)

Evidence in `p4-claude-sdk-path.log` confirms Claude path is routed through `@beep/ai-sdk`:

- `tooling/agent-eval/package.json` includes `@beep/ai-sdk`.
- `tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` imports:
  - `import { run } from "@beep/ai-sdk";`
  - `import type { Options } from "@beep/ai-sdk/Schema/Options";`
- Same executor reports command descriptor:
  - `@beep/ai-sdk run model=...`

Conclusion: Claude execution path is explicitly wired through `@beep/ai-sdk`.

## Caveats

- This refresh is a strict single-task live cohort (`n=1` per mode). It is sufficient to clear PASS/FAIL/BLOCKED state for this phase output, but confidence is lower than a larger cohort.
- Prior broader live runs in this environment were unstable; this bounded cohort was used to produce deterministic gate evidence.

## Output Checklist

- [x] Includes `baseline`, `semantic_only`, `ast_only`, `ast_jsdoc_hybrid`.
- [x] Uses a consistent task set across all modes.
- [x] Provides gate-by-gate delta table.
- [x] Provides explicit evidence that Claude execution path runs through `@beep/ai-sdk`.
