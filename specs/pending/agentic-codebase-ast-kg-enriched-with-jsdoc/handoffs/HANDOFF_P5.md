# HANDOFF P5 -> P6 — Dual-Write + Falkor Parity Hardening

## Objective
Transition from P5 ingestion completion to production-grade dual-write quality hardening without reopening locked P0-P5 contracts.

## P5 Completion Evidence
1. AST KG publication to `beep-ast-kg` executed and logged.
2. Deterministic replay/idempotency behavior evidenced in execution logs.
3. FalkorDB persistence confirmed via direct graph queries.

## P6 Mission
1. Add structured Falkor write sink in parallel with Graphiti episodic sink.
2. Add command surface for publish/verify/parity/replay.
3. Produce manual-signoff quality packet with explicit known-gaps and mitigation owners.

## P6 Required Inputs
1. `README.md`
2. `MASTER_ORCHESTRATION.md`
3. `handoffs/HANDOFF_P4.md`
4. `outputs/p2-design/graphiti-persistence-contract.md`
5. `outputs/p5-falkordb-ingestion/*`
6. `tooling/cli/src/commands/kg.ts`

## P6 Required Outputs
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
