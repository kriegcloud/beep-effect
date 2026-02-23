# P2 Migration Blueprint: knowledge-effect-workflow-migration

Date: 2026-02-07
Phase: P2 (Target Architecture + Migration Design)
Status: Complete
Decision: Proceed to P3 implementation with feature-flagged cutover and dual-path safety

## 1) Target Architecture

### 1.1 Runtime architecture

Target runtime introduces `@effect/workflow` as execution authority while preserving current service entrypoints.

- Keep `BatchOrchestrator.run` as the externally consumed API in `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`.
- Split orchestrator internals into two implementations selected by runtime config:
  - `legacy` path: current actor + `WorkflowPersistence` + `DurableActivities` behavior.
  - `engine` path: `WorkflowEngine.execute/poll/interrupt/resume` + `Workflow.make` + `Activity.make`.
- Add explicit runtime mode switch in `packages/knowledge/server/src/Runtime/*`:
  - `legacy` (default in P3)
  - `shadow` (run engine path for parity telemetry, legacy remains source of truth)
  - `engine` (default target in P4 cutover)

### 1.2 Orchestration architecture

- Preserve failure-policy semantics from `BatchOrchestrator.ts:427-431` as a first-class policy adapter in engine path:
  - `continue-on-failure`
  - `abort-all`
  - `retry-failed`
- Preserve parity-critical terminal behavior from `BatchOrchestrator.ts:494-516`:
  - all failed => `BatchFailed`
  - mixed/any success => `BatchCompleted`
- Preserve entity-resolution stage boundary and emissions from `BatchOrchestrator.ts:446-492`.

### 1.3 Persistence architecture

- Introduce engine durability storage in parallel (SQL in non-local envs, memory fallback in local/dev).
- Keep `WorkflowPersistence` tables during P3/P4 as compatibility read model and rollback anchor.
- During `shadow` mode:
  - legacy rows remain canonical for API reads.
  - engine result/state is recorded and compared for parity.
- During `engine` mode:
  - engine result/state is canonical.
  - compatibility adapter still writes minimum fields needed by existing readers until those readers migrate.

### 1.4 Event/progress compatibility

- Keep `BatchEventEmitter` and `ProgressStream` contracts unchanged.
- In engine mode, change producer source from actor transitions to workflow stage transitions.
- Preserve ordering constraints:
  - `BatchCreated` before first document event.
  - `ResolutionStarted` before clustering.
  - `BatchFailed`/`BatchCompleted` as final batch event.

## 2) Phased File-by-File Implementation Plan

## P3: Runtime + Persistence Introduction (Additive, no default cutover)

| File | P3 change | Why / risk addressed |
|---|---|---|
| `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts` | Add mode-gated execution facade (`legacy`/`shadow`/`engine`), keep current `run` signature; introduce parity-compare hooks in `shadow` mode. | R1, R3, R4 |
| `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts` | Add engine-native workflow definition and workflow registration bridge while preserving current call surface used by orchestrator. | R2, R3, R8 |
| `packages/knowledge/server/src/Workflow/DurableActivities.ts` | Keep legacy impl; add deprecation boundary and prevent double retries for engine-migrated activities (single retry owner). | R2 |
| `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | Add compatibility adapter methods for writing/reading parity snapshots; keep existing methods untouched. | R3, R5 |
| `packages/knowledge/server/src/Workflow/BatchEventEmitter.ts` | No API change; add deterministic event-tag logging annotations for parity diffing. | R7 |
| `packages/knowledge/server/src/Workflow/ProgressStream.ts` | No API change; ensure engine path can emit identical progress states (`started/completed/failed`). | R7 |
| `packages/knowledge/server/src/Workflow/BatchAggregator.ts` | Reuse unchanged for parity-safe aggregation. | R1 |
| `packages/knowledge/server/src/Workflow/index.ts` | Export new engine wiring symbols in additive form; keep legacy exports. | R3, R4 |
| `packages/knowledge/server/src/Runtime/LlmLayers.ts` | No functional change unless required by workflow layer deps. | R9 |
| `packages/knowledge/server/src/Runtime/ServiceBundles.ts` | Add workflow runtime mode config layer and engine layer wiring point. | R3, R8, R9 |
| `packages/knowledge/server/src/Runtime/index.ts` | Export runtime mode configuration + workflow layer composition entrypoint. | R4, R9 |
| `packages/knowledge/server/test/Workflow/DurableActivities.test.ts` | Add tests proving single retry owner when activity is engine-migrated. | R2 |
| `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts` | Add tests for engine annotations/serialization compatibility and failure recording parity. | R3, R6, R8 |
| `packages/knowledge/server/test/Workflow/*` | Add parity snapshot tests for event order and terminal outcome semantics. | R1, R7 |

P3 exit gate:
- `legacy` remains default.
- `shadow` path available and test-covered.
- No API response contract change.

## P4: Cutover + Parity Validation

| File | P4 change | Why / risk addressed |
|---|---|---|
| `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts` | Flip default to `engine`; keep `legacy` runtime toggle for rollback window. | R1, R3, R4 |
| `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts` | Make engine-native workflow/activity execution canonical. | R2, R6, R8 |
| `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | Reduce writes to legacy tables to compatibility-minimum set; retain read shim if any endpoint still depends on it. | R3, R5 |
| `packages/knowledge/server/src/Workflow/BatchEventEmitter.ts` | Validate emitted sequence parity under engine default with snapshot assertions. | R7 |
| `packages/knowledge/server/src/Workflow/ProgressStream.ts` | Validate progress payload parity under engine default. | R7 |
| `packages/knowledge/server/src/Workflow/index.ts` | Mark legacy exports as deprecated in-code comments and docs. | R4 |
| `packages/knowledge/server/test/Workflow/*` | Add cutover regression suite: policy branches, retries, resume, events, terminal states. | R1-R8 |
| `specs/pending/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md` | Capture evidence of parity and known/approved divergences. | All risks |

P4 exit gate:
- `engine` is default in runtime config.
- rollback toggle proven in staging.
- parity report completed and approved.

## P5: Legacy Removal

| File | P5 change | Why / risk addressed |
|---|---|---|
| `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts` | Delete after no call path depends on actor lookups. | R4 |
| `packages/knowledge/server/src/Workflow/BatchMachine.ts` | Delete after policy + terminal semantics pass under engine path. | R1, R4 |
| `packages/knowledge/server/src/Workflow/mapActorState.ts` | Delete after actor states are no longer part of status model. | R1 |
| `packages/knowledge/server/src/Workflow/DurableActivities.ts` | Delete after all activities are engine-native and retry ownership is engine-only. | R2, R6 |
| `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | Full/partial delete based on remaining compatibility readers; remove replay-query path first. | R3, R5 |
| `packages/knowledge/server/src/Workflow/index.ts` | Remove deleted exports and update public surface. | R4 |
| `packages/knowledge/server/test/Workflow/BatchMachine.test.ts` | Delete or rewrite as engine-policy tests (no actor-machine dependency). | R1, R4 |
| `packages/knowledge/server/test/Workflow/mapActorState.test.ts` | Delete after mapper removal. | R1 |
| `specs/pending/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md` | Include grep proof and verification run logs. | All deletion risks |

P5 exit gate:
- no runtime default or fallback uses actor-machine path.
- legacy files removed and no dead exports remain.

## 3) Rollback and Cutover Strategy

### 3.1 Runtime modes and order of operations

1. P3 deploy with mode `legacy` default and `shadow` enabled via config.
2. Run shadow comparisons in staging/prod canary (engine executes, legacy still serves).
3. Promote to `engine` default in P4 after parity gates pass.
4. Keep immediate rollback path (`engine -> legacy`) for one release window.
5. After stable window, remove legacy fallback in P5.

### 3.2 Rollback triggers

Rollback to `legacy` is mandatory if any occurs:
- policy outcome mismatch for same input (R1).
- duplicate activity attempt ownership detected (R2).
- missing/incorrect execution status for user-visible APIs (R3).
- batch lookup failures tied to removed actor assumptions without adapter coverage (R4).
- event sequence drift in `BatchEventEmitter` snapshots (R7).

### 3.3 Rollback mechanics

- Runtime config switch only; no schema rollback required during P3/P4.
- Keep compatibility writes to legacy tables while rollback window is open.
- Preserve orchestrator API and payloads so upstream callers are unaffected by mode change.

## 4) Risk Mitigation Matrix (R1-R9)

| Risk | Mitigation in design | Verification gate | Phase closure |
|---|---|---|---|
| R1 failure-policy drift | Explicit policy adapter preserving `BatchOrchestrator` branch semantics and terminal event rules. | policy parity tests across all three policies + terminal status snapshots | P4 |
| R2 duplicate retry ownership | One-owner rule: engine-owned retries for migrated activities, legacy retries disabled per-activity boundary. | attempt-count assertions and no duplicate failure rows | P3 |
| R3 persistence mismatch | Dual-path compatibility layer; legacy tables retained through cutover window. | unchanged API status contract in shadow and engine modes | P4 |
| R4 actor registry coupling | executionId-centric lookup introduced before cutover; registry retained only as compatibility shim. | no production-critical path depends on `BatchActorRegistry.lookup` | P4 |
| R5 JSON equality replay fragility | Canonicalize legacy input serialization where still used; remove replay query path in P5. | stable replay hit/miss metrics during shadow | P4/P5 |
| R6 error serialization incompatibility | typed serializable error/result schemas for engine activities. | resume/replay tests with structured errors | P3/P4 |
| R7 in-process event stream drift | preserve emitter APIs; compare sequence snapshots between legacy and engine runs. | batch/progress event snapshot parity suite | P4 |
| R8 missing suspend/resume semantics | explicit workflow annotations and runtime resume wiring in engine path. | forced-failure resume tests pass | P3/P4 |
| R9 runtime scope creep | freeze LLM runtime files unless workflow dependency requires touch. | no unrelated runtime diffs in PR scope | Every phase |

## 5) Acceptance Gates and Regression Test Requirements

### 5.1 Mandatory command gates per phase

Run and pass:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
```

### 5.2 Required regression coverage additions

- Policy parity tests for `continue-on-failure`, `abort-all`, `retry-failed` including terminal event assertions.
- Retry ownership tests ensuring migrated activities do not also execute `DurableActivities.runActivity` retry loop.
- Persistence contract tests proving execution status visibility remains stable.
- Resume/suspend tests covering forced activity failure then resume.
- Batch/progress event ordering snapshot tests.

### 5.3 Cutover acceptance checklist

- Engine default mode validated in staging with shadow baseline.
- Rollback toggle exercised and documented.
- No unresolved High risks (R1-R4) at cutover decision point.

## 6) Deletion Preconditions for Legacy Candidates

| Legacy candidate | Deletion preconditions |
|---|---|
| `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts` | Execution lookups use workflow execution IDs only; no runtime caller imports registry tag; rollback window closed. |
| `packages/knowledge/server/src/Workflow/BatchMachine.ts` | Engine policy and transition parity suite replaces machine transition assertions; no persistent actor instantiation remains. |
| `packages/knowledge/server/src/Workflow/mapActorState.ts` | External status mapping no longer depends on actor states; equivalent engine-state mapper in place and tested. |
| `packages/knowledge/server/src/Workflow/DurableActivities.ts` | All workflow activities migrated to `Activity.make`; retry/attempt telemetry validated in engine path. |
| `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | No endpoint requires legacy activity replay query; engine-backed status read model is canonical; audit confirms zero imports of removed methods. |
| `packages/knowledge/server/src/Runtime/LlmLayers.ts` (conditional) | Only if workflow migration replaces LLM runtime composition; otherwise keep. |
| `packages/knowledge/server/src/Runtime/ServiceBundles.ts` (conditional) | Only if bundle wiring is replaced end-to-end by new runtime composition. |
| `packages/knowledge/server/src/Runtime/index.ts` (conditional) | Only if exports become obsolete after runtime composition replacement. |

## 7) P3 Execution Constraints

- Treat R1-R4 as stop-the-line constraints.
- Keep diffs additive in P3; no legacy deletion in P3.
- Every new engine path must have explicit rollback path until P5.
- Do not change external API payloads without explicit spec update.
