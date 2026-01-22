# @beep/knowledge-server

Server infrastructure for ontology-guided knowledge extraction, entity resolution, and GraphRAG context assembly.

## Overview

This package provides the server-side infrastructure for the knowledge graph vertical slice:
- Effect-based LLM integration via `@effect/ai`
- Ontology-guided entity and relation extraction
- Vector embedding storage with pgvector similarity search
- GraphRAG subgraph retrieval for LLM context

## Installation

```bash
bun add @beep/knowledge-server
```

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Raw Text    │────▶│ Extraction      │────▶│ Knowledge       │
│             │     │ Pipeline        │     │ Graph           │
└─────────────┘     └─────────────────┘     └─────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │ Stages:               │
               │ 1. Text Chunking      │
               │ 2. Mention Extraction │
               │ 3. Entity Typing      │
               │ 4. Relation Extraction│
               │ 5. Graph Assembly     │
               │ 6. Grounding          │
               └───────────────────────┘
```

## Module Reference

### Runtime / LLM Layers

Provider system for LLM integration via `@effect/ai`.

```typescript
import { AnthropicLlmLive, OpenAiLlmLive } from "@beep/knowledge-server/Runtime";

// Use Anthropic Claude
const program = Effect.gen(function* () {
  const llm = yield* LanguageModel.LanguageModel;
  // ...
}).pipe(Effect.provide(AnthropicLlmLive));

// Use OpenAI
const program = Effect.gen(function* () {
  const llm = yield* LanguageModel.LanguageModel;
  // ...
}).pipe(Effect.provide(OpenAiLlmLive));
```

### Extraction Pipeline

Ontology-guided extraction from unstructured text.

```typescript
import { ExtractionPipeline } from "@beep/knowledge-server/Extraction";

const extractKnowledge = Effect.gen(function* () {
  const pipeline = yield* ExtractionPipeline;
  const result = yield* pipeline.extract(text, ontologyContext);
  return result.graph; // { entities, relations }
});
```

| Component | Purpose |
|-----------|---------|
| `MentionExtractor` | Extracts entity mentions from text |
| `EntityExtractor` | Types mentions using ontology classes |
| `RelationExtractor` | Extracts subject-predicate-object triples |
| `GraphAssembler` | Assembles entities and relations into graph |

### GraphRAG Service

Retrieval-Augmented Generation using knowledge graph traversal.

```typescript
import { GraphRAGService, GraphRAGQuery } from "@beep/knowledge-server/GraphRAG";

const retrieveContext = Effect.gen(function* () {
  const graphrag = yield* GraphRAGService;

  const result = yield* graphrag.query(
    new GraphRAGQuery({
      query: "Who are the key investors in AI startups?",
      topK: 10,       // Seed entities from k-NN search
      hops: 2,        // Graph traversal depth
      maxTokens: 4000 // Context budget
    }),
    organizationId,
    ontologyId
  );

  // result.context - Formatted for LLM consumption
  // result.entities - Retrieved entities
  // result.relations - Retrieved relations
  // result.scores - RRF relevance scores
});
```

| Component | Purpose |
|-----------|---------|
| `GraphRAGService` | Main service combining k-NN + traversal + RRF |
| `RrfScorer` | Reciprocal Rank Fusion scoring |
| `ContextFormatter` | LLM context formatting with token budgeting |

### Embedding Service

Vector embeddings for similarity search.

```typescript
import { EmbeddingService } from "@beep/knowledge-server/Embedding";

const program = Effect.gen(function* () {
  const embedding = yield* EmbeddingService;

  // Generate embedding
  const vector = yield* embedding.embed(text, "search_query", orgId, ontologyId);

  // Find similar entities
  const similar = yield* embedding.findSimilar(vector, orgId, limit, threshold);
});
```

### Ontology Service

OWL ontology parsing and context generation.

```typescript
import { OntologyService } from "@beep/knowledge-server/Ontology";

const program = Effect.gen(function* () {
  const ontology = yield* OntologyService;
  const context = yield* ontology.getContext(ontologyId, orgId);
  // context.classes - Available entity types
  // context.properties - Available relation predicates
});
```

### Entity Resolution

Clustering and deduplication of extracted entities.

```typescript
import { EntityResolutionService } from "@beep/knowledge-server/EntityResolution";

const program = Effect.gen(function* () {
  const resolver = yield* EntityResolutionService;
  const clusters = yield* resolver.clusterEntities(entities, threshold);
  const canonical = yield* resolver.selectCanonical(cluster);
});
```

## Database Repositories

| Repository | Purpose |
|------------|---------|
| `EntityRepo` | Knowledge entities with graph queries |
| `RelationRepo` | Relations with traversal queries |
| `EmbeddingRepo` | Vector embeddings with similarity search |
| `OntologyRepo` | Ontology metadata |
| `ClassDefinitionRepo` | OWL class definitions |
| `PropertyDefinitionRepo` | OWL property definitions |
| `EntityClusterRepo` | Entity resolution clusters |
| `SameAsLinkRepo` | Entity equivalence links |

## Testing

Tests use `@beep/testkit` with mock LLM layers.

```typescript
import { effect, strictEqual } from "@beep/testkit";
import { MockLlmLive, setMockResponse, clearMockResponses } from "../_shared/TestLayers";

effect("extracts entities", () =>
  Effect.gen(function* () {
    clearMockResponses();
    setMockResponse("EntityOutput", { entities: [...] });

    const extractor = yield* EntityExtractor;
    const result = yield* extractor.classify(mentions, chunk, ontologyContext);

    strictEqual(result.entities.length, 2);
  }).pipe(Effect.provide(TestLayer))
);
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain entities and schemas |
| `@beep/knowledge-tables` | Drizzle table definitions |
| `@beep/shared-server` | Base repository patterns |
| `@effect/ai` | LLM integration |
| `@effect/ai-anthropic` | Anthropic provider |
| `@effect/ai-openai` | OpenAI provider |
| `effect` | Core Effect runtime |

## Related Packages

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain models and schemas |
| `@beep/knowledge-tables` | Database table definitions |
| `@beep/knowledge-client` | Client-side RPC contracts |
| `@beep/knowledge-ui` | React components |
