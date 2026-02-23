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

### Workflow/Service Function Boundaries

For reusable workflow/service helpers, use named `Effect.fn` with explicit fallback/cause handling.

```typescript
// REQUIRED - reusable boundary
const emitProgress = Effect.fn("ExtractionWorkflow.emitProgress")(
  function* (stream: ProgressStream, progress: number) {
    yield* stream.offer({ progress });
  },
  Effect.catchAllCause((cause) =>
    Effect.logWarning("Failed to emit progress").pipe(
      Effect.annotateLogs({ cause })
    )
  )
);
```

```typescript
// ALLOWED - local orchestration only
const run = Effect.gen(function* () {
  const service = yield* ExtractionPipeline;
  return yield* service.extract(input, context, options);
});
```

### Yieldable Tagged Errors

Do not wrap yieldable tagged errors with `Effect.fail(...)`.

```typescript
// FORBIDDEN
return yield* Effect.fail(new ActivityFailedError({ /* ... */ }));

// REQUIRED
return yield* new ActivityFailedError({ /* ... */ });
```

```typescript
// FORBIDDEN in catch handlers
Effect.catchAllCause((cause) => Effect.fail(new ActivityFailedError({ cause: String(cause) })))

// REQUIRED
Effect.catchAllCause((cause) => new ActivityFailedError({ cause: String(cause) }))
```

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

## Gmail Extraction Integration

The `GmailExtractionAdapter` provides read-only email extraction optimized for knowledge graph ingestion.

### Required Scopes

```typescript
import { GmailScopes } from "@beep/google-workspace-domain";

export const REQUIRED_SCOPES = [GmailScopes.read] as const;
```

Scope: `https://www.googleapis.com/auth/gmail.readonly` - Read-only access for extraction (principle of least privilege).

### Key Operations

| Method | Purpose | Returns |
|--------|---------|---------|
| `extractEmailsForKnowledgeGraph` | Extract emails matching query | `ReadonlyArray<ExtractedEmailDocument>` |
| `extractThreadContext` | Extract full conversation thread | `ThreadContext` |

### Usage Pattern

The `GmailExtractionAdapter` requires `AuthContext` at layer construction time, so it must be provided within the request context where `AuthContext` is available.

```typescript
import { GmailExtractionAdapter } from "@beep/knowledge-server/adapters";
import * as GoogleWorkspace from "@beep/runtime-server/GoogleWorkspace.layer";
import * as Effect from "effect/Effect";

// In a handler with AuthContext available:
const extractEmailsForKnowledge = Effect.gen(function* () {
  const extractor = yield* GmailExtractionAdapter;

  // Extract recent emails from a specific sender
  const documents = yield* extractor.extractEmailsForKnowledgeGraph(
    "from:investor@example.com after:2024/01/01",
    maxResults: 50
  );

  // Documents are ready for entity/relation extraction
  return documents;
}).pipe(
  Effect.provide(GoogleWorkspace.layer)
);
```

### Extracted Document Format

```typescript
export interface ExtractedEmailDocument {
  readonly sourceId: string;              // Gmail message ID
  readonly sourceType: "gmail";
  readonly title: string;                 // Email subject
  readonly content: string;               // Extracted text (HTML stripped)
  readonly metadata: EmailMetadata;
  readonly extractedAt: DateTime.Utc;
}

export interface EmailMetadata {
  readonly from: string;
  readonly to: ReadonlyArray<string>;
  readonly cc: ReadonlyArray<string>;
  readonly date: O.Option<DateTime.Utc>;
  readonly threadId: string;
  readonly labels: ReadonlyArray<string>;
}
```

### Thread Context Extraction

For extracting full conversation context:

```typescript
const extractConversation = (threadId: string) =>
  Effect.gen(function* () {
    const extractor = yield* GmailExtractionAdapter;
    const thread = yield* extractor.extractThreadContext(threadId);

    // thread.participants - all unique email addresses
    // thread.messages - all messages in chronological order
    // thread.dateRange - earliest and latest timestamps
    return thread;
  }).pipe(
    Effect.provide(GoogleWorkspace.layer)
  );
```

### Content Extraction Features

- **HTML stripping**: Converts HTML emails to plain text for LLM consumption
- **Multipart handling**: Prefers `text/plain` over `text/html` when available
- **Nested parts**: Recursively extracts content from nested MIME structures
- **Base64 URL decoding**: Handles Gmail's base64url-encoded content
- **Header parsing**: Extracts and validates email addresses from headers

### Error Handling

The adapter emits these tagged errors:
- `GoogleApiError` - HTTP/API failures (network, invalid response)
- `GoogleAuthenticationError` - OAuth token failures
- `GoogleScopeExpansionRequiredError` - User lacks required OAuth scopes (triggers incremental consent)

```typescript
import { GoogleScopeExpansionRequiredError } from "@beep/google-workspace-domain";

const program = extractEmailsForKnowledge.pipe(
  Effect.catchTag("GoogleScopeExpansionRequiredError", (error) =>
    // Redirect user to OAuth consent with read-only scope
    redirectToOAuthConsent(error.requiredScopes)
  )
);
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
- [ ] Gmail extraction operations check for scope expansion errors

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
