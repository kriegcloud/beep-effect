# P5 Ingestion Engineer Prompt — Graphiti/FalkorDB Publication

## Mission
Execute and document AST KG publication to Graphiti/FalkorDB using the locked `AstKgEpisodeV1` persistence contract.

## Inputs
1. `outputs/p2-design/graphiti-persistence-contract.md`
2. `outputs/p3-execution/implementation-checklist.md`
3. `outputs/p3-execution/integration-log.md`
4. `outputs/p3-execution/changed-files-manifest.md`

## Required Outputs
1. `outputs/p5-falkordb-ingestion/ingestion-execution-log.md`
2. `outputs/p5-falkordb-ingestion/agents/ingestion-engineer.md`

## Required Checks
1. Graphiti target and group are explicit (`beep-ast-kg`).
2. Full publication run result is recorded (attempted, succeeded, failed counts).
3. Delta/replay run result is recorded with idempotency outcomes.
4. Any fallback/spool actions are recorded with replay instructions.
