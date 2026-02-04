# @beep/knowledge-server - Agent Guide

## Purpose & Fit

Server infrastructure for the knowledge graph vertical slice:
- Ontology-guided entity and relation extraction via LLM
- Vector embeddings with pgvector similarity search
- GraphRAG subgraph retrieval for agent context
- Entity resolution and deduplication

## Surface Map

### Core Modules

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `Runtime/` | LLM provider layers | `AnthropicLlmLive`, `OpenAiLlmLive` |
| `Extraction/` | Entity/relation extraction | `ExtractionPipeline`, `MentionExtractor`, `EntityExtractor`, `RelationExtractor` |
| `GraphRAG/` | Subgraph retrieval | `GraphRAGService`, `RrfScorer`, `ContextFormatter` |
| `Embedding/` | Vector embeddings | `EmbeddingService`, `MockEmbeddingModelLayer`, `OpenAiEmbeddingLayerConfig` |
| `Ontology/` | OWL parsing | `OntologyService`, `OntologyParser`, `OntologyCache` |
| `EntityResolution/` | Clustering/dedup | `EntityResolutionService`, `EntityClusterer` |
| `Grounding/` | Confidence filtering | `GroundingService`, `ConfidenceFilter` |
| `Nlp/` | Text processing | `NlpService`, `TextChunk` |

### Database Repositories

| Repository | Purpose | Key Methods |
|------------|---------|-------------|
| `EntityRepo` | Entity CRUD + graph queries | `findByIds`, `findByOntology`, `findByType` |
| `RelationRepo` | Relations + traversal | `findBySourceIds`, `findByTargetIds`, `findByEntityIds` |
| `EmbeddingRepo` | Vector storage | `findSimilar`, `upsert` |
| `OntologyRepo` | Ontology metadata | Standard CRUD |
| `ClassDefinitionRepo` | OWL classes | `findByOntology` |
| `PropertyDefinitionRepo` | OWL properties | `findByOntology` |

## Embedding Layer Composition

The `EmbeddingService` uses `@effect/ai`'s `EmbeddingModel.EmbeddingModel` for vector embeddings.

### Production Usage

```typescript
import { EmbeddingServiceLive, OpenAiEmbeddingLayerConfig } from "@beep/knowledge-server/Embedding";
import * as Layer from "effect/Layer";

const KnowledgeLive = EmbeddingServiceLive.pipe(
  Layer.provide(OpenAiEmbeddingLayerConfig)
);
```

### Custom Configuration

```typescript
import { EmbeddingServiceLive, makeOpenAiEmbeddingLayer } from "@beep/knowledge-server/Embedding";
import * as Redacted from "effect/Redacted";
import * as Layer from "effect/Layer";

const CustomEmbeddingLayer = makeOpenAiEmbeddingLayer({
  apiKey: Redacted.make(process.env.OPENAI_API_KEY!),
  model: "text-embedding-3-large",
  dimensions: 1024,
});

const KnowledgeLive = EmbeddingServiceLive.pipe(
  Layer.provide(CustomEmbeddingLayer)
);
```

### Testing Usage

```typescript
import { EmbeddingServiceLive, MockEmbeddingModelLayer } from "@beep/knowledge-server/Embedding";
import * as Layer from "effect/Layer";

const TestLayer = EmbeddingServiceLive.pipe(
  Layer.provide(MockEmbeddingModelLayer)
);
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | - | API key for OpenAI embeddings |
| `OPENAI_EMBEDDING_MODEL` | No | `text-embedding-3-small` | Model to use |
| `OPENAI_EMBEDDING_DIMENSIONS` | No | `768` | Vector dimensions |

**Note**: `OpenAiEmbeddingLayerConfig` reads from Effect Config which uses environment variables.

## Authoring Guardrails

### LLM Integration

```typescript
// REQUIRED - Use @effect/ai LanguageModel
import { LanguageModel } from "@effect/ai";

const model = yield* LanguageModel.LanguageModel;
const result = yield* model.generateObject({
  prompt: Prompt.make([
    { role: "system" as const, content: systemPrompt },
    { role: "user" as const, content: userPrompt }
  ]),
  schema: MyOutputSchema,
  objectName: "MyOutput"  // Optional but helpful for debugging
});

// NEVER - Use old AiService
// import { AiService } from "./Ai"; // DELETED
```

### Schema Patterns

```typescript
// REQUIRED - Use S.optionalWith for fields with defaults
topK: S.optionalWith(S.Number.pipe(S.greaterThan(0)), { default: () => 10 })

// For booleans with defaults, use the BS helper
enabled: BS.BoolWithDefault(false)

// NEVER - Use deprecated BS.toOptionalWithDefault
// topK: BS.toOptionalWithDefault(S.Number)(10)  // WRONG! Deprecated
```

### Sorting with Effect

```typescript
// REQUIRED - Use Order.mapInput for custom sorting
import * as Order from "effect/Order";
import * as Num from "effect/Number";
import * as A from "effect/Array";

const sorted = A.sort(items, Order.mapInput(Num.Order, (item) => -item.score));

// NEVER - Use compare object (not Effect pattern)
// A.sort(items, { compare: (a, b) => b.score - a.score });  // WRONG!
```

### Repository Patterns

```typescript
// REQUIRED - Use sql.in() for array queries
const results = yield* sql<Model>`
  SELECT * FROM ${sql(tableName)}
  WHERE organization_id = ${orgId}
    AND subject_id IN ${sql.in(sourceIds)}
`.pipe(Effect.mapError(/* ... */));

// NEVER - Build SQL strings manually
// WHERE subject_id IN (${sourceIds.join(",")})  // WRONG!
```

## Testing Patterns

### Mock LLM Setup

```typescript
import { MockLlmLive, setMockResponse, clearMockResponses } from "../_shared/TestLayers";

effect("extracts entities", () =>
  Effect.gen(function* () {
    clearMockResponses();
    setMockResponse("EntityOutput", {
      entities: [
        { mention: "John", typeIri: "http://schema.org/Person", confidence: 0.9 }
      ]
    });

    const extractor = yield* EntityExtractor;
    const result = yield* extractor.classify(mentions, chunk, ontologyContext);

    strictEqual(result.entities.length, 1);
  }).pipe(Effect.provide(TestLayer))
);
```

### Test Layer Composition

```typescript
// Service tests with mock LLM
const TestMentionExtractorLayer = Layer.provide(MentionExtractor.Default, MockLlmLive);

// Pure logic tests (no LLM needed)
effect("formats context", () =>
  Effect.gen(function* () {
    const result = formatContext(entities, relations);
    assertTrue(result.includes("## Entities"));
  })
);
```

## Quick Recipes

### GraphRAG Query

```typescript
import { GraphRAGService, GraphRAGQuery } from "@beep/knowledge-server/GraphRAG";

const retrieveContext = Effect.gen(function* () {
  const graphrag = yield* GraphRAGService;

  const result = yield* graphrag.query(
    new GraphRAGQuery({
      query: "Who are the key investors?",
      topK: 10,
      hops: 2,
      maxTokens: 4000
    }),
    organizationId,
    ontologyId
  );

  return result.context; // Formatted for LLM
});
```

### Extraction Pipeline

```typescript
import { ExtractionPipeline } from "@beep/knowledge-server/Extraction";

const extractFromText = Effect.gen(function* () {
  const pipeline = yield* ExtractionPipeline;

  const result = yield* pipeline.extract(text, ontologyContext, {
    minMentionConfidence: 0.5,
    minEntityConfidence: 0.7,
    minRelationConfidence: 0.6
  });

  return result.graph; // { entities, relations }
});
```

### Entity Traversal

```typescript
import { RelationRepo } from "@beep/knowledge-server/db";

const traverseOneHop = Effect.gen(function* () {
  const repo = yield* RelationRepo;

  // Outgoing relations
  const outgoing = yield* repo.findBySourceIds(entityIds, orgId);

  // Incoming relations
  const incoming = yield* repo.findByTargetIds(entityIds, orgId);

  // Collect connected entity IDs
  const connected = [...outgoing.map(r => r.objectId), ...incoming.map(r => r.subjectId)];
});
```

## Verifications

```bash
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

## Contributor Checklist

- [ ] LLM calls use `LanguageModel.LanguageModel` from `@effect/ai`
- [ ] Prompts use `Prompt.make()` with `as const` for role literals
- [ ] Schema defaults use `S.optionalWith(schema, { default: () => value })` or `BS.BoolWithDefault(value)` for booleans
- [ ] Sorting uses `Order.mapInput` not compare objects
- [ ] SQL arrays use `sql.in()` not string interpolation
- [ ] Tests use `@beep/testkit` with `effect()` wrapper
- [ ] Tests use `clearMockResponses()` before setting mocks
- [ ] Telemetry spans added via `Effect.withSpan`

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/knowledge-domain` | Domain models |
| `@beep/knowledge-tables` | Table definitions |
| `@beep/shared-server` | Repository patterns |
| `@effect/ai` | LLM integration |
| `@effect/ai-anthropic` | Anthropic provider |
| `@effect/ai-openai` | OpenAI provider |
| `@beep/testkit` | Testing utilities |
