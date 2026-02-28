# P5 Orchestrator Prompt — FalkorDB Ingestion Completion

You are executing P5 for:
`specs/pending/agentic-codebase-ast-kg-enriched-with-jsdoc`

## Mission
Close the delivery gap by publishing AST KG + JSDoc semantic data into Graphiti/FalkorDB and documenting verifiable ingestion evidence.

## Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P4.md`
4. `outputs/p2-design/graphiti-persistence-contract.md`
5. `outputs/p3-execution/*`
6. `outputs/p4-validation/*`

## Required Outputs
1. `outputs/p5-falkordb-ingestion/ingestion-execution-log.md`
2. `outputs/p5-falkordb-ingestion/graphiti-publication-verification.md`
3. `outputs/p5-falkordb-ingestion/backfill-and-replay-runbook.md`
4. `outputs/p5-falkordb-ingestion/agents/ingestion-engineer.md`
5. `outputs/p5-falkordb-ingestion/agents/verification-engineer.md`

## Exit Gate
1. Publication to Graphiti/FalkorDB group `beep-ast-kg` is executed and evidenced.
2. Verification queries confirm node/edge presence with locked provenance + commit metadata.
3. Replay/idempotency behavior is documented against Graphiti target.
4. No contradictions to locked defaults/interfaces.
