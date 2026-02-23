# P1 File Inventory: knowledge-effect-workflow-migration

Date: 2026-02-07
Phase: P1 (Discovery + Compatibility)

## Target Inventory (`packages/knowledge/server/src/Workflow/*`, `packages/knowledge/server/src/Runtime/*`)

### Workflow files

| File | Role | Key symbols / evidence | Migration disposition |
|---|---|---|---|
| `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts` | Top-level batch orchestration and failure policy routing | `createPersistentActor` (`:383`), policy branching (`:427`), resolution events (`:447`, `:491`), final batch outcome (`:499`, `:508`) | Migrate behavior into engine-backed orchestrator facade; keep API parity. |
| `packages/knowledge/server/src/Workflow/BatchMachine.ts` | Actor machine transitions and guards | `makeBatchMachine` (`:24`), state/event transitions (`.on/.reenter`) | **Legacy deletion candidate (P5)** after workflow-state migration. |
| `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts` | In-memory actor map for active batches | `Ref<HashMap>` storage (`:31`) | **Legacy deletion candidate (P5)** once executionId-based runtime is active. |
| `packages/knowledge/server/src/Workflow/mapActorState.ts` | Maps actor states to external batch states | `mapActorStateToBatchState` | **Legacy deletion candidate (P5)** when actor state is removed. |
| `packages/knowledge/server/src/Workflow/DurableActivities.ts` | Manual durable activity wrapper with retry/replay | replay lookup (`:61`), start/fail/complete record hooks (`:81`, `:95`, `:104`), retry (`:119`) | Replace with `Activity.make`; **legacy deletion candidate (P5)**. |
| `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | Custom SQL persistence for executions and activities | table definitions (`:20`, `:21`), activity records (`:82`+), replay query (`:327`) | Keep during transition; partial/full delete in P5 depending on compatibility read-model retention. |
| `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts` | Single-document extraction workflow composition | workflow execution creation + status updates + durable activity run (`run`) | Refactor into engine-friendly activity/workflow components. |
| `packages/knowledge/server/src/Workflow/BatchEventEmitter.ts` | In-process batch event PubSub | `emit`, `subscribeAll` | Keep contract; switch producer source during migration. |
| `packages/knowledge/server/src/Workflow/ProgressStream.ts` | In-process extraction progress stream | `PubSub.unbounded`, `subscribe` | Keep for parity; consider durability later. |
| `packages/knowledge/server/src/Workflow/BatchAggregator.ts` | Aggregation utility for batch results | `aggregate` | Keep; likely unchanged. |
| `packages/knowledge/server/src/Workflow/index.ts` | Workflow barrel exports | export surface | Update exports as implementation shifts. |

### Runtime files

| File | Role | Key symbols / evidence | Migration disposition |
|---|---|---|---|
| `packages/knowledge/server/src/Runtime/LlmLayers.ts` | LLM provider config and layer selection | `LlmConfig`, `LlmLive`, OpenAI/Anthropic selection | Not core workflow-runtime migration; keep unless runtime scope expands. |
| `packages/knowledge/server/src/Runtime/ServiceBundles.ts` | LLM provider/control-plane layer bundles | `LlmProviderBundleLive`, `LlmControlBundleLive`, `LlmRuntimeBundleLive` | Keep for now; conditional deletion only if runtime bundle architecture is replaced. |
| `packages/knowledge/server/src/Runtime/index.ts` | Runtime barrel export | `export * from "./LlmLayers"` | Keep unless `LlmLayers.ts` is replaced. |

## Reference Inventory (used for compatibility mapping)

| File | Why it matters | Key symbols / evidence |
|---|---|---|
| `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts` | Canonical `@effect/workflow` orchestration patterns | `Workflow.make` (`:137`), `idempotencyKey` (`:142`), suspend/capture annotations (`:153`), `toLayer` (`:308`), engine APIs (`:980`, `:997`, `:999`, `:1001`) |
| `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts` | Canonical `Activity.make` typed durable activities | `Activity.make` (e.g. `:330`) + typed `success/error` schemas |
| `.repos/effect-ontology/packages/@core-v2/src/server.ts` | Engine durability wiring | `ClusterWorkflowEngine` + `SingleRunner.layer({ runnerStorage: "sql" })` (`:80`), fallback `WorkflowEngine.layerMemory` (`:91`) |
| `.repos/effect-ontology/packages/@core-v2/src/Service/BatchState.ts` | Separate app-facing batch state persistence model | `publishState`/`persistState` (`:84`) |
| `.repos/effect-ontology/packages/@core-v2/src/Domain/Error/Activity.ts` | Serializable typed activity error model | `ActivityError` union and journaling comment (`:5`, `:66`) |
| `.repos/effect-ontology/packages/@core-v2/src/Runtime/ActivityRunner.ts` | Out-of-engine activity execution path and caveat | dispatcher + `Workflow/Activities.ts` usage |

## Explicit Legacy Deletion Candidate List (P5)

Primary candidates:

- `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts`
- `packages/knowledge/server/src/Workflow/BatchMachine.ts`
- `packages/knowledge/server/src/Workflow/mapActorState.ts`
- `packages/knowledge/server/src/Workflow/DurableActivities.ts`
- `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` (full or partial)

Conditional candidates (if runtime composition is moved in later phases):

- `packages/knowledge/server/src/Runtime/LlmLayers.ts`
- `packages/knowledge/server/src/Runtime/ServiceBundles.ts`
- `packages/knowledge/server/src/Runtime/index.ts`

## Parity-Critical Behaviors to Preserve During Migration

- Failure policy branching and semantics in `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:427`.
- Event emission sequence and payloads in `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:447`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:491`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:499`, `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts:508`.
- Durable activity retry and replay semantics in `packages/knowledge/server/src/Workflow/DurableActivities.ts:61`, `packages/knowledge/server/src/Workflow/DurableActivities.ts:119`.
- Execution/activity status visibility currently backed by `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`.
