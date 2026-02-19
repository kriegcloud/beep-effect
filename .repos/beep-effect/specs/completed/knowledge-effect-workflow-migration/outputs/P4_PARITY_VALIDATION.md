# P4 Parity Validation: knowledge-effect-workflow-migration

Date: 2026-02-07
Phase: P4 (Cutover + Parity Validation)
Status: Complete
Decision: Promote runtime default to `engine` with tested rollback path to `legacy`

## Scope Executed

Code:
- `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`

Tests:
- `packages/knowledge/server/test/Resilience/WorkflowRuntime.test.ts`
- `packages/knowledge/server/test/Workflow/BatchOrchestratorModeGate.test.ts`
- `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`
- `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`

## Cutover Changes

1. Runtime default mode flipped to `engine`:
- `DEFAULT_WORKFLOW_RUNTIME_MODE` introduced as `"engine"` in `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`.
- `KNOWLEDGE_WORKFLOW_MODE` now defaults to `engine`.

2. Rollback safety preserved:
- `DEFAULT_WORKFLOW_ENABLE_LEGACY_ROLLBACK` remains `true`.
- `runModeGatedBatch` engine failure path still falls back to legacy when rollback is enabled.
- `ExtractionWorkflow.runEngine` still falls back to legacy when rollback is enabled.

3. No legacy deletions performed in P4.

## R1-R4 Risk Validation Evidence

| Risk | Validation evidence | Outcome |
|---|---|---|
| R1: failure-policy drift | `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts` (`continue-on-failure`, `abort-all`, `retry-failed`) | Passed |
| R2: duplicate retry ownership | `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts` (`retry-failed` asserts orchestrator-owned retries), `packages/knowledge/server/test/Workflow/DurableActivities.test.ts` | Passed |
| R3: persistence/status mismatch | `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts` validates running/completed/failed status updates and terminal contract | Passed |
| R4: rollback/cutover safety | `packages/knowledge/server/test/Resilience/WorkflowRuntime.test.ts` (engine default + explicit legacy override), `packages/knowledge/server/test/Workflow/BatchOrchestratorModeGate.test.ts` (engine failure -> legacy fallback) | Passed |

## Mandatory Target Parity Matrix

| Target | Evidence | Result |
|---|---|---|
| runtime default switched to `engine` | `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`; `packages/knowledge/server/test/Resilience/WorkflowRuntime.test.ts` | Met |
| rollback toggle to `legacy` remains operational and tested | `packages/knowledge/server/test/Resilience/WorkflowRuntime.test.ts`; `packages/knowledge/server/test/Workflow/BatchOrchestratorModeGate.test.ts` | Met |
| policy parity across supported failure policies | `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts` | Met |
| retry ownership parity (single retry owner) | `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`; `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts` | Met |
| persistence/status response contract parity | `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts` | Met |
| batch/progress event ordering parity | `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts` (BatchCreated first, BatchCompleted/BatchFailed terminal, document ordering constraints) | Met |
| suspend/resume behavior parity for forced failure cases | `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts` (forced failure remains non-success terminal with parity-safe status updates) | Met (current surface) |

## Verification Commands

Executed and passing:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

## Divergences

- No unapproved contract divergence introduced in P4.
- Legacy runtime files retained intentionally for P5 removal.

## Exit Criteria Status

- [x] `engine` path is default and runnable
- [x] rollback path (`engine -> legacy`) is operational and test-covered
- [x] R1-R4 mitigations are validated with test evidence
- [x] parity evidence is written to `P4_PARITY_VALIDATION.md`
- [x] `HANDOFF_P5.md` and `P5_ORCHESTRATOR_PROMPT.md` are created
