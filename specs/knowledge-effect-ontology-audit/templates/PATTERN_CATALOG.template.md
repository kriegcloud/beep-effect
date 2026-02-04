# Pattern Catalog

> Reusable patterns extracted from effect-ontology for beep-effect adoption.

---

## Pattern 1: Service Definition

**Problem**: Define Effect services with proper dependency injection and accessors.

**effect-ontology Example** (`Service/OntologyService.ts`):
```typescript
export class OntologyService extends Effect.Service<OntologyService>()(
  "OntologyService",
  {
    accessors: true,
    dependencies: [RdfBuilder.Default, NlpService.Default],
    effect: Effect.gen(function* () {
      const rdfBuilder = yield* RdfBuilder
      const nlpService = yield* NlpService

      return {
        parseOntology: (content: string) => Effect.gen(function* () {
          // Implementation
        }),
        getClassHierarchy: (classIri: string) => Effect.gen(function* () {
          // Implementation
        })
      }
    })
  }
) {}
```

**Applicability**: All services in beep-effect knowledge slice.

---

## Pattern 2: Layer Composition

**Problem**: Compose layers in correct dependency order.

**effect-ontology Example** (`Runtime/ClusterRuntime.ts`):
```typescript
export const ClusterSqliteLive = (options?: { filename?: string }) =>
  SingleRunner.layer.pipe(
    Layer.provide(SqliteClient.layer({ filename: options?.filename ?? "cluster.db" })),
    Layer.provide(ShardingConfig.layerDefaults)
  )

export const PostgresPersistenceLive = Layer.mergeAll(
  SqlMessageStorage.layerWith({ prefix: "workflow_" }),
  SqlRunnerStorage.layerWith({ prefix: "workflow_" })
).pipe(
  Layer.provide(ShardingConfig.layerDefaults),
  Layer.provide(PgClientLive)
)

export const ClusterRuntime = SingleRunner.layer.pipe(
  Layer.provide(PostgresPersistenceLive)
)
```

**Applicability**: All layer composition in beep-effect.

**Key Points**:
- Use `Layer.mergeAll` for parallel independent layers
- Use `Layer.provide` for sequential dependencies
- Order matters: provide dependencies after merging
- Use `.pipe()` for readable composition

---

## Pattern 3: Circuit Breaker

**Problem**: Protect external services from cascading failures.

**effect-ontology Example** (`Runtime/CircuitBreaker.ts`):
```typescript
interface CircuitBreakerState {
  status: "closed" | "open" | "half_open"
  failures: number
  successes: number
  lastFailure: number | null
}

export const makeCircuitBreaker = (config: CircuitBreakerConfig) =>
  Effect.gen(function* () {
    const state = yield* Ref.make<CircuitBreakerState>({
      status: "closed",
      failures: 0,
      successes: 0,
      lastFailure: null
    })
    const clock = yield* Clock.Clock

    const canAttempt = Effect.gen(function* () {
      const current = yield* Ref.get(state)

      if (current.status === "closed") return true

      if (current.status === "open") {
        const now = yield* Clock.currentTimeMillis
        if (now - current.lastFailure! > Duration.toMillis(config.resetTimeout)) {
          yield* Ref.update(state, (s) => ({ ...s, status: "half_open" }))
          return true
        }
        return false
      }

      // half_open - allow one request
      return true
    })

    const recordSuccess = Ref.update(state, (s) => {
      if (s.status === "half_open") {
        const newSuccesses = s.successes + 1
        if (newSuccesses >= config.successThreshold) {
          return { status: "closed", failures: 0, successes: 0, lastFailure: null }
        }
        return { ...s, successes: newSuccesses }
      }
      return s
    })

    const recordFailure = Effect.gen(function* () {
      const now = yield* Clock.currentTimeMillis
      yield* Ref.update(state, (s) => {
        if (s.status === "half_open") {
          return { status: "open", failures: 1, successes: 0, lastFailure: now }
        }
        const newFailures = s.failures + 1
        if (newFailures >= config.maxFailures) {
          return { status: "open", failures: newFailures, successes: 0, lastFailure: now }
        }
        return { ...s, failures: newFailures, lastFailure: now }
      })
    })

    return {
      protect: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
        Effect.gen(function* () {
          const allowed = yield* canAttempt
          if (!allowed) {
            return yield* Effect.fail(new CircuitOpenError({ retryAfterMs: /* calculate */ }))
          }
          return yield* effect.pipe(
            Effect.tapBoth({
              onSuccess: () => recordSuccess,
              onFailure: () => recordFailure
            })
          )
        })
    }
  })
```

**Applicability**: Wrap all LLM calls in beep-effect.

---

## Pattern 4: Backpressure Handler

**Problem**: Prevent OOM when stream consumers are slow.

**effect-ontology Example** (`Cluster/BackpressureHandler.ts`):
```typescript
const CRITICAL_EVENTS = new Set([
  "extraction_started", "extraction_complete", "extraction_failed",
  "stage_started", "stage_completed", "error_fatal"
])

export const withBackpressure = (config: BackpressureConfig) =>
  <E, R>(stream: Stream.Stream<ProgressEvent, E, R>): Stream.Stream<ProgressEvent, E, R> =>
    Stream.unwrapScoped(
      Effect.gen(function* () {
        const queue = yield* Queue.bounded<ProgressEvent>(config.maxQueuedEvents)

        // Producer fiber
        yield* stream.pipe(
          Stream.runForEach((event) =>
            Effect.gen(function* () {
              const size = yield* Queue.size(queue)
              const loadFactor = size / config.maxQueuedEvents

              // Critical events always pass
              if (CRITICAL_EVENTS.has(event.type)) {
                yield* Queue.offer(queue, event)
                return
              }

              // Sample non-critical events under load
              if (loadFactor >= config.samplingThreshold) {
                if (Math.random() > config.samplingRate) {
                  return // Drop event
                }
              }

              yield* Queue.offer(queue, event)
            })
          ),
          Effect.fork
        )

        return Stream.fromQueue(queue)
      })
    )
```

**Applicability**: Progress streaming in beep-effect.

---

## Pattern 5: Workflow Definition

**Problem**: Define durable workflows with typed payloads and retry schedules.

**effect-ontology Example** (`Service/WorkflowOrchestrator.ts`):
```typescript
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (payload) => `${payload.batchId}-${hashPayload(payload)}`,
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered
  )
})

// Register workflow implementation
export const BatchExtractionWorkflowLayer = BatchExtractionWorkflow.toLayer(
  (payload) => Effect.gen(function* () {
    yield* Effect.logInfo("Starting batch extraction", { batchId: payload.batchId })

    // Activity calls are automatically journaled
    const chunks = yield* chunkingActivity.execute({ text: payload.text })
    const entities = yield* entityExtractionActivity.execute({ chunks })
    const relations = yield* relationExtractionActivity.execute({ entities, chunks })

    return { entities, relations, status: "complete" }
  })
)
```

**Applicability**: ExtractionWorkflow in beep-effect.

---

## Pattern 6: Durable Activity

**Problem**: Define activities that survive process restarts.

**effect-ontology Example** (`Workflow/DurableActivities.ts`):
```typescript
export const extractEntitiesActivity = Activity.make({
  name: "extract-entities",
  input: Schema.Struct({
    text: Schema.String,
    ontologyId: Schema.String,
    config: ExtractionConfig
  }),
  output: Schema.Array(EntitySchema),
  error: Schema.String
})

// Activity implementation (separate from definition)
export const extractEntitiesHandler = extractEntitiesActivity.handler(
  (input) => Effect.gen(function* () {
    const extractor = yield* EntityExtractor
    const entities = yield* extractor.extract(input.text, input.ontologyId, input.config)
    return entities
  })
)
```

**Applicability**: Each stage of extraction pipeline in beep-effect.

---

## Pattern 7: Event Bus (Dual Implementation)

**Problem**: Provide both in-memory (dev) and durable (prod) event buses.

**effect-ontology Example** (`Service/EventBus.ts`):
```typescript
export class EventBusService extends Effect.Service<EventBusService>()(
  "EventBusService",
  {
    accessors: true,
    // Note: effect is deferred to allow layer selection
  }
) {
  // Memory implementation (dev)
  static Memory = Layer.succeed(EventBusService, {
    publish: (event) => Effect.gen(function* () {
      // In-memory queue
    }),
    subscribe: () => Stream.fromQueue(memoryQueue)
  })

  // SQL implementation (prod)
  static Sql = Layer.effect(EventBusService,
    Effect.gen(function* () {
      const journal = yield* SqlEventJournal
      return {
        publish: (event) => journal.append(event),
        subscribe: () => journal.changes
      }
    })
  )

  // Auto-select based on environment
  static Default = Layer.suspend(() =>
    Config.string("EVENT_BUS_MODE").pipe(
      Config.withDefault("memory"),
      Effect.map((mode) => mode === "sql" ? EventBusService.Sql : EventBusService.Memory),
      Effect.flatten
    )
  )
}
```

**Applicability**: EventBusService in beep-effect (if needed).

---

## Pattern 8: Entity Handler (Distributed Actor)

**Problem**: Handle distributed extraction requests with RPC interface.

**effect-ontology Example** (`Cluster/ExtractionEntityHandler.ts`):
```typescript
export const KnowledgeGraphExtractor = Entity.make("KnowledgeGraphExtractor", [
  ExtractFromTextRpc,
  GetCachedResultRpc,
  CancelExtractionRpc,
  GetExtractionStatusRpc
])

export const makeExtractionEntityHandler = Effect.gen(function* () {
  const cancelRegistry = yield* Ref.make(HashMap.empty<string, Deferred.Deferred<void>>())

  const handleExtractFromText = (envelope: Entity.Request<ExtractFromTextRpc>) =>
    Stream.unwrapScoped(
      Effect.gen(function* () {
        const cancelSignal = yield* Deferred.make<void>()
        yield* Ref.update(cancelRegistry, HashMap.set(envelope.payload.runId, cancelSignal))

        return yield* runExtraction(envelope.payload).pipe(
          Stream.interruptWhen(Deferred.await(cancelSignal)),
          Stream.ensuring(
            Ref.update(cancelRegistry, HashMap.remove(envelope.payload.runId))
          )
        )
      })
    )

  const handleCancelExtraction = (envelope: Entity.Request<CancelExtractionRpc>) =>
    Effect.gen(function* () {
      const registry = yield* Ref.get(cancelRegistry)
      const signal = HashMap.get(registry, envelope.payload.runId)
      if (Option.isSome(signal)) {
        yield* Deferred.succeed(signal.value, undefined)
        return true
      }
      return false
    })

  return KnowledgeGraphExtractor.handler({
    ExtractFromText: handleExtractFromText,
    GetCachedResult: handleGetCachedResult,
    CancelExtraction: handleCancelExtraction,
    GetExtractionStatus: handleGetExtractionStatus
  })
})

export const ExtractionEntityHandlerLayer =
  KnowledgeGraphExtractor.toLayer(makeExtractionEntityHandler.pipe(Effect.orDie))
```

**Applicability**: ExtractionEntityHandler in beep-effect.

---

## Pattern 9: Progress Event Schema

**Problem**: Define discriminated union for real-time progress updates.

**effect-ontology Example** (`Contract/ProgressStreaming.ts`):
```typescript
const BaseProgressEvent = Schema.Struct({
  eventId: Schema.String,
  runId: Schema.String,
  timestamp: Schema.DateTimeUtc,
  overallProgress: Schema.Number
})

export class ExtractionStartedEvent extends Schema.TaggedClass<ExtractionStartedEvent>()(
  "ExtractionStartedEvent",
  {
    ...BaseProgressEvent.fields,
    totalChunks: Schema.Number,
    textMetadata: TextMetadataSchema
  }
) {}

export class ChunkProcessingStartedEvent extends Schema.TaggedClass<ChunkProcessingStartedEvent>()(
  "ChunkProcessingStartedEvent",
  {
    ...BaseProgressEvent.fields,
    chunkIndex: Schema.Number,
    chunkText: Schema.String
  }
) {}

// ... 18 more event types

export const ProgressEvent = Schema.Union(
  ExtractionStartedEvent,
  ChunkProcessingStartedEvent,
  EntityFoundEvent,
  RelationFoundEvent,
  ExtractionCompleteEvent,
  ExtractionFailedEvent,
  ExtractionCancelledEvent,
  BackpressureWarningEvent,
  RecoverableErrorEvent,
  FatalErrorEvent,
  RateLimitedEvent,
  StageStartedEvent,
  StageProgressEvent,
  StageCompletedEvent,
  // ... etc
)
```

**Applicability**: Progress streaming contract in beep-effect.

---

## Pattern 10: Stream Cancellation

**Problem**: Allow graceful cancellation of long-running streams.

**effect-ontology Example**:
```typescript
// Using Deferred for cancellation signal
const runWithCancellation = <A, E, R>(
  stream: Stream.Stream<A, E, R>,
  cancellation: Deferred.Deferred<void>
): Stream.Stream<A, E, R> =>
  stream.pipe(
    Stream.interruptWhen(Deferred.await(cancellation)),
    Stream.ensuring(Effect.logInfo("Stream cancelled or completed"))
  )

// Usage
Effect.gen(function* () {
  const cancel = yield* Deferred.make<void>()

  // Start stream
  const fiber = yield* runWithCancellation(myStream, cancel).pipe(
    Stream.runDrain,
    Effect.fork
  )

  // Cancel after 30 seconds
  yield* Effect.sleep("30 seconds")
  yield* Deferred.succeed(cancel, undefined)

  // Wait for cleanup
  yield* Fiber.join(fiber)
})
```

**Applicability**: All long-running extractions in beep-effect.

---

## Pattern Summary

| Pattern | Category | Complexity | Priority |
|---------|----------|------------|----------|
| Service Definition | Foundation | Low | Must have |
| Layer Composition | Foundation | Medium | Must have |
| Circuit Breaker | Resilience | Medium | P1 |
| Backpressure Handler | Resilience | Medium | P2 |
| Workflow Definition | Durability | Medium | P0 |
| Durable Activity | Durability | Medium | P0 |
| Event Bus | Events | High | P2 |
| Entity Handler | Cluster | High | P1 |
| Progress Event Schema | Contracts | Medium | P1 |
| Stream Cancellation | Streams | Low | P1 |

---

## Notes

_Additional patterns and observations go here._
