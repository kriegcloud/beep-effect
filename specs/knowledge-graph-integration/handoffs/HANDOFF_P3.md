# Phase 3 Handoff: Embedding & Grounding

**Date**: 2026-01-18
**From**: Phase 2 (Extraction Pipeline)
**To**: Phase 3 (Embedding & Grounding)
**Status**: Ready for implementation

---

## Phase 2 Completion Summary

Phase 2 successfully implemented the 6-stage extraction pipeline:

### Files Created

| Category | Files |
|----------|-------|
| NLP Service | `packages/knowledge/server/src/Nlp/NlpService.ts`, `TextChunk.ts` |
| AI Service | `packages/knowledge/server/src/Ai/AiService.ts`, `PromptTemplates.ts` |
| Extraction Schemas | `packages/knowledge/server/src/Extraction/schemas/MentionOutput.ts`, `EntityOutput.ts`, `RelationOutput.ts` |
| Extractors | `MentionExtractor.ts`, `EntityExtractor.ts`, `RelationExtractor.ts` |
| Assembly | `GraphAssembler.ts`, `ExtractionPipeline.ts` |

### Key Patterns Established

| Pattern | Implementation | Notes |
|---------|----------------|-------|
| NlpService | Sentence-aware chunking with overlap | Uses Stream for large docs |
| AiService | Interface + Context.GenericTag | Pluggable implementations |
| LLM Output | S.Class schemas for structured output | MentionOutput, EntityOutput, RelationOutput |
| Offset Tracking | Chunk-relative adjusted to document-absolute | Evidence spans preserve provenance |
| Pipeline | Effect.gen orchestration | Sequences all stages with logging |

### APIs Available for Phase 3

```typescript
// From GraphAssembler
interface AssembledEntity {
  readonly id: string;                    // "knowledge_entity__uuid"
  readonly mention: string;               // Original text
  readonly primaryType: string;           // Main ontology type IRI
  readonly types: readonly string[];      // All type IRIs
  readonly attributes: Record<string, string | number | boolean>;
  readonly confidence: number;
  readonly canonicalName?: string;
}

interface AssembledRelation {
  readonly id: string;                    // "knowledge_relation__uuid"
  readonly subjectId: string;             // Entity ID
  readonly predicate: string;             // Property IRI
  readonly objectId?: string;             // For object properties
  readonly literalValue?: string;         // For datatype properties
  readonly confidence: number;
  readonly evidence?: string;             // Text where relation expressed
  readonly evidenceStartChar?: number;
  readonly evidenceEndChar?: number;
}

interface KnowledgeGraph {
  readonly entities: readonly AssembledEntity[];
  readonly relations: readonly AssembledRelation[];
  readonly entityIndex: Record<string, string>;  // mention -> entityId
  readonly stats: {
    entityCount: number;
    relationCount: number;
    unresolvedSubjects: number;
    unresolvedObjects: number;
  };
}

// From ExtractionPipeline
interface ExtractionResult {
  readonly graph: KnowledgeGraph;
  readonly stats: {
    chunkCount: number;
    mentionCount: number;
    entityCount: number;
    relationCount: number;
    tokensUsed: number;
    durationMs: number;
  };
  readonly config: ExtractionPipelineConfig;
}
```

---

## Phase 3 Scope

Phase 3 implements embedding generation and grounding verification for extracted entities and relations.

### Primary Objectives

1. **EmbeddingProvider**: Provider-agnostic embedding interface with pluggable backends (Nomic, Voyage, OpenAI)
2. **EmbeddingService**: Caching layer with pgvector storage
3. **GroundingService**: Verify relations against source text via embedding similarity
4. **Confidence Filtering**: Filter low-confidence extractions

### Integration Points

```
ExtractionPipeline.run()
    → KnowledgeGraph
        → EmbeddingService.embedEntities()
            → pgvector storage
        → GroundingService.verifyRelations()
            → filtered KnowledgeGraph with updated confidence
```

---

## Required Files to Create

### 1. Embedding Provider Interface

```
packages/knowledge/server/src/Embedding/
├── EmbeddingProvider.ts    # Provider interface + implementations
├── EmbeddingService.ts     # Caching + batching + pgvector storage
├── providers/
│   ├── NomicProvider.ts    # Local Nomic embeddings
│   ├── VoyageProvider.ts   # Voyage AI (production)
│   └── OpenAiProvider.ts   # OpenAI fallback
└── index.ts
```

### 2. Grounding Service

```
packages/knowledge/server/src/Grounding/
├── GroundingService.ts     # Relation verification via similarity
├── ConfidenceFilter.ts     # Threshold-based filtering
└── index.ts
```

### 3. Repository Updates

```
packages/knowledge/server/src/db/repos/
├── Entity.repo.ts          # Add/update for extraction results
├── Relation.repo.ts        # Add/update for extraction results
└── Embedding.repo.ts       # Already exists - extend with similarity search
```

---

## Implementation Guidance

### EmbeddingProvider Interface

```typescript
// packages/knowledge/server/src/Embedding/EmbeddingProvider.ts
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export type TaskType = "search_document" | "search_query" | "clustering" | "classification";

export interface EmbeddingConfig {
  readonly model: string;
  readonly dimensions: number;
  readonly provider: string;
}

export interface EmbeddingResult {
  readonly vector: ReadonlyArray<number>;
  readonly model: string;
  readonly usage?: {
    readonly totalTokens: number;
  };
}

export interface EmbeddingProvider {
  readonly config: EmbeddingConfig;

  /**
   * Embed a single text
   */
  readonly embed: (
    text: string,
    taskType: TaskType
  ) => Effect.Effect<EmbeddingResult, EmbeddingError>;

  /**
   * Embed multiple texts (batched)
   */
  readonly embedBatch: (
    texts: ReadonlyArray<string>,
    taskType: TaskType
  ) => Effect.Effect<ReadonlyArray<EmbeddingResult>, EmbeddingError>;
}

export const EmbeddingProvider = Context.GenericTag<EmbeddingProvider>(
  "@beep/knowledge-server/EmbeddingProvider"
);

export class EmbeddingError extends S.TaggedError<EmbeddingError>()(
  "EmbeddingError",
  {
    message: S.String,
    provider: S.String,
    retryable: S.Boolean,
  }
) {}
```

### EmbeddingService with Caching

```typescript
// packages/knowledge/server/src/Embedding/EmbeddingService.ts
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { EmbeddingProvider, type TaskType } from "./EmbeddingProvider";
import { EmbeddingRepo } from "../db/repos/Embedding.repo";
import { Entities } from "@beep/knowledge-domain";

export class EmbeddingService extends Effect.Service<EmbeddingService>()(
  "@beep/knowledge-server/EmbeddingService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const provider = yield* EmbeddingProvider;
      const repo = yield* EmbeddingRepo;

      /**
       * Compute cache key for deduplication
       */
      const computeCacheKey = (text: string, model: string): string => {
        // Simple hash for now
        return `${model}:${hashText(text)}`;
      };

      return {
        /**
         * Embed single text with caching
         */
        embed: (
          text: string,
          taskType: TaskType,
          organizationId: string,
          ontologyId: string
        ) =>
          Effect.gen(function* () {
            const cacheKey = computeCacheKey(text, provider.config.model);

            // Check cache
            const cached = yield* repo.findByCacheKey(cacheKey, organizationId);
            if (O.isSome(cached)) {
              yield* Effect.logDebug("Embedding cache hit", { cacheKey });
              return cached.value.embedding;
            }

            // Generate embedding
            const result = yield* provider.embed(text, taskType);

            // Store in cache
            yield* repo.insert({
              organizationId,
              ontologyId,
              entityType: taskType,
              entityId: cacheKey,
              embedding: result.vector,
              contentText: text,
              model: result.model,
            });

            return result.vector;
          }),

        /**
         * Embed entities from extraction result
         */
        embedEntities: (
          entities: ReadonlyArray<AssembledEntity>,
          organizationId: string,
          ontologyId: string
        ) =>
          Effect.gen(function* () {
            yield* Effect.logInfo("Embedding entities", { count: entities.length });

            const texts = entities.map(e =>
              `${e.canonicalName ?? e.mention} is a ${e.primaryType}`
            );

            const results = yield* provider.embedBatch(texts, "clustering");

            // Store embeddings
            for (let i = 0; i < entities.length; i++) {
              const entity = entities[i]!;
              const result = results[i]!;

              yield* repo.insert({
                organizationId,
                ontologyId,
                entityType: "entity",
                entityId: entity.id,
                embedding: result.vector,
                contentText: texts[i],
                model: result.model,
              });
            }

            yield* Effect.logInfo("Entity embedding complete");
          }),

        /**
         * Find similar entities via pgvector
         */
        findSimilar: (
          queryVector: ReadonlyArray<number>,
          organizationId: string,
          limit: number = 10,
          threshold: number = 0.7
        ) =>
          Effect.gen(function* () {
            // Uses pgvector cosine similarity
            return yield* repo.findSimilar(queryVector, organizationId, limit, threshold);
          }),
      };
    }),
  }
) {}
```

### GroundingService

```typescript
// packages/knowledge/server/src/Grounding/GroundingService.ts
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { EmbeddingService } from "../Embedding/EmbeddingService";
import type { AssembledRelation, KnowledgeGraph } from "../Extraction/GraphAssembler";

const DEFAULT_CONFIDENCE_THRESHOLD = 0.8;

export interface GroundingConfig {
  /**
   * Minimum similarity for a relation to be considered grounded
   */
  readonly confidenceThreshold?: number;

  /**
   * Whether to include ungrounded relations with updated confidence
   */
  readonly keepUngrounded?: boolean;
}

export interface GroundingResult {
  /**
   * Relations that passed grounding
   */
  readonly groundedRelations: readonly AssembledRelation[];

  /**
   * Relations that failed grounding (if keepUngrounded=true)
   */
  readonly ungroundedRelations: readonly AssembledRelation[];

  /**
   * Statistics
   */
  readonly stats: {
    readonly total: number;
    readonly grounded: number;
    readonly ungrounded: number;
    readonly averageConfidence: number;
  };
}

export class GroundingService extends Effect.Service<GroundingService>()(
  "@beep/knowledge-server/GroundingService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const embedding = yield* EmbeddingService;

      /**
       * Convert relation to natural language statement
       */
      const relationToStatement = (
        relation: AssembledRelation,
        subjectMention: string,
        objectMention?: string
      ): string => {
        const predicateLabel = extractLocalName(relation.predicate);

        if (relation.literalValue !== undefined) {
          return `${subjectMention} ${predicateLabel} ${relation.literalValue}`;
        }

        if (objectMention) {
          return `${subjectMention} ${predicateLabel} ${objectMention}`;
        }

        return `${subjectMention} has property ${predicateLabel}`;
      };

      /**
       * Compute cosine similarity between two vectors
       */
      const cosineSimilarity = (
        a: ReadonlyArray<number>,
        b: ReadonlyArray<number>
      ): number => {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
          dotProduct += a[i]! * b[i]!;
          normA += a[i]! * a[i]!;
          normB += b[i]! * b[i]!;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
      };

      return {
        /**
         * Verify relations against source text
         */
        verifyRelations: (
          graph: KnowledgeGraph,
          sourceText: string,
          organizationId: string,
          ontologyId: string,
          config: GroundingConfig = {}
        ): Effect.Effect<GroundingResult> =>
          Effect.gen(function* () {
            const threshold = config.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;

            yield* Effect.logInfo("Grounding relations", {
              relationCount: graph.relations.length,
              threshold,
            });

            // Embed source text
            const sourceEmbedding = yield* embedding.embed(
              sourceText,
              "search_document",
              organizationId,
              ontologyId
            );

            // Build entity index for mention lookup
            const entityById = new Map<string, { mention: string }>();
            for (const entity of graph.entities) {
              entityById.set(entity.id, { mention: entity.mention });
            }

            const grounded: AssembledRelation[] = [];
            const ungrounded: AssembledRelation[] = [];
            let totalConfidence = 0;

            for (const relation of graph.relations) {
              const subject = entityById.get(relation.subjectId);
              const object = relation.objectId
                ? entityById.get(relation.objectId)
                : undefined;

              if (!subject) {
                ungrounded.push(relation);
                continue;
              }

              // Convert to natural language
              const statement = relationToStatement(
                relation,
                subject.mention,
                object?.mention
              );

              // Embed statement
              const statementEmbedding = yield* embedding.embed(
                statement,
                "search_query",
                organizationId,
                ontologyId
              );

              // Compute similarity
              const similarity = cosineSimilarity(sourceEmbedding, statementEmbedding);

              const updatedRelation: AssembledRelation = {
                ...relation,
                confidence: similarity,
              };

              if (similarity >= threshold) {
                grounded.push(updatedRelation);
                totalConfidence += similarity;
              } else {
                if (config.keepUngrounded) {
                  ungrounded.push(updatedRelation);
                }
              }
            }

            const result: GroundingResult = {
              groundedRelations: grounded,
              ungroundedRelations: ungrounded,
              stats: {
                total: graph.relations.length,
                grounded: grounded.length,
                ungrounded: ungrounded.length,
                averageConfidence: grounded.length > 0
                  ? totalConfidence / grounded.length
                  : 0,
              },
            };

            yield* Effect.logInfo("Grounding complete", result.stats);

            return result;
          }),

        /**
         * Update knowledge graph with grounding results
         */
        applyGrounding: (
          graph: KnowledgeGraph,
          groundingResult: GroundingResult
        ): KnowledgeGraph => {
          return {
            ...graph,
            relations: groundingResult.groundedRelations,
            stats: {
              ...graph.stats,
              relationCount: groundingResult.groundedRelations.length,
            },
          };
        },
      };
    }),
  }
) {}
```

### Embedding Repository Extension

Extend the existing `Embedding.repo.ts` with similarity search:

```typescript
// Add to packages/knowledge/server/src/db/repos/Embedding.repo.ts

/**
 * Find embeddings by cache key
 */
findByCacheKey: (cacheKey: string, organizationId: string) =>
  Effect.gen(function* () {
    const db = yield* KnowledgeDb.Db;
    const result = yield* db.executeOne(
      sql`SELECT * FROM embeddings
          WHERE entity_id = ${cacheKey}
          AND organization_id = ${organizationId}
          LIMIT 1`
    );
    return O.fromNullable(result);
  }),

/**
 * Find similar embeddings using pgvector cosine distance
 */
findSimilar: (
  queryVector: ReadonlyArray<number>,
  organizationId: string,
  limit: number = 10,
  threshold: number = 0.7
) =>
  Effect.gen(function* () {
    const db = yield* KnowledgeDb.Db;
    const vectorString = `[${queryVector.join(",")}]`;

    return yield* db.executeQuery(
      sql`SELECT *,
                 1 - (embedding <=> ${vectorString}::vector) as similarity
          FROM embeddings
          WHERE organization_id = ${organizationId}
          AND 1 - (embedding <=> ${vectorString}::vector) >= ${threshold}
          ORDER BY embedding <=> ${vectorString}::vector
          LIMIT ${limit}`
    );
  }),
```

---

## Dependencies to Add

```bash
cd packages/knowledge/server
# Nomic embeddings (if using local)
bun add @nomic-ai/nomic-embed

# Voyage AI (if using cloud)
bun add voyageai

# OpenAI (if using as fallback)
bun add openai
```

---

## Verification Criteria

### Build Verification

```bash
bun run check --filter="@beep/knowledge-*"
bun run lint:fix --filter="@beep/knowledge-*"
```

### Unit Test Requirements

- EmbeddingProvider implementations return correct vector dimensions
- EmbeddingService caching prevents duplicate API calls
- GroundingService filters low-confidence relations
- Cosine similarity calculation is correct

### Integration Test Requirements

- Full pipeline: document → extraction → embedding → grounding
- pgvector similarity search returns correct results
- Provider fallback works when primary fails

---

## Critical Path Notes

1. **pgvector setup**: Ensure pgvector extension is enabled and embedding table has correct vector column type
2. **Provider API keys**: Each embedding provider needs credentials configured in environment
3. **Rate limiting**: Embed batch operations to avoid hitting API rate limits
4. **Vector dimensions**: Nomic uses 768 dimensions by default - ensure pgvector column matches

---

## Related Files for Reference

| Purpose | Path |
|---------|------|
| Embedding domain model | `packages/knowledge/domain/src/entities/Embedding/Embedding.model.ts` |
| Embedding table | `packages/knowledge/tables/src/tables/embedding.table.ts` |
| Existing Embedding repo | `packages/knowledge/server/src/db/repos/Embedding.repo.ts` |
| GraphAssembler output | `packages/knowledge/server/src/Extraction/GraphAssembler.ts` |
| ExtractionPipeline | `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` |

---

## Next Phase Preview

Phase 4 (Entity Resolution) will:
- Cluster similar entities across extractions
- Select canonical entity per cluster
- Maintain `owl:sameAs` provenance links
- Handle cross-source entity matching
