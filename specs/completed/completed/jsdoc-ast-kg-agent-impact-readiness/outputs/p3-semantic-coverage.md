# P3 Semantic Coverage

## Status

COMPLETE (2026-02-28, thresholds met)

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

## Aggregate Metrics

| Metric | Formula | Numerator | Denominator | Measured | Threshold | Status |
|---|---|---:|---:|---:|---:|---|
| Required-tag parse success (`@domain/@provides/@depends/@errors`) | `parsed / labeled` | `68` | `68` | `100.00%` | `>= 99%` | PASS |
| Semantic edge precision (`@domain/@provides/@depends/@errors`) | `TP / (TP + FP)` | `68` | `68` | `100.00%` | `>= 90%` | PASS |
| Semantic edge recall (`@domain/@provides/@depends/@errors`) | `TP / (TP + FN)` | `68` | `68` | `100.00%` | `>= 85%` | PASS |

Confusion totals (aggregate):
- `TP = 68`
- `FP = 0`
- `FN = 0`

## Scoped Module Metrics

| Scoped module | Exported symbols | Labeled slots | Parse success (num/den) | Precision (num/den) | Recall (num/den) |
|---|---:|---:|---:|---:|---:|
| `kg-cli-command` | `2` | `8` | `100.00%` (`8/8`) | `100.00%` (`8/8`) | `100.00%` (`8/8`) |
| `agent-eval-execution` | `15` | `60` | `100.00%` (`60/60`) | `100.00%` (`60/60`) | `100.00%` (`60/60`) |

## Coverage Heatmap (Scoped Files)

Coverage here is required semantic-tag slot presence in labeled scope (`present_required_slots / labeled_required_slots`).

| File | Exported symbols | Required slots | Present slots | Coverage (num/den) |
|---|---:|---:|---:|---:|
| `tooling/cli/src/commands/kg.ts` | `2` | `8` | `8` | `100.00%` (`8/8`) |
| `tooling/agent-eval/src/benchmark/execution/cli-executor.ts` | `1` | `4` | `4` | `100.00%` (`4/4`) |
| `tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` | `2` | `8` | `8` | `100.00%` (`8/8`) |
| `tooling/agent-eval/src/benchmark/execution/codex-sdk-executor.ts` | `2` | `8` | `8` | `100.00%` (`8/8`) |
| `tooling/agent-eval/src/benchmark/execution/index.ts` | `2` | `8` | `8` | `100.00%` (`8/8`) |
| `tooling/agent-eval/src/benchmark/execution/types.ts` | `8` | `32` | `32` | `100.00%` (`32/32`) |

## Tag-Family Breakdown

| Tag family | Labeled slots | Parse success (num/den) | Precision (num/den) | Recall (num/den) |
|---|---:|---:|---:|---:|
| `@domain` | `17` | `100.00%` (`17/17`) | `100.00%` (`17/17`) | `100.00%` (`17/17`) |
| `@provides` | `17` | `100.00%` (`17/17`) | `100.00%` (`17/17`) | `100.00%` (`17/17`) |
| `@depends` | `17` | `100.00%` (`17/17`) | `100.00%` (`17/17`) | `100.00%` (`17/17`) |
| `@errors` | `17` | `100.00%` (`17/17`) | `100.00%` (`17/17`) | `100.00%` (`17/17`) |

## Gap Analysis

No missing semantic edges were observed in the frozen labeled set. All required-tag slots in P1 scope were present and parse-valid.

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
