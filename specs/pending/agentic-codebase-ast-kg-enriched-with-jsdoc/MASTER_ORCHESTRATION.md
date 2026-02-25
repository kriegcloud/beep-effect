# Master Orchestration

## Phase State Machine
`P0 -> P1 -> P2 -> P3 -> P4`

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
- Exit gate: required files present + pathless check pass.

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

## Rollout Stages and Controls
- Stages: `R0 Shadow`, `R1 Advisory`, `R2 Limited On`, `R3 Default On`.
- Fallback triggers/actions are defined in README and must be copied unchanged into P2 rollout design contract.

## Required Verification Commands
1. `bun run beep docs laws`
2. `bun run beep docs skills`
3. `bun run beep docs policies`
4. `bun run agents:pathless:check`
