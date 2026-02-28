# P1 Orchestrator Prompt — Research and Decision-Log Freeze

You are executing P1 for:
`specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc`

## Mission
Refresh research and freeze decision logs so P2 can freeze architecture without ambiguity.

## Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `outputs/initial_plan.md`
4. `outputs/p0-research/*`
5. `handoffs/HANDOFF_P0.md`

## Non-Negotiable Locks
Use P0 locked defaults and locked interface defaults as immutable unless ADR + proof is added.

## Required Outputs
1. `outputs/p1-research/landscape-comparison.md`
2. `outputs/p1-research/reuse-vs-build-matrix.md`
3. `outputs/p1-research/constraints-and-gaps.md`
4. `outputs/p1-research/agents/research-agent.md`
5. `outputs/p1-research/agents/reuse-audit-agent.md`

## Exit Gate
1. Source coverage remains 16/16.
2. No contradictions to locked defaults/interfaces.
3. Open items are explicitly moved to P2 with defaults.
4. P2 design prompts are authored from P1 outputs.
