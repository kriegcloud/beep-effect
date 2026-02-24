# HANDOFF_P2_6: Enron Knowledge Demo Integration

> Regression recovery handoff for Phase 2.6 (ingest payload parse boundary + browser parity enforcement).

## Working Context (<=2K tokens)

### Phase 2.6 Objective

Fix the current `knowledge-demo` ingest regression where scenario ingest fails with `ParseError` at batch workflow payload construction, then verify in real browser flow that demo behavior fully matches Phase 2 contract requirements.

### Current Blocking Error

Observed runtime failure during scenario ingest (`scenario-1`), after `prepareScenarioIngestPayload` succeeds:

- `ParseError: @beep/knowledge-server/Workflow/BatchOrchestrator/EngineBatchPayload (Constructor)`
- parse path: `["documents"][0]`
- expected: `EngineDocument`
- actual: object containing:
  - `documentId: "workspaces_document__c64da1bb-14d0-58e2-bde6-73a55e9e1eca"`
  - `text: "<email body>"`
  - `ontologyContent: "<ontology ttl>"`

This currently terminates the ingest flow and causes unhandled error output in browser logs.

### Highest-Probability Root Cause (Ranked)

1. **Engine payload document normalization mismatch at orchestrator boundary**
   - `EngineBatchPayload.documents` is typed as `S.Array(EngineDocument)`.
   - `toEnginePayload` passes `params.documents` directly instead of explicitly constructing `EngineDocument` values.
   - File:
     - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:463`
     - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:471`
2. **DocumentId encoding mismatch between generated deterministic IDs and strict schema decode path**
   - deterministic ID generation occurs in `knowledge-demo` action.
   - file:
     - `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/actions.ts:60`
     - `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/actions.ts:75`
3. **Test gap allowed this regression to ship**
   - current workflow parity tests exercise `executeBatchEngineWorkflow` directly, not full `batch_start` -> `BatchOrchestrator.start` encoded payload construction path.
   - file:
     - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`

### Scope Authorized for Fix

Targeted fix in these areas is authorized:

- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/actions.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/test/Workflow/*`

### Required Fix Strategy

1. Reproduce quickly with current scenario ingest path (`scenario-1`) and capture exact parse boundary.
2. Fix payload conversion at orchestrator boundary so `EngineBatchPayload.documents` construction is deterministic and parse-safe.
3. If needed, harden deterministic document ID generation/validation at source action boundary.
4. Add regression test(s) that cover `batch_start` payload path end-to-end enough to catch this exact parse failure in CI.
5. Keep typed errors and Phase 2 behavior contract intact (do not reintroduce optimistic/fallback behavior).

### Mandatory Browser Verification Protocol (Claude in Chrome)

`Claude Code` must use **Claude in Chrome** for verification, not terminal-only checks.

Required browser verification loop:

1. Open `/knowledge-demo` in Chrome with demo gate enabled.
2. Ingest `scenario-1` from UI (`Ingest Scenario` button).
3. Confirm there is **no** unhandled `ParseError` or unhandled rejection in browser console.
4. Confirm ingest lifecycle is visible and contract-compliant:
   - `pending` -> (`extracting` and/or `resolving`) -> terminal (`completed`/`failed`/`cancelled`)
5. Confirm query remains disabled before `completed`.
6. On `completed`, confirm one deterministic post-ingest load/query path occurs and entities/relations render.
7. Repeat with at least one additional scenario (recommended `scenario-2`) to rule out scenario-specific false pass.

### Fix Loop Policy (Non-Negotiable)

Claude must repeat:

`implement fix -> run package checks/tests -> verify in Claude-in-Chrome -> collect evidence`

until behavior is **100% compliant with Phase 2 spec requirements**.  
Do not stop at “compiles” or “tests pass” if browser behavior is still non-compliant.

### Phase 2.6 Success Criteria

- [ ] `scenario-1` ingest no longer throws `EngineBatchPayload` parse error.
- [ ] No unhandled browser errors during ingest path.
- [ ] Lifecycle contract from Phase 2 is preserved (`pending/extracting/resolving/completed/failed/cancelled`).
- [ ] Query remains disabled until `completed`.
- [ ] No fallback/mock data path is introduced.
- [ ] `bun run check --filter @beep/knowledge-server` passes.
- [ ] `bun run test --filter @beep/knowledge-server` passes.
- [ ] `bun run check --filter @beep/todox` passes.
- [ ] `bun run test --filter @beep/todox` passes.
- [ ] Browser verification in Claude-in-Chrome confirms Phase 2 parity.

## Episodic Context (<=1K tokens)

- P2 delivered live RPC migration for `knowledge-demo` and explicit ingest lifecycle contract.
- P2.5 stabilized workflow acceptance/status semantics and eliminated phantom `batchId` path.
- New regression appeared after P2.5 changes: ingest fails at `EngineBatchPayload` document parse boundary before lifecycle can proceed.
- This phase isolates parse-boundary recovery + strict browser parity validation against Phase 2 outputs.

## Semantic Context (<=500 tokens)

Critical references:

- UI ingest trigger path:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx:295`
- Server action payload prep:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/actions.ts:175`
- Engine payload schema and conversion:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:151`
  - `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:463`
- Phase 2 contract source of truth:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-knowledge-demo-integration/outputs/ingest-status-contract.md`
  - `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-knowledge-demo-integration/outputs/rpc-client-migration.md`
- P2.5 architecture/validation:
  - `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-knowledge-demo-integration/outputs/phase-2.5-regression-plan.md`
  - `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-knowledge-demo-integration/outputs/phase-2.5-validation.md`

Key invariant:
- If user clicks `Ingest Scenario`, the start path must complete without parse boundary crashes and transition into observable lifecycle states per Phase 2 contract.

## Procedural Context (links only)

- `../README.md`
- `../MASTER_ORCHESTRATION.md`
- `../RUBRICS.md`
- `../outputs/ingest-status-contract.md`
- `../outputs/rpc-client-migration.md`
- `../outputs/phase-2.5-regression-plan.md`
- `../outputs/phase-2.5-validation.md`
- `/home/elpresidank/YeeBois/projects/beep-effect2/specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2_5.md`

## Context Budget Audit

| Section | Estimated Tokens | Budget | Status |
|---|---:|---:|---|
| Working | 1500 | <=2000 | OK |
| Episodic | 170 | <=1000 | OK |
| Semantic | 230 | <=500 | OK |
| Procedural | links-only | links-only | OK |
| Total | 1900 | <=4000 | OK |

## Verification Snapshot

Commands run in this handoff synthesis session:

- `sed -n '1,260p' specs/pending/enron-knowledge-demo-integration/templates/HANDOFF_TEMPLATE.md`
- `sed -n '1,320p' specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2_5.md`
- read-only inspections:
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
  - `apps/todox/src/app/knowledge-demo/actions.ts`
  - `apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx`
  - `packages/common/schema/src/identity/entity-id/entity-id.ts`
  - `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`

Build/test status in this handoff-only step:
- Not re-run in this step (use latest package gates during fix loop).

## Next Phase Required Outputs

- `outputs/phase-2.6-root-cause.md` (confirmed root cause + rejected hypotheses)
- `outputs/phase-2.6-fix-summary.md` (actual code deltas + rationale)
- `outputs/phase-2.6-validation.md` (package checks/tests + Claude-in-Chrome verification evidence against Phase 2 contract)
