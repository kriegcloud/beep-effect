# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 (Embedding & Grounding) implementation.

---

## Prompt

You are implementing Phase 3 (Embedding & Grounding) of the Knowledge Graph Integration spec.

### Context

Phase 2 (Extraction Pipeline) is complete. The knowledge slice now has:

- **NlpService**: Sentence-aware text chunking with configurable overlap
- **MentionExtractor**: LLM-powered entity mention detection
- **EntityExtractor**: Ontology-guided entity type classification
- **RelationExtractor**: Triple extraction with confidence scoring
- **GraphAssembler**: Merge entities + relations into KnowledgeGraph
- **ExtractionPipeline**: Full orchestration returning ExtractionResult

### Your Mission

Implement embedding generation and grounding verification:

1. **EmbeddingProvider**: Provider interface with Nomic/Voyage/OpenAI implementations
2. **EmbeddingService**: Caching layer with pgvector storage and batch operations
3. **GroundingService**: Verify relations against source text via embedding similarity
4. **ConfidenceFilter**: Threshold-based filtering of low-confidence extractions
5. **Repository extensions**: Similarity search via pgvector

### Key Integration Point: ExtractionResult

The extraction pipeline produces a KnowledgeGraph that needs embedding and grounding:

```typescript
import { Extraction } from "@beep/knowledge-server";

// After extraction completes
const result = yield* pipeline.run(text, ontologyTurtle, config);

// Embed entities
yield* EmbeddingService.embedEntities(
  result.graph.entities,
  organizationId,
  ontologyId
);

// Ground relations
const grounded = yield* GroundingService.verifyRelations(
  result.graph,
  text,
  organizationId,
  ontologyId,
  { confidenceThreshold: 0.8 }
);

// Apply grounding to update graph
const finalGraph = GroundingService.applyGrounding(result.graph, grounded);
```

### Files to Create

```
packages/knowledge/server/src/Embedding/
├── EmbeddingProvider.ts    # Interface + error types
├── EmbeddingService.ts     # Caching + batching + storage
├── providers/
│   ├── NomicProvider.ts    # Local embeddings
│   ├── VoyageProvider.ts   # Production cloud
│   └── OpenAiProvider.ts   # Fallback
└── index.ts

packages/knowledge/server/src/Grounding/
├── GroundingService.ts     # Relation verification
├── ConfidenceFilter.ts     # Threshold filtering
└── index.ts
```

### Critical Patterns

**EmbeddingProvider Interface**:
```typescript
export type TaskType = "search_document" | "search_query" | "clustering" | "classification";

export interface EmbeddingProvider {
  readonly config: EmbeddingConfig;
  readonly embed: (text: string, taskType: TaskType) => Effect<EmbeddingResult, EmbeddingError>;
  readonly embedBatch: (texts: ReadonlyArray<string>, taskType: TaskType) => Effect<ReadonlyArray<EmbeddingResult>, EmbeddingError>;
}

export const EmbeddingProvider = Context.GenericTag<EmbeddingProvider>(
  "@beep/knowledge-server/EmbeddingProvider"
);
```

**EmbeddingService with Caching**:
```typescript
export class EmbeddingService extends Effect.Service<EmbeddingService>()(
  "@beep/knowledge-server/EmbeddingService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const provider = yield* EmbeddingProvider;
      const repo = yield* EmbeddingRepo;

      return {
        embed: (text: string, taskType: TaskType, orgId: string, ontologyId: string) =>
          Effect.gen(function* () {
            const cacheKey = computeCacheKey(text, provider.config.model);
            const cached = yield* repo.findByCacheKey(cacheKey, orgId);
            if (O.isSome(cached)) return cached.value.embedding;

            const result = yield* provider.embed(text, taskType);
            yield* repo.insert({ /* embedding data */ });
            return result.vector;
          }),
      };
    }),
  }
) {}
```

**Grounding via Similarity**:
```typescript
const cosineSimilarity = (a: number[], b: number[]): number => {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

// For each relation:
// 1. Convert to statement: "Subject predicateLabel Object"
// 2. Embed statement
// 3. Compare to source text embedding
// 4. Filter by threshold (default 0.8)
```

**pgvector Similarity Search**:
```sql
-- Add to Embedding.repo.ts
SELECT *,
       1 - (embedding <=> $1::vector) as similarity
FROM embeddings
WHERE organization_id = $2
AND 1 - (embedding <=> $1::vector) >= $3
ORDER BY embedding <=> $1::vector
LIMIT $4
```

### Dependencies to Add

```bash
cd packages/knowledge/server
bun add @nomic-ai/nomic-embed voyageai openai
```

### Verification

```bash
bun run check --filter="@beep/knowledge-*"
bun run test --filter="@beep/knowledge-*"
```

### Success Criteria

1. `EmbeddingProvider` interface with at least one implementation (Nomic recommended for local dev)
2. `EmbeddingService.embed` correctly caches to prevent duplicate API calls
3. `EmbeddingService.embedEntities` batch processes extraction results
4. `GroundingService.verifyRelations` filters by similarity threshold
5. pgvector similarity search returns correct ranked results
6. All knowledge packages pass type checking

### Handoff Document

Full context available at: `specs/knowledge-graph-integration/handoffs/HANDOFF_P3.md`

### On Completion

1. Update `specs/knowledge-graph-integration/REFLECTION_LOG.md` with Phase 3 learnings
2. Create `handoffs/HANDOFF_P4.md` for Entity Resolution phase
3. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md`
