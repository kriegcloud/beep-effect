# Unified Extraction Pipeline

> **Created**: 2025-12-19
> **Status**: In Progress
> **Epic**: `effect-ontology-3je2` (Unified Extraction Pipeline & Dead Code Cleanup)

## Overview

This plan consolidates the batch and streaming extraction pipelines into a single 6-phase unified extraction engine. The goal is to eliminate code duplication, ensure consistent extraction behavior, and enable grounding verification across all extraction paths.

## Problem Statement

Currently, the codebase has two divergent extraction paths:

1. **Batch Path** (`DurableActivities.makeExtractionActivity`):
   - Hardcoded entity/relation extraction
   - Missing grounding verification
   - Direct knowledge graph construction

2. **Streaming Path** (`StreamingExtraction.makeExtractionWorkflow`):
   - 6-phase pipeline (Chunk → Mention → Entity → Property Scope → Relation → Ground)
   - Grounding verification enabled
   - Never used in production batch workflows

This divergence causes:
- Duplicate code maintenance
- Inconsistent extraction behavior
- Missing grounding in batch extraction
- Testing complexity (two paths to verify)

## Solution: Unified Streaming-First Architecture

### Architecture Diagram

```
                     ┌─────────────────────────────────┐
                     │   BatchExtractionWorkflow       │
                     │   (5-stage orchestration)       │
                     └─────────────────────────────────┘
                                    │
                                    │ Stage 2: Extracting
                                    ▼
                     ┌─────────────────────────────────┐
                     │  StreamingExtractionActivity    │
                     │  (Durable wrapper - NEW)        │
                     │  - Activity.make                │
                     │  - buildRunConfig helper        │
                     │  - enrichEntityMetadata helper  │
                     │  - knowledgeGraphToClaims       │
                     └─────────────────────────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────────┐
                     │    StreamingExtraction          │
                     │    (6-phase core engine)        │
                     │                                 │
                     │  Phase 1: Chunking              │
                     │  Phase 2: Mention Detection     │
                     │  Phase 3: Entity Extraction     │
                     │  Phase 4: Property Scoping      │
                     │  Phase 5: Relation Extraction   │
                     │  Phase 6: Grounding (≥0.8)      │
                     └─────────────────────────────────┘
                                    │
                                    ▼
                          KnowledgeGraph (output)
```

### 6-Phase Pipeline Details

| Phase | Service | Input | Output | Purpose |
|-------|---------|-------|--------|---------|
| 1 | NlpService.chunk | Document text | TextChunk[] | Split into processable segments |
| 2 | MentionExtractor | TextChunk[] | EntityMention[] | Detect entity mention spans |
| 3 | EntityExtractor | Mentions + OntologyContext | ExtractedEntity[] | LLM-based entity typing |
| 4 | OntologyService.getPropertiesFor | Entity types | ScopedProperty[] | Domain/range filtered properties |
| 5 | RelationExtractor | Entities + Properties | ExtractedRelation[] | LLM-based relation extraction |
| 6 | Grounder.verifyRelationBatch | Relations + Context | GroundedRelation[] | Filter by embedding similarity ≥ 0.8 |

### Key Components

#### 1. StreamingExtractionActivity (NEW)

Durable activity wrapper that:
- Wraps `StreamingExtraction.extract()` as a durable activity
- Builds `RunConfig` from `ExtractionActivityInput`
- Enriches entity metadata (documentId, positions)
- Converts `KnowledgeGraph` to claims using `knowledgeGraphToClaims()`
- Serializes to RDF quads using `claimsDataToQuads()`

```typescript
// src/Workflow/StreamingExtractionActivity.ts
export const makeStreamingExtractionActivity = Activity.make(
  "streaming-extraction",
  {
    input: ExtractionActivityInput,
    output: ExtractionActivityOutput,
    error: Schema.String,
    idempotencyKey: (input) =>
      IdempotencyKey.fromSemanticInputs([input.documentId, input.sourceUri]),
  },
  ({ input }) =>
    Effect.gen(function*() {
      // 1. Load document from storage
      // 2. Build RunConfig from input
      // 3. Call StreamingExtraction.extract()
      // 4. Enrich entity metadata with documentId, positions
      // 5. Convert to claims using knowledgeGraphToClaims()
      // 6. Serialize to RDF using claimsDataToQuads()
      // 7. Write to storage and return output
    })
)
```

#### 2. buildRunConfig Helper

Converts `ExtractionActivityInput` (preprocessing hints) to `RunConfig`:

```typescript
// src/Workflow/StreamingExtractionActivity.ts
const buildRunConfig = (input: ExtractionActivityInput): RunConfig =>
  RunConfig.make({
    ontology: input.ontologyUri,
    chunking: {
      strategy: input.chunkingStrategy ?? "standard",
      chunkSize: input.suggestedChunkSize ?? 500,
      overlap: input.suggestedOverlap ?? 50,
    },
    llm: {
      model: input.llmModel ?? "claude-haiku-4-5",
      temperature: 0.0,
    },
    concurrency: input.concurrency ?? 5,
    enableGrounding: true,  // Always enabled
    groundingThreshold: 0.8,
  })
```

#### 3. enrichEntityMetadata Helper

Adds document-level metadata to extracted entities:

```typescript
// src/Workflow/StreamingExtractionActivity.ts
const enrichEntityMetadata = (
  entities: ExtractedEntity[],
  documentId: DocumentId,
  sourceUri: GcsUri
): ExtractedEntity[] =>
  entities.map((entity) => ({
    ...entity,
    documentId,
    sourceUri,
    // Preserve mention spans for provenance
  }))
```

### Implementation Tasks

These tasks are tracked in beads under epic `effect-ontology-3je2`:

| Task | Beads ID | Status | Description |
|------|----------|--------|-------------|
| Create StreamingExtractionActivity | `9a4q` | Open | Activity.make wrapper |
| Add buildRunConfig helper | `jmkq` | Open | Config translation |
| Add enrichEntityMetadata helper | `alpl` | Open | Metadata enrichment |
| Update WorkflowOrchestrator | `gh5a` | Open | Use new activity |
| Add streaming extraction tests | `6pl8` | Open | Test coverage |
| Remove dead makeExtractionActivity | `hw96` | Open | Cleanup |

### Migration Strategy

1. **Phase 1: Create Wrapper** (no behavior change)
   - Implement `StreamingExtractionActivity`
   - Keep `makeExtractionActivity` as fallback
   - Feature flag: `useStreamingExtraction`

2. **Phase 2: Gradual Rollout**
   - Enable for small batches (<10 docs)
   - Monitor for regressions
   - Compare output quality

3. **Phase 3: Full Migration**
   - Enable for all batches
   - Remove `makeExtractionActivity`
   - Delete dead code

### Interface Alignment

#### Current: ExtractionActivityInput

```typescript
const ExtractionActivityInput = Schema.Struct({
  documentId: DocumentId,
  sourceUri: GcsUri,
  manifestUri: GcsUri,
  batchId: BatchId,
  ontologyUri: GcsUri,
  ontologyVersion: OntologyVersion,
  targetNamespace: Namespace,
  // Preprocessing hints
  chunkingStrategy: Schema.optional(ChunkingStrategy),
  suggestedChunkSize: Schema.optional(Schema.Number),
  suggestedOverlap: Schema.optional(Schema.Number),
})
```

#### StreamingExtraction: RunConfig

```typescript
const RunConfig = Schema.Struct({
  ontology: Schema.String,  // Path or URI
  chunking: Schema.Struct({
    strategy: ChunkingStrategy,
    chunkSize: Schema.Number,
    overlap: Schema.Number,
  }),
  llm: Schema.Struct({
    model: Schema.String,
    temperature: Schema.Number,
  }),
  concurrency: Schema.Number,
  enableGrounding: Schema.Boolean,
  groundingThreshold: Schema.Number,
})
```

The `buildRunConfig` helper bridges these interfaces.

### Testing Strategy

1. **Unit Tests** (`StreamingExtractionActivity.test.ts`)
   - Test `buildRunConfig` translation
   - Test `enrichEntityMetadata` enrichment
   - Test activity make/execute cycle

2. **Integration Tests**
   - Compare output: batch vs streaming for same input
   - Verify grounding filtering works
   - Test with preprocessing hints

3. **Property-Based Tests**
   - Verify deterministic output given same input
   - Test idempotency key generation

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance regression | Medium | High | Benchmark before/after, gradual rollout |
| Output quality change | Low | High | Side-by-side comparison testing |
| Missing grounding breaks workflows | Low | Medium | Feature flag for gradual enablement |
| Layer composition issues | Medium | Medium | Test with full production layers |

### Success Criteria

1. Single extraction path for all batch/streaming use cases
2. Grounding verification enabled by default (≥0.8 threshold)
3. All existing tests pass
4. No performance regression (within 10%)
5. Dead code removed from `DurableActivities.ts`

## References

- [System Architecture](../architecture/system-architecture.md) - Updated with unified pipeline
- [Effect Patterns Guide](../architecture/effect-patterns-guide.md) - Activity patterns
- Epic: `effect-ontology-3je2` - Beads tracking
