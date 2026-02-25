# P2 Orchestrator Prompt — Contract and Design Freeze

You are executing P2 for:
`specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc`

## Mission
Freeze architecture contracts so P3 implementation can execute with `TBD=0` and without reopening locked defaults.

## Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P0.md`
4. `outputs/p1-research/landscape-comparison.md`
5. `outputs/p1-research/reuse-vs-build-matrix.md`
6. `outputs/p1-research/constraints-and-gaps.md`
7. `outputs/p1-research/agents/research-agent.md`
8. `outputs/p1-research/agents/reuse-audit-agent.md`

## Non-Negotiable Locks
Use P0 locked defaults and locked interface defaults as immutable unless ADR + proof is added.

## Required Outputs
1. `outputs/p2-design/kg-schema-v1.md`
2. `outputs/p2-design/extraction-contract.md`
3. `outputs/p2-design/graphiti-persistence-contract.md`
4. `outputs/p2-design/incremental-update-design.md`
5. `outputs/p2-design/query-and-hook-contract.md`
6. `outputs/p2-design/evaluation-design.md`
7. `outputs/p2-design/rollout-and-fallback-design.md`

## Required Checks
1. `TBD=0` across all P2 output files.
2. CLI/ID/provenance/tag-edge/envelope/hook-failure contracts match P0 locks.
3. Open items from P1 are resolved using their carried defaults unless ADR is accepted.
4. P3 task graph ownership assumptions are explicitly documented in P2 outputs.

## Exit Gate
1. No contradictions to locked defaults/interfaces.
2. All P2 outputs exist and pass internal consistency check.
3. P3 execution can start without architecture choices.
