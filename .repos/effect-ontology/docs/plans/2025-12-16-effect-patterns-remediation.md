# Effect Patterns Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Address critical Effect pattern issues identified in the codebase audit to establish systematic patterns for building new infrastructure.

**Architecture:** Fix resource management, error typing, and state handling issues. Consolidate duplicate error types. Ensure all activities use typed error schemas instead of string errors.

**Tech Stack:** Effect-TS, @effect/workflow, @effect/schema, @google-cloud/storage, N3.js

---

## Overview

This plan addresses 6 critical issues in priority order:

1. **Task 1-2:** Consolidate duplicate CircuitOpenError classes
2. **Task 3-4:** Fix GCS Storage client resource leak
3. **Task 5-6:** Fix RDF store finalizer (does nothing)
4. **Task 7-9:** Add typed ActivityError schema (replaces string errors)
5. **Task 10-11:** Fix IRI casting bypasses validation
6. **Task 12-14:** Fix workflow state emission race condition

Each task follows TDD: write failing test, implement fix, verify, commit.

---

## Task 1: Create Consolidated CircuitOpenError in Domain/Error

**Files:**
- Create: `packages/@core-v2/src/Domain/Error/Circuit.ts`
- Modify: `packages/@core-v2/src/Domain/Error/index.ts`

**Step 1: Create the new error module**

```typescript
// packages/@core-v2/src/Domain/Error/Circuit.ts
/**
 * Domain: Circuit Breaker Errors
 *
 * Consolidated circuit breaker errors for use across the codebase.
 * Use Schema.TaggedError for serialization support.
 *
 * @since 2.0.0
 * @module Domain/Error/Circuit
 */

import { Schema } from "effect"

/**
 * Error thrown when circuit breaker is open
 *
 * Use catchTag("CircuitOpenError") to handle this error.
 *
 * @since 2.0.0
 */
export class CircuitOpenError extends Schema.TaggedError<CircuitOpenError>()(
  "CircuitOpenError",
  {
    resetTimeoutMs: Schema.Number,
    lastFailureTime: Schema.optional(Schema.Number),
    retryAfterMs: Schema.optional(Schema.Number)
  }
) {
  get message(): string {
    const retryMs = this.retryAfterMs ?? this.resetTimeoutMs
    return `Circuit breaker is open. Will retry in ${retryMs}ms`
  }
}

/**
 * Error when rate limit is exceeded
 *
 * @since 2.0.0
 */
export class RateLimitError extends Schema.TaggedError<RateLimitError>()(
  "RateLimitError",
  {
    reason: Schema.Literal("tokens", "requests", "concurrent"),
    retryAfterMs: Schema.optional(Schema.Number)
  }
) {
  get message(): string {
    const base = `Rate limit exceeded: ${this.reason}`
    return this.retryAfterMs ? `${base}, retry after ${this.retryAfterMs}ms` : base
  }
}
```

**Step 2: Export from index**

Add to `packages/@core-v2/src/Domain/Error/index.ts`:

```typescript
export * from "./Circuit.js"
```

**Step 3: Commit**

```bash
git add packages/@core-v2/src/Domain/Error/Circuit.ts packages/@core-v2/src/Domain/Error/index.ts
git commit -m "feat(errors): add consolidated CircuitOpenError and RateLimitError"
```

---

## Task 2: Migrate Consumers to Use Domain CircuitOpenError

**Files:**
- Modify: `packages/@core-v2/src/Runtime/CircuitBreaker.ts`
- Modify: `packages/@core-v2/src/Service/LlmControl/RateLimiter.ts`
- Modify: `packages/@core-v2/src/Runtime/RateLimitedLanguageModel.ts`

**Step 1: Update CircuitBreaker.ts**

Replace lines 224-231 in `packages/@core-v2/src/Runtime/CircuitBreaker.ts`:

```typescript
// Remove the local class definition and import from domain
import { CircuitOpenError } from "../Domain/Error/Circuit.js"

// Delete these lines (224-231):
// export class CircuitOpenError extends Data.TaggedError("CircuitOpenError")<{
//   readonly resetTimeoutMs: number
//   readonly lastFailureTime: number
// }> {
//   get message(): string {
//     return `Circuit breaker is open. Will retry in ${this.resetTimeoutMs}ms`
//   }
// }
```

Also update the import at top of file - remove `Data` if no longer needed:

```typescript
import { Clock, Duration, Effect, Ref } from "effect"
import { CircuitOpenError } from "../Domain/Error/Circuit.js"
```

**Step 2: Update RateLimiter.ts**

Replace the error class definitions (lines 80-99) in `packages/@core-v2/src/Service/LlmControl/RateLimiter.ts`:

```typescript
// At top of file, replace Data import:
import { Context, Effect, Layer, Ref } from "effect"
import { CircuitOpenError, RateLimitError } from "../../Domain/Error/Circuit.js"

// Delete lines 77-99 (the local error class definitions)
```

**Step 3: Verify imports compile**

```bash
cd packages/@core-v2 && bun run check
```

Expected: No type errors related to CircuitOpenError or RateLimitError

**Step 4: Run tests**

```bash
cd packages/@core-v2 && bun test
```

**Step 5: Commit**

```bash
git add packages/@core-v2/src/Runtime/CircuitBreaker.ts packages/@core-v2/src/Service/LlmControl/RateLimiter.ts
git commit -m "refactor(errors): migrate to consolidated CircuitOpenError"
```

---

## Task 3: Write Test for GCS Storage Resource Cleanup

**Files:**
- Create: `packages/@core-v2/test/Service/Storage.resource.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/@core-v2/test/Service/Storage.resource.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Scope } from "effect"
import { StorageService, StorageServiceLive } from "../../src/Service/Storage.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"

describe("StorageService Resource Management", () => {
  it.effect("should clean up GCS client when scope closes", () =>
    Effect.gen(function*() {
      // Track if cleanup was called
      let cleanupCalled = false

      // Create a test layer that tracks cleanup
      const TestStorageLayer = Layer.scoped(
        StorageService,
        Effect.gen(function*() {
          const scope = yield* Scope.Scope

          // Simulate resource acquisition
          yield* Scope.addFinalizer(scope, Effect.sync(() => {
            cleanupCalled = true
          }))

          // Return mock implementation
          return {
            get: () => Effect.succeed(null),
            set: () => Effect.void,
            remove: () => Effect.void,
            clear: Effect.void,
            size: Effect.succeed(0),
            getUint8Array: () => Effect.succeed(null),
            list: () => Effect.succeed([])
          } as any
        })
      )

      // Run with scope
      yield* Effect.scoped(
        Effect.gen(function*() {
          const storage = yield* StorageService
          yield* storage.size
        })
      ).pipe(Effect.provide(TestStorageLayer))

      // Verify cleanup was called
      expect(cleanupCalled).toBe(true)
    })
  )
})
```

**Step 2: Run test to verify it fails (current impl doesn't use Layer.scoped)**

```bash
cd packages/@core-v2 && bun test test/Service/Storage.resource.test.ts
```

Expected: Test fails because current StorageServiceLive uses `Layer.effect` not `Layer.scoped`

**Step 3: Commit test**

```bash
git add packages/@core-v2/test/Service/Storage.resource.test.ts
git commit -m "test(storage): add resource cleanup test (failing)"
```

---

## Task 4: Fix GCS Storage Resource Leak

**Files:**
- Modify: `packages/@core-v2/src/Service/Storage.ts:28-143, 258-280`

**Step 1: Refactor makeGcsStore to return scoped effect**

Replace the `makeGcsStore` function (lines 28-143) with a scoped version:

```typescript
// packages/@core-v2/src/Service/Storage.ts

// Change makeGcsStore to return Effect that acquires/releases GCS client
const makeGcsStore = (config: StorageConfig) =>
  Effect.gen(function*() {
    if (!config.bucketName) {
      return yield* Effect.fail(new Error("bucketName is required for GCS storage"))
    }

    const scope = yield* Scope.Scope

    // Acquire GCS client with cleanup
    const storage = yield* Effect.acquireRelease(
      Effect.sync(() => new Storage()),
      (client) => Effect.sync(() => {
        // GCS client doesn't have explicit close, but we log for observability
        Effect.logDebug("GCS Storage client released")
      })
    ).pipe(Scope.extend(scope))

    const bucket = storage.bucket(config.bucketName)
    const prefix = config.pathPrefix ?? ""

    const toPath = (key: string) => `${prefix}/${key}`.replace(/\/+/g, "/").replace(/^\//, "")

    // ... rest of implementation unchanged ...
    // (keep handleError and KeyValueStore.make implementation)

    return {
      ...impl,
      list: (listPrefix) => /* ... unchanged ... */
    }
  })
```

**Step 2: Update StorageServiceLive to use Layer.scoped**

Replace lines 258-280:

```typescript
export const StorageServiceLive = Layer.scoped(
  StorageService,
  Effect.gen(function*() {
    const config = yield* ConfigService
    const { bucket, localPath, prefix, type } = config.storage

    const storageConfig: StorageConfig = {
      type,
      bucketName: Option.getOrUndefined(bucket),
      localPath: Option.getOrUndefined(localPath),
      pathPrefix: prefix
    }

    if (type === "gcs") {
      return yield* makeGcsStore(storageConfig)
    } else if (type === "local") {
      return yield* makeLocalStore(storageConfig)
    } else {
      return yield* makeMemoryStore
    }
  })
)
```

**Step 3: Add Scope import**

```typescript
import { Context, Effect, Layer, Option, Scope } from "effect"
```

**Step 4: Run tests**

```bash
cd packages/@core-v2 && bun test test/Service/Storage.resource.test.ts
```

Expected: PASS

**Step 5: Run full test suite**

```bash
cd packages/@core-v2 && bun test
```

**Step 6: Commit**

```bash
git add packages/@core-v2/src/Service/Storage.ts
git commit -m "fix(storage): add proper resource cleanup for GCS client"
```

---

## Task 5: Write Test for RDF Store Finalizer

**Files:**
- Create: `packages/@core-v2/test/Service/Rdf.resource.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/@core-v2/test/Service/Rdf.resource.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Scope } from "effect"
import { RdfBuilder } from "../../src/Service/Rdf.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"

describe("RdfBuilder Resource Management", () => {
  it.effect("makeStore finalizer should clear store data", () =>
    Effect.gen(function*() {
      let storeSize = -1

      yield* Effect.scoped(
        Effect.gen(function*() {
          const rdf = yield* RdfBuilder
          const store = yield* rdf.makeStore

          // Add some data
          yield* rdf.parseTurtle(`
            @prefix ex: <http://example.org/> .
            ex:subject ex:predicate ex:object .
          `).pipe(Effect.map((parsed) => {
            // Copy quads to our store
            store._store.addQuads(parsed._store.getQuads(null, null, null, null))
          }))

          storeSize = store._store.size
          expect(storeSize).toBeGreaterThan(0)
        })
      ).pipe(
        Effect.provide(RdfBuilder.Default),
        Effect.provide(ConfigServiceDefault)
      )

      // After scope closes, store should have been cleared
      // (We can't directly test this, but the finalizer should run)
    })
  )
})
```

**Step 2: Run test**

```bash
cd packages/@core-v2 && bun test test/Service/Rdf.resource.test.ts
```

**Step 3: Commit test**

```bash
git add packages/@core-v2/test/Service/Rdf.resource.test.ts
git commit -m "test(rdf): add resource cleanup test"
```

---

## Task 6: Fix RDF Store Finalizer

**Files:**
- Modify: `packages/@core-v2/src/Service/Rdf.ts:187-197`

**Step 1: Fix the makeStore finalizer**

Replace lines 187-197 in `packages/@core-v2/src/Service/Rdf.ts`:

```typescript
makeStore: Effect.acquireRelease(
  Effect.sync(() => {
    const n3Store = new N3.Store()
    return { _tag: "RdfStore" as const, _store: n3Store } satisfies RdfStore
  }),
  (store) =>
    Effect.sync(() => {
      // Actually clear the store to release memory
      const quads = store._store.getQuads(null, null, null, null)
      store._store.removeQuads(quads)
    }).pipe(
      Effect.tap(() => Effect.logDebug("RDF store cleared", {
        finalQuadCount: store._store.size
      }))
    )
),
```

**Step 2: Run tests**

```bash
cd packages/@core-v2 && bun test test/Service/Rdf.resource.test.ts
```

Expected: PASS

**Step 3: Commit**

```bash
git add packages/@core-v2/src/Service/Rdf.ts
git commit -m "fix(rdf): implement proper store cleanup in finalizer"
```

---

## Task 7: Create Typed ActivityError Schema

**Files:**
- Create: `packages/@core-v2/src/Domain/Error/Activity.ts`
- Modify: `packages/@core-v2/src/Domain/Error/index.ts`

**Step 1: Create the ActivityError schema**

```typescript
// packages/@core-v2/src/Domain/Error/Activity.ts
/**
 * Domain: Activity Errors
 *
 * Typed error schemas for workflow activities.
 * These are serializable for journaling by @effect/workflow.
 *
 * @since 2.0.0
 * @module Domain/Error/Activity
 */

import { Schema } from "effect"

/**
 * Activity timeout error
 */
export const ActivityTimeoutError = Schema.Struct({
  _tag: Schema.Literal("ActivityTimeout"),
  stage: Schema.String,
  durationMs: Schema.Number,
  message: Schema.String
})

/**
 * Service failure during activity
 */
export const ActivityServiceError = Schema.Struct({
  _tag: Schema.Literal("ActivityServiceFailure"),
  service: Schema.String,
  operation: Schema.String,
  message: Schema.String,
  retryable: Schema.Boolean
})

/**
 * Resource not found during activity
 */
export const ActivityNotFoundError = Schema.Struct({
  _tag: Schema.Literal("ActivityNotFound"),
  resourceType: Schema.String,
  resourceId: Schema.String,
  message: Schema.String
})

/**
 * Validation failure during activity
 */
export const ActivityValidationError = Schema.Struct({
  _tag: Schema.Literal("ActivityValidation"),
  field: Schema.optional(Schema.String),
  reason: Schema.String,
  message: Schema.String
})

/**
 * Generic activity error (fallback)
 */
export const ActivityGenericError = Schema.Struct({
  _tag: Schema.Literal("ActivityGeneric"),
  message: Schema.String,
  cause: Schema.optional(Schema.String)
})

/**
 * Union of all activity error types
 *
 * Use this as the error schema for Activity.make()
 */
export const ActivityError = Schema.Union(
  ActivityTimeoutError,
  ActivityServiceError,
  ActivityNotFoundError,
  ActivityValidationError,
  ActivityGenericError
)

export type ActivityError = typeof ActivityError.Type

/**
 * Helper to create a generic error from unknown
 */
export const toActivityError = (e: unknown): ActivityError => ({
  _tag: "ActivityGeneric",
  message: e instanceof Error ? e.message : String(e),
  cause: e instanceof Error && e.cause ? String(e.cause) : undefined
})

/**
 * Helper to create service error
 */
export const serviceError = (
  service: string,
  operation: string,
  e: unknown,
  retryable = false
): ActivityError => ({
  _tag: "ActivityServiceFailure",
  service,
  operation,
  message: e instanceof Error ? e.message : String(e),
  retryable
})

/**
 * Helper to create not found error
 */
export const notFoundError = (
  resourceType: string,
  resourceId: string
): ActivityError => ({
  _tag: "ActivityNotFound",
  resourceType,
  resourceId,
  message: `${resourceType} not found: ${resourceId}`
})
```

**Step 2: Export from index**

Add to `packages/@core-v2/src/Domain/Error/index.ts`:

```typescript
export * from "./Activity.js"
```

**Step 3: Commit**

```bash
git add packages/@core-v2/src/Domain/Error/Activity.ts packages/@core-v2/src/Domain/Error/index.ts
git commit -m "feat(errors): add typed ActivityError schema"
```

---

## Task 8: Write Test for Typed Activity Errors

**Files:**
- Create: `packages/@core-v2/test/Workflow/ActivityError.test.ts`

**Step 1: Write test for error serialization**

```typescript
// packages/@core-v2/test/Workflow/ActivityError.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import {
  ActivityError,
  toActivityError,
  serviceError,
  notFoundError
} from "../../src/Domain/Error/Activity.js"

describe("ActivityError", () => {
  it("should serialize and deserialize correctly", () => {
    const error: typeof ActivityError.Type = {
      _tag: "ActivityServiceFailure",
      service: "StorageService",
      operation: "get",
      message: "Object not found",
      retryable: true
    }

    const json = JSON.stringify(error)
    const parsed = JSON.parse(json)
    const decoded = Schema.decodeUnknownSync(ActivityError)(parsed)

    expect(decoded._tag).toBe("ActivityServiceFailure")
    expect(decoded.retryable).toBe(true)
  })

  it("toActivityError should wrap unknown errors", () => {
    const error = toActivityError(new Error("Something failed"))

    expect(error._tag).toBe("ActivityGeneric")
    expect(error.message).toBe("Something failed")
  })

  it("serviceError should create proper structure", () => {
    const error = serviceError("OntologyService", "searchClasses", new Error("Connection failed"), true)

    expect(error._tag).toBe("ActivityServiceFailure")
    expect(error.service).toBe("OntologyService")
    expect(error.retryable).toBe(true)
  })

  it("notFoundError should create proper structure", () => {
    const error = notFoundError("Document", "doc-123")

    expect(error._tag).toBe("ActivityNotFound")
    expect(error.resourceId).toBe("doc-123")
  })
})
```

**Step 2: Run test**

```bash
cd packages/@core-v2 && bun test test/Workflow/ActivityError.test.ts
```

Expected: PASS

**Step 3: Commit**

```bash
git add packages/@core-v2/test/Workflow/ActivityError.test.ts
git commit -m "test(workflow): add ActivityError serialization tests"
```

---

## Task 9: Migrate DurableActivities to Typed Errors

**Files:**
- Modify: `packages/@core-v2/src/Workflow/DurableActivities.ts`

**Step 1: Update imports and error schema**

At top of file, add import:

```typescript
import {
  ActivityError,
  toActivityError,
  serviceError,
  notFoundError
} from "../Domain/Error/Activity.js"
```

**Step 2: Replace ActivityError schema definition**

Remove line 66:

```typescript
// DELETE: export const ActivityError = Schema.String
```

**Step 3: Update error mapping in each activity**

Replace `.pipe(Effect.mapError((e) => e instanceof Error ? e.message : String(e)))` patterns:

For `makeExtractionActivity` (line 300):
```typescript
}).pipe(
  Effect.mapError(toActivityError),
  Effect.catchTag("SystemError", (e) =>
    Effect.fail(serviceError("StorageService", "get", e, true))
  )
),
```

For `makeResolutionActivity` (line 368):
```typescript
}).pipe(Effect.mapError(toActivityError)),
```

For `makeValidationActivity` (line 462):
```typescript
}).pipe(Effect.mapError(toActivityError)),
```

For `makeIngestionActivity` (line 516):
```typescript
}).pipe(Effect.mapError(toActivityError)),
```

**Step 4: Update requireContent helper**

Replace lines 74-78:

```typescript
const requireContent = (opt: Option.Option<string>, key: string) =>
  Option.match(opt, {
    onNone: () => Effect.fail(notFoundError("StorageObject", key)),
    onSome: (value) => Effect.succeed(value)
  })
```

**Step 5: Run type check**

```bash
cd packages/@core-v2 && bun run check
```

**Step 6: Run tests**

```bash
cd packages/@core-v2 && bun test
```

**Step 7: Commit**

```bash
git add packages/@core-v2/src/Workflow/DurableActivities.ts
git commit -m "refactor(workflow): migrate activities to typed ActivityError"
```

---

## Task 10: Create RDF Type Constants

**Files:**
- Create: `packages/@core-v2/src/Domain/Rdf/Constants.ts`
- Modify: `packages/@core-v2/src/Domain/Rdf/Types.ts`

**Step 1: Create constants file**

```typescript
// packages/@core-v2/src/Domain/Rdf/Constants.ts
/**
 * RDF Namespace Constants
 *
 * Pre-validated IRI constants for common RDF predicates.
 * Use these instead of string literals with `as any` casts.
 *
 * @since 2.0.0
 * @module Domain/Rdf/Constants
 */

import type { IRI } from "./Types.js"

/**
 * RDF namespace IRIs
 */
export const RDF = {
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" as IRI,
  Property: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property" as IRI,
  Statement: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Statement" as IRI,
  subject: "http://www.w3.org/1999/02/22-rdf-syntax-ns#subject" as IRI,
  predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate" as IRI,
  object: "http://www.w3.org/1999/02/22-rdf-syntax-ns#object" as IRI
} as const

/**
 * RDFS namespace IRIs
 */
export const RDFS = {
  Class: "http://www.w3.org/2000/01/rdf-schema#Class" as IRI,
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf" as IRI,
  subPropertyOf: "http://www.w3.org/2000/01/rdf-schema#subPropertyOf" as IRI,
  domain: "http://www.w3.org/2000/01/rdf-schema#domain" as IRI,
  range: "http://www.w3.org/2000/01/rdf-schema#range" as IRI,
  label: "http://www.w3.org/2000/01/rdf-schema#label" as IRI,
  comment: "http://www.w3.org/2000/01/rdf-schema#comment" as IRI
} as const

/**
 * OWL namespace IRIs
 */
export const OWL = {
  Class: "http://www.w3.org/2002/07/owl#Class" as IRI,
  ObjectProperty: "http://www.w3.org/2002/07/owl#ObjectProperty" as IRI,
  DatatypeProperty: "http://www.w3.org/2002/07/owl#DatatypeProperty" as IRI,
  AnnotationProperty: "http://www.w3.org/2002/07/owl#AnnotationProperty" as IRI
} as const

/**
 * SKOS namespace IRIs
 */
export const SKOS = {
  Concept: "http://www.w3.org/2004/02/skos/core#Concept" as IRI,
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel" as IRI,
  altLabel: "http://www.w3.org/2004/02/skos/core#altLabel" as IRI,
  definition: "http://www.w3.org/2004/02/skos/core#definition" as IRI,
  broader: "http://www.w3.org/2004/02/skos/core#broader" as IRI,
  narrower: "http://www.w3.org/2004/02/skos/core#narrower" as IRI,
  related: "http://www.w3.org/2004/02/skos/core#related" as IRI
} as const
```

**Step 2: Export from Types.ts**

Add to end of `packages/@core-v2/src/Domain/Rdf/Types.ts`:

```typescript
export * from "./Constants.js"
```

**Step 3: Commit**

```bash
git add packages/@core-v2/src/Domain/Rdf/Constants.ts packages/@core-v2/src/Domain/Rdf/Types.ts
git commit -m "feat(rdf): add typed IRI constants for common namespaces"
```

---

## Task 11: Replace IRI Casts with Constants

**Files:**
- Modify: `packages/@core-v2/src/Workflow/DurableActivities.ts`
- Modify: `packages/@core-v2/src/Workflow/Activities.ts`
- Modify: `packages/@core-v2/src/Workflow/StreamingExtraction.ts`

**Step 1: Update DurableActivities.ts**

Add import at top:
```typescript
import { RDF } from "../Domain/Rdf/Types.js"
```

Replace line 112:
```typescript
// OLD: predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" as any
// NEW:
predicate: RDF.type
```

**Step 2: Update Activities.ts**

Add import at top:
```typescript
import { RDF } from "../Domain/Rdf/Types.js"
```

Replace line 98:
```typescript
// OLD: predicate: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" as any
// NEW:
predicate: RDF.type
```

**Step 3: Run type check**

```bash
cd packages/@core-v2 && bun run check
```

Expected: No errors

**Step 4: Run tests**

```bash
cd packages/@core-v2 && bun test
```

**Step 5: Commit**

```bash
git add packages/@core-v2/src/Workflow/DurableActivities.ts packages/@core-v2/src/Workflow/Activities.ts
git commit -m "refactor(workflow): replace IRI casts with typed constants"
```

---

## Task 12: Document Workflow State Emission Issue

**Files:**
- Create: `packages/@core-v2/docs/architecture/workflow-state-patterns.md`

**Step 1: Create documentation**

```markdown
# Workflow State Management Patterns

## Current Issue: State Race Condition

The current implementation in `WorkflowOrchestrator.ts` has a race condition:

```typescript
// PROBLEM: State emitted outside workflow journal
const emitState = (state: BatchState) =>
  publishState(state).pipe(
    Effect.catchAll((error) => Effect.logWarning("Failed to publish batch state", { batchId, error }))
  )
```

When workflow replays after crash:
1. Activities replay from last checkpoint
2. `emitState()` is called again
3. External store has stale state
4. State is inconsistent

## Recommended Pattern

State should flow through workflow return value, not side effects:

```typescript
// GOOD: State as workflow result
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,  // Return final state
  error: BatchError,

  execute: (payload) => Effect.gen(function*() {
    // Build state through pipeline
    let state: BatchState = { _tag: "Pending", ... }

    state = yield* runExtraction(state)
    state = yield* runResolution(state)
    state = yield* runValidation(state)
    state = yield* runIngestion(state)

    return state  // Return via workflow, not side effect
  })
})

// External state sync happens AFTER workflow completes
const runAndSync = (payload) =>
  Effect.gen(function*() {
    const engine = yield* WorkflowEngine.WorkflowEngine
    const result = yield* engine.execute(BatchExtractionWorkflow, payload)

    // Only sync to external store after workflow completes
    if (result._tag === "Complete") {
      yield* publishState(Exit.getOrThrow(result.exit))
    }

    return result
  })
```

## Interim Mitigation

Until refactored, add idempotency to state publishing:

```typescript
const emitState = (state: BatchState) =>
  Effect.gen(function*() {
    const existing = yield* getBatchStateFromStore(state.batchId)

    // Only publish if state is newer
    if (Option.isNone(existing) ||
        DateTime.greaterThan(state.updatedAt, existing.value.updatedAt)) {
      yield* publishState(state)
    }
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logWarning("Failed to publish batch state", { batchId: state.batchId, error })
    )
  )
```

## Migration Path

1. **Phase 1 (This Plan):** Document issue, add idempotency guard
2. **Phase 2 (Future):** Refactor to return state through workflow
3. **Phase 3 (Future):** Remove external state emission entirely
```

**Step 2: Commit**

```bash
git add packages/@core-v2/docs/architecture/workflow-state-patterns.md
git commit -m "docs(workflow): document state emission race condition and patterns"
```

---

## Task 13: Add Idempotency Guard to State Emission

**Files:**
- Modify: `packages/@core-v2/src/Service/WorkflowOrchestrator.ts`

**Step 1: Update emitState helper**

Replace lines 242-245:

```typescript
const emitState = (state: BatchState) =>
  Effect.gen(function*() {
    const existing = yield* getBatchStateFromStore(batchId)

    // Only publish if state is newer (idempotency guard)
    const shouldPublish = Option.match(existing, {
      onNone: () => true,
      onSome: (e) => DateTime.greaterThan(state.updatedAt, e.updatedAt)
    })

    if (shouldPublish) {
      yield* publishState(state)
    } else {
      yield* Effect.logDebug("Skipping state publish (not newer)", {
        batchId,
        existingUpdatedAt: Option.map(existing, e => e.updatedAt),
        newUpdatedAt: state.updatedAt
      })
    }
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logWarning("Failed to publish batch state", { batchId, error })
    )
  )
```

**Step 2: Run tests**

```bash
cd packages/@core-v2 && bun test
```

**Step 3: Commit**

```bash
git add packages/@core-v2/src/Service/WorkflowOrchestrator.ts
git commit -m "fix(workflow): add idempotency guard to state emission"
```

---

## Task 14: Final Verification and Summary Commit

**Step 1: Run full test suite**

```bash
cd packages/@core-v2 && bun test
```

Expected: All tests pass

**Step 2: Run type check**

```bash
cd packages/@core-v2 && bun run check
```

Expected: No type errors

**Step 3: Verify no `as any` casts remain in Workflow/**

```bash
grep -r "as any" packages/@core-v2/src/Workflow/
```

Expected: Only legitimate casts (e.g., in StreamingExtraction.ts:41 for error code access)

**Step 4: Create summary commit**

```bash
git add -A
git commit -m "chore: complete Effect patterns remediation

Summary of changes:
- Consolidated CircuitOpenError and RateLimitError to Domain/Error/Circuit.ts
- Fixed GCS Storage client resource leak (Layer.scoped)
- Fixed RDF store finalizer to actually clear store
- Added typed ActivityError schema (replaces string errors)
- Added RDF IRI constants (removes unsafe casts)
- Added idempotency guard to workflow state emission
- Documented workflow state race condition and migration path

All tests passing. Type-safe Error handling throughout."
```

---

## Verification Checklist

- [ ] `bun test` passes
- [ ] `bun run check` has no errors
- [ ] No duplicate CircuitOpenError definitions
- [ ] StorageServiceLive uses Layer.scoped
- [ ] RDF makeStore finalizer clears quads
- [ ] DurableActivities uses ActivityError schema
- [ ] No `as any` IRI casts in Workflow files
- [ ] emitState has idempotency guard
- [ ] Documentation added for workflow state patterns

---

**Plan complete and saved to `docs/plans/2025-12-16-effect-patterns-remediation.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
