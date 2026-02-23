# HANDOFF_P2_5: Enron Knowledge Demo Integration

> Regression recovery handoff for Phase 2.5 (knowledge slice workflow lifecycle).

## Working Context (<=2K tokens)

### Phase 2.5 Objective

Stabilize `/knowledge-demo` ingest lifecycle by eliminating phantom batch IDs and aligning the batch workflow start/status contract with reliable `@effect/workflow` usage.

### What This Phase Is Fixing

Current regression: `BatchNotFoundError` occurs during polling after a reported successful `batch_start`.

Primary failing path:
- `batch_start` returns success after daemon fork without confirming accepted execution.
  - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts:18`
- Persistence record creation happens inside the workflow executor and is currently best-effort/swallowed.
  - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:345`
- `getStatus` requires that persistence row and maps lookup failures to `BatchNotFoundError`.
  - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/getStatus.ts:45`
  - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:236`

### Hazel Comparison Synthesis (Explorer-Derived)

Reference repo: `/home/elpresidank/YeeBois/projects/beep-effect2/.repos/hazel`

Observed `hazel` patterns relevant to this regression:
1. deterministic workflow identity and idempotency are first-class in workflow definitions.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/.repos/hazel/packages/domain/src/cluster/workflows/rss-feed-poll-workflow.ts:21`
2. fire-and-forget starts use explicit discard execution semantics.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/.repos/hazel/apps/cluster/src/cron/rss-poll-cron.ts:68`
3. workflow dispatch failures are mapped at boundaries instead of silently swallowed.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/.repos/hazel/apps/backend/src/routes/webhooks.http.ts:383`
4. workflow registration is a required runtime capability in the cluster app wiring.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/.repos/hazel/apps/cluster/src/index.ts:36`

### Severity-Ranked Findings to Carry Forward

1. Start can report success even when workflow execution is not accepted.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts:18`
2. Initial persistence is non-deterministic due to swallowed failures.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:345`
3. Infra errors are flattened into `BatchNotFoundError` on status/read paths.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/getStatus.ts:45`
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/streamProgress.ts:11`
4. `retry-failed` policy likely conflicts with stable idempotency keys and may become a no-op.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:314`
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts:203`
5. Defect-based paths (`die/dieMessage`) exist in demo-critical handler flow.
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:477`
   - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts:44`

### Rewrite Authorization (Explicit)

For Phase 2.5, full redesign/rewrite/delete is authorized for knowledge workflow modules if needed to restore lifecycle correctness and demo reliability.

Modules in scope for replacement, not just patching:
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/getStatus.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/streamProgress.ts`

### Preferred Implementation Strategy

1. Make start acceptance deterministic.
   - `batch_start` must only return success after execution acceptance and discoverable status state are guaranteed.
2. Remove best-effort swallow for initial execution persistence (`createExecution`, first status transition).
3. Treat `WorkflowEngine` as required in batch path wiring, not optional.
4. Preserve typed distinction between `not found` and infrastructure failures.
5. Rework retry semantics so policy and idempotency are coherent.
6. Keep PII/secret-safe logging only (`hasX/len/count/id/hash` fields).

### Phase 2.5 Success Criteria

- [ ] No phantom `batchId` can be returned from `batch_start`.
- [ ] Polling a returned `batchId` never immediately yields false `BatchNotFoundError`.
- [ ] Infra/database failures are surfaced as non-notfound failures.
- [ ] Batch lifecycle remains observable (`pending/extracting/resolving/completed/failed/cancelled`).
- [ ] `bun run check --filter @beep/knowledge-server` passes.
- [ ] `bun run test --filter @beep/knowledge-server` passes.
- [ ] `bun run check --filter @beep/todox` passes.
- [ ] `bun run test --filter @beep/todox` passes.

## Episodic Context (<=1K tokens)

- P2 moved knowledge-demo to live RPC ingest path and resolved parse/auth blockers.
- Regression appeared after those fixes: status polling fails with `BatchNotFoundError` despite successful start response.
- Explorer review against `hazel` confirmed lifecycle mismatch: our start path is optimistic while persistence/status lookup is strict.
- This handoff creates a dedicated P2.5 stabilization phase before continuing with additional demo scope.

## Semantic Context (<=500 tokens)

Fixed anchors:
- Feature path: `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo`
- Batch RPC contracts: `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/domain/src/entities/Batch/contracts`
- Runtime workflow internals: `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow`
- Comparison baseline repo: `/home/elpresidank/YeeBois/projects/beep-effect2/.repos/hazel`

Key contract invariant for this phase:
- If `batch_start` returns `{ batchId }`, then `batch_getStatus({ batchId })` must be deterministically resolvable without false not-found.

## Procedural Context (links only)

- `../README.md`
- `../MASTER_ORCHESTRATION.md`
- `../RUBRICS.md`
- `../outputs/ingest-status-contract.md`
- `../outputs/rpc-client-migration.md`
- `/home/elpresidank/YeeBois/projects/beep-effect2/.claude/handoffs/2026-02-16-024746-enron-knowledge-demo-batchnotfound-handoff.md`

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 1450 | <=2000 | OK |
| Episodic | 210 | <=1000 | OK |
| Semantic | 180 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1840 | <=4000 | OK |

## Verification Snapshot

Commands run in this synthesis/handoff session:
- `find specs -maxdepth 3 -type d -name '*enron*'`
- `sed -n '1,260p' specs/pending/enron-knowledge-demo-integration/templates/HANDOFF_TEMPLATE.md`
- multiple read-only inspections of workflow and rpc files in knowledge slice
- explorer-agent comparison against `hazel`

Build/test status:
- Not run in this handoff-only step.

## Next Phase Required Outputs

- `outputs/phase-2.5-regression-plan.md` (chosen redesign architecture + migration sequence)
- `outputs/phase-2.5-validation.md` (proof of deterministic start/status behavior + command results)
