# Agent Prompts - Knowledge Server @effect/ai Migration

> Copy-paste ready prompts for sub-agent delegations.

---

## CRITICAL: Source File Reading (DO THIS FIRST)

**Before delegating to any research agents**, the orchestrator MUST read the authoritative source files directly:

### Step 1: Read EmbeddingModel.ts

```bash
# Read the core embedding interface
Read tmp/effect/packages/ai/ai/src/EmbeddingModel.ts
```

Key extracts to note:
- `EmbeddingModel` class (Context.Tag) at line 88-91
- `Service` interface at lines 102-116
- `Result` interface at lines 140-150
- `make()` constructor at lines 192-256
- `makeDataLoader()` constructor at lines 269-311

### Step 2: Read OpenAiEmbeddingModel.ts

```bash
# Read the OpenAI embedding layer
Read tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts
```

Key extracts to note:
- `Config.Batched` interface at lines 65-71
- `layerBatched()` at lines 187-191
- `makeBatched()` internal at lines 112-144 (shows how it uses EmbeddingModel.make)

### Step 3: Read OpenAiClient.ts

```bash
# Read the OpenAI client
Read tmp/effect/packages/ai/openai/src/OpenAiClient.ts
```

Key extracts to note:
- `OpenAiClient` class (Context.Tag)
- `layerConfig()` for creating client from environment
- `createEmbedding()` method

---

## mcp-researcher: @effect/ai Documentation Research (SUPPLEMENTARY)

### Prompt

```
Research the @effect/ai package documentation focusing on embedding functionality.

NOTE: This is supplementary to the direct source file reading. The orchestrator should have already read:
- tmp/effect/packages/ai/ai/src/EmbeddingModel.ts
- tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts
- tmp/effect/packages/ai/openai/src/OpenAiClient.ts

Search for and document any ADDITIONAL information not found in source:

1. **EmbeddingModel Module**
   - EmbeddingModel service tag and interface
   - embed() and embedMany() method signatures
   - Service definition and dependency injection pattern

2. **EmbeddingModel.make() Constructor**
   - Required and optional parameters
   - embedMany callback signature
   - maxBatchSize configuration
   - cache configuration (capacity, timeToLive)

3. **EmbeddingModel.makeDataLoader() Constructor**
   - window parameter for time-based batching
   - Difference from make() batching

4. **EmbeddingModel.Result Type**
   - index field purpose
   - embeddings field type

5. **AiError Error Types**
   - HttpRequestError
   - HttpResponseError
   - MalformedOutput
   - Error construction patterns

Return structured documentation for each topic with code examples where available.
```

---

## mcp-researcher: @effect/ai-openai Documentation Research

### Prompt

```
Research the @effect/ai-openai package documentation focusing on embedding functionality.

Search for and document:

1. **OpenAiClient Service**
   - Service interface and methods
   - make() constructor parameters (apiKey, apiUrl, organizationId, projectId)
   - layer() and layerConfig() factory functions
   - createEmbedding() method

2. **OpenAiEmbeddingModel Module**
   - model() function for creating embedding models
   - layerBatched() layer factory
   - layerDataLoader() layer factory
   - Config interface options

3. **Config.Service Interface**
   - Model selection
   - Dimensions configuration
   - Encoding format options

4. **Layer Composition Patterns**
   - How OpenAiClient and OpenAiEmbeddingModel compose
   - HttpClient requirement
   - Error handling in layers

Return structured documentation with layer composition examples.
```

---

## codebase-researcher: Current Embedding Usage Analysis

### Prompt

```
Analyze the current embedding implementation in packages/knowledge/server/.

Research questions:

1. **EmbeddingProvider Consumers**
   - Which services import EmbeddingProvider?
   - How is EmbeddingProvider.embed() called?
   - How is EmbeddingProvider.embedBatch() called?

2. **TaskType Usage**
   - Where is TaskType enum used?
   - Is it actually affecting embedding generation?
   - Can it be removed without breaking functionality?

3. **EmbeddingResult Usage**
   - Which fields are actually read from EmbeddingResult?
   - Is usage.totalTokens used anywhere?
   - How is vector stored/processed?

4. **Error Handling**
   - Where is EmbeddingError caught?
   - What recovery logic exists?
   - Can AiError be a drop-in replacement?

5. **Layer Composition**
   - How is EmbeddingProvider provided in production?
   - What's in Runtime/LlmLayers.ts?
   - How do tests provide mock embeddings?

Scope your search to:
- packages/knowledge/server/src/Embedding/
- packages/knowledge/server/src/EntityResolution/
- packages/knowledge/server/src/GraphRAG/
- packages/knowledge/server/src/Grounding/
- packages/knowledge/server/test/

Return a usage map with file paths and specific code patterns.
```

---

## effect-code-writer: Create OpenAI Embedding Layer

### Prompt

```
Refactor packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts to use @effect/ai-openai.

Current state: Custom implementation with dynamic import of 'openai' npm package.

Target state: Use @effect/ai-openai/OpenAiClient and @effect/ai-openai/OpenAiEmbeddingModel.

Requirements:

1. Import from @effect/ai-openai (not direct openai package)
2. Create OpenAiClient layer using layerConfig with OPENAI_API_KEY from Config
3. Create OpenAiEmbeddingModel layer using layerBatched
4. Configure model: "text-embedding-3-small", dimensions: 768, maxBatchSize: 100
5. Compose layers properly (EmbeddingModel depends on OpenAiClient, OpenAiClient depends on HttpClient)
6. Export both the composed layer and individual layers for flexibility

Reference the existing patterns in:
- tmp/effect/packages/ai/openai/src/OpenAiClient.ts
- tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts

Follow @beep/knowledge-server Effect patterns:
- Namespace imports (import * as X from ...)
- Single-letter aliases (S, A, O, etc.)
- Layer.provide() for composition
- Effect.Service pattern where applicable

Do NOT:
- Keep the old custom implementation
- Use dynamic imports
- Create custom error types (use AiError from @effect/ai)
```

---

## effect-code-writer: Adapt EmbeddingService

### Prompt

```
Adapt packages/knowledge/server/src/Embedding/EmbeddingService.ts to use @effect/ai EmbeddingModel.

Current state: Uses custom EmbeddingProvider with TaskType parameter.

Target state: Uses EmbeddingModel from @effect/ai.

Changes required:

1. **Imports**
   - Add: import * as EmbeddingModel from "@effect/ai/EmbeddingModel"
   - Keep: EmbeddingRepo, effect imports

2. **Service Dependencies**
   - Replace: yield* EmbeddingProvider
   - With: yield* EmbeddingModel.EmbeddingModel

3. **embed() Method**
   - Remove taskType parameter (or make optional/ignored)
   - Call EmbeddingModel.embed() instead of provider.embed()
   - Adapt result to match current return type

4. **embedEntities() Method**
   - Use EmbeddingModel.embedMany() instead of provider.embedBatch()
   - Adapt Result[] to current format

5. **Error Handling**
   - Map AiError to EmbeddingError if needed for backward compatibility
   - Or update consumers to handle AiError directly

6. **getConfig() Method**
   - EmbeddingModel doesn't expose config
   - Either remove method or return hardcoded config

Keep:
- Cache key computation logic
- pgvector storage via EmbeddingRepo
- Span annotations
- Log statements

Reference packages for patterns:
- Current: packages/knowledge/server/src/Embedding/EmbeddingService.ts
- Target pattern: tmp/effect/packages/ai/ai/src/EmbeddingModel.ts
```

---

## test-writer: Update Embedding Tests

### Prompt

```
Update embedding tests in packages/knowledge/server/test/ to use @effect/ai patterns.

Tasks:

1. **Create MockEmbeddingModel Layer**

   Use EmbeddingModel.make() to create a mock:

   const MockEmbeddingLive = Layer.effect(
     EmbeddingModel.EmbeddingModel,
     EmbeddingModel.make({
       maxBatchSize: 100,
       embedMany: (inputs) =>
         Effect.succeed(
           inputs.map((_, index) => ({
             index,
             embeddings: new Array(768).fill(0),
           }))
         ),
     })
   )

2. **Update Test Layers**

   Replace MockEmbeddingProvider with MockEmbeddingLive in test compositions.

3. **Update Assertions**

   If EmbeddingResult shape changed, update assertions to match new format.

4. **Add New Tests**

   - Test batch embedding with EmbeddingModel.embedMany()
   - Test error handling with AiError types
   - Test cache integration still works

Use @beep/testkit patterns:
- effect() for unit tests
- layer() for integration tests
- strictEqual() for assertions
```

---

## architecture-pattern-enforcer: Validate Migration Patterns

### Prompt

```
Validate the @effect/ai migration patterns against beep-effect architecture rules.

Check:

1. **Layer Dependency Order**
   - EmbeddingModel depends on OpenAiClient
   - OpenAiClient depends on HttpClient
   - No circular dependencies

2. **Cross-Slice Import Restrictions**
   - No imports from other slices
   - Use @beep/* path aliases

3. **Effect Patterns Compliance**
   - Namespace imports only
   - No async/await
   - Schema.TaggedError for errors
   - Effect.Service pattern for services

4. **Error Handling**
   - AiError types used correctly
   - No raw Error constructors

5. **Configuration**
   - Environment config via effect/Config
   - Redacted for API keys

Scope: packages/knowledge/server/src/Embedding/

Reference: .claude/rules/effect-patterns.md

Output: outputs/architecture-review.md with pass/fail for each check.
```

---

## package-error-fixer: Fix Migration Errors

### Prompt

```
Fix all type errors, build errors, and lint issues in @beep/knowledge-server after the @effect/ai migration.

Target: packages/knowledge/server

Commands:
- bun run check --filter @beep/knowledge-server
- bun run build --filter @beep/knowledge-server
- bun run lint:fix --filter @beep/knowledge-server

Common issues to expect:
1. Type mismatches between old EmbeddingResult and new format
2. Missing imports for @effect/ai modules
3. Layer composition type errors
4. TaskType removal causing parameter mismatches

Fix strategy:
1. Run type check first
2. Fix errors in dependency order (providers -> service -> consumers)
3. Run build to catch any additional issues
4. Run lint:fix for formatting

Report progress after each error batch is fixed.
```
