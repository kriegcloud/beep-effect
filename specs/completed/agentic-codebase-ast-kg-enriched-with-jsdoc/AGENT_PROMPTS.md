# Agent Prompts

## P1 Orchestrator
Mission: coordinate research refresh and decision-log freeze using P0 locks and initial plan alignment.

Required outputs:
1. `outputs/p1-research/landscape-comparison.md`
2. `outputs/p1-research/reuse-vs-build-matrix.md`
3. `outputs/p1-research/constraints-and-gaps.md`
4. `outputs/p1-research/agents/research-agent.md`
5. `outputs/p1-research/agents/reuse-audit-agent.md`

## P1 Research Agent
Mission: validate external source signals and confirm no conflicts with locked defaults.

Required output:
1. `outputs/p1-research/agents/research-agent.md`

## P1 Reuse Audit Agent
Mission: verify each reuse/build boundary against current repo files.

Required output:
1. `outputs/p1-research/agents/reuse-audit-agent.md`

## P2 Orchestrator
Mission: freeze architecture and interfaces for implementation.

Required outputs:
1. `outputs/p2-design/kg-schema-v1.md`
2. `outputs/p2-design/extraction-contract.md`
3. `outputs/p2-design/graphiti-persistence-contract.md`
4. `outputs/p2-design/incremental-update-design.md`
5. `outputs/p2-design/query-and-hook-contract.md`
6. `outputs/p2-design/evaluation-design.md`
7. `outputs/p2-design/rollout-and-fallback-design.md`

Hard rule: no unresolved architectural `TBD` by P2 exit.

Phase completion invariant:
A phase is complete only when outputs are present, exit gates pass, and next-phase handoff prompt documents are authored.

## P3 Core Engineers
- AST Engineer: extraction + delta planner + deterministic cache.
- Semantic Engineer: JSDoc tag mapper to graph edges.
- Graphiti Engineer: persistence/upsert/write verify path.
- Hook Engineer: hook integration + fallback guardrails.
- Eval Engineer: benchmark condition/profile + metrics reporting.

Required output root: `outputs/p3-execution/*`

## P4 Validation/Rollout Engineers
- Validation Engineer: execute threshold matrix and produce scorecards.
- Rollout Engineer: execute staged rollout and fallback drills.

Required output root: `outputs/p4-validation/*`

## P5 FalkorDB Ingestion Engineers
- Ingestion Engineer: publish AST KG envelopes to Graphiti/FalkorDB (`beep-ast-kg`) and record execution evidence.
- Verification Engineer: validate read/query surfaces and replay/idempotency on published data.

Required output root: `outputs/p5-falkordb-ingestion/*`

## P6 Dual-Write + Parity Engineers
- Schema/Parity Engineer: freeze dual-write schema mappings and parity contract against Falkor code-graph behavior.
- Dual-Write Engineer: implement and verify direct Falkor structured sink + Graphiti episodic sink orchestration.
- Query API Engineer: implement `kg verify` and `kg parity` checks for functional parity.
- Validation Engineer: execute quality scorecard and produce signoff evidence.
- Rollout Engineer: produce shadow->controlled rollout + operations/failure runbook.

Required output root: `outputs/p6-dual-write-parity/*`

## P7 KG Excellence Engineers
- Performance Engineer: implement Falkor batching and measure runtime improvements.
- Query Engineer: implement strict parity profile + group-isolated validation semantics.
- Reliability Engineer: automate Graphiti recovery and execute outage drills.
- Orchestrator: maintain ticket backlog status and final excellence scorecard.

Required output root: `outputs/p7-kg-excellence/*`

## Prompt Files
- [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [handoffs/P0_RESEARCH_AGENT_PROMPT.md](./handoffs/P0_RESEARCH_AGENT_PROMPT.md)
- [handoffs/P0_REUSE_AUDIT_AGENT_PROMPT.md](./handoffs/P0_REUSE_AUDIT_AGENT_PROMPT.md)
- [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [handoffs/P1_RESEARCH_AGENT_PROMPT.md](./handoffs/P1_RESEARCH_AGENT_PROMPT.md)
- [handoffs/P1_REUSE_AUDIT_AGENT_PROMPT.md](./handoffs/P1_REUSE_AUDIT_AGENT_PROMPT.md)
- [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md)
- [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [handoffs/P2_SCHEMA_AGENT_PROMPT.md](./handoffs/P2_SCHEMA_AGENT_PROMPT.md)
- [handoffs/P2_GRAPHITI_CONTRACT_AGENT_PROMPT.md](./handoffs/P2_GRAPHITI_CONTRACT_AGENT_PROMPT.md)
- [handoffs/P2_HOOK_CONTRACT_AGENT_PROMPT.md](./handoffs/P2_HOOK_CONTRACT_AGENT_PROMPT.md)
- [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [handoffs/P3_AST_ENGINEER_PROMPT.md](./handoffs/P3_AST_ENGINEER_PROMPT.md)
- [handoffs/P3_SEMANTIC_ENGINEER_PROMPT.md](./handoffs/P3_SEMANTIC_ENGINEER_PROMPT.md)
- [handoffs/P3_GRAPHITI_ENGINEER_PROMPT.md](./handoffs/P3_GRAPHITI_ENGINEER_PROMPT.md)
- [handoffs/P3_HOOK_ENGINEER_PROMPT.md](./handoffs/P3_HOOK_ENGINEER_PROMPT.md)
- [handoffs/P3_EVAL_ENGINEER_PROMPT.md](./handoffs/P3_EVAL_ENGINEER_PROMPT.md)
- [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md)
- [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)
- [handoffs/P4_VALIDATION_ENGINEER_PROMPT.md](./handoffs/P4_VALIDATION_ENGINEER_PROMPT.md)
- [handoffs/P4_ROLLOUT_ENGINEER_PROMPT.md](./handoffs/P4_ROLLOUT_ENGINEER_PROMPT.md)
- [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md)
- [handoffs/P5_ORCHESTRATOR_PROMPT.md](./handoffs/P5_ORCHESTRATOR_PROMPT.md)
- [handoffs/P5_INGESTION_ENGINEER_PROMPT.md](./handoffs/P5_INGESTION_ENGINEER_PROMPT.md)
- [handoffs/P5_VERIFICATION_ENGINEER_PROMPT.md](./handoffs/P5_VERIFICATION_ENGINEER_PROMPT.md)
- [handoffs/HANDOFF_P5.md](./handoffs/HANDOFF_P5.md)
- [handoffs/P6_ORCHESTRATOR_PROMPT.md](./handoffs/P6_ORCHESTRATOR_PROMPT.md)
- [handoffs/P6_SCHEMA_PARITY_ENGINEER_PROMPT.md](./handoffs/P6_SCHEMA_PARITY_ENGINEER_PROMPT.md)
- [handoffs/P6_DUAL_WRITE_ENGINEER_PROMPT.md](./handoffs/P6_DUAL_WRITE_ENGINEER_PROMPT.md)
- [handoffs/P6_QUERY_API_ENGINEER_PROMPT.md](./handoffs/P6_QUERY_API_ENGINEER_PROMPT.md)
- [handoffs/P6_VALIDATION_ENGINEER_PROMPT.md](./handoffs/P6_VALIDATION_ENGINEER_PROMPT.md)
- [handoffs/P6_ROLLOUT_ENGINEER_PROMPT.md](./handoffs/P6_ROLLOUT_ENGINEER_PROMPT.md)
- [handoffs/HANDOFF_P6.md](./handoffs/HANDOFF_P6.md)
- [handoffs/P7_ORCHESTRATOR_PROMPT.md](./handoffs/P7_ORCHESTRATOR_PROMPT.md)
- [handoffs/P7_PERFORMANCE_ENGINEER_PROMPT.md](./handoffs/P7_PERFORMANCE_ENGINEER_PROMPT.md)
- [handoffs/P7_RELIABILITY_ENGINEER_PROMPT.md](./handoffs/P7_RELIABILITY_ENGINEER_PROMPT.md)
- [handoffs/P7_QUERY_ENGINEER_PROMPT.md](./handoffs/P7_QUERY_ENGINEER_PROMPT.md)
