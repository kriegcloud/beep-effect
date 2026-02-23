# knowledge-effect-workflow-migration Quick Start

## Objective

Port knowledge workflow runtime to `@effect/workflow`, then delete superseded workflow code.

## Start Here

1. Read `handoffs/HANDOFF_P1.md`.
2. Copy/paste `handoffs/P1_ORCHESTRATOR_PROMPT.md` into a fresh agent session.
3. Execute P1 discovery outputs before writing migration code.

## Required P1 Outputs

- `outputs/P1_COMPATIBILITY_REPORT.md`
- `outputs/P1_FILE_INVENTORY.md`
- `outputs/P1_RISK_REGISTER.md`
- `outputs/P2_MIGRATION_BLUEPRINT.md` (draft skeleton)

## Definition of Done Snapshot

- `@effect/workflow` path is default
- persistence parity is validated
- old custom workflow code deleted
- all verification commands pass
- parity docs updated with evidence paths
- completed phase has generated next-phase handoff docs:
  `handoffs/HANDOFF_P{N+1}.md` and `handoffs/P{N+1}_ORCHESTRATOR_PROMPT.md`

## Fast Verification Commands

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```
