# P3 Semantic Coverage

## Status

COMPLETE (2026-02-28, thresholds not met)

## Scope and Frozen Labeled Set

- Scope paths (P1): `tooling/cli/src/commands/kg.ts`, `tooling/agent-eval/src/benchmark/execution/**/*.ts`
- Frozen labeled set artifact: `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/labeled-semantic-set.json`
- Metric summary artifact: `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/semantic-metrics-summary.json`
- Label-set definition: one label per `(exported symbol x required tag)` for `@domain`, `@provides`, `@depends`, `@errors`
- Labeled symbols: `17`
- Total labeled semantic-tag slots (denominator universe): `68` (`17 * 4`)

## Measurement Method (Denominator-Explicit)

1. Parse all exported symbols in P1 scope using TypeScript AST.
2. Build labeled slots for required tags (`@domain/@provides/@depends/@errors`) per symbol.
3. Adjudicate each slot:
   - `TP`: tag present and parse-valid (plus domain value matches expected scope domain).
   - `FP`: tag present but parse-invalid or domain-mismatched.
   - `FN`: tag missing, or present-but-invalid (counted as missed required edge).
4. Compute metrics:
   - Required-tag parse success = `parsed_required_slots / labeled_required_slots`
   - Semantic edge precision = `TP / (TP + FP)`
   - Semantic edge recall = `TP / (TP + FN)`

Precision zero-denominator policy used here:
- If `(TP + FP) = 0`, precision is reported as `0.00%` and flagged denominator-undefined.

## Aggregate Metrics

| Metric | Formula | Numerator | Denominator | Measured | Threshold | Status |
|---|---|---:|---:|---:|---:|---|
| Required-tag parse success (`@domain/@provides/@depends/@errors`) | `parsed / labeled` | `0` | `68` | `0.00%` | `>= 99%` | FAIL |
| Semantic edge precision (`@domain/@provides/@depends/@errors`) | `TP / (TP + FP)` | `0` | `0` | `0.00%`* | `>= 90%` | FAIL |
| Semantic edge recall (`@domain/@provides/@depends/@errors`) | `TP / (TP + FN)` | `0` | `68` | `0.00%` | `>= 85%` | FAIL |

`*` Precision denominator was zero because no required semantic edges were present on exported symbols in scope.

Confusion totals (aggregate):
- `TP = 0`
- `FP = 0`
- `FN = 68`

## Scoped Module Metrics

| Scoped module | Exported symbols | Labeled slots | Parse success (num/den) | Precision (num/den) | Recall (num/den) |
|---|---:|---:|---:|---:|---:|
| `kg-cli-command` | `2` | `8` | `0.00%` (`0/8`) | `0.00%` (`0/0`) | `0.00%` (`0/8`) |
| `agent-eval-execution` | `15` | `60` | `0.00%` (`0/60`) | `0.00%` (`0/0`) | `0.00%` (`0/60`) |

## Coverage Heatmap (Scoped Files)

Coverage here is required semantic-tag slot presence in labeled scope (`present_required_slots / labeled_required_slots`).

| File | Exported symbols | Required slots | Present slots | Coverage |
|---|---:|---:|---:|---:|
| `tooling/cli/src/commands/kg.ts` | `2` | `8` | `0` | `0.00%` |
| `tooling/agent-eval/src/benchmark/execution/cli-executor.ts` | `1` | `4` | `0` | `0.00%` |
| `tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` | `2` | `8` | `0` | `0.00%` |
| `tooling/agent-eval/src/benchmark/execution/codex-sdk-executor.ts` | `2` | `8` | `0` | `0.00%` |
| `tooling/agent-eval/src/benchmark/execution/index.ts` | `2` | `8` | `0` | `0.00%` |
| `tooling/agent-eval/src/benchmark/execution/types.ts` | `8` | `32` | `0` | `0.00%` |

## Tag-Family Breakdown

| Tag family | Labeled slots | Parse success (num/den) | Precision (num/den) | Recall (num/den) |
|---|---:|---:|---:|---:|
| `@domain` | `17` | `0.00%` (`0/17`) | `0.00%` (`0/0`) | `0.00%` (`0/17`) |
| `@provides` | `17` | `0.00%` (`0/17`) | `0.00%` (`0/0`) | `0.00%` (`0/17`) |
| `@depends` | `17` | `0.00%` (`0/17`) | `0.00%` (`0/0`) | `0.00%` (`0/17`) |
| `@errors` | `17` | `0.00%` (`0/17`) | `0.00%` (`0/0`) | `0.00%` (`0/17`) |

## Root-Cause Analysis for Missing Semantic Edges

1. Exported symbols in P1 scope currently document `@category` (and sometimes file-level `@module`) but do not provide per-symbol `@domain/@provides/@depends/@errors`.
2. The labeled set shows zero observed required semantic tags across all 17 exported symbols, producing complete FN coverage (`68/68`).
3. Because no required semantic edges are emitted, precision denominator is zero and recall is zero; gate evaluation therefore fails on all three P3 semantic metrics.

## Command and Evidence Contract (P3-C01..P3-C05)

| Command ID | Artifact | Status |
|---|---|---|
| P3-C01 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/discovery-laws.log` | PASS |
| P3-C02 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/discovery-skills.log` | PASS |
| P3-C03 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/discovery-policies.log` | PASS |
| P3-C04 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/agents-pathless-check.log` | PASS |
| P3-C05 | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/p3-contract-audit.log` | PASS |

## Output Checklist

- [x] Parse success measured.
- [x] Precision measured.
- [x] Recall measured.
- [x] Coverage heatmap included.
- [x] Coverage gaps explained.
