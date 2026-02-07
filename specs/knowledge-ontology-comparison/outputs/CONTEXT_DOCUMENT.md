# Implementation Context: Knowledge-Ontology Feature Integration

## Purpose

This document provides comprehensive context for future implementation specs that will close remaining gaps between the `effect-ontology` reference implementation and the `knowledge-slice` of the beep-effect monorepo. Implementers should use this document to understand:

1. The architectural patterns established in effect-ontology
2. The current state of knowledge-slice implementation (**65 FULL + 19 PARTIAL + 37 GAP** out of 121 capabilities)
3. Key decisions that must be preserved during future work
4. File mappings between reference and target codebases
5. Common pitfalls and anti-patterns to avoid
6. What is already implemented and should NOT be re-implemented

**Important**: This document was corrected on 2026-02-05 to reflect the actual state of the knowledge-slice. The previous version contained significant factual errors, incorrectly claiming that SPARQL, RDF reasoning, and several GraphRAG subsystems were unimplemented. They are fully implemented. The comparison matrix shows the knowledge-slice is **69% complete** (65 FULL + 19 PARTIAL = 84 of 121 capabilities at least partially implemented), with only 20 meaningful remaining gaps (the other 17 GAPs are low-priority P3 items or architectural differences rather than functional deficits).

---

## Reference Implementation Overview

The `effect-ontology` project (`/tmp/effect-ontology`) is a standalone Effect-TS system for extracting structured knowledge graphs from unstructured text using ontology-guided LLM prompting. Key characteristics:

### Architecture Principles

| Principle | Description |
|-----------|-------------|
| **Pure Domain Layer** | `Domain/` contains types, schemas, and errors with zero I/O |
| **Effect.Service Pattern** | All services use `Effect.Service<T>()()` or `Context.Tag` with typed shapes |
| **Layer Bundles** | Pre-composed service groups for order-independent composition |
| **Typed Errors** | Every failure mode explicit via `S.TaggedError` |
| **Durable Workflows** | `@effect/workflow` for crash-recoverable pipelines |

### Reference Package Structure

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

### Reference Key Services

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

The `knowledge-slice` (`/packages/knowledge/`) is a vertical slice in the beep-effect monorepo following the pattern: `domain -> tables -> server -> client -> ui`. Out of 121 capabilities analyzed in the comparison matrix, **65 are FULLY implemented**, **19 are PARTIALLY implemented**, and **37 remain as gaps** (of which only 20 are meaningful -- the rest are P3 future enhancements or architectural differences).

### Package Structure (Verified)

```
packages/knowledge/
  domain/                   # Schema definitions, typed errors, value objects
    src/
      entities/             # 12 entity models
        Entity/             # Entity.model.ts
        Mention/            # Mention.model.ts
        Relation/           # Relation.model.ts
        Ontology/           # Ontology.model.ts
        ClassDefinition/    # ClassDefinition.model.ts
        PropertyDefinition/ # PropertyDefinition.model.ts
        Embedding/          # Embedding.model.ts
        EntityCluster/      # EntityCluster.model.ts
        MentionRecord/      # MentionRecord.model.ts
        Extraction/         # Extraction.model.ts
        MergeHistory/       # MergeHistory.model.ts
        SameAsLink/         # SameAsLink.model.ts
      errors/               # 14 error files (extraction, grounding, graphrag, sparql,
                            #   reasoning, rdf, entity, entity-resolution, ontology,
                            #   relation, cluster, registry, split, merge)
      value-objects/
        rdf/                # Quad, QuadPattern, RdfFormat, SparqlBindings
        reasoning/          # InferenceResult, ReasoningProfile, ReasoningConfig
        sparql/             # SparqlQuery
        *.value.ts          # evidence-span, class-iri, attributes, entity-candidate,
                            #   merge-params, count-result, extraction-config,
                            #   relation-direction
      rpc/                  # RPC contract schemas
        Entity/             # Count, Create, Delete, Get, List, Search, Update
        GraphRag/           # query, queryFromSeeds
        Extraction/         # Extract, Cancel, GetStatus, List
        Ontology/           # Create, Delete, Get, GetClasses, GetProperties, List, Update
        Relation/           # Count, Create, Delete, Get, ListByEntity, ListByPredicate
      services/             # Service interfaces (Context.Tag definitions)
        EntityRegistry.service.ts
        MergeHistory.service.ts
        Split.service.ts
        IncrementalClusterer.service.ts
      projections/
        GraphRagQueryResult.ts

  tables/                   # Drizzle table definitions
    src/
      tables/               # 12 table files
        entity.table.ts
        mention.table.ts
        relation.table.ts
        ontology.table.ts
        class-definition.table.ts
        property-definition.table.ts
        embedding.table.ts
        entity-cluster.table.ts
        mention-record.table.ts
        extraction.table.ts
        merge-history.table.ts
        same-as-link.table.ts
      _check.ts             # Domain <-> table alignment check
      relations.ts           # Drizzle table relations
      schema.ts              # Schema exports

  server/                   # Effect services
    src/
      Extraction/           # LLM-based knowledge extraction pipeline
        ExtractionPipeline.ts
        MentionExtractor.ts
        EntityExtractor.ts
        RelationExtractor.ts
        GraphAssembler.ts
        schemas/            # entity-output, mention-output, relation-output

      EntityResolution/     # Clustering, canonical selection, owl:sameAs
        EntityResolutionService.ts
        EntityClusterer.ts
        CanonicalSelector.ts
        IncrementalClustererLive.ts
        EntityRegistry.ts
        BloomFilter.ts
        SplitService.ts
        SameAsLinker.ts
        MergeHistoryLive.ts

      GraphRAG/             # Graph-augmented retrieval + grounded generation
        GraphRAGService.ts
        RrfScorer.ts
        ConfidenceScorer.ts
        CitationParser.ts
        CitationValidator.ts
        GroundedAnswerGenerator.ts
        PromptTemplates.ts
        ReasoningTraceFormatter.ts
        ContextFormatter.ts
        AnswerSchemas.ts

      Sparql/               # Custom SPARQL engine (sparqljs + N3.Store)
        SparqlService.ts
        SparqlParser.ts
        QueryExecutor.ts
        FilterEvaluator.ts
        SparqlModels.ts

      Rdf/                  # RDF triple store and serialization
        RdfStoreService.ts
        Serializer.ts
        RdfBuilder.ts

      Reasoning/            # Forward-chaining inference engine
        ForwardChainer.ts
        ReasonerService.ts
        RdfsRules.ts

      Ontology/             # Ontology parsing and introspection
        OntologyService.ts
        OntologyParser.ts
        OntologyCache.ts
        constants.ts

      Embedding/            # Vector embedding generation
        EmbeddingService.ts
        EmbeddingProvider.ts
        providers/
          OpenAiLayer.ts
          MockProvider.ts

      Nlp/                  # Text chunking
        NlpService.ts
        TextChunk.ts

      Grounding/            # Graph-based evidence grounding
        GroundingService.ts
        ConfidenceFilter.ts

      Ai/                   # AI prompt templates
        PromptTemplates.ts

      Runtime/              # LLM layer composition
        LlmLayers.ts

      db/                   # Database layer
        Db/                 # Database context
        repos/              # 11 repositories
          Entity.repo.ts
          Relation.repo.ts
          Embedding.repo.ts
          Ontology.repo.ts
          ClassDefinition.repo.ts
          PropertyDefinition.repo.ts
          EntityCluster.repo.ts
          MentionRecord.repo.ts
          MergeHistory.repo.ts
          SameAsLink.repo.ts
          _common.ts
        repositories.ts

      rpc/v1/               # RPC endpoint handlers
        entity/             # count, get, list
        graphrag/           # query
        relation/           # via _rpcs

      adapters/
        GmailExtractionAdapter.ts

      utils/
        formatting.ts
        vector.ts

  client/                   # RPC client contracts
  ui/                       # React components
```

### Existing Services (Complete Inventory)

| Service | File | Status | Notes |
|---------|------|--------|-------|
| `ExtractionPipeline` | `Extraction/ExtractionPipeline.ts` | Implemented | 6-stage pipeline (chunk, mentions, entities, relations, assemble, persist) |
| `MentionExtractor` | `Extraction/MentionExtractor.ts` | Implemented | LLM-based mention extraction |
| `EntityExtractor` | `Extraction/EntityExtractor.ts` | Implemented | LLM entity extraction |
| `RelationExtractor` | `Extraction/RelationExtractor.ts` | Implemented | LLM relation extraction |
| `GraphAssembler` | `Extraction/GraphAssembler.ts` | Implemented | Monoid-based parallel graph merging |
| `EntityResolutionService` | `EntityResolution/EntityResolutionService.ts` | Implemented | Main orchestrator for entity resolution |
| `EntityClusterer` | `EntityResolution/EntityClusterer.ts` | Implemented | Agglomerative clustering |
| `CanonicalSelector` | `EntityResolution/CanonicalSelector.ts` | Implemented | Best canonical selection for cluster |
| `IncrementalClusterer` | `EntityResolution/IncrementalClustererLive.ts` | Implemented | Incremental clustering across batches |
| `EntityRegistry` | `EntityResolution/EntityRegistry.ts` | Implemented | Cross-batch registry with BloomFilter |
| `BloomFilter` | `EntityResolution/BloomFilter.ts` | Implemented | Probabilistic pre-screening |
| `SplitService` | `EntityResolution/SplitService.ts` | Implemented | Split/unmerge entities |
| `SameAsLinker` | `EntityResolution/SameAsLinker.ts` | Implemented | owl:sameAs link generation |
| `MergeHistoryLive` | `EntityResolution/MergeHistoryLive.ts` | Implemented | Merge audit trail |
| `GraphRAGService` | `GraphRAG/GraphRAGService.ts` | Implemented | Main GraphRAG orchestrator |
| `RrfScorer` | `GraphRAG/RrfScorer.ts` | Implemented | Reciprocal Rank Fusion (k=60) |
| `ConfidenceScorer` | `GraphRAG/ConfidenceScorer.ts` | Implemented | Multi-signal confidence scoring |
| `CitationParser` | `GraphRAG/CitationParser.ts` | Implemented | Extract citations from generated text |
| `CitationValidator` | `GraphRAG/CitationValidator.ts` | Implemented | SPARQL ASK-based citation validation + reasoning inference |
| `GroundedAnswerGenerator` | `GraphRAG/GroundedAnswerGenerator.ts` | Implemented | @effect/ai LanguageModel-based generation |
| `ReasoningTraceFormatter` | `GraphRAG/ReasoningTraceFormatter.ts` | Implemented | Step-by-step inference chain formatting |
| `ContextFormatter` | `GraphRAG/ContextFormatter.ts` | Implemented | Format graph context for prompts |
| `SparqlService` | `Sparql/SparqlService.ts` | Implemented | SELECT, CONSTRUCT, ASK via sparqljs + N3.Store |
| `SparqlParser` | `Sparql/SparqlParser.ts` | Implemented | Parse SPARQL strings via sparqljs library |
| `QueryExecutor` | `Sparql/QueryExecutor.ts` | Implemented | Execute parsed queries against N3.Store backend |
| `FilterEvaluator` | `Sparql/FilterEvaluator.ts` | Implemented | Evaluate SPARQL FILTER expressions |
| `RdfStore` | `Rdf/RdfStoreService.ts` | Implemented | N3.Store wrapper (addQuads, match, remove) |
| `Serializer` | `Rdf/Serializer.ts` | Implemented | Turtle/N-Triples serialization via N3.Writer |
| `RdfBuilder` | `Rdf/RdfBuilder.ts` | Implemented | Builder-pattern RDF graph construction |
| `ForwardChainer` | `Reasoning/ForwardChainer.ts` | Implemented | Iterative fixed-point forward chaining |
| `ReasonerService` | `Reasoning/ReasonerService.ts` | Implemented | Inference + materialize with configurable depth/max |
| `RdfsRules` | `Reasoning/RdfsRules.ts` | Implemented | RDFS rules: rdfs2, 3, 5, 7, 9, 11 |
| `OntologyService` | `Ontology/OntologyService.ts` | Implemented | Turtle parsing, class/property introspection, hierarchy |
| `OntologyParser` | `Ontology/OntologyParser.ts` | Implemented | Parse ontology Turtle into structured data |
| `OntologyCache` | `Ontology/OntologyCache.ts` | Implemented | Caching layer |
| `EmbeddingService` | `Embedding/EmbeddingService.ts` | Implemented | Vector embedding generation |
| `NlpService` | `Nlp/NlpService.ts` | Implemented | Text chunking |
| `GroundingService` | `Grounding/GroundingService.ts` | Implemented | Graph-based evidence grounding |
| `ConfidenceFilter` | `Grounding/ConfidenceFilter.ts` | Implemented | Confidence threshold filtering |

### Current Strengths

1. **Clean Effect Service architecture** -- All services follow `Context.Tag` or `Effect.Service<T>()()` pattern with typed shapes
2. **Comprehensive entity resolution** -- Clustering, canonical selection, owl:sameAs link generation, incremental cross-batch resolution via EntityRegistry with BloomFilter, merge/split with full audit trail
3. **Working GraphRAG with RRF scoring** -- k=60 from Cormack et al., 2009
4. **Full SPARQL subsystem** -- Custom engine using sparqljs parser with N3.Store backend, supporting SELECT, CONSTRUCT, and ASK queries with FILTER evaluation
5. **Forward-chaining reasoning** -- Iterative fixed-point inference with 6 RDFS rules, configurable depth/max limits, provenance tracking per derived quad
6. **RDF triple store** -- N3.Store wrapper with full Quad model, Turtle/N-Triples serialization, builder-pattern graph construction
7. **Grounded answer generation** -- @effect/ai LanguageModel integration, citation parsing, SPARQL-based citation validation with reasoning-backed inference verification, multi-signal confidence scoring
8. **Reasoning trace formatting** -- Step-by-step inference chains with depth calculation from provenance maps
9. **PostgreSQL + JSONB flexibility** -- Drizzle ORM with typed tables, 12 table definitions covering all domain entities
10. **Branded EntityIds throughout** -- `@beep/shared-domain` provides `KnowledgeEntityIds`
11. **Immutable evidence layer** -- MentionRecord model, table, and repo separate from mutable Entity aggregation

---

## Architectural Decisions to Preserve

### 1. Two-Tier Entity Resolution

**Pattern**: Separates immutable evidence from mutable aggregation.

**Why**:
- `MentionRecord` nodes are never modified after creation, preserving full provenance
- `Entity` nodes aggregate clusters and can be re-computed
- Enables audit trail and incremental re-resolution without losing original evidence

**Current knowledge-slice has**:
- `MentionRecord.Model` in `domain/src/entities/MentionRecord/MentionRecord.model.ts`
- `Entity.Model` in `domain/src/entities/Entity/Entity.model.ts`
- `EntityCluster.Model` in `domain/src/entities/EntityCluster/EntityCluster.model.ts`
- `MergeHistory.Model` and `SameAsLink.Model` for audit trail
- Tables and repositories for all of the above

**Remaining gap**: The current implementation lacks typed graph edges (`ResolutionEdge`, `RelationEdge`) as explicit domain models. Entity-to-mention relationships are tracked via foreign keys rather than first-class edge models.

### 2. Re-SHACL Pattern (Future -- Not Yet Implemented)

**Pattern**: Only compute inferences needed for validation, not full materialization.

**Why**:
- Full RDFS/OWL materialization is expensive (O(n^2) or worse)
- Most SHACL shapes only need `rdfs:subClassOf` for type inheritance
- `reasonForValidation()` targets specific inference rules

**Reference Implementation** (`effect-ontology/Service/Reasoner.ts`):

```typescript
reasonForValidation: (store: RdfStore): Effect.Effect<ReasoningResult, ReasoningError | RuleParseError> =>
  Effect.gen(function*() {
    yield* Effect.logDebug("Reasoner.reasonForValidation - applying subclass inference")
    return yield* reason(store, ReasoningConfig.subclassOnly())
  })
```

**Current knowledge-slice**: ReasonerService exists with `infer()` and `inferAndMaterialize()` methods. It accepts a `ReasoningConfig` with `maxDepth`, `maxInferences`, and `profile` fields. However, the ForwardChainer currently applies all RDFS rules regardless of the profile setting (Gap #8). SHACL validation itself is not implemented (Gap #4).

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

**Status**: Implemented correctly. Preserve this implementation.

### 4. SPARQL Engine Architecture

**Pattern**: Custom SPARQL engine using sparqljs parser + N3.Store backend (NOT Oxigraph WASM).

**Why**:
- No external WASM dependency required
- sparqljs provides full SPARQL 1.1 parsing
- N3.Store provides efficient triple pattern matching
- Custom QueryExecutor enables fine-grained control over execution
- FilterEvaluator handles SPARQL FILTER expression evaluation

**Current knowledge-slice** (`server/src/Sparql/`):

The SPARQL subsystem consists of 5 files working together:
- `SparqlParser.ts` -- Parses SPARQL strings via the `sparqljs` library into AST
- `QueryExecutor.ts` -- Executes parsed ASTs against N3.Store with `executeSelect`, `executeConstruct`, `executeAsk`
- `FilterEvaluator.ts` -- Evaluates SPARQL FILTER expressions (comparison, logical, regex, etc.)
- `SparqlModels.ts` -- Domain models for SPARQL patterns and term types
- `SparqlService.ts` -- Orchestrator providing `select()`, `construct()`, `ask()`, `query()` methods

The service dispatches queries by type using Effect Match:

```typescript
const getQueryTypeString: (ast: sparqljs.SparqlQuery) => string = Match.type<sparqljs.SparqlQuery>().pipe(
  Match.when({ type: "update" }, () => "UPDATE"),
  Match.when({ type: "query" }, (q) => q.queryType),
  Match.exhaustive
);
```

**Status**: Implemented. SELECT, CONSTRUCT, and ASK are supported. DESCRIBE is not yet implemented (Gap #5).

### 5. Forward-Chaining Reasoning

**Pattern**: Iterative fixed-point inference with provenance tracking.

**Why**:
- Forward chaining applies rules repeatedly until no new facts are derived
- Each derived quad tracks its provenance (which rule, which source quads)
- Configurable depth and inference limits prevent runaway computation
- RDFS rules enable type hierarchy inference critical for ontology-guided extraction

**Current knowledge-slice** (`server/src/Reasoning/`):

The reasoning subsystem consists of 3 files:
- `RdfsRules.ts` -- Defines 6 RDFS rules: rdfs2 (domain), rdfs3 (range), rdfs5 (subproperty transitivity), rdfs7 (subproperty entailment), rdfs9 (subclass entailment), rdfs11 (subclass transitivity)
- `ForwardChainer.ts` -- Iterative fixed-point loop with `ChainState` tracking known quads, derived quads, provenance, and iteration count
- `ReasonerService.ts` -- Service wrapper providing `infer()` and `inferAndMaterialize()` with configurable `ReasoningConfig`

The ForwardChainer uses `MutableHashSet` and `MutableHashMap` for efficient deduplication and provenance tracking:

```typescript
interface ChainState {
  readonly knownQuadIds: MutableHashSet.MutableHashSet<string>;
  readonly allQuads: Quad[];
  readonly derivedQuads: Quad[];
  readonly provenance: MutableHashMap.MutableHashMap<string, InferenceProvenance>;
  readonly totalInferences: number;
  readonly iterations: number;
}
```

**Status**: Implemented. Remaining gaps: profile-based rule selection (Gap #8) and OWL rules (Gap #9).

### 6. Citation Validation Pipeline

**Pattern**: SPARQL ASK-based citation validation with reasoning-backed inference verification.

**Why**:
- Generated answers contain citations referencing entities and relations
- SPARQL ASK queries verify entity/relation existence in the knowledge graph
- ReasonerService provides inference-based verification for facts that are not directly stored but can be derived
- Confidence decay applied to inferred facts based on inference chain depth

**Current knowledge-slice** (`server/src/GraphRAG/CitationValidator.ts`):

```typescript
const INFERENCE_CONFIDENCE_DECAY = 0.1;
const BASE_INFERRED_CONFIDENCE = 0.9;
const MIN_INFERRED_CONFIDENCE = 0.5;

const buildEntityExistsQuery = (entityId: string): string => `
  ASK WHERE {
    { ?s ?p ?o . FILTER(?s = <${entityId}>) }
    UNION
    { ?s ?p ?o . FILTER(?o = <${entityId}>) }
  }
`;
```

The CitationValidator depends on both `SparqlService` and `ReasonerService`, integrating SPARQL execution with reasoning inference to validate citations.

**Status**: Implemented.

### 7. Durable Activities via @effect/workflow (NOT YET IMPLEMENTED)

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
    }))
    return `${payload.batchId}-${Math.abs(hash).toString(16).slice(0, 8)}`
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

**Current knowledge-slice**: `ExtractionPipeline` is not durable. A failure loses all progress. This is the highest-priority remaining gap (Gap #1).

### 8. Batch State Machine (NOT YET IMPLEMENTED)

**Pattern**: Real-time progress visibility via state transitions and PubSub.

**Why**:
- Enables SSE streaming of progress to clients
- Clear state transitions: `PENDING -> EXTRACTING -> RESOLVING -> VALIDATING -> INGESTING -> COMPLETED`
- Per-document status tracking within batches

**Current knowledge-slice**: Has `Extraction.Model` but lacks the full state machine pattern (Gap #2).

---

## Implementation Patterns to Follow

### Service Definition Pattern

Services in the knowledge-slice use `Context.Tag` with explicit shape interfaces:

```typescript
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export interface MyServiceShape {
  readonly methodA: (arg: string) => Effect.Effect<Result, MyError>;
  readonly methodB: (arg: number) => Effect.Effect<Result, MyError>;
}

export class MyService extends Context.Tag($I`MyService`)<MyService, MyServiceShape>() {}

const serviceEffect: Effect.Effect<MyServiceShape, never, Dep1 | Dep2> = Effect.gen(function* () {
  const dep1 = yield* Dep1;
  const dep2 = yield* Dep2;

  return {
    methodA: Effect.fn("MyService.methodA")(
      (arg: string): Effect.Effect<Result, MyError> =>
        Effect.gen(function* () {
          // ... implementation
        }).pipe(
          Effect.withSpan("MyService.methodA", {
            attributes: { arg },
          })
        )
    ),

    methodB: Effect.fn("MyService.methodB")(
      (arg: number): Effect.Effect<Result, MyError> =>
        Effect.gen(function* () {
          // ... implementation
        })
    ),
  };
});

export const MyServiceLive: Layer.Layer<MyService, never, Dep1 | Dep2> = Layer.effect(
  MyService,
  serviceEffect
);
```

### Layer Composition Pattern

Use `Layer.provide()` and `Layer.mergeAll()` for dependency composition:

```typescript
export const SparqlServiceLive: Layer.Layer<SparqlService, never, RdfStore | SparqlParser> = Layer.effect(
  SparqlService,
  serviceEffect
).pipe(
  Layer.provide(SparqlParserLive),
  Layer.provide(RdfStoreLive),
);
```

### Error Handling Pattern

All errors MUST use `S.TaggedError` for new code:

```typescript
import * as S from "effect/Schema";

export class ReasoningError extends S.TaggedError<ReasoningError>()("ReasoningError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

export class SparqlExecutionError extends S.TaggedError<SparqlExecutionError>()("SparqlExecutionError", {
  message: S.String,
  query: S.String,
  cause: S.optional(S.Unknown),
}) {}
```

**Note**: ALWAYS prefer `S.TaggedError` (from `effect/Schema`) for new errors. `S.TaggedError` provides serialization support needed for RPC boundaries and structured logging.

### Error Serialization

Use a helper for error serialization that handles multiple error types:

```typescript
import * as P from "effect/Predicate";
import * as Match from "effect/Match";

const serializeError = (error: unknown): string =>
  Match.value(error).pipe(
    Match.when(P.isError, (e) => e.message),
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

effect("computes result", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);

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

### Implemented -- No Porting Required

These files exist in the reference implementation AND have functional equivalents in knowledge-slice. No porting is needed:

| Reference File | Knowledge-Slice Equivalent | Notes |
|----------------|---------------------------|-------|
| `effect-ontology/Service/Sparql.ts` | `Sparql/SparqlService.ts` + `SparqlParser.ts` + `QueryExecutor.ts` + `FilterEvaluator.ts` | knowledge-slice uses sparqljs + N3.Store instead of Oxigraph WASM |
| `effect-ontology/Service/Reasoner.ts` | `Reasoning/ReasonerService.ts` + `ForwardChainer.ts` + `RdfsRules.ts` | Same approach: iterative forward chaining with RDFS rules |
| `effect-ontology/Service/Rdf.ts` | `Rdf/RdfStoreService.ts` + `Serializer.ts` + `RdfBuilder.ts` | N3.Store wrapper, Turtle/N-Triples serialization, builder pattern |
| `effect-ontology/Domain/Rdf/Constants.ts` | `Ontology/constants.ts` | RDF, RDFS, OWL, SKOS namespaces |
| `effect-ontology/Domain/Model/EntityResolution.ts` | `entities/MentionRecord/` + `entities/Entity/` + `entities/EntityCluster/` | Two-tier model with immutable MentionRecord |

### Remaining -- Files to Create for Gap Closure

| Gap # | Target File(s) | Purpose |
|-------|----------------|---------|
| 1 | `server/src/Workflow/ExtractionWorkflow.ts` | Durable @effect/workflow definition |
| 1 | `server/src/Workflow/WorkflowActivities.ts` | Individual workflow activity definitions |
| 2 | `domain/src/value-objects/BatchState.value.ts` | BatchState union type (Schema.Union of TaggedStructs) |
| 2 | `server/src/Workflow/BatchStateMachine.ts` | State transition logic with PubSub |
| 3 | `tables/src/tables/workflow-state.table.ts` | Workflow state persistence table |
| 3 | `tables/src/tables/activity-journal.table.ts` | Activity journal table |
| 4 | `server/src/Validation/ShaclService.ts` | SHACL validation service |
| 4 | `server/src/Validation/ShapeGenerator.ts` | Auto-generate shapes from ontology |
| 5 | `server/src/Sparql/QueryExecutor.ts` (modify) | Add `executeDescribe` function |
| 6 | `server/src/Rdf/RdfStoreService.ts` (modify) | Add graph management API |
| 7 | `domain/src/value-objects/rdf/ProvOConstants.ts` | PROV-O namespace constants |
| 8 | `server/src/Reasoning/ForwardChainer.ts` (modify) | Profile-based rule filtering |
| 9 | `server/src/Reasoning/OwlRules.ts` | OWL inference rules |
| 10 | `server/src/Workflow/BatchOrchestrator.ts` | Multi-document batch coordination |
| 11 | `server/src/Runtime/CircuitBreaker.ts` | LLM call circuit breaker |
| 12 | `server/src/Runtime/RateLimiter.ts` | API rate limiting with Effect.Semaphore |
| 13 | `server/src/Runtime/TokenBudget.ts` | Per-stage token budget tracking |
| 14 | `server/src/Runtime/Bundles.ts` | Pre-composed layer bundles |
| 15 | `server/src/Sparql/SparqlGenerator.ts` | NL-to-SPARQL translation |

### Target Files to Modify (for remaining gaps)

| Target File | Modification | Gap # |
|-------------|-------------|-------|
| `server/src/Extraction/ExtractionPipeline.ts` | Replace with durable workflow calls | 1 |
| `server/src/Sparql/SparqlService.ts` | Add DESCRIBE dispatch branch | 5 |
| `server/src/Sparql/QueryExecutor.ts` | Add GRAPH clause support | 6 |
| `server/src/Reasoning/ForwardChainer.ts` | Filter rules by profile from config | 8 |
| `server/src/Reasoning/RdfsRules.ts` | Export rule IDs for profile mapping | 8 |
| `tables/src/relations.ts` | Add workflow table relations | 3 |
| `tables/src/schema.ts` | Export new workflow tables | 3 |

---

## Vocabulary & Namespace Reference

### Standard RDF Namespaces (Implemented in Ontology/constants.ts)

```typescript
export const RDF = {
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  first: "http://www.w3.org/1999/02/22-rdf-syntax-ns#first",
  rest: "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",
  nil: "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil",
} as const;

export const RDFS = {
  label: "http://www.w3.org/2000/01/rdf-schema#label",
  comment: "http://www.w3.org/2000/01/rdf-schema#comment",
  subClassOf: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
  subPropertyOf: "http://www.w3.org/2000/01/rdf-schema#subPropertyOf",
  domain: "http://www.w3.org/2000/01/rdf-schema#domain",
  range: "http://www.w3.org/2000/01/rdf-schema#range",
  Class: "http://www.w3.org/2000/01/rdf-schema#Class",
} as const;

export const OWL = {
  Class: "http://www.w3.org/2002/07/owl#Class",
  ObjectProperty: "http://www.w3.org/2002/07/owl#ObjectProperty",
  DatatypeProperty: "http://www.w3.org/2002/07/owl#DatatypeProperty",
  FunctionalProperty: "http://www.w3.org/2002/07/owl#FunctionalProperty",
  inverseOf: "http://www.w3.org/2002/07/owl#inverseOf",
  equivalentClass: "http://www.w3.org/2002/07/owl#equivalentClass",
  unionOf: "http://www.w3.org/2002/07/owl#unionOf",
  Thing: "http://www.w3.org/2002/07/owl#Thing",
} as const;

export const SKOS = {
  prefLabel: "http://www.w3.org/2004/02/skos/core#prefLabel",
  altLabel: "http://www.w3.org/2004/02/skos/core#altLabel",
  hiddenLabel: "http://www.w3.org/2004/02/skos/core#hiddenLabel",
  definition: "http://www.w3.org/2004/02/skos/core#definition",
  scopeNote: "http://www.w3.org/2004/02/skos/core#scopeNote",
  example: "http://www.w3.org/2004/02/skos/core#example",
  broader: "http://www.w3.org/2004/02/skos/core#broader",
  narrower: "http://www.w3.org/2004/02/skos/core#narrower",
  related: "http://www.w3.org/2004/02/skos/core#related",
  exactMatch: "http://www.w3.org/2004/02/skos/core#exactMatch",
  closeMatch: "http://www.w3.org/2004/02/skos/core#closeMatch",
} as const;
```

### Namespaces Not Yet Implemented

```typescript
// PROV-O (Gap #7) - W3C provenance vocabulary
export const PROV = {
  Entity: "http://www.w3.org/ns/prov#Entity",
  Activity: "http://www.w3.org/ns/prov#Activity",
  Agent: "http://www.w3.org/ns/prov#Agent",
  wasGeneratedBy: "http://www.w3.org/ns/prov#wasGeneratedBy",
  generatedAtTime: "http://www.w3.org/ns/prov#generatedAtTime",
  wasAttributedTo: "http://www.w3.org/ns/prov#wasAttributedTo",
  used: "http://www.w3.org/ns/prov#used",
} as const;

// XSD (partially used in RdfsRules.ts inline, not exported as constants)
export const XSD = {
  string: "http://www.w3.org/2001/XMLSchema#string",
  integer: "http://www.w3.org/2001/XMLSchema#integer",
  dateTime: "http://www.w3.org/2001/XMLSchema#dateTime",
  double: "http://www.w3.org/2001/XMLSchema#double",
  boolean: "http://www.w3.org/2001/XMLSchema#boolean",
} as const;

// DCTERMS (not yet used in knowledge-slice)
export const DCTERMS = {
  title: "http://purl.org/dc/terms/title",
  source: "http://purl.org/dc/terms/source",
  created: "http://purl.org/dc/terms/created",
  modified: "http://purl.org/dc/terms/modified",
} as const;
```

### RDFS Rules Reference (Implemented in RdfsRules.ts)

```n3
# rdfs2 - Domain constraint propagation
{ ?s ?p ?o . ?p rdfs:domain ?c . } => { ?s rdf:type ?c . } .

# rdfs3 - Range constraint propagation
{ ?s ?p ?o . ?p rdfs:range ?c . } => { ?o rdf:type ?c . } .

# rdfs5 - SubProperty transitivity
{ ?p1 rdfs:subPropertyOf ?p2 . ?p2 rdfs:subPropertyOf ?p3 . } => { ?p1 rdfs:subPropertyOf ?p3 . } .

# rdfs7 - SubProperty entailment
{ ?s ?p ?o . ?p rdfs:subPropertyOf ?q . } => { ?s ?q ?o . } .

# rdfs9 - SubClass entailment
{ ?s rdf:type ?c . ?c rdfs:subClassOf ?c2 . } => { ?s rdf:type ?c2 . } .

# rdfs11 - SubClass transitivity
{ ?c1 rdfs:subClassOf ?c2 . ?c2 rdfs:subClassOf ?c3 . } => { ?c1 rdfs:subClassOf ?c3 . } .
```

### OWL Rules Reference (NOT YET IMPLEMENTED -- Gap #9)

```n3
# owl:sameAs symmetry
{ ?x owl:sameAs ?y . } => { ?y owl:sameAs ?x . } .

# owl:sameAs transitivity
{ ?x owl:sameAs ?y . ?y owl:sameAs ?z . } => { ?x owl:sameAs ?z . } .

# owl:inverseOf
{ ?p owl:inverseOf ?q . ?s ?p ?o . } => { ?o ?q ?s . } .

# owl:TransitiveProperty
{ ?p rdf:type owl:TransitiveProperty . ?x ?p ?y . ?y ?p ?z . } => { ?x ?p ?z . } .

# owl:SymmetricProperty
{ ?p rdf:type owl:SymmetricProperty . ?x ?p ?y . } => { ?y ?p ?x . } .
```

---

## Integration Notes

### How Remaining Components Integrate with Existing Knowledge-Slice

1. **SHACL Validation Service** *(Gap #4)*
   - Will depend on existing `RdfStore` and `ReasonerService`
   - `ReasonerService.infer()` will apply targeted inference before validation (Re-SHACL pattern)
   - Requires profile-based rule selection (Gap #8) for efficiency
   - Integrate shacl-engine or rdf-validate-shacl npm package
   - Generate shapes from ontology `ClassDefinition`/`PropertyDefinition` models

2. **SPARQL DESCRIBE Support** *(Gap #5)*
   - Add `executeDescribe` to existing `QueryExecutor.ts`
   - DESCRIBE returns all triples where the given IRI appears as subject or object
   - Add dispatch branch in `SparqlService.query()` for DESCRIBE query type
   - `SparqlParser.ts` already detects DESCRIBE queries via `isDescribeQuery`

3. **Named Graph Management** *(Gap #6)*
   - Extend existing `RdfStoreService` with `createGraph`, `listGraphs`, `dropGraph` methods
   - The `Quad` model already has an optional `graph` field
   - `Serializer.ts` already handles graph field during parse and serialize
   - Add GRAPH clause support in `QueryExecutor.ts`
   - Design naming convention (e.g., `urn:beep:document:<documentId>`)

4. **Reasoning Profiles** *(Gap #8)*
   - Modify existing `ForwardChainer.ts` to filter rules by profile from `ReasoningConfig`
   - Map profile names to rule subsets: "rdfs-full", "rdfs-subclass", "rdfs-domain-range", "owl-sameas"
   - `ReasoningConfig` already has a `profile` field -- just needs to be wired into rule selection

5. **OWL Rules** *(Gap #9)*
   - Create `OwlRules.ts` alongside existing `RdfsRules.ts` using the same `RdfsRule` interface
   - Register OWL rules in profile system (depends on Gap #8)
   - SameAsLinker already generates owl:sameAs links -- ForwardChainer will be able to reason over them

6. **Durable ExtractionWorkflow** *(Gaps #1, #2, #3)*
   - Replace `ExtractionPipeline.run()` with durable workflow activities
   - Activities for: preprocessing, extraction, resolution, validation, ingestion
   - State stored in PostgreSQL via `@effect/workflow`
   - New workflow tables in `knowledge/tables/` (Drizzle schema)
   - BatchState union type in domain layer
   - PubSub integration for SSE streaming of state transitions

7. **Cross-Batch Orchestration** *(Gap #10)*
   - Depends on durable workflow (Gap #1) and batch state machine (Gap #2)
   - EntityRegistry and IncrementalClusterer already support cross-document resolution
   - Need batch coordinator to manage parallel extraction with configurable concurrency
   - Aggregate progress tracking and batch-level error handling (continue, abort, retry)

8. **LLM Resilience Stack** *(Gaps #11, #12, #13)*
   - Circuit breaker wrapping LLM layer (Gap #11)
   - Rate limiting with Effect.Semaphore for API call throttling (Gap #12)
   - Token budget service for per-stage cost control (Gap #13)
   - Stack order: cache -> rate limit -> circuit breaker -> fallback

9. **Layer Bundles** *(Gap #14)*
   - `SemanticInfraBundle`: RdfStore + Serializer + SparqlService + ReasonerService
   - `ExtractionBundle`: EntityExtractor + RelationExtractor + MentionExtractor + NlpService
   - `GraphRAGBundle`: GraphRAGService + GroundedAnswerGenerator + CitationValidator + ConfidenceScorer + ReasoningTraceFormatter
   - `EntityResolutionBundle`: EntityResolutionService + EntityClusterer + CanonicalSelector + IncrementalClusterer + EntityRegistry

10. **NL-to-SPARQL Generation** *(Gap #15)*
    - LLM prompt template with ontology schema context from OntologyService
    - Query validation via SparqlParser (parse generated SPARQL before execution)
    - Error feedback loop (regenerate on syntax errors)
    - Integration with GraphRAGService as alternative query path

### Database Schema Extensions (For Remaining Gaps)

New tables needed for workflow durability (Gaps #1, #2, #3):

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
```

---

## Common Pitfalls to Avoid

### 1. Assuming SPARQL Is Not Implemented

The previous version of this document incorrectly stated that knowledge-slice has no SPARQL capability. It does. The full `Sparql/` subsystem with SparqlService, SparqlParser, QueryExecutor, FilterEvaluator, and SparqlModels exists and works. It uses sparqljs + N3.Store, NOT Oxigraph WASM.

### 2. Assuming Reasoning Is Not Implemented

The previous version incorrectly stated that knowledge-slice has no RDF reasoning. It does. ForwardChainer + ReasonerService + RdfsRules exist in `Reasoning/`. The ReasonerService provides `infer()` and `inferAndMaterialize()` methods.

### 3. Forgetting Service Shape Interface Pattern

Knowledge-slice services use `Context.Tag` with explicit shape interfaces, not `Effect.Service` with `accessors: true`:

```typescript
// Actual pattern used in knowledge-slice:
export interface SparqlServiceShape {
  readonly select: (queryString: string) => Effect.Effect<SelectResult, SparqlServiceError>;
  readonly construct: (queryString: string) => Effect.Effect<ConstructResult, SparqlServiceError>;
  readonly ask: (queryString: string) => Effect.Effect<AskResult, SparqlServiceError>;
}

export class SparqlService extends Context.Tag($I`SparqlService`)<SparqlService, SparqlServiceShape>() {}
```

### 4. Using Native JavaScript Collections

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

### 5. Missing Span Instrumentation

**Wrong**:
```typescript
const myMethod = (arg: string) => Effect.gen(function* () {
  // ... implementation without tracing
});
```

**Correct**:
```typescript
const myMethod = Effect.fn("MyService.myMethod")(
  (arg: string) => Effect.gen(function* () {
    // ... implementation
  }).pipe(
    Effect.withSpan("MyService.myMethod", {
      attributes: { arg }
    })
  )
);
```

### 6. Throwing Errors Instead of Effect.fail

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

### 7. Using `any` or Type Assertions

**Wrong**:
```typescript
const result = someFunction() as any;
const typed = result as MyType;
```

**Correct**:
```typescript
const decoded = yield* S.decodeUnknown(MySchema)(result);
```

### 8. Forgetting to Provide Dependencies in Layer Composition

**Wrong**:
```typescript
const layer = MyService.Default;  // Missing dependency layers
```

**Correct**:
```typescript
export const MyServiceLive = Layer.effect(MyService, serviceEffect).pipe(
  Layer.provide(DependencyA.Default),
  Layer.provide(DependencyB.Default),
);
```

### 9. Referencing Oxigraph in Knowledge-Slice Code

The knowledge-slice does NOT use Oxigraph WASM. It uses `sparqljs` for parsing and `N3.Store` for triple storage. Do not add Oxigraph dependencies or reference Oxigraph patterns when working on SPARQL-related code.

### 10. Mixing Layer.provide and Layer.provideMerge Incorrectly

**Wrong** (order-dependent when it should not be):
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
  Layer.provideMerge(ServiceC.Default),
);
```

---

## Summary

This context document establishes the patterns, decisions, and integration points for closing the remaining gaps between effect-ontology and the knowledge-slice. The knowledge-slice is **69% complete** (65 FULL + 19 PARTIAL = 84 of 121 capabilities at least partially implemented), with only 20 meaningful remaining gaps. Key takeaways:

### Already Implemented (Preserve)
1. **SPARQL engine** -- Custom engine using sparqljs + N3.Store (SELECT, CONSTRUCT, ASK)
2. **Forward-chaining reasoning** -- Iterative fixed-point with 6 RDFS rules and provenance tracking
3. **RDF triple store** -- N3.Store wrapper with Turtle/N-Triples serialization and builder pattern
4. **RRF scoring** -- k=60 implementation (already correct)
5. **Grounded answer generation** -- @effect/ai LanguageModel with citation-aware prompting
6. **Citation validation** -- SPARQL ASK + reasoning inference verification
7. **Reasoning trace formatting** -- Step-by-step inference chain with depth calculation
8. **Two-tier entity resolution** -- MentionRecord (immutable evidence) + Entity (mutable aggregation)
9. **Cross-batch entity resolution** -- EntityRegistry with BloomFilter + embedding similarity
10. **Merge/split with audit trail** -- SplitService + MergeHistoryLive + SameAsLinker

### Remaining Gaps (20 items, see GAP_ANALYSIS.md)
1. **P0**: Durable workflows (Gap #1), batch state machine (Gap #2), workflow persistence tables (Gap #3)
2. **P1**: SHACL validation (Gap #4), SPARQL DESCRIBE (Gap #5), named graphs (Gap #6), PROV-O provenance (Gap #7), reasoning profiles (Gap #8), OWL rules (Gap #9), cross-batch orchestration (Gap #10)
3. **P2**: CircuitBreaker (Gap #11), rate limiting (Gap #12), token budget (Gap #13), layer bundles (Gap #14), NL-to-SPARQL (Gap #15)
4. **P3**: Content enrichment (Gap #16), document classifier (Gap #17), image extraction (Gap #18), curation workflow (Gap #19), Wikidata linking (Gap #20)

### Implementation Priorities
- **Highest priority**: Workflow durability stack (Gaps #1-3) -- blocks production deployment
- **Next priority**: Semantic enrichment (Gaps #4, #8, #9) -- builds on existing Reasoning/SPARQL infrastructure
- **Efficiency wins**: Low-effort gaps like SPARQL DESCRIBE (Gap #5, ~1 day) and reasoning profiles (Gap #8, ~1.5 days)

Future implementation specs should reference this document and the corrected GAP_ANALYSIS.md when creating detailed implementation plans.
