# Master Orchestration

## Phase State Machine
`P0 -> P1 -> P2 -> P3 -> P4 -> P5 -> P6 -> P7`

No phase is complete until:
1. Declared outputs exist.
2. Exit gates are met.
3. Next-phase handoff prompt set exists.

## Locked Defaults and Interface Contracts
Use README lock tables as normative defaults. P1 cannot reopen these decisions without ADR + source proof.

## P0: Launch Packet (Complete)
- Objective: canonical scaffolding, defaults lock, research inventory, reuse/build matrix.
- Exit artifacts:
  1. canonical files (`README`, `QUICK_START`, `MASTER_ORCHESTRATION`, `AGENT_PROMPTS`, `RUBRICS`, `REFLECTION_LOG`)
  2. P0 handoffs (`HANDOFF_P0`, P0 orchestrator/research/reuse prompts)
  3. P0 outputs (`landscape-comparison`, `reuse-vs-build-matrix`, `constraints-and-gaps`, agent summaries)
- Exit gate:
  1. Required files present + pathless check pass.
  2. P1 handoff prompt set exists.

## P1: Research and Decision Log Freeze
- Objective: refresh evidence, confirm reuse/build boundaries, and freeze research-grade decision logs.
- Owners: Orchestrator, Research Agent, Reuse Audit Agent.
- Required outputs:
  1. `outputs/p1-research/landscape-comparison.md`
  2. `outputs/p1-research/reuse-vs-build-matrix.md`
  3. `outputs/p1-research/constraints-and-gaps.md`
  4. `outputs/p1-research/agents/research-agent.md`
  5. `outputs/p1-research/agents/reuse-audit-agent.md`
- Entry gate: P0 complete.
- Exit gate:
  1. Source coverage remains 16/16.
  2. No research contradictions against P0 locks.
  3. P2 design prompts authored.

## P2: Contract and Design Freeze
- Objective: freeze schema, extraction contract, persistence contract, incremental update model, hook/query contract, evaluation design, rollout/fallback design.
- Owners: Orchestrator, Schema Agent, Graphiti Contract Agent, Hook Contract Agent.
- Required outputs:
  1. `outputs/p2-design/kg-schema-v1.md`
  2. `outputs/p2-design/extraction-contract.md`
  3. `outputs/p2-design/graphiti-persistence-contract.md`
  4. `outputs/p2-design/incremental-update-design.md`
  5. `outputs/p2-design/query-and-hook-contract.md`
  6. `outputs/p2-design/evaluation-design.md`
  7. `outputs/p2-design/rollout-and-fallback-design.md`
- Entry gate: P1 complete.
- Exit gate:
  1. `TBD=0` across all design outputs.
  2. CLI/ID/envelope/hook contracts frozen.
  3. P3 task graph and ownership frozen.
  4. P3 handoff prompt set exists (`HANDOFF_P2` + P3 prompts).

## P3: Core Implementation and Integration
- Objective: implement AST/type/JSDoc extraction core, deterministic local cache, delta planner, Graphiti persistence, hook integration, and benchmark profile wiring.
- Owners: AST Engineer, Semantic Engineer, Graphiti Engineer, Hook Engineer, Eval Engineer.
- Required outputs:
  1. `outputs/p3-execution/implementation-checklist.md`
  2. `outputs/p3-execution/integration-log.md`
  3. `outputs/p3-execution/changed-files-manifest.md`
  4. `outputs/p3-execution/agents/ast-engineer.md`
  5. `outputs/p3-execution/agents/semantic-engineer.md`
  6. `outputs/p3-execution/agents/graphiti-engineer.md`
  7. `outputs/p3-execution/agents/hook-engineer.md`
  8. `outputs/p3-execution/agents/eval-engineer.md`
- Entry gate: P2 complete.
- Exit gate:
  1. Full + delta indexing smoke checks pass.
  2. Graphiti write path proven idempotent on replay.
  3. Hook fallback no-throw behavior passes integration checks.
  4. P4 handoff prompt set exists.

## P4: Validation + Rollout
- Objective: prove correctness/usefulness/impact and validate fallback.
- Owners: Validation Engineer, Rollout Engineer.
- Required outputs:
  1. `outputs/p4-validation/coverage-correctness-report.md`
  2. `outputs/p4-validation/semantic-enrichment-quality-report.md`
  3. `outputs/p4-validation/query-usefulness-report.md`
  4. `outputs/p4-validation/agent-performance-impact-report.md`
  5. `outputs/p4-validation/rollout-readiness.md`
  6. `outputs/p4-validation/fallback-drill-report.md`
  7. `outputs/p4-validation/agents/validation-engineer.md`
  8. `outputs/p4-validation/agents/rollout-engineer.md`
- Entry gate: P3 complete.
- Exit gate:
  1. All quantitative thresholds from README met.
  2. Rollback controls tested and documented.

## P5: FalkorDB Ingestion Completion (Gap Closure)
- Objective: close the spec gap by executing real Graphiti/FalkorDB publication for AST KG artifacts and proving queryable ingestion.
- Owners: Orchestrator, Ingestion Engineer, Verification Engineer.
- Required outputs:
  1. `outputs/p5-falkordb-ingestion/ingestion-execution-log.md`
  2. `outputs/p5-falkordb-ingestion/graphiti-publication-verification.md`
  3. `outputs/p5-falkordb-ingestion/backfill-and-replay-runbook.md`
  4. `outputs/p5-falkordb-ingestion/agents/ingestion-engineer.md`
  5. `outputs/p5-falkordb-ingestion/agents/verification-engineer.md`
- Entry gate: P4 complete.
- Exit gate:
  1. AST KG episodes published to Graphiti/FalkorDB group `beep-ast-kg` for configured index scope.
  2. Verification queries demonstrate expected node/edge presence with provenance and commit metadata.
  3. Replay/idempotency behavior verified against the target Graphiti service.
  4. P5 handoff prompt set exists.

## P6: Dual-Write + Falkor Parity Hardening
- Objective: harden AST KG into production-grade dual-write flow (direct Falkor structured graph + Graphiti episodic envelopes) with TypeScript-first functional parity against Falkor code-graph behavior.
- Owners: Orchestrator, Schema/Parity Engineer, Dual-Write Engineer, Query API Engineer, Validation Engineer, Rollout Engineer.
- Required outputs:
  1. `outputs/p6-dual-write-parity/schema-parity-contract.md`
  2. `outputs/p6-dual-write-parity/dual-write-execution-log.md`
  3. `outputs/p6-dual-write-parity/query-parity-report.md`
  4. `outputs/p6-dual-write-parity/quality-scorecard.md`
  5. `outputs/p6-dual-write-parity/rollout-and-operations-runbook.md`
  6. `outputs/p6-dual-write-parity/agents/schema-parity-engineer.md`
  7. `outputs/p6-dual-write-parity/agents/dual-write-engineer.md`
  8. `outputs/p6-dual-write-parity/agents/query-api-engineer.md`
  9. `outputs/p6-dual-write-parity/agents/validation-engineer.md`
  10. `outputs/p6-dual-write-parity/agents/rollout-engineer.md`
- Entry gate: P5 complete with evidenced publication to `beep-ast-kg`.
- Exit gate:
  1. `beep kg publish|verify|parity|replay` command surface is implemented and documented.
  2. Dual-write full+delta+replay evidence exists for `target=both` with deterministic replay semantics.
  3. Falkor functional parity checks (entity listing, neighbor expansion, commit context, path query execution) are evidenced.
  4. Manual signoff packet includes known gaps, owners, and mitigations.

## P7: KG Excellence Gap Closure
- Objective: resolve all P6 known gaps with measurable performance and reliability improvements for world-class AST KG operations.
- Owners: Orchestrator, Performance Engineer, Query Engineer, Reliability Engineer, Operations Engineer.
- Required outputs:
  1. `outputs/p7-kg-excellence/tickets.md`
  2. `outputs/p7-kg-excellence/falkor-batching-report.md`
  3. `outputs/p7-kg-excellence/replay-receipt-contract.md`
  4. `outputs/p7-kg-excellence/group-isolation-runbook.md`
  5. `outputs/p7-kg-excellence/strict-parity-profile.md`
  6. `outputs/p7-kg-excellence/recovery-automation-report.md`
  7. `outputs/p7-kg-excellence/resilience-drill-report.md`
  8. `outputs/p7-kg-excellence/final-excellence-scorecard.md`
- Entry gate: P6 packet complete with full-repo dual-write evidence.
- Exit gate:
  1. No open P0/P1 tickets from P7 backlog.
  2. Full-repo dual-write runtime reduced by >=70% from P6 baseline.
  3. Strict parity profile is implemented and evidenced.
  4. Recovery automation and outage drills are documented and repeatable.

## Rollout Stages and Controls
- Stages: `R0 Shadow`, `R1 Advisory`, `R2 Limited On`, `R3 Default On`.
- Fallback triggers/actions are defined in README and must be copied unchanged into P2 rollout design contract.

## Required Verification Commands
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`
4. `bun run agents:pathless:check`
