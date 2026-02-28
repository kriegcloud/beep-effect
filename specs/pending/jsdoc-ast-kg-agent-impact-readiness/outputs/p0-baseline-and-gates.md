# P0 Baseline and Gates

## Status

FROZEN on 2026-02-28.

## Objective

Freeze gate definitions, thresholds, and evidence contracts before any P1-P5 implementation claims.

## Scope and Inputs (Locked)

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/README.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/RUBRICS.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/initial_plan.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p-pre-kg-cli-refactor-and-ai-sdk.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/handoffs/HANDOFF_PRE.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/handoffs/HANDOFF_P0.md`

## PRE Phase Assumptions and Contracts (Preserved)

### PRE Assumptions (Locked)

1. Baseline structure retrieval remains deterministic AST-backed.
2. Semantic JSDoc edges are additive and confidence-weighted.
3. Fallback to deterministic context is mandatory for retrieval failures.
4. Promotion decisions require live ablation evidence.
5. Claude benchmark backend runs through `@beep/ai-sdk`.

### PRE Constraints (Locked)

1. No command-surface regressions for `kg index|publish|verify|parity|replay`.
2. Effect-first implementation patterns are mandatory.
3. Tooling failures use typed schema-based errors only.
4. Claude benchmark SDK backend is routed via `@beep/ai-sdk`.
5. Existing CLI fallback behavior remains intact.

### PRE Command and Evidence Contract (Preserved)

| Command ID | Command | Evidence Artifact |
|---|---|---|
| PRE-C01 | `bun run beep docs laws` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/discovery-laws.log` |
| PRE-C02 | `bun run beep docs skills` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/discovery-skills.log` |
| PRE-C03 | `bun run beep docs policies` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/discovery-policies.log` |
| PRE-C04 | `bun run agents:pathless:check` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/agents-pathless-check.log` |
| PRE-C05 | `bun run --cwd tooling/cli test -- kg.test.ts` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/kg-cli-test.log` |
| PRE-C06 | `bunx turbo run check --filter=@beep/ai-sdk` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/ai-sdk-check.log` |
| PRE-C07 | `bunx turbo run lint --filter=@beep/ai-sdk` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/ai-sdk-lint.log` |
| PRE-C08 | `bunx turbo run test --filter=@beep/ai-sdk` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/ai-sdk-test.log` |
| PRE-C09 | `rg -n "@anthropic-ai/claude-agent-sdk|@beep/ai-sdk" tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/pre/claude-executor-import-audit.log` |

### PRE Gate Contracts (Preserved)

| Gate ID | Metric | Threshold | Measurement Method (Exact) | Command/Evidence Mapping |
|---|---|---:|---|---|
| PRE-G1 | `kg.ts` modularization plan completeness | 100% command-surface mapping (`index|publish|verify|parity|replay`) | Presence of all five command names and modular ownership boundaries in PRE output | PRE-C05 + `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` |
| PRE-G2 | Effect-first policy completeness | 100% required rules documented | Presence of no-escape typing constraints and typed tooling error contract in PRE output | PRE-C05 + `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` |
| PRE-G3 | Direct vendor Claude SDK calls in migrated benchmark execution path | 0 | Count matching direct vendor SDK imports in benchmark SDK execution path | PRE-C09 |
| PRE-G4 | `@beep/ai-sdk` validation suite | `check + lint + test` all pass | PRE-C06, PRE-C07, PRE-C08 all exit with code `0` | PRE-C06..PRE-C08 |
| PRE-G5 | KG CLI parity guardrails | Pre/post command behavior parity matrix present | Presence of explicit parity verification matrix for all five `kg` commands in PRE output | PRE-C05 + `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` |

## Ablation Baseline Contract (Locked)

| Required Mode | Bench Condition (`tooling/agent-eval`) | Locked Intent |
|---|---|---|
| `baseline` | `current` | Non-KG control condition |
| `semantic_only` | `adaptive` | Adaptive policy path without Graphiti retrieval |
| `ast_only` | `minimal` | Minimal retrieval packet path without Graphiti retrieval |
| `ast_jsdoc_hybrid` | `adaptive_kg` | Hybrid path with Graphiti retrieval enabled |

Delta reference pair is locked to `ast_jsdoc_hybrid` (candidate) vs `baseline` (control).

## P0 Command and Evidence Mapping (Executed)

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P0-C01 | `bun run beep docs laws` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/discovery-laws.log` |
| P0-C02 | `bun run beep docs skills` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/discovery-skills.log` |
| P0-C03 | `bun run beep docs policies` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/discovery-policies.log` |
| P0-C04 | `bun run agents:pathless:check` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/agents-pathless-check.log` |
| P0-C05 | `rg -n "threshold|measurement|evidence|blocked" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p0-baseline-and-gates.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p0/p0-contract-audit.log` |

## Locked Upstream Measurement Command Registry

| Command ID | Command | Evidence Artifact |
|---|---|---|
| P2-C01 | `curl -fsS http://127.0.0.1:8123/healthz` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/graphiti-healthz.json` |
| P2-C02 | `curl -fsS http://127.0.0.1:8123/metrics` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/graphiti-metrics.prom` |
| P2-C05 | `rg -n "timeout|retry|no-throw|fallback|timeout rate|p95|p99|search_memory_facts" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p2-retrieval-reliability.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p2/p2-contract-audit.log` |
| P3-C05 | `rg -n "parse success|precision|recall|denominator|coverage|@domain|@provides|@depends|@errors" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p3-semantic-coverage.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p3/p3-contract-audit.log` |
| P4-C02 | `bun run agent:bench --live --execution-backend sdk --graphiti-url http://127.0.0.1:8123/mcp --graphiti-group-id beep-dev --conditions current,minimal,adaptive,adaptive_kg --output outputs/agent-reliability/runs/p4-ablation-live.json --report-output outputs/agent-reliability/weekly/p4-ablation-live-report.md` | `outputs/agent-reliability/runs/p4-ablation-live.json` |
| P4-C03 | `bun run agent:bench:report --input outputs/agent-reliability/runs/p4-ablation-live.json --output outputs/agent-reliability/weekly/p4-ablation-live-report.md --title "P4 Ablation Live Report"` | `outputs/agent-reliability/weekly/p4-ablation-live-report.md` |
| P4-C04 | `bun run agent:bench:compare --baseline outputs/agent-reliability/runs/baseline.json --candidate outputs/agent-reliability/runs/p4-ablation-live.json --output outputs/agent-reliability/weekly/p4-ablation-compare.md --title "P4 Ablation Compare"` | `outputs/agent-reliability/weekly/p4-ablation-compare.md` |
| P4-C06 | `rg -n "baseline|semantic_only|ast_only|ast_jsdoc_hybrid|delta|@beep/ai-sdk|BLOCKED" specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p4-ablation-benchmark.md` | `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/evidence/p4/p4-report-audit.log` |

## Success Gates (Locked Definitions)

| Gate ID | Metric | Threshold | Measurement Method (Exact) | Command/Evidence Mapping | Evidence Source |
|---|---|---:|---|---|---|
| G01 | Retrieval top-5 hit rate on labeled tasks | `>= 80%` | `(prompt_count_with_expected_target_in_top5 / total_labeled_prompts) * 100` | P4-C02, P4-C03, P4-C06 | `outputs/p4-ablation-benchmark.md` |
| G02 | Human relevance score for injected KG context | `>= 4.0/5` | `sum(all reviewer scores) / review_count`, minimum two reviewers per prompt | P4-C03, P4-C06 | `outputs/p4-ablation-benchmark.md` |
| G03 | Task success delta vs baseline | `>= +10pp` | `successRate(ast_jsdoc_hybrid) - successRate(baseline)` where `successRate = successful_tasks / total_tasks * 100` | P4-C02, P4-C03, P4-C04, P4-C06 | `outputs/p4-ablation-benchmark.md` |
| G04 | Wrong-API/resource hallucination delta | `<= -30%` | `((wrongApiRate_hybrid - wrongApiRate_baseline) / wrongApiRate_baseline) * 100` | P4-C02, P4-C03, P4-C04, P4-C06 | `outputs/p4-ablation-benchmark.md` |
| G05 | First-pass `check` + `lint` pass delta | `>= +20pp` | `firstPassRate(ast_jsdoc_hybrid) - firstPassRate(baseline)` where `firstPassRate = first_pass_successes / total_tasks * 100` | P4-C02, P4-C03, P4-C04, P4-C06 | `outputs/p4-ablation-benchmark.md` |
| G06 | Median token/cost delta | `<= -10%` | `((medianCost_hybrid - medianCost_baseline) / medianCost_baseline) * 100` | P4-C02, P4-C03, P4-C04, P4-C06 | `outputs/p4-ablation-benchmark.md` |
| G07 | Retrieval timeout rate (`search_memory_facts` path) | `<= 1%` | `(timeout_count / retrieval_request_count) * 100` | P2-C02, P2-C05 | `outputs/p2-retrieval-reliability.md` |
| G08 | Retrieval p95 latency (warm) | `<= 1.5s` | p95 over warm retrieval latency samples for the same commit/task cohort | P2-C02, P2-C05 | `outputs/p2-retrieval-reliability.md` |
| G09 | Retrieval p99 latency | `<= 2.5s` | p99 over retrieval latency samples for the same commit/task cohort | P2-C02, P2-C05 | `outputs/p2-retrieval-reliability.md` |
| G10 | Required tag parse success (`@domain/@provides/@depends/@errors`) | `>= 99%` | `(required_tags_parsed_successfully / required_tags_encountered) * 100` | P3-C05 | `outputs/p3-semantic-coverage.md` |
| G11 | Semantic edge precision (`@domain/@provides/@depends/@errors`) | `>= 90%` | `TP / (TP + FP) * 100` on labeled semantic-edge adjudication set | P3-C05 | `outputs/p3-semantic-coverage.md` |
| G12 | Semantic edge recall (`@domain/@provides/@depends/@errors`) | `>= 85%` | `TP / (TP + FN) * 100` on labeled semantic-edge adjudication set | P3-C05 | `outputs/p3-semantic-coverage.md` |

## Blocked-Metric Policy (Locked)

1. Any missing artifact, missing command output, missing denominator, or unresolved evidence conflict sets status to `BLOCKED`.
2. Any undefined divisor for percentage-delta metrics sets status to `BLOCKED_ZERO_BASELINE`.
3. Any saturated baseline that makes uplift gates non-actionable sets status to `BLOCKED_BASELINE_SATURATED` until the task set is hardened.
4. No interpolation, carry-forward estimation, proxy substitution, or inferred backfilling is allowed.
5. `BLOCKED` states never count as pass.

## Current Freeze-Time Gate State (2026-02-28)

| Gate ID | Status | Reason |
|---|---|---|
| PRE-G1 | PASS | PRE output includes explicit command-surface mapping for `index|publish|verify|parity|replay`. |
| PRE-G2 | PASS | PRE output includes Effect-first and typed tooling error contracts. |
| PRE-G3 | BLOCKED | `claude-sdk-executor.ts` still references `@anthropic-ai/claude-agent-sdk` in PRE evidence audit (migration target not complete). |
| PRE-G4 | PASS | PRE evidence logs show `@beep/ai-sdk` `check`, `lint`, and `test` passed. |
| PRE-G5 | PASS | PRE output includes explicit pre/post verification matrix for all five `kg` commands. |
| G01 | BLOCKED | P4 output is pending; no measured top-5 hit-rate evidence captured yet. |
| G02 | BLOCKED | P4 output is pending; no reviewer-score dataset captured yet. |
| G03 | BLOCKED | P4 output is pending; no measured task-success delta captured yet. |
| G04 | BLOCKED | P4 output is pending; no measured hallucination-rate delta captured yet. |
| G05 | BLOCKED | P4 output is pending; no measured first-pass delta captured yet. |
| G06 | BLOCKED | P4 output is pending; no measured median cost delta captured yet. |
| G07 | BLOCKED | P2 output is pending; timeout-rate numerator/denominator are not recorded yet. |
| G08 | BLOCKED | P2 output is pending; warm p95 latency samples are not recorded yet. |
| G09 | BLOCKED | P2 output is pending; p99 latency samples are not recorded yet. |
| G10 | BLOCKED | P3 output is pending; required-tag parse totals are not recorded yet. |
| G11 | BLOCKED | P3 output is pending; semantic-edge precision adjudication set not recorded yet. |
| G12 | BLOCKED | P3 output is pending; semantic-edge recall adjudication set not recorded yet. |

## Promotion Rule (Unchanged)

- **GO:** all high-impact gates pass.
- **LIMITED GO:** reliability gates pass, and at least one of task success or hallucination gates passes with no regression elsewhere.
- **NO GO:** reliability fails, task quality gates regress, or any required gate remains `BLOCKED`.
