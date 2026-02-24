# P1 Risk Register: knowledge-effect-workflow-migration

Date: 2026-02-07
Phase: P1 (Discovery + Compatibility)

## Prioritized Risks

| ID | Priority | Risk | Evidence | Impact | Mitigation | Exit Criteria |
|---|---|---|---|---|---|---|
| R1 | High | Behavior drift in failure-policy semantics (`continue-on-failure`, `abort-all`, `retry-failed`) when moving from actor machine to engine workflow | `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:427` | User-visible batch outcomes may change without explicit product decision | Codify policy as parity tests before cutover; implement policy adapter in new orchestrator facade | Existing policy tests pass unchanged on engine-backed path |
| R2 | High | Duplicate retry/replay behavior if custom `DurableActivities.runActivity` and `Activity.make` semantics overlap during transition | `packages/knowledge/server/src/Workflow/DurableActivities.ts:61`, `packages/knowledge/server/src/Workflow/DurableActivities.ts:119`; reference `Activity.make` at `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts:330` | Extra attempts, inconsistent status rows, hard-to-debug side effects | Phase migration by activity boundary; disable custom retry path for activities moved to engine | Each migrated activity has exactly one retry owner |
| R3 | High | Persistence model mismatch between legacy SQL workflow tables and engine journal/result state | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:20`; `.repos/effect-ontology/packages/@core-v2/src/server.ts:80` | Loss of status visibility or broken APIs during cutover | Dual-path period: keep legacy tables for compatibility reads while introducing engine persistence | API consumers receive unchanged response contracts during shadow mode |
| R4 | High | In-memory actor registry assumptions break in multi-process / restart scenarios, especially during partial migration | `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts:31` | Lookup failures, phantom missing batches, uneven behavior across nodes | Transition to executionId-centric lookup immediately in P2 design; retain compatibility shim temporarily | No production call path depends on in-memory actor registry |
| R5 | Medium | Activity input matching in legacy replay query depends on JSON equality and may miss cache hits | `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts:327` | Unplanned re-execution and cost spikes | Canonicalize serialized inputs while legacy path remains; remove dependency after full activity migration | Replay hit/miss rates stable through transition |
| R6 | Medium | Error serialization incompatibility with engine journaling requirements | Reference schema requirement `.repos/effect-ontology/packages/@core-v2/src/Domain/Error/Activity.ts:5` | Resume/replay failures or opaque errors | Introduce typed `Schema` error unions per activity result before migration of that activity | All migrated activities use typed serializable error schemas |
| R7 | Medium | Progress/event channels are in-process only and may diverge from engine lifecycle timing | `packages/knowledge/server/src/Workflow/BatchEventEmitter.ts`; `packages/knowledge/server/src/Workflow/ProgressStream.ts` | Missing/late events for subscribers during cutover | Keep existing stream contracts; emit from workflow stage boundaries and parity-test event sequence | Event sequence snapshots match pre-migration behavior |
| R8 | Medium | Suspend/resume semantics may be missing if engine configuration omits annotations and retry schedule | Reference `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:153`, `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts:156` | Workflows fail terminally where resumable behavior is expected | Add explicit workflow annotations (`SuspendOnFailure`, `CaptureDefects`) and resume API coverage in P3 | Resume integration tests pass for forced failure cases |
| R9 | Low | Runtime scope creep into LLM layer composition could delay migration | `packages/knowledge/server/src/Runtime/LlmLayers.ts`; `packages/knowledge/server/src/Runtime/ServiceBundles.ts` | Timeline slip from unrelated changes | Keep runtime LLM layer files out of core migration unless required by dependency graph | P2 blueprint excludes unnecessary runtime refactors |

## Blocker Assessment

- Hard blockers found: **None**.
- Proceed recommendation: **Proceed to P2** with R1-R4 treated as gating risks.

## Risk Ownership Proposal (for P2 planning)

- Workflow API and execution lifecycle risks: R1, R4, R8.
- Activity migration and retry/journaling risks: R2, R5, R6.
- Persistence compatibility and observability risks: R3, R7.
- Scope control risks: R9.

## Legacy Deletion Candidates (Risk-Linked)

These candidates should only be deleted after corresponding risks are closed:

- `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts` (R4)
- `packages/knowledge/server/src/Workflow/BatchMachine.ts` (R1, R4)
- `packages/knowledge/server/src/Workflow/mapActorState.ts` (R1)
- `packages/knowledge/server/src/Workflow/DurableActivities.ts` (R2, R5, R6)
- `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` (R2, R3, R5)
