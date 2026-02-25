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
