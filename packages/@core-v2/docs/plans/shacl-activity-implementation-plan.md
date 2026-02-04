# SHACL Activity Implementation Plan

**Date**: December 11, 2025
**Status**: Planning Complete
**Purpose**: Add SHACL validation activity as a model for future workflow activities

---

## Executive Summary

This document provides a complete implementation plan for adding a SHACL validation activity to the Effect-TS ontology extraction pipeline. The implementation serves as a **template pattern** for adding future workflow activities in a clean, testable way with full Effect integration.

### Key Decisions

1. **Library**: Use `shacl-engine` (15-26x faster than alternatives)
2. **Pattern**: Follow existing service/activity/layer patterns
3. **Testing**: Unit tests + integration tests with mock storage
4. **No Terraform changes**: Existing Cloud Run configuration is sufficient

---

## 1. Architecture Overview

### Current System Architecture

```
Cloud Run (HTTP Server)
    │
    ▼
WorkflowOrchestrator (orchestrates workflow execution)
    │
    ▼
BatchExtractionWorkflow (workflow definition)
    │
    ▼
DurableActivities (Activity.make definitions)
    │
    ▼
Services (EntityExtractor, RdfBuilder, OntologyService, etc.)
    │
    ▼
Layers (TestRuntime, ProductionRuntime, WorkflowLayers)
```

### Where SHACL Fits

The SHACL validation activity will:
1. Receive a resolved knowledge graph URI as input
2. Load optional SHACL shapes from storage (or auto-generate from ontology)
3. Perform SHACL validation using `shacl-engine`
4. Produce a validation report and validated graph output
5. Support both synchronous execution and streaming feedback

### Current Gap

The existing `makeValidationActivity` in `src/Workflow/Activities.ts` is a stub:
- Always returns `conforms: true`
- Does no actual SHACL validation
- Simply copies the input graph to the output location

---

## 2. Service Definition: SHACLService

### 2.1 Error Types

**New file**: `src/Domain/Error/Shacl.ts`

```typescript
import { Schema } from "effect"

/**
 * ShaclValidationError - SHACL validation processing errors
 */
export class ShaclValidationError extends Schema.TaggedError<ShaclValidationError>()(
  "ShaclValidationError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ShapesLoadError - Failed to load SHACL shapes
 */
export class ShapesLoadError extends Schema.TaggedError<ShapesLoadError>()(
  "ShapesLoadError",
  {
    message: Schema.String,
    shapesUri: Schema.optional(Schema.String),
    cause: Schema.optional(Schema.Unknown)
  }
) {}

/**
 * ValidationReportError - Failed to generate validation report
 */
export class ValidationReportError extends Schema.TaggedError<ValidationReportError>()(
  "ValidationReportError",
  {
    message: Schema.String,
    cause: Schema.optional(Schema.Unknown)
  }
) {}
```

### 2.2 Service Interface

**New file**: `src/Service/Shacl.ts`

```typescript
import type { Store } from "n3"
import { Context, Effect, Layer, Schema } from "effect"
import { ShaclValidationError, ShapesLoadError } from "../Domain/Error/Shacl.js"
import { RdfBuilder } from "./Rdf.js"
import { StorageService } from "./Storage.js"

// -----------------------------------------------------------------------------
// Validation Report Schema
// -----------------------------------------------------------------------------

export const ShaclViolation = Schema.Struct({
  focusNode: Schema.String,
  path: Schema.optional(Schema.String),
  value: Schema.optional(Schema.String),
  message: Schema.String,
  severity: Schema.Literal("Violation", "Warning", "Info"),
  sourceShape: Schema.optional(Schema.String)
})
export type ShaclViolation = typeof ShaclViolation.Type

export const ShaclValidationReport = Schema.Struct({
  conforms: Schema.Boolean,
  violations: Schema.Array(ShaclViolation),
  validatedAt: Schema.DateTimeUtc,
  dataGraphTripleCount: Schema.Number,
  shapesGraphTripleCount: Schema.Number,
  durationMs: Schema.Number
})
export type ShaclValidationReport = typeof ShaclValidationReport.Type

// -----------------------------------------------------------------------------
// Service Interface
// -----------------------------------------------------------------------------

export interface ShaclServiceMethods {
  /**
   * Validate an RDF graph against SHACL shapes
   */
  validate: (
    dataStore: Store,
    shapesStore: Store
  ) => Effect.Effect<ShaclValidationReport, ShaclValidationError>

  /**
   * Load shapes from a Turtle string
   */
  loadShapes: (
    shapesTurtle: string
  ) => Effect.Effect<Store, ShapesLoadError>

  /**
   * Load shapes from a GCS URI
   */
  loadShapesFromUri: (
    shapesUri: string
  ) => Effect.Effect<Store, ShapesLoadError | StorageError>

  /**
   * Generate default shapes from ontology class definitions
   */
  generateShapesFromOntology: (
    ontologyStore: Store
  ) => Effect.Effect<Store, ShaclValidationError>
}

// -----------------------------------------------------------------------------
// Service Tag
// -----------------------------------------------------------------------------

export class ShaclService extends Context.Tag("ShaclService")<
  ShaclService,
  ShaclServiceMethods
>() {
  static readonly Default: Layer.Layer<ShaclService, never, RdfBuilder | StorageService>
}
```

### 2.3 Service Implementation Pattern

```typescript
export const ShaclServiceLive = Layer.effect(
  ShaclService,
  Effect.gen(function* () {
    const rdfBuilder = yield* RdfBuilder
    const storage = yield* StorageService

    return {
      validate: (dataStore, shapesStore) =>
        Effect.gen(function* () {
          const start = yield* DateTime.now

          // Dynamic import to avoid top-level await
          const SHACLValidator = (yield* Effect.promise(() =>
            import("shacl-engine").then(m => m.default)
          ))

          const validator = new SHACLValidator(shapesStore, {
            factory: rdfBuilder.factory,
            debug: false,
            coverage: false
          })

          const report = yield* Effect.tryPromise({
            try: () => validator.validate({ dataset: dataStore }),
            catch: (e) => new ShaclValidationError({
              message: `SHACL validation failed: ${e}`,
              cause: e
            })
          })

          const end = yield* DateTime.now

          return {
            conforms: report.conforms,
            violations: report.results.map(r => ({
              focusNode: r.focusNode?.value ?? "unknown",
              path: r.path?.value,
              value: r.value?.value,
              message: r.message?.[0] ?? "Constraint violation",
              severity: mapSeverity(r.severity),
              sourceShape: r.sourceShape?.value
            })),
            validatedAt: start,
            dataGraphTripleCount: dataStore.size,
            shapesGraphTripleCount: shapesStore.size,
            durationMs: DateTime.distance(start, end)
          }
        }),

      loadShapes: (shapesTurtle) =>
        Effect.gen(function* () {
          const store = yield* rdfBuilder.parseTurtle(shapesTurtle)
          return store._store
        }).pipe(
          Effect.mapError(e => new ShapesLoadError({
            message: `Failed to parse shapes: ${e}`,
            cause: e
          }))
        ),

      loadShapesFromUri: (shapesUri) =>
        Effect.gen(function* () {
          const content = yield* storage.get(stripGsPrefix(shapesUri))
          const turtle = yield* Effect.fromOption(content).pipe(
            Effect.mapError(() => new ShapesLoadError({
              message: `Shapes not found at ${shapesUri}`,
              shapesUri
            }))
          )
          return yield* loadShapes(turtle)
        }),

      generateShapesFromOntology: (ontologyStore) =>
        Effect.gen(function* () {
          // Generate basic SHACL shapes from rdfs:domain/range constraints
          // This is a simplified approach - production would use Astrea
          const shapes = new N3.Store()
          // ... shape generation logic
          return shapes
        })
    }
  })
)
```

---

## 3. Activity Definition

### 3.1 Input/Output Schemas

**Update existing schemas in** `src/Domain/Schema/Batch.ts`:

```typescript
// Input already exists
export const ValidationActivityInput = Schema.Struct({
  batchId: BatchId,
  resolvedGraphUri: GcsUri,
  shaclUri: Schema.optional(GcsUri)
})

// Enhanced output
export const ValidationActivityOutput = Schema.Struct({
  validatedUri: GcsUri,
  conforms: Schema.Boolean,
  violations: Schema.Number,
  violationSummary: Schema.optional(Schema.Array(Schema.Struct({
    severity: Schema.String,
    count: Schema.Number,
    sampleMessages: Schema.Array(Schema.String)
  }))),
  reportUri: GcsUri,
  durationMs: Schema.Number
})
```

### 3.2 Activity Implementation

**Update** `src/Workflow/DurableActivities.ts`:

```typescript
export const ShaclValidationActivity = Activity.make({
  name: "shacl-validation",
  success: ValidationActivityOutput,
  error: Schema.String,
  execute: Effect.gen(function* () {
    const ctx = yield* Activity.CurrentAttempt
    const input = ctx.input as ValidationActivityInput

    const start = yield* DateTime.now
    const storage = yield* StorageService
    const config = yield* ConfigService
    const shacl = yield* ShaclService
    const rdfBuilder = yield* RdfBuilder

    const bucket = resolveBucket(config)

    yield* Effect.logInfo("SHACL validation activity starting", {
      batchId: input.batchId,
      resolvedGraphUri: input.resolvedGraphUri,
      hasExplicitShapes: Option.isSome(Option.fromNullable(input.shaclUri))
    })

    // 1. Load the resolved graph
    const resolvedTurtle = yield* storage.get(stripGsPrefix(input.resolvedGraphUri)).pipe(
      Effect.flatMap(opt => Option.match(opt, {
        onNone: () => Effect.fail(`Missing graph at ${input.resolvedGraphUri}`),
        onSome: Effect.succeed
      }))
    )

    const dataStore = yield* rdfBuilder.parseTurtle(resolvedTurtle)

    // 2. Load or generate SHACL shapes
    const shapesStore = yield* input.shaclUri
      ? shacl.loadShapesFromUri(input.shaclUri)
      : shacl.generateShapesFromOntology(dataStore._store)

    // 3. Perform validation
    const report = yield* shacl.validate(dataStore._store, shapesStore)

    // 4. Write validated graph
    const validationGraphPath = PathLayout.batch.validationGraph(input.batchId)
    yield* storage.set(validationGraphPath, resolvedTurtle)

    // 5. Write validation report
    const reportPath = PathLayout.batch.validationReport(input.batchId)
    yield* storage.set(reportPath, JSON.stringify(report, null, 2))

    const end = yield* DateTime.now

    yield* Effect.logInfo("SHACL validation activity complete", {
      batchId: input.batchId,
      conforms: report.conforms,
      violations: report.violations.length,
      durationMs: DateTime.distance(start, end)
    })

    return {
      validatedUri: toGcsUri(bucket, validationGraphPath),
      conforms: report.conforms,
      violations: report.violations.length,
      reportUri: toGcsUri(bucket, reportPath),
      durationMs: DateTime.distance(start, end)
    }
  }).pipe(Effect.mapError(toStringError))
})
```

---

## 4. Layer Composition

### 4.1 Update WorkflowLayers.ts

```typescript
// Add to imports
import { ShaclService } from "../Service/Shacl.js"

// Add ShaclBundle
const ShaclBundle = ShaclService.Default.pipe(
  Layer.provideMerge(RdfBuilderBundle),
  Layer.provideMerge(StorageBundle)
)

// Update ActivityDependenciesLayer
export const ActivityDependenciesLayer = Layer.mergeAll(
  StorageBundle,
  CoreDependenciesLayer,
  LlmExtractionBundle,
  OntologyBundle,
  ShaclBundle  // <-- Add this
)
```

### 4.2 Update TestRuntime.ts

```typescript
/**
 * Mock SHACL Service for testing
 */
export const MockShaclService = (options?: {
  conforms?: boolean
  violations?: ShaclViolation[]
}) => Layer.succeed(
  ShaclService,
  {
    validate: (dataStore, shapesStore) => Effect.succeed({
      conforms: options?.conforms ?? true,
      violations: options?.violations ?? [],
      validatedAt: DateTime.unsafeNow(),
      dataGraphTripleCount: dataStore.size,
      shapesGraphTripleCount: shapesStore.size,
      durationMs: 0
    }),
    loadShapes: (turtle) => Effect.gen(function* () {
      const parser = new N3.Parser()
      const store = new N3.Store()
      parser.parse(turtle).forEach(q => store.addQuad(q))
      return store
    }),
    loadShapesFromUri: () => Effect.succeed(new N3.Store()),
    generateShapesFromOntology: () => Effect.succeed(new N3.Store())
  }
)

// Update TestLayers
export const TestLayers = Layer.mergeAll(
  // ... existing layers
  MockShaclService(),  // <-- Add this
  BunContext.layer
).pipe(
  Layer.provideMerge(ConfigServiceDefault),
  Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
)
```

---

## 5. Cloud Run Integration

### No Terraform Changes Required

The existing Cloud Run configuration is sufficient:
- Container has access to GCS storage
- Environment variables for LLM and storage are configured
- SHACL validation runs within the existing workflow engine
- 300s timeout is more than sufficient

### Optional Environment Variable

```hcl
# If you want a configurable default shapes location
env {
  name  = "DEFAULT_SHACL_PATH"
  value = var.default_shacl_path
}
```

### Performance Considerations

- `shacl-engine` is 15-26x faster than alternatives
- For graphs under 100K triples: validation typically <1 second
- No memory concerns for typical extraction outputs

---

## 6. Testing Strategy

### 6.1 Unit Tests

**New file**: `test/Service/Shacl.test.ts`

```typescript
import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { ShaclService } from "../../src/Service/Shacl.js"
import { RdfBuilder } from "../../src/Service/Rdf.js"

describe("ShaclService", () => {
  const testLayer = ShaclService.Default.pipe(
    Layer.provideMerge(RdfBuilder.Default),
    Layer.provideMerge(StorageServiceTest)
  )

  describe("validate", () => {
    it("should return conforms=true for valid data", () =>
      Effect.gen(function* () {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const dataStore = yield* rdf.parseTurtle(`
          @prefix ex: <http://example.org/> .
          @prefix schema: <http://schema.org/> .

          ex:alice a schema:Person ;
            schema:name "Alice" .
        `)

        const shapesStore = yield* shacl.loadShapes(`
          @prefix sh: <http://www.w3.org/ns/shacl#> .
          @prefix schema: <http://schema.org/> .

          schema:PersonShape a sh:NodeShape ;
            sh:targetClass schema:Person ;
            sh:property [
              sh:path schema:name ;
              sh:minCount 1 ;
            ] .
        `)

        const report = yield* shacl.validate(dataStore._store, shapesStore)

        expect(report.conforms).toBe(true)
        expect(report.violations).toHaveLength(0)
      }).pipe(Effect.provide(testLayer), Effect.runPromise))

    it("should detect missing required property", () =>
      Effect.gen(function* () {
        const shacl = yield* ShaclService
        const rdf = yield* RdfBuilder

        const dataStore = yield* rdf.parseTurtle(`
          @prefix ex: <http://example.org/> .
          @prefix schema: <http://schema.org/> .

          ex:bob a schema:Person .
        `)

        const shapesStore = yield* shacl.loadShapes(`
          @prefix sh: <http://www.w3.org/ns/shacl#> .
          @prefix schema: <http://schema.org/> .

          schema:PersonShape a sh:NodeShape ;
            sh:targetClass schema:Person ;
            sh:property [ sh:path schema:name ; sh:minCount 1 ] .
        `)

        const report = yield* shacl.validate(dataStore._store, shapesStore)

        expect(report.conforms).toBe(false)
        expect(report.violations.length).toBeGreaterThan(0)
      }).pipe(Effect.provide(testLayer), Effect.runPromise))
  })
})
```

### 6.2 Integration Tests

**New file**: `test/Workflow/ShaclValidation.test.ts`

```typescript
import { Effect, Layer } from "effect"
import { describe, expect, it } from "vitest"
import { ShaclValidationActivity } from "../../src/Workflow/DurableActivities.js"
import { TestLayers } from "../../src/Runtime/TestRuntime.js"

describe("ShaclValidationActivity", () => {
  it("should validate a conforming graph", async () => {
    const testStorage = new Map<string, string>()
    testStorage.set("batches/test-batch/resolved.ttl", `
      @prefix ex: <http://example.org/> .
      ex:alice a ex:Person ; ex:name "Alice" .
    `)

    const result = await Effect.gen(function* () {
      return yield* ShaclValidationActivity.execute
    }).pipe(
      Effect.provideService(Activity.CurrentAttempt, {
        input: {
          batchId: "test-batch" as BatchId,
          resolvedGraphUri: "gs://test/batches/test-batch/resolved.ttl" as GcsUri
        },
        attempt: 1
      }),
      Effect.provide(TestLayers),
      Effect.runPromise
    )

    expect(result.conforms).toBe(true)
  })
})
```

---

## 7. Error Handling and Observability

### 7.1 Error Pattern

```typescript
// All errors mapped to strings for activity serialization
.pipe(Effect.mapError(toStringError))

// Tagged errors provide structured information
new ShaclValidationError({
  message: "Validation failed",
  cause: originalError
})
```

### 7.2 Telemetry Integration

```typescript
// Add spans inside activity
yield* Effect.withSpan("shacl-validation.load-graph")(loadGraphEffect)
yield* Effect.withSpan("shacl-validation.validate")(validateEffect)
```

### 7.3 Metrics to Track

- `shacl_validation_duration_ms` - Validation duration
- `shacl_validation_conformance` - Boolean conformance rate
- `shacl_validation_violations_count` - Number of violations
- `shacl_shapes_triple_count` - Size of shapes graph

---

## 8. Template Pattern for Future Activities

This implementation serves as a template for adding new workflow activities.

### Step 1: Define Domain Types

1. Create error types in `src/Domain/Error/<Name>.ts`
   - Extend `Schema.TaggedError` for serializable errors
   - Include relevant context

2. Create/extend schemas in `src/Domain/Schema/Batch.ts`
   - Input schema with branded types
   - Output schema with metrics

### Step 2: Create Service

1. Define service interface in `src/Service/<Name>.ts`
   - Use `Context.Tag` for service tag
   - Define methods returning `Effect.Effect<A, E, R>`
   - Expose `Default` layer

2. Implementation pattern:
   ```typescript
   export class MyService extends Context.Tag("MyService")<
     MyService,
     MyServiceMethods
   >() {
     static readonly Default = Layer.effect(
       MyService,
       Effect.gen(function* () {
         const dep = yield* SomeDependency
         return { method: (input) => Effect.gen(function* () { ... }) }
       })
     )
   }
   ```

### Step 3: Create Activity

1. Add activity in `src/Workflow/DurableActivities.ts`:
   ```typescript
   export const MyActivity = Activity.make({
     name: "my-activity",
     success: MyActivityOutput,
     error: Schema.String,
     execute: Effect.gen(function* () { ... })
       .pipe(Effect.mapError(toStringError))
   })
   ```

2. Register in workflow in `BatchWorkflow.ts`

### Step 4: Wire Layers

1. Update `src/Runtime/WorkflowLayers.ts`
2. Update `src/Runtime/TestRuntime.ts` with mock

### Step 5: Add Tests

1. Unit tests in `test/Service/<Name>.test.ts`
2. Integration tests in `test/Workflow/<Name>.test.ts`

### Step 6: Infrastructure (if needed)

1. Update Terraform for new env vars
2. Update Dockerfile for new dependencies

---

## 9. Implementation Checklist

### Phase 1: Service Foundation (Days 1-2)

- [ ] Create `src/Domain/Error/Shacl.ts` with error types
- [ ] Add `shacl-engine` to package.json: `bun add shacl-engine`
- [ ] Create `src/Service/Shacl.ts` with service interface
- [ ] Implement `ShaclServiceLive` layer
- [ ] Update `src/Service/index.ts` exports
- [ ] Update `src/Domain/Error/index.ts` exports
- [ ] Create basic unit tests

### Phase 2: Activity Integration (Days 3-4)

- [ ] Update `ValidationActivityOutput` schema
- [ ] Add `ShaclValidationActivity` to DurableActivities.ts
- [ ] Update WorkflowLayers.ts with ShaclBundle
- [ ] Update TestRuntime.ts with MockShaclService
- [ ] Create activity integration tests

### Phase 3: Testing and Documentation (Day 5)

- [ ] Add comprehensive test cases
- [ ] Verify performance with real SHACL shapes
- [ ] Create example SHACL shapes for football ontology
- [ ] Run full workflow integration test

### Files to Create

| File | Purpose |
|------|---------|
| `src/Domain/Error/Shacl.ts` | Error types |
| `src/Service/Shacl.ts` | Service definition |
| `test/Service/Shacl.test.ts` | Unit tests |
| `test/Workflow/ShaclValidation.test.ts` | Integration tests |
| `ontologies/football/shapes.ttl` | Example SHACL shapes |

### Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Add shacl-engine dependency |
| `src/Service/index.ts` | Export ShaclService |
| `src/Domain/Error/index.ts` | Export Shacl errors |
| `src/Workflow/DurableActivities.ts` | Add validation activity |
| `src/Runtime/WorkflowLayers.ts` | Add ShaclBundle |
| `src/Runtime/TestRuntime.ts` | Add MockShaclService |

---

## 10. Critical Reference Files

When implementing, refer to these files for patterns:

| File | Pattern to Follow |
|------|-------------------|
| `src/Service/Rdf.ts` | Service definition, N3 integration |
| `src/Workflow/DurableActivities.ts` | Activity pattern, existing stub |
| `src/Runtime/WorkflowLayers.ts` | Layer composition pattern |
| `src/Runtime/TestRuntime.ts` | Mock service pattern |
| `docs/ontology_research/rdf_shacl_reasoning_research.md` | shacl-engine performance info |

---

## Appendix: Example SHACL Shapes

**File**: `ontologies/football/shapes.ttl`

```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix fb: <http://ontology.football/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

# Person must have a name
fb:PersonShape a sh:NodeShape ;
    sh:targetClass fb:Person ;
    sh:property [
        sh:path fb:name ;
        sh:datatype xsd:string ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] .

# Player must reference a valid Team
fb:PlayerShape a sh:NodeShape ;
    sh:targetClass fb:Player ;
    sh:property [
        sh:path fb:playsFor ;
        sh:class fb:Team ;
        sh:minCount 0 ;
    ] ;
    sh:property [
        sh:path fb:jerseyNumber ;
        sh:datatype xsd:integer ;
        sh:minInclusive 1 ;
        sh:maxInclusive 99 ;
    ] .

# Match must have two teams
fb:MatchShape a sh:NodeShape ;
    sh:targetClass fb:Match ;
    sh:property [
        sh:path fb:homeTeam ;
        sh:class fb:Team ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] ;
    sh:property [
        sh:path fb:awayTeam ;
        sh:class fb:Team ;
        sh:minCount 1 ;
        sh:maxCount 1 ;
    ] .
```
