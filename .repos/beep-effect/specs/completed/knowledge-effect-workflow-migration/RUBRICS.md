# Evaluation Rubrics

## Weighted Score

| Criterion | Weight | Pass Condition |
|-----------|--------|----------------|
| Functional parity | 35% | Workflow behavior matches expected baseline or documented divergence |
| Reliability | 25% | Persistence/retry/idempotency semantics covered by tests |
| Legacy removal | 25% | Old workflow engine code removed and no default wiring remains |
| Documentation | 15% | Matrix + reflection + handoffs updated with evidence paths |

## Hard Gates (Must Pass)

- [ ] `@effect/workflow` is default workflow runtime
- [ ] No unresolved P0 migration blockers
- [ ] All required check/lint/tests pass
- [ ] Legacy workflow path deleted and verified

## Legacy Deletion Evidence

Include command output snippets in `outputs/P5_LEGACY_REMOVAL_REPORT.md`:

```bash
rg -n "DurableActivities|ExtractionWorkflow|WorkflowPersistence" packages/knowledge/server/src/Workflow
rg -n "WorkflowRuntime|legacy|Durable" packages/knowledge/server/src/Runtime packages/knowledge/server/src/index.ts
```
