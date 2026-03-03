# Workflow Layer Composition & Activity Consolidation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix workflow service dependencies, consolidate duplicate activity implementations, and align with durable activity model per the workflow-engine-implementation-spec.

**Architecture:**
1. Fix layer composition: `@effect/workflow`'s `Workflow.toLayer()` converts execute requirements into layer requirements - services must be provided **before** workflow layer construction.
2. Consolidate activities: Move real LLM extraction logic from `Activities.ts` into `DurableActivities.ts` which uses proper `Activity.make` for journaling.
3. Organize by bundles: Platform, Config, Storage, Ontology, LLM/Extraction, Workflow, HTTP - per spec addendum.

**Tech Stack:** Effect 3.x, @effect/workflow, @effect/platform-bun, TypeScript

**Reference:** `/Users/pooks/Dev/effect-ontology/docs/recommendations/workflow-engine-implementation-spec.md`

---

## Phase 1: Fix Layer Composition (Immediate - Unblocks Testing)

### Problem Analysis

The workflow hangs at "Extraction activity starting" because services (`EntityExtractor`, `RelationExtractor`, `OntologyService`) aren't available in the workflow execution context.

**Root cause:** `Workflow.toLayer<R>()` makes `R` requirements into **layer requirements**. Currently, dependencies are provided AFTER `BatchExtractionWorkflowLayer` construction.

---

### Task 1: Create Service Dependencies Layer Module

**Files:**
- Create: `src/Runtime/WorkflowLayers.ts`

**Step 1: Create the WorkflowLayers module**

```typescript
/**
 * Workflow Layer Composition
 *
 * Provides properly-composed layers for the batch extraction workflow.
 * Services must be provided to the workflow layer BEFORE it's constructed.
 *
 * Organization follows spec bundles:
 * - ActivityDependenciesLayer: All services needed by activity execute effects
 * - BatchExtractionWorkflowWithDepsLayer: Workflow layer with deps pre-provided
 * - WorkflowOrchestratorFullLayer: Complete orchestrator + workflow
 *
 * @since 2.0.0
 */

import { Layer } from "effect"
import { ConfigService } from "../Service/Config.js"
import { EntityExtractor, RelationExtractor } from "../Service/Extraction.js"
import { NlpService } from "../Service/Nlp.js"
import { OntologyService } from "../Service/Ontology.js"
import { RdfBuilder } from "../Service/Rdf.js"
import { StorageServiceLive } from "../Service/Storage.js"
import { BatchExtractionWorkflowLayer, WorkflowOrchestratorLive } from "../Service/WorkflowOrchestrator.js"
import { makeLanguageModelLayer } from "./ProductionRuntime.js"

// -----------------------------------------------------------------------------
// Activity Dependencies Bundle (spec: LlmExtractionBundle + OntologyBundle)
// -----------------------------------------------------------------------------

/**
 * LLM Extraction services: EntityExtractor + RelationExtractor
 * Requires: LanguageModel
 */
const LlmExtractionBundle = Layer.mergeAll(
  EntityExtractor.Default,
  RelationExtractor.Default
).pipe(Layer.provide(makeLanguageModelLayer))

/**
 * Ontology services: OntologyService + NlpService + RdfBuilder
 */
const OntologyBundle = Layer.mergeAll(
  OntologyService.Default,
  RdfBuilder.Default
).pipe(Layer.provide(NlpService.Default))

/**
 * All services required by workflow activities.
 *
 * Activities yield these in their execute effects:
 * - StorageService: Read/write documents and graphs
 * - ConfigService: Access configuration (bucket, paths)
 * - RdfBuilder: Serialize knowledge graphs to Turtle
 * - EntityExtractor: LLM-based entity extraction
 * - RelationExtractor: LLM-based relation extraction
 * - OntologyService: Ontology class/property lookup
 */
export const ActivityDependenciesLayer = Layer.mergeAll(
  StorageServiceLive,
  ConfigService.Default,
  LlmExtractionBundle,
  OntologyBundle
)

// -----------------------------------------------------------------------------
// Workflow Bundle (with dependencies pre-provided)
// -----------------------------------------------------------------------------

/**
 * BatchExtractionWorkflowLayer with all activity dependencies provided.
 *
 * CRITICAL: The workflow's execute effect yields services like EntityExtractor.
 * These must be available when the workflow layer is constructed, not after.
 */
export const BatchExtractionWorkflowWithDepsLayer = BatchExtractionWorkflowLayer.pipe(
  Layer.provide(ActivityDependenciesLayer)
)

/**
 * Complete WorkflowOrchestrator layer with workflow and all dependencies.
 *
 * Provides:
 * - WorkflowOrchestrator service
 * - BatchExtractionWorkflow (registered with engine)
 * - All activity dependencies
 *
 * Requires:
 * - WorkflowEngine (from WorkflowEngine.layerMemory or ClusterWorkflowEngine)
 * - FileSystem, Path (from BunContext)
 */
export const WorkflowOrchestratorFullLayer = Layer.mergeAll(
  WorkflowOrchestratorLive,
  BatchExtractionWorkflowWithDepsLayer
)
```

**Step 2: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors (or existing unrelated errors)

**Step 3: Commit**

```bash
git add src/Runtime/WorkflowLayers.ts
git commit -m "feat: add WorkflowLayers module with proper dependency composition

Provides ActivityDependenciesLayer bundling all services needed by
workflow activities (EntityExtractor, RelationExtractor, OntologyService,
StorageService, RdfBuilder, ConfigService).

BatchExtractionWorkflowWithDepsLayer ensures dependencies are provided
BEFORE the workflow layer is constructed.

Follows spec bundle organization: LlmExtractionBundle, OntologyBundle."
```

---

### Task 2: Update server.ts to Use New Layer Composition

**Files:**
- Modify: `src/server.ts`

**Step 1: Update imports**

Replace extraction service imports with WorkflowLayers:

```typescript
// REMOVE these imports (lines ~22-28):
// import { makeLanguageModelLayer } from "./Runtime/ProductionRuntime.js"
// import { EntityExtractor, RelationExtractor } from "./Service/Extraction.js"
// import { NlpService } from "./Service/Nlp.js"
// import { OntologyService } from "./Service/Ontology.js"

// ADD this import:
import { WorkflowOrchestratorFullLayer, ActivityDependenciesLayer } from "./Runtime/WorkflowLayers.js"
```

**Step 2: Remove manual layer composition (lines ~75-99)**

Delete the `ExtractionServicesLive`, `OntologyServiceLive`, and `WorkflowOrchestratorWithDependencies` definitions.

**Step 3: Add new simplified composition**

```typescript
// Workflow orchestrator with all activity dependencies pre-composed
const WorkflowOrchestratorWithDependencies = WorkflowOrchestratorFullLayer.pipe(
  Layer.provide(WorkflowEngineLive),
  Layer.provide(PlatformLayer)
)
```

**Step 4: Simplify ServerLive composition (lines ~103-117)**

```typescript
const ServerLive = HttpServerLive.pipe(
  Layer.provideMerge(BunHttpServer.layer({ port, idleTimeout: 255 })),
  Layer.provideMerge(HealthCheckService.Default),
  Layer.provideMerge(WorkflowEngineLive),
  Layer.provideMerge(WorkflowOrchestratorWithDependencies),
  Layer.provideMerge(BatchStateHubLayer),
  Layer.provideMerge(BatchStatePersistenceLayer),
  Layer.provideMerge(ActivityDependenciesLayer),  // For HTTP handlers
  Layer.provideMerge(ShutdownService.Default),
  Layer.provide(PlatformLayer)
)
```

**Step 5: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/server.ts
git commit -m "fix: use WorkflowLayers for proper dependency composition

Replace manual layer composition with WorkflowOrchestratorFullLayer
which provides dependencies to the workflow layer BEFORE construction.
This fixes the hanging issue where activities couldn't access services.

Follows spec bundle organization pattern."
```

---

### Task 3: Build and Test Layer Fix

**Files:** None (testing)

**Step 1: Build**

Run: `pnpm build`
Expected: Build succeeds

**Step 2: Start test server**

Run: `./scripts/test-server.sh`
Expected: Server starts, logs "Listening on http://localhost:8080"

**Step 3: Send test extraction**

Run: `./scripts/test-extract.sh`
Expected: Progress past "Extraction activity starting" to show:
- "Source document loaded"
- "Candidate classes loaded"
- "Entities extracted" (count > 0)
- "Extraction activity complete"

**Step 4: Commit if passing**

```bash
git commit --allow-empty -m "test: verify layer composition fix - extraction runs"
```

---

## Phase 2: Consolidate Activities (Durable-Ready)

Per spec section "Consolidate Activities into DurableActivities.ts":
- Move real logic from `Activities.ts` into `DurableActivities.ts`
- DurableActivities uses `Activity.make` for journaling
- Delete or deprecate duplicate in `Activities.ts`

---

### Task 4: Port Extraction Logic to DurableActivities

**Files:**
- Modify: `src/Workflow/DurableActivities.ts:124-155`

**Step 1: Add extraction service imports to DurableActivities.ts**

Add after line 30:

```typescript
import { EntityExtractor, RelationExtractor } from "../Service/Extraction.js"
import { OntologyService } from "../Service/Ontology.js"
import { KnowledgeGraph } from "../Domain/Model/Entity.js"
import { Chunk } from "effect"
```

**Step 2: Add graphToTurtle helper (from Activities.ts)**

Add after `parseTurtleStats` helper (~line 97):

```typescript
/**
 * Serialize a KnowledgeGraph to Turtle using RdfBuilder
 */
const graphToTurtle = (graph: KnowledgeGraph) =>
  Effect.gen(function*() {
    const rdf = yield* RdfBuilder
    const store = yield* rdf.createStore
    yield* rdf.addEntities(store, graph.entities)
    yield* rdf.addRelations(store, graph.relations)
    return yield* rdf.toTurtle(store)
  })
```

**Step 3: Replace stub extraction with real logic**

Replace `makeExtractionActivity` (lines 124-155) with:

```typescript
export const makeExtractionActivity = (input: typeof ExtractionActivityInput.Type) =>
  Activity.make({
    name: `extraction-${input.documentId}`,
    success: ExtractionOutput,
    error: ActivityError,
    execute: Effect.gen(function*() {
      const start = yield* DateTime.now
      const storage = yield* StorageService
      const config = yield* ConfigService
      const entityExtractor = yield* EntityExtractor
      const relationExtractor = yield* RelationExtractor
      const ontologyService = yield* OntologyService

      const bucket = resolveBucket(config)

      yield* Effect.logInfo("Extraction activity starting", {
        batchId: input.batchId,
        documentId: input.documentId,
        sourceUri: input.sourceUri,
        ontologyUri: input.ontologyUri
      })

      // 1. Read source document
      const sourceKey = stripGsPrefix(input.sourceUri)
      const sourceContent = yield* storage.get(sourceKey).pipe(
        Effect.flatMap((opt) => requireContent(opt, sourceKey))
      )

      yield* Effect.logInfo("Source document loaded", {
        documentId: input.documentId,
        contentLength: sourceContent.length
      })

      // 2. Load ontology candidate classes via hybrid search
      const candidateClasses = yield* ontologyService.searchClassesHybrid(
        sourceContent.slice(0, 2000),
        100
      ).pipe(
        Effect.tap((classes) =>
          Effect.logInfo("Candidate classes loaded", {
            documentId: input.documentId,
            candidateCount: Chunk.size(classes)
          })
        )
      )

      // 3. Extract entities from LLM
      const entities = yield* entityExtractor.extract(
        sourceContent,
        Chunk.toReadonlyArray(candidateClasses)
      ).pipe(
        Effect.tap((entities) =>
          Effect.logInfo("Entities extracted", {
            documentId: input.documentId,
            entityCount: Chunk.size(entities)
          })
        )
      )

      // 4. Get properties for extracted entity types
      const entityTypes = Chunk.toReadonlyArray(entities).flatMap((e) => e.types)
      const uniqueEntityTypes = Array.from(new Set(entityTypes))
      const properties = yield* ontologyService.getPropertiesFor(uniqueEntityTypes)

      // 5. Extract relations (if 2+ entities and properties)
      const relations = Chunk.size(entities) >= 2 && Chunk.size(properties) > 0
        ? yield* relationExtractor.extract(
            sourceContent,
            entities,
            Chunk.toReadonlyArray(properties)
          ).pipe(
            Effect.tap((rels) =>
              Effect.logInfo("Relations extracted", {
                documentId: input.documentId,
                relationCount: Chunk.size(rels)
              })
            )
          )
        : Chunk.empty()

      // 6. Create KnowledgeGraph
      const graph = new KnowledgeGraph({
        entities: Chunk.toReadonlyArray(entities),
        relations: Chunk.toReadonlyArray(relations),
        sourceText: sourceContent
      })

      // 7. Serialize to Turtle
      const turtleContent = yield* graphToTurtle(graph)

      // 8. Save to storage
      const graphPath = PathLayout.document.graph(input.documentId)
      yield* storage.set(graphPath, turtleContent)

      const end = yield* DateTime.now

      yield* Effect.logInfo("Extraction activity complete", {
        batchId: input.batchId,
        documentId: input.documentId,
        entityCount: Chunk.size(entities),
        relationCount: Chunk.size(relations),
        durationMs: DateTime.distance(start, end)
      })

      return {
        documentId: input.documentId,
        graphUri: toGcsUri(bucket, graphPath),
        entityCount: Chunk.size(entities),
        relationCount: Chunk.size(relations),
        durationMs: DateTime.distance(start, end)
      }
    }).pipe(Effect.mapError((e) => e instanceof Error ? e.message : String(e))),
    interruptRetryPolicy: activityRetryPolicy
  })
```

**Step 4: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add src/Workflow/DurableActivities.ts
git commit -m "feat: port real extraction logic to DurableActivities

Move LLM extraction logic from Activities.ts to DurableActivities.ts:
- Ontology class search via searchClassesHybrid
- Entity extraction via EntityExtractor
- Relation extraction via RelationExtractor
- KnowledgeGraph building and Turtle serialization

Activity.make provides journaling for crash recovery.
Stub logic replaced with full implementation."
```

---

### Task 5: Switch WorkflowOrchestrator to DurableActivities

**Files:**
- Modify: `src/Service/WorkflowOrchestrator.ts`

**Step 1: Change import**

Replace line 23-28:

```typescript
// BEFORE:
import {
  makeExtractionActivity,
  makeIngestionActivity,
  makeResolutionActivity,
  makeValidationActivity
} from "../Workflow/Activities.js"

// AFTER:
import {
  makeExtractionActivity,
  makeIngestionActivity,
  makeResolutionActivity,
  makeValidationActivity
} from "../Workflow/DurableActivities.js"
```

**Step 2: Update activity invocations to use `.execute`**

In `BatchExtractionWorkflowLayer` (starting ~line 266), the current code calls:
```typescript
makeExtractionActivity(input).execute
```

This is the same pattern for Activity.make, so no changes needed to invocation style.

**Step 3: Run TypeScript check**

Run: `pnpm exec tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/Service/WorkflowOrchestrator.ts
git commit -m "refactor: switch WorkflowOrchestrator to DurableActivities

Import activities from DurableActivities.ts instead of Activities.ts.
Uses Activity.make for journaling and crash recovery.

Per spec: 'switch calls to makeExtractionActivity from Activities.ts
with the Activity.make versions from DurableActivities.ts'"
```

---

### Task 6: Deprecate Activities.ts

**Files:**
- Modify: `src/Workflow/Activities.ts`

**Step 1: Add deprecation notice**

Add at top of file after module doc:

```typescript
/**
 * @deprecated Use DurableActivities.ts instead.
 * This file is retained for reference only. All activity logic has been
 * consolidated into DurableActivities.ts which uses Activity.make for
 * proper journaling and crash recovery.
 *
 * This file will be removed in a future version.
 */
```

**Step 2: Export re-exports from DurableActivities (optional - thin wrapper)**

Or simply leave the deprecation notice and let consumers migrate.

**Step 3: Commit**

```bash
git add src/Workflow/Activities.ts
git commit -m "deprecate: mark Activities.ts as deprecated

Logic consolidated into DurableActivities.ts per spec.
Retained for reference; will be removed in future version."
```

---

### Task 7: Build and Test Full Pipeline

**Files:** None (testing)

**Step 1: Build**

Run: `pnpm build`
Expected: Build succeeds

**Step 2: Start test server**

Run: `./scripts/test-server.sh`
Expected: Server starts successfully

**Step 3: Run extraction test**

Run: `./scripts/test-extract.sh`
Expected:
- "Extraction activity starting"
- "Source document loaded"
- "Candidate classes loaded" (candidateCount > 0)
- "Entities extracted" (entityCount > 0)
- "Relations extracted" (may be 0 if < 2 entities)
- "Extraction activity complete"
- "Resolution activity starting"
- ... through to "Workflow complete"

**Step 4: Commit**

```bash
git commit --allow-empty -m "test: verify durable activities work end-to-end"
```

---

## Phase 3: State & Observability Improvements (Optional)

Per spec sections 4-7:

### Task 8: Add Stub Flags to State (Optional)

Add `stub: true` to validation/resolution state when using placeholder logic.

### Task 9: Add Per-Stage Spans (Optional)

Wrap stages with `Effect.withSpan("workflow.extract")` for observability.

### Task 10: Manifest Preflight Validation (Optional)

Check sourceUri, ontologyUri existence before starting workflow.

---

## Verification Checklist

After completing Phase 1 & 2:

- [ ] `pnpm build` succeeds
- [ ] `./scripts/test-server.sh` starts without errors
- [ ] `./scripts/test-extract.sh` shows extraction progress (not hanging)
- [ ] Server logs show "Entities extracted" with count > 0
- [ ] Activities use `Activity.make` from `@effect/workflow`
- [ ] `Activities.ts` marked deprecated
- [ ] `DurableActivities.ts` contains real extraction logic
- [ ] No TypeScript errors

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/Runtime/WorkflowLayers.ts` | Create | Bundle activity dependencies, provide before workflow |
| `src/server.ts` | Modify | Use WorkflowLayers, simplify composition |
| `src/Workflow/DurableActivities.ts` | Modify | Port real extraction logic from Activities.ts |
| `src/Service/WorkflowOrchestrator.ts` | Modify | Import from DurableActivities instead of Activities |
| `src/Workflow/Activities.ts` | Deprecate | Mark deprecated, point to DurableActivities |

---

## Rollback Plan

If the fix causes issues:

1. Revert to Activities.ts: Change import in WorkflowOrchestrator.ts back
2. Revert server.ts: `git checkout HEAD~N -- src/server.ts`
3. Remove WorkflowLayers.ts: `rm src/Runtime/WorkflowLayers.ts`
4. Rebuild: `pnpm build`
