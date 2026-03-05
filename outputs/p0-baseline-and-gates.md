# P0 Baseline and Gates

## Status

FROZEN on 2026-02-28.

## Scope and Inputs (Locked)

- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/README.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/RUBRICS.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/initial_plan.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p-pre-kg-cli-refactor-and-ai-sdk.md`
- `specs/pending/jsdoc-ast-kg-agent-impact-readiness/handoffs/P0_ORCHESTRATOR_PROMPT.md`

## PRE Contracts Preserved (No Changes)

### PRE Gate Contracts

| Gate ID | Metric | Threshold | Measurement Method | Evidence Source |
|---|---|---:|---|---|
| PRE-G1 | `kg.ts` modularization plan completeness | 100% command-surface mapping (`index`,`publish`,`verify`,`parity`,`replay`) | Presence check in PRE deliverable | `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` |
| PRE-G2 | Effect-first policy completeness | 100% required rules documented | Presence check in PRE deliverable | `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` |
| PRE-G3 | Direct vendor Claude SDK calls in benchmark execution path | 0 | Source audit for direct vendor import in migrated path | `tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` |
| PRE-G4 | `@beep/ai-sdk` validation suite | `check + lint + test` all pass | Command exit status | command logs |
| PRE-G5 | KG CLI parity guardrails | pre/post command behavior parity plan present | Presence check in PRE deliverable | `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` |

### PRE Assumptions and Defaults (Locked)

1. Baseline retrieval remains deterministic AST-backed.
2. JSDoc semantic edges are additive and confidence-weighted.
3. Fallback to deterministic context is mandatory for retrieval failures.
4. Promotion requires live ablation evidence.
5. Claude benchmark backend must run through `@beep/ai-sdk`.

## Ablation Baseline Contract (Locked)

### Mode Mapping for Measurement

| P4 Required Mode | Bench Condition (`tooling/agent-eval`) | Locked Behavior Basis |
|---|---|---|
| `baseline` | `current` | Non-KG control condition |
| `semantic_only` | `adaptive` | Adaptive policy path without Graphiti retrieval |
| `ast_only` | `minimal` | Minimal retrieval packet path without Graphiti retrieval |
| `ast_jsdoc_hybrid` | `adaptive_kg` | Hybrid path with Graphiti retrieval enabled |

### Delta Reference Pair (Locked)

- Baseline side for deltas: `baseline` (`current`)
- Candidate side for deltas: `ast_jsdoc_hybrid` (`adaptive_kg`)

## Command and Evidence Registry (Explicit Mapping)

| Command ID | Command | Evidence Artifact |
|---|---|---|
| C01 | `bun run beep docs laws` | terminal output + `outputs/p0-evidence/discovery-laws.log` |
| C02 | `bun run beep docs skills` | terminal output + `outputs/p0-evidence/discovery-skills.log` |
| C03 | `bun run beep docs policies` | terminal output + `outputs/p0-evidence/discovery-policies.log` |
| C04 | `curl -fsS http://127.0.0.1:8123/healthz` | `outputs/p0-evidence/graphiti-healthz.json` |
| C05 | `curl -fsS http://127.0.0.1:8123/metrics` | `outputs/p0-evidence/graphiti-metrics.prom` |
| C06 | `bunx turbo run check --filter=@beep/ai-sdk` | `outputs/p0-evidence/ai-sdk-check.log` |
| C07 | `bunx turbo run lint --filter=@beep/ai-sdk` | `outputs/p0-evidence/ai-sdk-lint.log` |
| C08 | `bunx turbo run test --filter=@beep/ai-sdk` | `outputs/p0-evidence/ai-sdk-test.log` |
| C09 | `bun run --cwd tooling/cli test -- kg.test.ts` | `outputs/p0-evidence/kg-cli-test.log` |
| C10 | `BEEP_GRAPHITI_URL=http://127.0.0.1:8123/mcp bun run beep kg verify --target both --group beep-ast-kg` | `outputs/p0-evidence/kg-verify-both.json` |
| C11 | `BEEP_GRAPHITI_URL=http://127.0.0.1:8123/mcp bun run beep kg parity --profile code-graph-functional --group beep-ast-kg` | `outputs/p0-evidence/kg-parity-functional.json` |
| C12 | `bun run agent:bench --live --execution-backend sdk --graphiti-url http://127.0.0.1:8123/mcp --graphiti-group-id beep-dev --conditions current,minimal,adaptive,adaptive_kg --output outputs/agent-reliability/runs/p4-ablation-live.json --report-output outputs/agent-reliability/weekly/p4-ablation-live-report.md` | `outputs/agent-reliability/runs/p4-ablation-live.json` |
| C13 | `bun run agent:bench:report --input outputs/agent-reliability/runs/p4-ablation-live.json --output outputs/agent-reliability/weekly/p4-ablation-live-report.md --title "P4 Ablation Live Report"` | `outputs/agent-reliability/weekly/p4-ablation-live-report.md` |
| C14 | `bun run agent:bench:compare --baseline outputs/agent-reliability/runs/baseline.json --candidate outputs/agent-reliability/runs/p4-ablation-live.json --output outputs/agent-reliability/weekly/p4-ablation-compare.md --title "P4 Ablation Compare"` | `outputs/agent-reliability/weekly/p4-ablation-compare.md` |
| C15 | `bun run check` | `outputs/p0-evidence/repo-check.log` |
| C16 | `bun run lint` | `outputs/p0-evidence/repo-lint.log` |
| C17 | `bun run test` | `outputs/p0-evidence/repo-test.log` |
| C18 | `bun run docgen` | `outputs/p0-evidence/repo-docgen.log` |
| C19 | `bun run agents:pathless:check` | `outputs/p0-evidence/agents-pathless-check.log` |
| C20 | `rg -n "@anthropic-ai/claude-agent-sdk|@beep/ai-sdk" tooling/agent-eval/src/benchmark/execution/claude-sdk-executor.ts` | `outputs/p0-evidence/claude-executor-import-audit.log` |
| C21 | `rg -n "index|publish|verify|parity|replay|Effect-first|typed tooling error|@beep/ai-sdk|parity" outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` | `outputs/p0-evidence/pre-output-contract-audit.log` |
| C22 | `rg -n "Top-5 hit rate|Hook KG relevance|Task success delta|Wrong-API|First-pass|Median token/cost delta" outputs/p4-ablation-benchmark.md` | `outputs/p0-evidence/p4-metric-lines.log` |
| C23 | `rg -n "timeout rate|p95|p99|search_memory_facts" outputs/p2-retrieval-reliability.md` | `outputs/p0-evidence/p2-metric-lines.log` |
| C24 | `rg -n "parse success|precision|recall|@domain|@provides|@depends|@errors" outputs/p3-semantic-coverage.md` | `outputs/p0-evidence/p3-metric-lines.log` |

## Success Gates (Definitions Locked)

| Gate ID | Metric | Threshold | Measurement Method (Exact) | Command/Evidence Mapping | Evidence Source Per Metric |
|---|---|---:|---|---|---|
| G01 | Retrieval top-5 hit rate on labeled tasks | `>= 80%` | `(prompts with >=1 expected target in top-5) / (total prompts) * 100`; prompt set size `>=100` | C12, C22 | `outputs/p4-ablation-benchmark.md` |
| G02 | Human relevance score for injected KG context | `>= 4.0/5` | Mean reviewer score across all prompt reviews; at least 2 reviewers per prompt | C22 | `outputs/p4-ablation-benchmark.md` |
| G03 | Task success delta vs baseline | `>= +10pp` | `successRate(ast_jsdoc_hybrid) - successRate(baseline)` in percentage points | C12, C13, C14, C22 | `outputs/p4-ablation-benchmark.md` |
| G04 | Wrong-API/resource hallucination delta | `<= -30%` | `((rate_hybrid - rate_baseline) / rate_baseline) * 100` | C12, C13, C14, C22 | `outputs/p4-ablation-benchmark.md` |
| G05 | First-pass `check` + `lint` pass delta | `>= +20pp` | `(check+lint pass rate hybrid) - (check+lint pass rate baseline)` in percentage points | C12, C13, C14, C22 | `outputs/p4-ablation-benchmark.md` |
| G06 | Median token/cost delta | `<= -10%` | `((medianCost_hybrid - medianCost_baseline) / medianCost_baseline) * 100` | C12, C13, C14, C22 | `outputs/p4-ablation-benchmark.md` |
| G07 | Retrieval timeout rate (`search_memory_facts` path) | `<= 1%` | `(timeout_count / retrieval_request_count) * 100` | C04, C05, C23 | `outputs/p2-retrieval-reliability.md` |
| G08 | Retrieval p95 latency (warm) | `<= 1.5s` | p95 of warm retrieval latencies, same commit/snapshot cohort | C23 | `outputs/p2-retrieval-reliability.md` |
| G09 | Retrieval p99 latency | `<= 2.5s` | p99 of retrieval latencies, same commit/snapshot cohort | C23 | `outputs/p2-retrieval-reliability.md` |
| G10 | Required tag parse success (`@domain/@provides/@depends/@errors` scoped set included in semantic packet) | `>= 99%` | `(required tags parsed successfully / required tags encountered) * 100` | C24 | `outputs/p3-semantic-coverage.md` |
| G11 | Semantic edge precision (`@domain/@provides/@depends/@errors`) | `>= 90%` | `TP / (TP + FP) * 100` using labeled adjudication | C24 | `outputs/p3-semantic-coverage.md` |
| G12 | Semantic edge recall (`@domain/@provides/@depends/@errors`) | `>= 85%` | `TP / (TP + FN) * 100` using labeled adjudication | C24 | `outputs/p3-semantic-coverage.md` |

## Blocked-Metric Policy (Locked)

1. Any missing artifact, missing command output, or missing denominator sets status to `BLOCKED`.
2. No interpolation, no carry-forward estimation, and no proxy substitution is allowed.
3. If a baseline denominator is zero for a percentage-delta metric, status is `BLOCKED_ZERO_BASELINE`.
4. If baseline ceiling makes uplift undefined or non-actionable (for example 100% baseline on uplift-only gate), status is `BLOCKED_BASELINE_SATURATED` until task set is hardened.
5. `BLOCKED` never counts as pass.

## Current Freeze-Time Gate State (2026-02-28)

| Gate ID | Status | Reason |
|---|---|---|
| PRE-G1 | BLOCKED | `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` missing at root output contract path |
| PRE-G2 | BLOCKED | `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` missing at root output contract path |
| PRE-G3 | BLOCKED | PRE migration acceptance not yet completed in this phase chain |
| PRE-G4 | BLOCKED | PRE validation logs not captured under this phase chain |
| PRE-G5 | BLOCKED | PRE parity-guardrail contract file missing at root output contract path |
| G01 | BLOCKED | `outputs/p4-ablation-benchmark.md` missing |
| G02 | BLOCKED | `outputs/p4-ablation-benchmark.md` missing |
| G03 | BLOCKED | `outputs/p4-ablation-benchmark.md` missing |
| G04 | BLOCKED | `outputs/p4-ablation-benchmark.md` missing |
| G05 | BLOCKED | `outputs/p4-ablation-benchmark.md` missing |
| G06 | BLOCKED | `outputs/p4-ablation-benchmark.md` missing |
| G07 | BLOCKED | `outputs/p2-retrieval-reliability.md` missing |
| G08 | BLOCKED | `outputs/p2-retrieval-reliability.md` missing |
| G09 | BLOCKED | `outputs/p2-retrieval-reliability.md` missing |
| G10 | BLOCKED | `outputs/p3-semantic-coverage.md` missing |
| G11 | BLOCKED | `outputs/p3-semantic-coverage.md` missing |
| G12 | BLOCKED | `outputs/p3-semantic-coverage.md` missing |

## Promotion Rule (Unchanged)

- **GO:** all high-impact gates pass.
- **LIMITED GO:** reliability gates pass, and at least one of task success or hallucination gates passes with no regression elsewhere.
- **NO GO:** reliability fails, task quality gates regress, or any required gate remains `BLOCKED`.
