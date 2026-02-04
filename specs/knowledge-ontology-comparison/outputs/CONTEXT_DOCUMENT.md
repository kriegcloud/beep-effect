# Implementation Context: Knowledge-Ontology Feature Integration

## Purpose

This document provides comprehensive context for future implementation specs that will port features from the `effect-ontology` reference implementation into the `knowledge-slice` of the beep-effect monorepo. Implementers should use this document to understand:

1. The architectural patterns established in effect-ontology
2. The current state of knowledge-slice implementation
3. Key decisions that must be preserved during porting
4. File mappings between reference and target codebases
5. Common pitfalls and anti-patterns to avoid

## Reference Implementation Overview

The `effect-ontology` project (`/tmp/effect-ontology`) is a standalone Effect-TS system for extracting structured knowledge graphs from unstructured text using ontology-guided LLM prompting. Key characteristics:

### Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Pure Domain Layer** | `Domain/` contains types, schemas, and errors with zero I/O |
| **Effect.Service Pattern** | All services use `Effect.Service<T>()()` with `accessors: true` |
| **Layer Bundles** | Pre-composed service groups for order-independent composition |
| **Typed Errors** | Every failure mode explicit via `Data.TaggedError` or `Schema.TaggedError` |
| **Durable Workflows** | `@effect/workflow` for crash-recoverable pipelines |

### Package Structure

```
packages/@core-v2/
  src/
    Domain/           # Pure types, schemas, errors (no I/O)
      Error/          # Typed errors per service domain
      Model/          # Domain models (Entity, EntityResolution, BatchWorkflow)
      Schema/         # API request/response schemas
      Rdf/            # RDF constants and IRI utilities
    Service/          # Effect.Service classes with .Default layers
      LlmControl/     # Token budget, stage timeout, rate limiting
    Workflow/         # Business logic orchestration
    Runtime/          # Layer composition, HTTP server
      Persistence/    # PostgreSQL workflow persistence
    Telemetry/        # OpenTelemetry integration
```

### Key Services

| Service | Purpose | Dependencies |
|---------|---------|--------------|
| `SparqlService` | SPARQL query execution via Oxigraph WASM | `RdfBuilder` |
| `Reasoner` | RDFS forward-chaining inference via N3.js | None |
| `ShaclService` | SHACL validation with policy-based control | `RdfBuilder`, `StorageService` |
| `RdfBuilder` | RDF parsing/serialization, graph construction | `ConfigService` |
| `EntityResolutionService` | Entity clustering with embedding similarity | `EmbeddingService` |
| `WorkflowOrchestrator` | Durable batch extraction workflows | Many |

---

## Current Implementation Overview

The `knowledge-slice` (`/packages/knowledge/`) is a vertical slice in the beep-effect monorepo following the pattern: `domain -> tables -> server -> client -> ui`.

### Package Structure

```
packages/knowledge/
  domain/            # Schema definitions, typed errors, value objects
    src/
      entities/      # Entity, Mention, Relation, Ontology, etc.
      errors/        # Extraction, Grounding, EntityResolution errors
      value-objects/ # Confidence, EvidenceSpan, ClassIri
  tables/            # Drizzle table definitions
    src/tables/      # entity, mention, relation, embedding, etc.
  server/            # Effect services
    src/
      Extraction/    # ExtractionPipeline, MentionExtractor, etc.
      EntityResolution/  # Clustering, canonical selection, owl:sameAs
      GraphRAG/      # RRF scoring, context formatting
      Ontology/      # OntologyService, OntologyParser
      Embedding/     # EmbeddingService, providers
      Nlp/           # Text chunking, NlpService
      Grounding/     # GroundingService, ConfidenceFilter
      db/            # Repositories, database context
  client/            # RPC client contracts
  ui/                # React components
```

### Existing Services

| Service | File | Status |
|---------|------|--------|
| `ExtractionPipeline` | `server/src/Extraction/ExtractionPipeline.ts` | Implemented |
| `EntityResolutionService` | `server/src/EntityResolution/EntityResolutionService.ts` | Implemented |
| `GraphRAGService` | `server/src/GraphRAG/GraphRAGService.ts` | Implemented |
| `OntologyService` | `server/src/Ontology/OntologyService.ts` | Implemented |
| `EmbeddingService` | `server/src/Embedding/EmbeddingService.ts` | Implemented |
| `NlpService` | `server/src/Nlp/NlpService.ts` | Implemented |

### Current Strengths

1. **Clean Effect Service architecture** - All services follow `Effect.Service<T>()()` pattern
2. **Comprehensive entity resolution** - Clustering, canonical selection, owl:sameAs link generation
3. **Working GraphRAG with RRF scoring** - k=60 from Cormack et al., 2009
4. **PostgreSQL + JSONB flexibility** - Drizzle ORM with typed tables
5. **Branded EntityIds throughout** - `@beep/shared-domain` provides `KnowledgeEntityIds`

---

## Architectural Decisions to Preserve

### 1. Two-Tier Entity Resolution

**Pattern**: Separates immutable evidence from mutable aggregation.

**Why**:
- `MentionRecord` nodes are never modified after creation, preserving full provenance
- `ResolvedEntity` nodes aggregate clusters and can be re-computed
- Enables audit trail and incremental re-resolution without losing original evidence

**Reference Implementation** (`effect-ontology/Domain/Model/EntityResolution.ts`):

```typescript
import * as S from "effect/Schema";

/**
 * MentionRecord - Evidence record preserving original extraction
 * INVARIANT: Never modified after creation.
 */
export class MentionRecord extends S.Class<MentionRecord>("MentionRecord")({
  _tag: S.Literal("MentionRecord"),
  id: EntityIdSchema,
  mention: S.String,
  types: S.Array(S.String),
  attributes: AttributesSchema,
  chunkIndex: S.Number,  // Provenance tracking
  confidence: OptionalConfidenceSchema
}) {}

/**
 * ResolvedEntity - Canonical entity aggregating multiple MentionRecords
 */
export class ResolvedEntity extends S.Class<ResolvedEntity>("ResolvedEntity")({
  _tag: S.Literal("ResolvedEntity"),
  canonicalId: EntityIdSchema,
  mention: S.String,  // Best mention from cluster
  types: S.Array(S.String),  // Merged types via frequency voting
  attributes: AttributesSchema,
  externalIds: S.optional(S.Record({ key: S.String, value: S.String }))
}) {}
```

**Current knowledge-slice has**:
- `Mention.Model` in `domain/src/entities/mention/mention.model.ts`
- `Entity.Model` in `domain/src/entities/entity/entity.model.ts`
- `EntityCluster.Model` in `domain/src/entities/entity-cluster/entity-cluster.model.ts`

**Gap**: The current implementation merges mentions into entities but lacks the explicit two-tier graph structure with typed edges (`ResolutionEdge`, `RelationEdge`).

### 2. Re-SHACL Pattern

**Pattern**: Only compute inferences needed for validation, not full materialization.

**Why**:
- Full RDFS/OWL materialization is expensive (O(n^2) or worse)
- Most SHACL shapes only need `rdfs:subClassOf` for type inheritance
- `reasonForValidation()` targets specific inference rules

**Reference Implementation** (`effect-ontology/Service/Reasoner.ts`):

```typescript
/**
 * Targeted reasoning for SHACL validation
 * Only applies rules relevant to the shapes being validated.
 */
reasonForValidation: (store: RdfStore): Effect.Effect<ReasoningResult, ReasoningError | RuleParseError> =>
  Effect.gen(function*() {
    yield* Effect.logDebug("Reasoner.reasonForValidation - applying subclass inference")
    // For validation, we primarily need type inference via subClassOf
    return yield* reason(store, ReasoningConfig.subclassOnly())
  })
```

**RDFS Rules Applied** (N3 notation):

```n3
# rdfs:subClassOf transitivity
{ ?s rdf:type ?c . ?c rdfs:subClassOf ?c2 . } => { ?s rdf:type ?c2 . } .

# rdfs:subClassOf chain
{ ?c1 rdfs:subClassOf ?c2 . ?c2 rdfs:subClassOf ?c3 . } => { ?c1 rdfs:subClassOf ?c3 . } .
```

**Current knowledge-slice**: Does not have RDF reasoning capabilities. OntologyService parses Turtle but doesn't apply inference rules.

### 3. RRF Scoring (k=60)

**Pattern**: Reciprocal Rank Fusion for combining multiple ranking signals.

**Why**:
- Formula: `score = sum(1/(rank_i + k))` for all rankings
- k=60 is research-optimal (Cormack et al., 2009)
- Avoids score normalization issues when combining embedding similarity + graph distance
- Higher k values favor lower ranks

**Current knowledge-slice** (`server/src/GraphRAG/RrfScorer.ts`):

```typescript
export const RRF_K = 60;

export const rrfComponent = (rank: number, k = RRF_K): number => {
  return 1 / (k + rank);
};

export const fuseRankings = <T extends string>(
  rankedLists: ReadonlyArray<ReadonlyArray<T>>,
  k = RRF_K
): ReadonlyArray<RankedItem<T>> => {
  // Accumulate scores by ID
  const scoreMap = MutableHashMap.empty<T, number>();
  for (const rankedList of rankedLists) {
    A.forEach(rankedList, (id, i) => {
      const rank = i + 1; // 1-indexed
      const component = rrfComponent(rank, k);
      const currentScore = O.getOrElse(MutableHashMap.get(scoreMap, id), thunkZero);
      MutableHashMap.set(scoreMap, id, currentScore + component);
    });
  }
  // ... sort by descending score
};
```

**Status**: Already implemented correctly. Preserve this implementation.

### 4. Durable Activities via @effect/workflow

**Pattern**: Crash-recoverable workflow execution with journaled activities.

**Why**:
- Activities are journaled to PostgreSQL
- Deterministic replay on failure
- Supports both fire-and-forget and blocking modes
- Built-in suspend-on-failure with retry schedule

**Reference Implementation** (`effect-ontology/Service/WorkflowOrchestrator.ts`):

```typescript
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (payload: BatchWorkflowPayloadType) => {
    const hash = Hash.string(JSON.stringify({
      ontologyVersion: payload.ontologyVersion,
      // ... deterministic key components
    }))
    return \`\${payload.batchId}-\${Math.abs(hash).toString(16).slice(0, 8)}\`
  },
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered
  )
})
```

**Current knowledge-slice**: `ExtractionPipeline` is not durable. A failure loses all progress.

### 5. Batch State Machine

**Pattern**: Real-time progress visibility via state transitions and PubSub.

**Why**:
- Enables SSE streaming of progress to clients
- Clear state transitions: `PENDING -> EXTRACTING -> RESOLVING -> VALIDATING -> INGESTING -> COMPLETED`
- Per-document status tracking within batches

**Reference Implementation** (`effect-ontology/Domain/Model/BatchWorkflow.ts`):

```typescript
export const BatchState = Schema.Union(
  Schema.TaggedStruct("Pending", { ... }),
  Schema.TaggedStruct("Preprocessing", { ... }),
  Schema.TaggedStruct("Extracting", { documentStatuses: ... }),
  Schema.TaggedStruct("Resolving", { ... }),
  Schema.TaggedStruct("Validating", { ... }),
  Schema.TaggedStruct("Ingesting", { ... }),
  Schema.TaggedStruct("Complete", { ... }),
  Schema.TaggedStruct("Failed", { failedInStage: ... })
)
```

**Current knowledge-slice**: Has `Extraction.Model` but lacks the full state machine pattern.

### 6. Oxigraph WASM for SPARQL

**Pattern**: Full SPARQL 1.1 query execution in-process.

**Why**:
- No external triplestore dependency
- Supports SELECT, ASK, CONSTRUCT, DESCRIBE
- Graceful fallback when query fails (return all triples)
- Works in both Node.js and browser (WASM)

**Reference Implementation** (`effect-ontology/Service/Sparql.ts`):

```typescript
export class SparqlService extends Effect.Service<SparqlService>()("SparqlService", {
  effect: Effect.gen(function*() {
    const rdfBuilder = yield* RdfBuilder

    const execute = (store: RdfStore, query: string) =>
      Effect.gen(function*() {
        // 1. Serialize N3 store to Turtle
        const turtle = yield* rdfBuilder.toTurtle(store)

        // 2. Create Oxigraph store and load data
        const oxStore = new oxigraph.Store()
        oxStore.load(turtle, { format: "text/turtle", base_iri: "http://example.org/" })

        // 3. Execute SPARQL query
        const result = yield* Effect.try({ try: () => oxStore.query(query), ... })

        // 4. Process result based on query type (SELECT/ASK/CONSTRUCT)
        // ...
      })

    return { execute, executeSelect, executeAsk }
  }),
  dependencies: [RdfBuilder.Default],
  accessors: true
}) {}
```

**Current knowledge-slice**: Does not have SPARQL execution capability. OntologyService uses direct N3 store traversal.

---

## Implementation Patterns to Follow

### Service Definition Pattern

All services MUST use the `Effect.Service` pattern with `accessors: true`:

```typescript
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class MyService extends Effect.Service<MyService>()("@beep/knowledge-server/MyService", {
  accessors: true,
  effect: Effect.gen(function* () {
    const dep = yield* SomeDependency;

    return {
      methodA: (arg: string) => Effect.gen(function* () {
        yield* Effect.logInfo("MyService.methodA", { arg });
        // ... implementation
      }),

      methodB: (arg: number) => Effect.gen(function* () {
        // ... implementation
      }).pipe(
        Effect.withSpan("MyService.methodB", {
          captureStackTrace: false,
          attributes: { arg }
        })
      ),
    };
  }),
}) {}

// Live layer with dependencies
export const MyServiceLive = MyService.Default.pipe(
  Layer.provide(SomeDependency.Default),
);
```

### Layer Composition Pattern

Use `Layer.provideMerge()` for order-independent composition:

```typescript
// Core dependencies (foundation)
const CoreDependenciesLayer = ConfigServiceDefault;

// Service bundles with dependencies pre-provided
const LlmControlBundle = Layer.mergeAll(
  TokenBudgetServiceLive,
  StageTimeoutServiceLive
);

// LLM Extraction services
const LlmExtractionBundle = Layer.mergeAll(
  EntityExtractor.Default,
  RelationExtractor.Default
).pipe(
  Layer.provideMerge(LlmControlBundle),
  Layer.provideMerge(makeLanguageModelLayer),
  Layer.provideMerge(CoreDependenciesLayer)
);

// Complete activity dependencies
export const ActivityDependenciesLayer = Layer.mergeAll(
  StorageBundle,
  CoreDependenciesLayer,
  LlmExtractionBundle,
  OntologyBundle,
  EmbeddingBundle,
  EntityResolutionBundle,
);
```

### Error Handling Pattern

All errors MUST use `S.TaggedError` for new code:

```typescript
import * as S from "effect/Schema";

// PREFERRED - Schema-based tagged error (for serialization, RPC, and logging)
export class ReasoningError extends S.TaggedError<ReasoningError>()("ReasoningError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

// PREFERRED - Another Schema-based tagged error example
export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>()("SparqlExecutionError", {
  message: S.String,
  query: S.String,
  cause: S.optional(S.Unknown),
}) {}
```

**Note**: ALWAYS prefer `S.TaggedError` (from `effect/Schema`) for new errors. Use `Data.TaggedError` (from `effect/Data`) only when interoperating with legacy code that requires it. `S.TaggedError` provides serialization support needed for RPC boundaries and structured logging.

### Error Serialization

Use a helper for error serialization that handles multiple error types. Note that error serialization utilities are an exception where `typeof` and `instanceof` checks are acceptable since we're handling arbitrary unknown values:

```typescript
import * as P from "effect/Predicate";
import * as Match from "effect/Match";

/**
 * Serialize an unknown error to a string message.
 *
 * NOTE: This utility is an exception to the "no typeof/instanceof" rule
 * because it must handle arbitrary unknown values at system boundaries.
 * Prefer Effect predicates where possible.
 */
const serializeError = (error: unknown): string =>
  Match.value(error).pipe(
    // Handle standard Error instances
    Match.when(P.isError, (e) => e.message),

    // Handle objects with _message (Schema ParseError) or message properties
    Match.when(
      (e): e is { _message: string } =>
        P.isRecord(e) && "_message" in e && P.isString(e._message),
      (e) => e._message
    ),
    Match.when(
      (e): e is { message: string } =>
        P.isRecord(e) && "message" in e && P.isString(e.message),
      (e) => e.message
    ),

    // Fallback: try JSON serialization, then String coercion
    Match.orElse((e) => {
      try {
        return JSON.stringify(e, null, 2);
      } catch {
        return String(e);
      }
    })
  );
```

### Testing Pattern

Use `@beep/testkit` for all Effect-based tests:

```typescript
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

// Unit test
effect("computes result", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);

// Integration test with shared Layer
layer(TestLayer, { timeout: Duration.seconds(60) })("suite name", (it) => {
  it.effect("test name", () =>
    Effect.gen(function* () {
      const repo = yield* MemberRepo;
      const result = yield* repo.findAll();
      strictEqual(result.length, 0);
    })
  );
});
```

---

## File Reference Map

### Reference Files to Copy Patterns From

| Reference File | Purpose | Port To |
|----------------|---------|---------|
| `effect-ontology/Service/Sparql.ts` | SPARQL execution via Oxigraph | `packages/knowledge/server/src/Sparql/SparqlService.ts` |
| `effect-ontology/Service/Reasoner.ts` | N3 forward-chaining inference | `packages/knowledge/server/src/Reasoning/ReasonerService.ts` |
| `effect-ontology/Service/Shacl.ts` | SHACL validation | `packages/knowledge/server/src/Validation/ShaclService.ts` |
| `effect-ontology/Service/Rdf.ts` | RDF abstraction layer | `packages/knowledge/server/src/Rdf/RdfBuilder.ts` |
| `effect-ontology/Domain/Model/EntityResolution.ts` | Two-tier entity model | Enhance `packages/knowledge/domain/src/entities/` |
| `effect-ontology/Service/WorkflowOrchestrator.ts` | Durable workflows | `packages/knowledge/server/src/Workflow/` |
| `effect-ontology/Runtime/WorkflowLayers.ts` | Layer composition | `packages/knowledge/server/src/Runtime/Layers.ts` |
| `effect-ontology/Domain/Rdf/Constants.ts` | RDF vocabulary constants | `packages/knowledge/domain/src/rdf/Constants.ts` |

### Target Files to Modify

| Target File | Modification |
|-------------|--------------|
| `packages/knowledge/server/src/Ontology/OntologyService.ts` | Add RDF store operations |
| `packages/knowledge/server/src/EntityResolution/` | Add two-tier evidence layer |
| `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts` | Add SPARQL-based grounding |
| `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` | Add durability via workflow |
| `packages/knowledge/tables/src/` | Add workflow state tables |
| `packages/knowledge/domain/src/` | Add EntityResolution graph types |

---

## Vocabulary & Namespace Reference

### Standard RDF Namespaces

```typescript
export const RDF = {
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  Property: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
  // ...
};

export const RDFS = {
  Class: "http://www.w3.org/2000/01/rdf-schema#Class",
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
  domain: "http://www.w3.org/2000/01/rdf-schema#domain",
  range: "http://www.w3.org/2000/01/rdf-schema#range",
  label: "http://www.w3.org/2000/01/rdf-schema#label",
  // ...
};

export const OWL = {
  Class: "http://www.w3.org/2002/07/owl#Class",
  sameAs: "http://www.w3.org/2002/07/owl#sameAs",
  ObjectProperty: "http://www.w3.org/2002/07/owl#ObjectProperty",
  DatatypeProperty: "http://www.w3.org/2002/07/owl#DatatypeProperty",
  // ...
};

export const XSD = {
  string: "http://www.w3.org/2001/XMLSchema#string",
  integer: "http://www.w3.org/2001/XMLSchema#integer",
  dateTime: "http://www.w3.org/2001/XMLSchema#dateTime",
  double: "http://www.w3.org/2001/XMLSchema#double",
  // ...
};

export const PROV = {
  Entity: "http://www.w3.org/ns/prov#Entity",
  Activity: "http://www.w3.org/ns/prov#Activity",
  wasGeneratedBy: "http://www.w3.org/ns/prov#wasGeneratedBy",
  generatedAtTime: "http://www.w3.org/ns/prov#generatedAtTime",
  // ...
};

export const DCTERMS = {
  title: "http://purl.org/dc/terms/title",
  source: "http://purl.org/dc/terms/source",
  // ...
};

export const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  altLabel: "http://www.w3.org/2004/02/skos/core#altLabel",
  broader: "http://www.w3.org/2004/02/skos/core#broader",
  narrower: "http://www.w3.org/2004/02/skos/core#narrower",
  // ...
};
```

### Custom Namespaces (effect-ontology specific)

```typescript
// Core ontology
export const CORE = {
  namespace: "http://effect-ontology.dev/core#",
  TrackedEntity: "http://effect-ontology.dev/core#TrackedEntity",
  Mention: "http://effect-ontology.dev/core#Mention",
  hasEvidentialMention: "http://effect-ontology.dev/core#hasEvidentialMention",
  mentions: "http://effect-ontology.dev/core#mentions",
  // ...
};

// Claims vocabulary (Wikidata-style)
export const CLAIMS = {
  namespace: "http://effect-ontology.dev/claims#",
  Claim: "http://effect-ontology.dev/claims#Claim",
  confidence: "http://effect-ontology.dev/claims#confidence",
  statedIn: "http://effect-ontology.dev/claims#statedIn",
  evidenceText: "http://effect-ontology.dev/claims#evidenceText",
  startOffset: "http://effect-ontology.dev/claims#startOffset",
  endOffset: "http://effect-ontology.dev/claims#endOffset",
  // ...
};

// Extraction metadata
export const EXTR = {
  confidence: "http://example.org/kg/confidence",
  usedModel: "http://example.org/kg/usedModel",
  ontologyVersion: "http://example.org/kg/ontologyVersion",
  // ...
};
```

---

## Integration Notes

### How New Components Integrate with Existing knowledge-slice

1. **RdfBuilder Service** *(addresses Gap #7, #12 from GAP_ANALYSIS)*
   - Provides `parseTurtle()`, `toTurtle()`, `createStore()` operations
   - `OntologyService` will use RdfBuilder instead of direct N3 calls
   - All RDF operations go through this abstraction

2. **SparqlService** *(addresses Gap #2 from GAP_ANALYSIS)*
   - Uses Oxigraph WASM for in-process SPARQL
   - `GraphRAGService` can use SPARQL for complex graph queries
   - Fallback to direct N3 traversal when SPARQL fails

3. **ReasonerService** *(addresses Gap #3 from GAP_ANALYSIS)*
   - `ShaclService.validateWithPolicy()` calls `Reasoner.reasonForValidation()` first
   - Applies only necessary inference rules (rdfs:subClassOf)
   - Non-mutating `reasonCopy()` for validation

4. **Durable ExtractionWorkflow** *(addresses Gap #1, #4, #5 from GAP_ANALYSIS)*
   - Replace `ExtractionPipeline.run()` with durable workflow
   - Activities for: preprocessing, extraction, resolution, validation, ingestion
   - State stored in PostgreSQL via `@effect/workflow`

5. **Two-Tier EntityResolution** *(addresses Gap #9, #10, #11 from GAP_ANALYSIS)*
   - Add `MentionRecord` and `ResolvedEntity` to domain
   - Add `ResolutionEdge` and `RelationEdge` types
   - Modify `EntityResolutionService` to produce graph structure

### Database Schema Extensions

New tables needed:

```sql
-- Workflow state persistence
CREATE TABLE knowledge_workflow_state (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity journal for durability
CREATE TABLE knowledge_activity_journal (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL REFERENCES knowledge_workflow_state(id),
  activity_name TEXT NOT NULL,
  input JSONB,
  output JSONB,
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Two-tier entity resolution graph
CREATE TABLE knowledge_mention_record (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  mention TEXT NOT NULL,
  types TEXT[] NOT NULL,
  attributes JSONB DEFAULT '{}',
  chunk_index INTEGER NOT NULL,
  confidence DECIMAL(4,3),
  organization_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE knowledge_resolution_edge (
  id TEXT PRIMARY KEY,
  mention_record_id TEXT NOT NULL REFERENCES knowledge_mention_record(id),
  resolved_entity_id TEXT NOT NULL,
  confidence DECIMAL(4,3) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('exact', 'similarity', 'containment', 'neighbor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Common Pitfalls to Avoid

### 1. Direct N3 Usage Outside RdfBuilder

**Wrong**:
```typescript
import * as N3 from "n3";
const store = new N3.Store();
store.addQuad(N3.DataFactory.quad(...));
```

**Correct**:
```typescript
const rdfBuilder = yield* RdfBuilder;
const store = yield* rdfBuilder.createStore;
yield* rdfBuilder.addEntities(store, entities, { graphUri });
```

### 2. Forgetting `accessors: true` in Services

**Wrong**:
```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () { ... }),
}) {}

// Later: const svc = yield* MyService; // Works
// But: MyService.methodA(...) // Doesn't work!
```

**Correct**:
```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  accessors: true,  // <-- Required for static accessors
  effect: Effect.gen(function* () { ... }),
}) {}

// Now both work:
const svc = yield* MyService;
MyService.methodA(...);  // Static accessor
```

### 3. Using Native JavaScript Collections

**Wrong**:
```typescript
const arr = entities.map(e => e.id);
const filtered = arr.filter(x => x > 0);
```

**Correct**:
```typescript
import * as A from "effect/Array";
const arr = A.map(entities, e => e.id);
const filtered = A.filter(arr, x => x > 0);
```

### 4. Missing Span Instrumentation

**Wrong**:
```typescript
const myMethod = (arg: string) => Effect.gen(function* () {
  // ... implementation without tracing
});
```

**Correct**:
```typescript
const myMethod = (arg: string) => Effect.gen(function* () {
  // ... implementation
}).pipe(
  Effect.withSpan("MyService.myMethod", {
    captureStackTrace: false,
    attributes: { arg }
  })
);
```

### 5. Throwing Errors Instead of Effect.fail

**Wrong**:
```typescript
if (!isValid) {
  throw new Error("Invalid input");
}
```

**Correct**:
```typescript
if (!isValid) {
  return yield* Effect.fail(new ValidationError({ message: "Invalid input" }));
}
```

### 6. Using `any` or Type Assertions

**Wrong**:
```typescript
const result = someFunction() as any;
const typed = result as MyType;
```

**Correct**:
```typescript
const decoded = yield* S.decodeUnknown(MySchema)(result);
// Or use proper Effect error handling
```

### 7. Forgetting to Provide Dependencies

**Wrong**:
```typescript
const layer = MyService.Default;  // Missing dependency layers
```

**Correct**:
```typescript
const layer = MyService.Default.pipe(
  Layer.provide(DependencyA.Default),
  Layer.provide(DependencyB.Default),
);
```

### 8. Mixing Layer.provide and Layer.provideMerge Incorrectly

**Wrong** (order-dependent when it shouldn't be):
```typescript
const bundle = ServiceA.Default.pipe(
  Layer.provide(ServiceB.Default),
  Layer.provide(ServiceC.Default),  // ServiceC can't see ServiceB
);
```

**Correct** (order-independent):
```typescript
const bundle = ServiceA.Default.pipe(
  Layer.provideMerge(ServiceB.Default),
  Layer.provideMerge(ServiceC.Default),  // All services visible to each other
);
```

---

## Summary

This context document establishes the patterns, decisions, and integration points for porting effect-ontology features into the knowledge-slice. Key takeaways:

1. **Preserve** the two-tier entity resolution model for provenance
2. **Use** Re-SHACL pattern for efficient validation
3. **Keep** RRF scoring with k=60 (already implemented)
4. **Add** durable workflows via @effect/workflow
5. **Implement** batch state machine for progress tracking
6. **Integrate** Oxigraph WASM for SPARQL capabilities
7. **Follow** Effect.Service pattern with accessors and proper Layer composition
8. **Avoid** the common pitfalls listed above

Future implementation specs should reference this document and the specific file mappings when creating detailed implementation plans.
