# Phase 2 Handoff: Extraction Pipeline

**Date**: 2026-01-18
**From**: Phase 1 (Ontology Service)
**To**: Phase 2 (Extraction Pipeline)
**Status**: Ready for implementation

---

## Phase 1 Completion Summary

Phase 1 successfully implemented the Ontology Service layer for OWL/RDFS parsing:

### Files Created

| Category | Files |
|----------|-------|
| Entity IDs | Added `ClassDefinitionId`, `PropertyDefinitionId` to `packages/shared/domain/src/entity-ids/knowledge/ids.ts` |
| Domain Models | `ClassDefinition.model.ts`, `PropertyDefinition.model.ts` in `packages/knowledge/domain/src/entities/` |
| Tables | `classDefinition.table.ts`, `propertyDefinition.table.ts` in `packages/knowledge/tables/src/tables/` |
| Parser | `packages/knowledge/server/src/Ontology/OntologyParser.ts` - N3.js-based Turtle parser |
| Cache | `packages/knowledge/server/src/Ontology/OntologyCache.ts` - LRU cache with content-hash validation |
| Service | `packages/knowledge/server/src/Ontology/OntologyService.ts` - High-level ontology API |
| Constants | `packages/knowledge/server/src/Ontology/constants.ts` - RDF/OWL/RDFS/SKOS namespace URIs |
| Repos | `Ontology.repo.ts`, `ClassDefinition.repo.ts`, `PropertyDefinition.repo.ts` |

### Key Patterns Established

| Pattern | Implementation | Notes |
|---------|----------------|-------|
| OntologyParser | `Effect.async` wrapping N3.js callbacks | Parses Turtle into N3.Store |
| OntologyContext | In-memory lookups for classes/properties | Memoized ancestor computation |
| OntologyCache | LRU with content-hash invalidation | Bounds memory, detects changes |
| OntologyService | Combines parser, cache, repos | Single entry point for ontology ops |
| DbRepo.make | Standard repo creation pattern | From `@beep/shared-domain/factories` |

### APIs Available for Phase 2

```typescript
// OntologyService methods available
interface OntologyService {
  // Load and parse ontology content
  load(key: string, content: string): Effect<OntologyContext>;

  // Load with external vocabulary content merged
  loadWithExternal(key: string, content: string, externalContent: string): Effect<OntologyContext>;

  // Search classes by label
  searchClasses(context: OntologyContext, query: string, limit?: number): Effect<ParsedClassDefinition[]>;

  // Search properties by label
  searchProperties(context: OntologyContext, query: string, limit?: number): Effect<ParsedPropertyDefinition[]>;

  // Cache management
  invalidateCache(key: string): Effect<void>;
  clearCache(): Effect<void>;
  getCacheStats(): Effect<CacheStats>;
}

// OntologyContext methods for querying loaded ontology
interface OntologyContext {
  readonly classes: ReadonlyArray<ParsedClassDefinition>;
  readonly properties: ReadonlyArray<ParsedPropertyDefinition>;

  // Get properties that apply to a class (by domain)
  getPropertiesForClass(classIri: string): ReadonlyArray<ParsedPropertyDefinition>;

  // Check if childIri is subclass of parentIri
  isSubClassOf(childIri: string, parentIri: string): boolean;

  // Get all ancestor classes (transitive)
  getAncestors(classIri: string): ReadonlyArray<string>;

  // Find class/property by IRI
  findClass(iri: string): Option<ParsedClassDefinition>;
  findProperty(iri: string): Option<ParsedPropertyDefinition>;
}
```

---

## Phase 2 Scope

Phase 2 implements the 6-phase streaming extraction pipeline for transforming documents into knowledge graph entities and relations.

### Primary Objectives

1. **NlpService**: Sentence-aware text chunking with configurable overlap
2. **MentionExtractor**: LLM-powered entity mention detection
3. **EntityExtractor**: Ontology-guided entity type classification
4. **RelationExtractor**: Triple extraction with confidence scoring
5. **ExtractionPipeline**: Orchestrates all stages as Effect Stream
6. **Structured Output Schemas**: Effect Schema for LLM responses

### Extraction Pipeline Stages

```
Document → Chunking → Mention Detection → Entity Extraction
                                              ↓
                    Graph Assembly ← Relation Extraction
```

| Stage | Input | Output | Service |
|-------|-------|--------|---------|
| 1. Chunking | Raw text | TextChunk[] | NlpService |
| 2. Mention | TextChunk | Mention[] | MentionExtractor |
| 3. Entity | Mention[] + OntologyContext | Entity[] | EntityExtractor |
| 4. Relation | Entity[] + TextChunk | Relation[] | RelationExtractor |
| 5. Assembly | Entity[] + Relation[] | KnowledgeGraph | GraphAssembler |
| 6. Persist | KnowledgeGraph | ExtractionResult | ExtractionRepo |

---

## Required Files to Create

### 1. NLP Service (Text Processing)

```
packages/knowledge/server/src/Nlp/
├── NlpService.ts       # Text chunking service
├── TextChunk.ts        # Chunk schema with offsets
└── index.ts
```

### 2. Extraction Services

```
packages/knowledge/server/src/Extraction/
├── MentionExtractor.ts     # Stage 2: Find entity mentions
├── EntityExtractor.ts      # Stage 3: Classify to ontology types
├── RelationExtractor.ts    # Stage 4: Extract triples
├── GraphAssembler.ts       # Stage 5: Merge into graph
├── ExtractionPipeline.ts   # Orchestration service
├── schemas/
│   ├── MentionOutput.ts    # LLM output schema for mentions
│   ├── EntityOutput.ts     # LLM output schema for entities
│   └── RelationOutput.ts   # LLM output schema for relations
└── index.ts
```

### 3. AI Integration

```
packages/knowledge/server/src/Ai/
├── AiService.ts        # Wrapper for @effect/ai
├── PromptTemplates.ts  # Extraction prompt builders
└── index.ts
```

---

## Implementation Guidance

### NlpService Pattern

```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as S from "effect/Schema";

export class TextChunk extends S.Class<TextChunk>("TextChunk")({
  index: S.Number,
  text: S.String,
  startOffset: S.Number,
  endOffset: S.Number,
}) {}

export class ChunkingConfig extends S.Class<ChunkingConfig>("ChunkingConfig")({
  maxChunkSize: S.Number,
  preserveSentences: S.Boolean,
  overlapSentences: S.Number,
}) {}

export class NlpService extends Effect.Service<NlpService>()(
  "@beep/knowledge-server/NlpService",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return {
        chunkText: (text: string, config: ChunkingConfig) =>
          Stream.fromIterable(splitIntoChunks(text, config)),
      };
    }),
  }
) {}
```

### Extraction Stage Pattern

```typescript
import * as Effect from "effect/Effect";
import { OntologyService, OntologyContext } from "../Ontology/index.js";
import { AiService } from "../Ai/index.js";

export class EntityExtractor extends Effect.Service<EntityExtractor>()(
  "@beep/knowledge-server/EntityExtractor",
  {
    dependencies: [AiService.Default, OntologyService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;
      const ontologyService = yield* OntologyService;

      return {
        extract: (mentions: Mention[], ontologyContext: OntologyContext) =>
          Effect.gen(function* () {
            // Build prompt with ontology class definitions
            const classOptions = ontologyContext.classes
              .map(c => `- ${c.label}: ${c.comment.pipe(O.getOrElse(() => ""))}`)
              .join("\n");

            const prompt = `Given these ontology classes:\n${classOptions}\n\nClassify these mentions:\n${JSON.stringify(mentions)}`;

            // Use structured output with Effect Schema
            const result = yield* ai.generateObject({
              schema: EntityOutputSchema,
              prompt,
            });

            return result.entities;
          }),
      };
    }),
  }
) {}
```

### Structured Output Schema

```typescript
// packages/knowledge/server/src/Extraction/schemas/EntityOutput.ts
import * as S from "effect/Schema";

export class ExtractedEntity extends S.Class<ExtractedEntity>("ExtractedEntity")({
  mention: S.String,
  typeIri: S.String,
  confidence: S.Number,
  evidence: S.optional(S.String),
}) {}

export class EntityOutput extends S.Class<EntityOutput>("EntityOutput")({
  entities: S.Array(ExtractedEntity),
  reasoning: S.optional(S.String),
}) {}
```

### Using OntologyContext from Phase 1

```typescript
// Load ontology once, use for multiple extractions
const ontologyContext = yield* OntologyService.load("my-ontology", turtleContent);

// Get valid property predicates for an entity type
const personClass = ontologyContext.findClass("http://example.org/Person");
const personProperties = ontologyContext.getPropertiesForClass("http://example.org/Person");

// Validate extracted types against ontology
const isValidType = ontologyContext.findClass(extractedTypeIri).pipe(O.isSome);
```

---

## Verification Criteria

### Build Verification

```bash
bun run check --filter="@beep/knowledge-*"
bun run lint:fix --filter="@beep/knowledge-*"
```

### Unit Test Requirements

- NlpService correctly chunks text preserving sentences
- NlpService handles overlap correctly
- MentionExtractor returns valid mention schema
- EntityExtractor uses ontology classes for classification
- RelationExtractor respects ontology property constraints

### Integration Test Requirements

- Full pipeline: document → entities + relations
- Ontology-guided extraction respects type constraints
- Large document handling with streaming

---

## Dependencies

### NPM Packages to Add

```bash
cd packages/knowledge/server
bun add @effect/ai wink-nlp
```

### Effect Patterns

- `Stream` for processing large documents
- `Effect.all` with batching for LLM calls
- Structured output with `S.Class` schemas
- `Effect.Service` composition with dependencies

---

## Critical Path Notes

1. **OntologyContext integration**: Load ontology BEFORE extraction, pass context to extractors
2. **Streaming for large docs**: Use `Stream.flatMap` to process chunks without loading all into memory
3. **LLM rate limiting**: Consider `Effect.retry` with backoff for API calls
4. **Confidence thresholds**: Filter low-confidence extractions before persistence

---

## Related Files for Reference

| Purpose | Path |
|---------|------|
| OntologyService | `packages/knowledge/server/src/Ontology/OntologyService.ts` |
| OntologyContext | `packages/knowledge/server/src/Ontology/OntologyService.ts:25-55` |
| ParsedClassDefinition | `packages/knowledge/server/src/Ontology/OntologyParser.ts:22-40` |
| ParsedPropertyDefinition | `packages/knowledge/server/src/Ontology/OntologyParser.ts:48-69` |
| Entity model | `packages/knowledge/domain/src/entities/Entity/Entity.model.ts` |
| Relation model | `packages/knowledge/domain/src/entities/Relation/Relation.model.ts` |
| Extraction model | `packages/knowledge/domain/src/entities/Extraction/Extraction.model.ts` |
| Mention model | `packages/knowledge/domain/src/entities/Mention/Mention.model.ts` |
| MASTER_ORCHESTRATION | `specs/knowledge-graph-integration/MASTER_ORCHESTRATION.md` |

---

## Next Phase Preview

Phase 3 (Embedding & Grounding) will:
- Generate embeddings for extracted entities
- Ground entities to external knowledge bases
- Update confidence scores based on grounding results
