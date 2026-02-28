# JSDoc-Enriched AST KG Agent Impact Readiness

## Status

PENDING

## Owner

@elpresidank

## Created

2026-02-28

## Updated

2026-02-28

## Quick Navigation

- [Quick Start](./QUICK_START.md)
- [Master Orchestration](./MASTER_ORCHESTRATION.md)
- [Agent Prompts](./AGENT_PROMPTS.md)
- [Rubrics](./RUBRICS.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Handoff PRE](./handoffs/HANDOFF_PRE.md)
- [Handoff P0](./handoffs/HANDOFF_P0.md)
- [Handoff P1](./handoffs/HANDOFF_P1.md)
- [Handoff P2](./handoffs/HANDOFF_P2.md)
- [Handoff P3](./handoffs/HANDOFF_P3.md)
- [Handoff P4](./handoffs/HANDOFF_P4.md)
- [Handoff P5](./handoffs/HANDOFF_P5.md)
- [Outputs Manifest](./outputs/manifest.json)
- [Initial Plan](./outputs/initial_plan.md)
- [PRE KG CLI Refactor + AI SDK](./outputs/p-pre-kg-cli-refactor-and-ai-sdk.md)
- [P0 Baseline and Gates](./outputs/p0-baseline-and-gates.md)
- [P1 JSDoc Governance](./outputs/p1-jsdoc-governance.md)
- [P2 Retrieval Reliability](./outputs/p2-retrieval-reliability.md)
- [P3 Semantic Coverage](./outputs/p3-semantic-coverage.md)
- [P4 Ablation Benchmark](./outputs/p4-ablation-benchmark.md)
- [P5 Rollout Decision](./outputs/p5-rollout-decision.md)

## Purpose

**Problem:** The repository now has a JSDoc-enriched AST knowledge graph, but current evidence does not prove it materially improves coding-agent outcomes. In addition, `tooling/cli/src/commands/kg.ts` is monolithic and risks drifting from repository laws and Effect-first conventions.

**Solution:** Add a mandatory pre-phase that modularizes `kg.ts` with Effect-first patterns, then route Claude execution through `@beep/ai-sdk` in benchmark/execution paths before running impact phases.

**Why this matters:** It prevents architecture and quality debt from polluting later validation phases, and it validates the new internal SDK under real benchmark workloads.

## Source-of-Truth Contract

All decisions in this spec must be grounded in these local artifacts first:

1. [KG Evaluation Report](/home/elpresidank/YeeBois/projects/beep-effect3/KG_EVALUATION_REPORT.md)
2. [AST KG Main Pending Spec README](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/README.md)
3. [P4 Query Usefulness Report](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/outputs/p4-validation/query-usefulness-report.md)
4. [P4 Agent Performance Impact Report](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/outputs/p4-validation/agent-performance-impact-report.md)
5. [P4 Semantic Enrichment Quality Report](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/outputs/p4-validation/semantic-enrichment-quality-report.md)
6. [P4 Coverage Correctness Report](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/outputs/p4-validation/coverage-correctness-report.md)
7. [P6 Query Parity Report](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc/outputs/p6-dual-write-parity/query-parity-report.md)
8. [KG CLI Command Surface](/home/elpresidank/YeeBois/projects/beep-effect3/tooling/cli/src/commands/kg.ts)
9. [Agent Benchmark Harness](/home/elpresidank/YeeBois/projects/beep-effect3/tooling/agent-eval/src)
10. [AI SDK README](/home/elpresidank/YeeBois/projects/beep-effect3/packages/ai/sdk/README.md)
11. [AI SDK Agent Guide](/home/elpresidank/YeeBois/projects/beep-effect3/packages/ai/sdk/AGENTS.md)

When these artifacts disagree with assumptions, this spec must follow the artifacts.

## Scope

### In Scope

- Mandatory pre-phase modularization of `tooling/cli/src/commands/kg.ts`.
- Effect-first conformance for refactored CLI modules.
- Claude execution path integration via `@beep/ai-sdk` for benchmark workflows.
- Defining hard promotion gates for KG usefulness and reliability.
- Building labeled retrieval/evaluation datasets.
- Hardening Graphiti retrieval reliability for agent use.
- Expanding semantic coverage quality in high-value modules.
- Running live ablation benchmarks (`baseline`, `semantic-only`, `ast-only`, `ast+jsdoc`).
- Producing a rollout decision packet with explicit go/no-go outcome.

### Out of Scope

- Re-architecting the entire AST extraction pipeline.
- Replacing Graphiti/Falkor infrastructure.
- Broad product UX changes.
- Shipping speculative model-side prompt optimizations without benchmark evidence.

## Architecture Decision Records

| ADR | Decision | Rationale |
|---|---|---|
| ADR-000 | Add `PRE` phase before P0 for CLI modularization + SDK integration | Later evidence phases should not run on unstable/monolithic tooling surfaces. |
| ADR-001 | Treat AST structure as deterministic baseline signal | Ensures retrieval remains grounded even if semantic tags are missing or stale. |
| ADR-002 | Treat JSDoc semantics as additive signal with explicit confidence weighting | Prevents semantic noise from overpowering deterministic code structure. |
| ADR-003 | Require lint-enforced JSDoc tags on scoped critical modules first | Delivers meaningful quality lift quickly while controlling adoption risk. |
| ADR-004 | Promotion requires live ablation evidence, not simulation-only evidence | Avoids false confidence from non-production proxy metrics. |
| ADR-005 | Retrieval path must degrade gracefully to deterministic local/AST context on timeout | Preserves agent stability under Graphiti query failures. |
| ADR-006 | Claude benchmark backend must go through `@beep/ai-sdk` | Proofs out the internal SDK and reduces direct vendor-SDK coupling in evaluation tooling. |

## Phase Breakdown

| Phase | Focus | Deliverable | Exit Criteria |
|---|---|---|---|
| PRE | KG CLI modularization + AI SDK integration | `outputs/p-pre-kg-cli-refactor-and-ai-sdk.md` | `kg.ts` refactor plan is decision-complete, Effect-first guardrails are explicit, and `@beep/ai-sdk` integration contract is locked. |
| P0 | Baseline and gate freeze | `outputs/p0-baseline-and-gates.md` | All target metrics and thresholds are locked with no ambiguity. |
| P1 | JSDoc governance contract | `outputs/p1-jsdoc-governance.md` | Enforced tag contract and CI gate plan are locked for scoped modules. |
| P2 | Retrieval reliability hardening | `outputs/p2-retrieval-reliability.md` | Timeout/error budget controls and fallback behavior are implemented and verified. |
| P3 | Semantic coverage quality | `outputs/p3-semantic-coverage.md` | Coverage, parse success, and precision/recall evidence are produced for labeled sets. |
| P4 | Live ablation benchmark | `outputs/p4-ablation-benchmark.md` | Comparative benchmark across four modes is complete with reproducible evidence. |
| P5 | Rollout decision | `outputs/p5-rollout-decision.md` | Explicit go/no-go decision with risks, mitigations, and rollback plan is signed off. |

## Success Criteria

- [ ] PRE phase completes with explicit modularization map for `kg.ts` and SDK integration plan for Claude backend.
- [ ] Gate thresholds are frozen before implementation claims in P0+.
- [ ] Labeled task/evaluation dataset is defined and versioned.
- [ ] Retrieval reliability budget is measured and enforced (`facts` timeout budget, fallback behavior).
- [ ] Semantic coverage and quality are measured on scoped modules.
- [ ] Live ablation benchmark includes all four retrieval modes.
- [ ] Promotion decision includes explicit pass/fail against every gate.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Monolithic `kg.ts` introduces hidden regressions | High | PRE modularization contract with file boundaries and test matrix before phase execution. |
| JSDoc tags are stale or low quality | High | CI lint rules + stale-doc detection + scoped rollout. |
| Retrieval instability from Graphiti timeouts | High | Retry policy, timeout budget, circuit breaker, deterministic fallback path. |
| Benchmark contamination or weak tasks | High | Curated labeled dataset with expected evidence targets. |
| No measurable success uplift despite stronger retrieval | Medium | Use result to de-scope feature to advisory context only. |
| Scope creep into broad refactors | Medium | Keep this spec evidence-first and metric-driven. |

## Execution Plan For Another Agent Instance

### PRE KG CLI Refactor + AI SDK Integration

- Define new module boundaries for `tooling/cli/src/commands/kg.ts` (for example: `types`, `constants`, `indexing`, `publish`, `verify`, `parity`, `replay`, `adapters`).
- Lock Effect-first rules for the refactor:
  - `ServiceMap.Service` and typed schema errors for tooling codepaths.
  - no `any`, no type assertions, no untyped throws.
  - canonical aliases (`A/O/P/R/S`) and root Effect imports where required.
- Define Claude execution path migration from direct `@anthropic-ai/claude-agent-sdk` usage in `tooling/agent-eval` to `@beep/ai-sdk` abstractions.
- Produce [outputs/p-pre-kg-cli-refactor-and-ai-sdk.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p-pre-kg-cli-refactor-and-ai-sdk.md).

### P0 Baseline and Gates

- Freeze target metrics and acceptance thresholds from [RUBRICS.md](./RUBRICS.md).
- Define the exact benchmark and retrieval-eval data contracts.
- Produce [outputs/p0-baseline-and-gates.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p0-baseline-and-gates.md).

### P1 JSDoc Governance

- Define required semantic tags and lint policy for critical modules.
- Define stale-doc policy for symbol-signature drift.
- Produce [outputs/p1-jsdoc-governance.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p1-jsdoc-governance.md).

### P2 Retrieval Reliability

- Implement and verify timeout handling, retry strategy, and deterministic fallback policy.
- Measure `search_memory_facts` timeout behavior and recovery paths.
- Produce [outputs/p2-retrieval-reliability.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p2-retrieval-reliability.md).

### P3 Semantic Coverage

- Measure semantic-edge coverage and quality on scoped modules.
- Produce precision/recall and parse-success evidence.
- Produce [outputs/p3-semantic-coverage.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p3-semantic-coverage.md).

### P4 Ablation Benchmark

- Run live benchmark on `baseline`, `semantic-only`, `ast-only`, `ast+jsdoc`.
- Ensure Claude runs use `@beep/ai-sdk` execution path.
- Compare task success, hallucination rate, first-pass check/lint pass, and cost.
- Produce [outputs/p4-ablation-benchmark.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p4-ablation-benchmark.md).

### P5 Rollout Decision

- Determine go/no-go by strict gate comparison.
- Document staged rollout, rollback triggers, and operational guardrails.
- Produce [outputs/p5-rollout-decision.md](/home/elpresidank/YeeBois/projects/beep-effect3/specs/pending/jsdoc-ast-kg-agent-impact-readiness/outputs/p5-rollout-decision.md).

## Important Planned Public API / Interface Additions

No external package API changes are required by default. Planned internal interfaces:

1. KG CLI modular command internals under `tooling/cli/src/commands/kg/*`.
2. Claude benchmark executor path via `@beep/ai-sdk` in `tooling/agent-eval`.
3. Retrieval mode matrix for benchmark harness:
- `baseline`
- `semantic_only`
- `ast_only`
- `ast_jsdoc_hybrid`

## Test Cases and Scenarios

1. Pre-phase modularization scenarios:
- Command behavior parity for `kg index|publish|verify|parity|replay` before vs after modular split.
- Error-channel typing and Effect-first conformance checks for touched files.

2. AI SDK integration scenarios:
- Claude execution backend in benchmark harness runs through `@beep/ai-sdk` and preserves existing result schema.
- Smoke and regression tests for benchmark execution complete with SDK-backed executor.

3. Retrieval quality scenarios:
- For each labeled task, measure whether top-k retrieved context includes expected files/symbols/edges.

4. Reliability scenarios:
- Simulate Graphiti read timeout and verify no-throw fallback behavior.
- Verify fallback emits deterministic context without KG semantic layer.

5. Semantic quality scenarios:
- Measure parse success for required tags.
- Evaluate precision and recall for semantic edges against labeled truth set.

6. Agent outcome scenarios:
- Run full benchmark suite for all four retrieval modes.
- Compare against frozen thresholds in [RUBRICS.md](./RUBRICS.md).

## Verification and Acceptance Gates

Required command families:

1. `bun run --cwd tooling/cli test -- kg.test.ts`
2. `bunx turbo run check --filter=@beep/ai-sdk`
3. `bunx turbo run lint --filter=@beep/ai-sdk`
4. `bunx turbo run test --filter=@beep/ai-sdk`
5. `bun run beep kg verify --target both --group beep-ast-kg`
6. `bun run beep kg parity --profile code-graph-functional --group beep-ast-kg`
7. `bun run agent:bench --live` (with mode variants)
8. `bun run check`
9. `bun run lint`
10. `bun run test`

If unrelated pre-existing failures block full green, capture explicit proof and isolate impact.

## Assumptions and Defaults

1. Primary graph group remains `beep-ast-kg` unless isolation is required for experiment hygiene.
2. Benchmark decisions are based on live runs when feasible.
3. Scoped governance starts with critical modules before repo-wide enforcement.
4. Fallback to deterministic context is mandatory for all KG retrieval failures.
5. Claude execution path uses `@beep/ai-sdk` instead of direct vendor SDK calls.

## Exit Condition

This spec is complete when a downstream agent can execute PRE and P0-P5 without additional architecture decisions and produce a definitive rollout decision supported by reproducible evidence across retrieval quality, semantic quality, reliability, and live task impact.
