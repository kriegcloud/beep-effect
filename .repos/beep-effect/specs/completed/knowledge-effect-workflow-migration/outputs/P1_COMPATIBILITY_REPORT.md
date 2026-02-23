# P1 Compatibility Report: knowledge-effect-workflow-migration

Date: 2026-02-07
Phase: P1 (Discovery + Compatibility)
Status: Complete
Recommendation: **Proceed to P2 with guardrails** (no hard blockers; several high-risk parity areas need explicit design in P2)

## Scope

- Reference implementation analyzed:
  - `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts`
  - `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts`
  - `.repos/effect-ontology/packages/@core-v2/src/server.ts`
  - `.repos/effect-ontology/packages/@core-v2/src/Service/BatchState.ts`
  - `.repos/effect-ontology/packages/@core-v2/src/Domain/Error/Activity.ts`
  - `.repos/effect-ontology/packages/@core-v2/src/Runtime/ActivityRunner.ts`
- Target implementation analyzed:
  - `packages/knowledge/server/src/Workflow/*`
  - `packages/knowledge/server/src/Runtime/*`

## Executive Summary

The current knowledge runtime implements workflow semantics manually using `@beep/machine` actors, SQL-backed execution/activity tables, and in-process PubSub streams. The reference implementation uses `@effect/workflow` primitives (`Workflow.make`, `Activity.make`, `WorkflowEngine.execute/poll/interrupt/resume`) with explicit suspend/resume and durable engine options.

Migration is feasible without feature regression, but not by a 1:1 file swap. The largest compatibility gaps are:

- Current actor-based batch machine lifecycle vs `@effect/workflow` execution lifecycle.
- Custom `DurableActivities.runActivity` replay logic vs workflow-engine activity journaling.
- In-memory actor registry and PubSub streams that do not survive process boundaries.
- Existing SQL schema and query patterns that assume custom activity records.

These are design risks, not blockers, and can be addressed in P2-P4 if parity constraints are made explicit.

## Evidence Snapshot

Reference (`effect-ontology`) signals direct `@effect/workflow` usage:

- `Workflow.make(...)` with idempotency and annotations in `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:137`.
- `annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(Context.add(Workflow.CaptureDefects, true))` in `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:153`.
- `BatchExtractionWorkflow.toLayer(...)` in `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:308`.
- Engine orchestration APIs in `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:980`, `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:997`, `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:999`, `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:1001`.
- Activity journaling model via `Activity.make({ success, error, execute })` in `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts:330` (and repeated activity definitions).

Target (`knowledge/server`) signals custom runtime behavior:

- Persistent machine actor creation in `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:383`.
- Failure-policy branching (`continue-on-failure`, `abort-all`, `retry-failed`) in `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:427`.
- Manual durable activity replay/retry in `packages/knowledge/server/src/Workflow/DurableActivities.ts:61`, `packages/knowledge/server/src/Workflow/DurableActivities.ts:119`.
- SQL persistence interface and activity records in `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:82`, `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:327`.

## API Mapping: Current Custom Pieces -> `@effect/workflow`

| Current custom piece | Current evidence | `@effect/workflow` equivalent | Migration notes |
|---|---|---|---|
| Custom workflow state machine (`BatchMachine`, actor events) | `packages/knowledge/server/src/Workflow/BatchMachine.ts:24`; actor usage at `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:383` | `Workflow.make` workflow definition + state evolution inside workflow logic | Keep domain state tags, but move transition authority to workflow execution functions. |
| Manual orchestration service (`BatchOrchestrator.run`) | `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:401` | `WorkflowEngine.execute` / `poll` / `interrupt` / `resume` API surface | Introduce orchestrator facade that preserves existing server API while delegating to engine. |
| Custom activity wrapper (`DurableActivities.runActivity`) | `packages/knowledge/server/src/Workflow/DurableActivities.ts:44` | `Activity.make` typed activities, journaled by engine | Replace ad-hoc replay query and manual retry bookkeeping with activity definitions. |
| Replay lookup (`findCompletedActivity`) | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:327` | Engine activity journal replay | Keep table temporarily for parity instrumentation and rollback confidence, then delete in P5. |
| Execution status table updates | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:118` | Workflow result/status polling via engine (`Workflow.Result`) | Preserve external status contract by compatibility read model (engine result -> existing response shape). |
| Progress/event streams via in-process PubSub | `packages/knowledge/server/src/Workflow/BatchEventEmitter.ts`; `packages/knowledge/server/src/Workflow/ProgressStream.ts` | Workflow result polling + optional side-channel events | Keep event emitters during migration; switch producer source from actor transitions to workflow stage transitions. |
| In-memory actor registry | `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts:31` | Engine-managed execution IDs; no per-process actor map required | Remove once callers stop requiring live actor lookups. |

## Persistence Mapping and Schema Implications

### Current target persistence model

- Execution/activity persistence in SQL via custom tables from `KnowledgeEntityIds.WorkflowExecutionId.tableName` and `KnowledgeEntityIds.WorkflowActivityId.tableName` (`packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:20`, `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:21`).
- Activity replay depends on query-by-`executionId + activityName + input` (`packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:327`).
- Batch actor state durability relies on `createPersistentActor(..., PersistenceAdapterTag)` (`packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:383`).

### Reference persistence model

- Workflow engine durability is environment-selectable (`ClusterWorkflowEngine` + `SingleRunner.layer({ runnerStorage: "sql" })` vs memory) in `.repos/effect-ontology/packages/@core-v2/src/server.ts:80` and `.repos/effect-ontology/packages/@core-v2/src/server.ts:91`.
- Activity journaling is part of workflow engine semantics (`Activity.make`) rather than custom SQL lifecycle rows in `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts:330`.
- Separate app-facing persisted batch state is still maintained (`publishState` / `persistState`) in `.repos/effect-ontology/packages/@core-v2/src/Service/BatchState.ts:84`.

### Schema implications for migration

- Keep existing workflow execution/activity tables during P2-P4 for compatibility read models and rollback observability.
- Introduce workflow-engine persistence in parallel (memory in local/dev first, SQL-backed in staging/prod).
- Define typed serializable activity error/result schemas (target currently uses stringified errors in several paths) aligned with `.repos/effect-ontology/packages/@core-v2/src/Domain/Error/Activity.ts:66`.
- Add explicit translation layer from engine execution/result state to current API response models before removing legacy tables.

## Unsupported or Misaligned Behavior + Mitigation

| Misalignment | Evidence | Impact | Mitigation |
|---|---|---|---|
| Current runtime uses persistent actors and in-memory registry, not engine execution IDs | `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts:31`; `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:383` | Multi-process consistency and restart lookup behavior can diverge | Introduce executionId-first APIs and compatibility adapter that still serves old lookup pathways until removed. |
| Manual retry/replay semantics in custom durable activities | `packages/knowledge/server/src/Workflow/DurableActivities.ts:61` and `packages/knowledge/server/src/Workflow/DurableActivities.ts:119` | Risk of double-retry or drift when mixing custom and engine retries | During transition, isolate migrated activities to engine-native `Activity.make` and disable duplicate retry loops for migrated paths. |
| Current activity replay keyed by JSON input equality | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:327` | Non-canonical input serialization can break replay determinism | Canonicalize inputs where legacy path remains; prefer engine journaling once migrated. |
| Failure semantics differ (`all failed` => BatchFailed, mixed => BatchCompleted) | `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:499` and `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:508` | Silent regression risk in external status/event consumers | Capture this as parity test invariant in P4; preserve exact behavior until explicitly changed by product decision. |
| Reference activities require WorkflowEngine/WorkflowInstance context | `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts:12` | Existing standalone-style execution patterns may break | Keep or rework any out-of-engine execution path; if needed, maintain an adapter similar to reference `Runtime/ActivityRunner.ts`. |
| Progress/event stream currently in-process only | `packages/knowledge/server/src/Workflow/BatchEventEmitter.ts`; `packages/knowledge/server/src/Workflow/ProgressStream.ts` | No durability across restarts | Preserve current contract in P2/P3; evaluate durable event bridge in later phase, but treat as non-goal for parity migration. |

## Legacy Deletion Candidates (for P5)

The following are explicit deletion candidates once engine-native workflow runtime and compatibility adapters are fully adopted:

- `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts`
  - Reason: actor lookup registry is only needed by current custom actor runtime.
- `packages/knowledge/server/src/Workflow/BatchMachine.ts`
  - Reason: machine transitions can move into workflow function/state logic.
- `packages/knowledge/server/src/Workflow/mapActorState.ts`
  - Reason: actor-state mapping becomes obsolete once source state is workflow result/state.
- `packages/knowledge/server/src/Workflow/DurableActivities.ts`
  - Reason: replaced by engine-native `Activity.make` activities.
- `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` (full or partial)
  - Reason: manual execution/activity journaling replaced by workflow engine persistence; may retain thin read model adapters depending on API compatibility decisions.

Conditional deletion candidates (only if scope expands to runtime composition replacement):

- `packages/knowledge/server/src/Runtime/LlmLayers.ts`
- `packages/knowledge/server/src/Runtime/ServiceBundles.ts`
- `packages/knowledge/server/src/Runtime/index.ts`

## Recommended Migration Sequence (P2 -> P5)

1. **P2: Blueprint + compatibility scaffolding**
- Define target workflow API surfaces: `start`, `startAndWait`, `poll`, `interrupt`, `resume`.
- Define compatibility contracts: existing status/event semantics, failure policy behavior, retry observability.
- Specify dual-write / shadow-read strategy for legacy persistence vs engine result model.

2. **P3: Engine introduction with minimal behavior change**
- Add `@effect/workflow` engine layer selection (memory for local, SQL for durable envs).
- Implement first migrated workflow path with `Workflow.make` and workflow registration layer.
- Add typed activity definitions using `Activity.make` for at least one stage.

3. **P4: Parity validation and controlled cutover**
- Run side-by-side validation for status transitions, retries, event emission, and failure-policy branches.
- Validate non-regression against workflow tests and any API contract tests.
- Cut over orchestrator entrypoints to engine-backed implementation while preserving external contract.

4. **P5: Legacy cleanup**
- Delete actor-runtime and custom durable-activity modules no longer referenced.
- Remove obsolete persistence paths after read-model compatibility window closes.
- Finalize docs and operational runbooks.

## Proceed/Hold Decision

Decision: **Proceed to P2.**

Reasoning:
- No hard technical blocker was found in target code that prevents introducing `@effect/workflow`.
- Reference implementation provides direct, working patterns for workflow definition, activity modeling, and engine orchestration APIs.
- Risks are concrete and mitigable through phased dual-path migration and parity tests.
