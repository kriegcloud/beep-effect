# P5 Verification Engineer Prompt — Ingestion Verification and Replay Safety

## Mission
Verify that published AST KG data is queryable from Graphiti/FalkorDB and that replay/idempotency behavior matches contract.

## Inputs
1. `outputs/p5-falkordb-ingestion/ingestion-execution-log.md`
2. `outputs/p2-design/graphiti-persistence-contract.md`
3. `outputs/p2-design/query-and-hook-contract.md`
4. `outputs/p3-execution/integration-log.md`

## Required Outputs
1. `outputs/p5-falkordb-ingestion/graphiti-publication-verification.md`
2. `outputs/p5-falkordb-ingestion/backfill-and-replay-runbook.md`
3. `outputs/p5-falkordb-ingestion/agents/verification-engineer.md`

## Required Checks
1. Query samples return expected entities/relationships with `ast|type|jsdoc` provenance.
2. Group isolation (`beep-ast-kg`) is confirmed.
3. Replay behavior is no-dup/idempotent and conflict policy is documented.
4. Operational backfill and recovery steps are explicit.
