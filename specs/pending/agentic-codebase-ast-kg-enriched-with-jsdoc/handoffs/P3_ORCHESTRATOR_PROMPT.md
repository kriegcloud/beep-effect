# P3 Orchestrator Prompt — Core Implementation and Integration

You are executing P3 for:
`specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc`

## Mission
Implement and integrate the AST KG system exactly as frozen in P2 contracts, with no architecture reopen.

## Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P0.md`
4. `handoffs/HANDOFF_P2.md`
5. `outputs/p2-design/kg-schema-v1.md`
6. `outputs/p2-design/extraction-contract.md`
7. `outputs/p2-design/graphiti-persistence-contract.md`
8. `outputs/p2-design/incremental-update-design.md`
9. `outputs/p2-design/query-and-hook-contract.md`
10. `outputs/p2-design/evaluation-design.md`
11. `outputs/p2-design/rollout-and-fallback-design.md`

## Non-Negotiable Locks
Use P0/P2 locked defaults and locked interface defaults as immutable unless ADR + proof is added.

## Required Outputs
1. `outputs/p3-execution/implementation-checklist.md`
2. `outputs/p3-execution/integration-log.md`
3. `outputs/p3-execution/changed-files-manifest.md`
4. `outputs/p3-execution/agents/ast-engineer.md`
5. `outputs/p3-execution/agents/semantic-engineer.md`
6. `outputs/p3-execution/agents/graphiti-engineer.md`
7. `outputs/p3-execution/agents/hook-engineer.md`
8. `outputs/p3-execution/agents/eval-engineer.md`

## Required Checks
1. Full + delta indexing smoke checks pass.
2. Graphiti write path is idempotent on replay.
3. Hook fallback no-throw behavior passes integration checks.
4. Interface lock surfaces remain unchanged (CLI/ID/provenance/tag-edge/envelope/hook-failure).
5. P4 handoff prompt set is authored before declaring P3 complete.

## Exit Gate
1. No contradictions to locked defaults/interfaces.
2. All P3 outputs exist and pass integration checks.
3. P4 validation and rollout handoff prompt set exists.
