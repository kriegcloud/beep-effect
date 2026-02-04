# CLI Extraction Infrastructure Issues

**Date**: 2024-12-23
**Context**: Implementing `bun run extract` CLI command for ad-hoc extraction testing

---

## Problems Encountered

### 1. Pre-Built Layers Have Config "Baked In"

**Problem**: Layer bundles like `CliExtractionLayer` are constructed at module load time with `ConfigServiceDefault`, which reads from environment variables. When trying to override config via CLI flags, the values are already "baked in".

**Symptom**: Setting `--no-external-vocabs` flag had no effect. External vocabularies were still loaded from the `.env` file value.

**Root Cause**:
```typescript
// This layer is built at module load time
export const CliExtractionLayer = Layer.mergeAll(
  ExtractionWorkflowBundle,  // Already has ConfigServiceDefault provided
  RdfBuilderBundle
).pipe(...)
```

When `Layer.setConfigProvider(customProvider)` is used later, it doesn't retroactively change how nested layers read config.

**Workaround**: Created `makeCliExtractionLayer(configProvider)` function that rebuilds all layer bundles with the custom config provider. This is verbose and duplicates bundle definitions.

**Better Solution Needed**:
- Separate "layer shape" from "layer instantiation"
- ConfigService should be a required input, not pre-provided
- Or use `Layer.unwrapEffect` pattern more systematically

---

### 2. ConfigProvider.fromMap Path Delimiter Mismatch

**Problem**: `ConfigProvider.fromMap` defaults to `.` as path delimiter, but `ConfigProvider.fromEnv()` uses `_`.

**Symptom**: Setting `ONTOLOGY_EXTERNAL_VOCABS_PATH` in the map didn't override the env value.

**Fix**:
```typescript
// Must specify pathDelim to match env var format
ConfigProvider.fromMap(configMap, { pathDelim: "_" })
```

**Better Solution Needed**:
- Document this clearly
- Consider a helper like `ConfigProvider.fromMapEnvStyle()`
- Or use nested key format consistently (`ONTOLOGY.EXTERNAL_VOCABS_PATH`)

---

### 3. @effect/cli Options Must Precede Positional Args

**Problem**: CLI command fails with "unknown argument" when options come after positional args.

**Symptom**:
```bash
# FAILS
bun run extract ontology.ttl --text "hello"
# Received unknown argument: '--text'

# WORKS
bun run extract --text "hello" ontology.ttl
```

**Workaround**: Documented in help output, but unintuitive for users.

**Better Solution Needed**:
- Check if @effect/cli has configuration for this
- Or add validation with helpful error message

---

### 4. Voyage AI Embedding Response Schema Error

**Problem**: Voyage AI embedding requests fail with schema validation error.

**Error**:
```
EmbeddingInvalidResponseError: Invalid Voyage response:
{ readonly object: "list"; readonly data: ReadonlyArray<...> }
└─ ["object"]
   └─ is missing
```

**Current Schema** (in `src/Service/VoyageEmbeddingProvider.ts:79-84`):
```typescript
const VoyageResponseSchema = Schema.Struct({
  object: Schema.Literal("list"),  // <-- Expected but missing
  data: Schema.Array(VoyageEmbeddingData),
  model: Schema.String,
  usage: VoyageUsage
})
```

**Root Cause**: The actual Voyage API response structure doesn't match our schema. The `object: "list"` field is expected but not present in the response.

**Note**: `.env` has valid Voyage API key configured - this is a schema mismatch, not missing credentials.

**Impact**: Falls back to BM25 text search for ontology class retrieval, which may produce lower quality semantic matching.

**Fix Needed**:
1. Test against actual Voyage API to capture real response format
2. Update schema to match actual response (likely make `object` optional or remove)
3. Add integration test with recorded responses

**File**: `src/Service/VoyageEmbeddingProvider.ts`

---

### 5. Empty String Config Values May Not Override

**Problem**: Setting config value to empty string `""` may not properly override environment variable.

**Initial Attempt**:
```typescript
configMap.set("ONTOLOGY_EXTERNAL_VOCABS_PATH", "")
```

**Workaround**: Used a sentinel value instead:
```typescript
configMap.set("ONTOLOGY_EXTERNAL_VOCABS_PATH", "__SKIP_EXTERNAL_VOCABS__")
```

**Note**: This may have been a red herring - the real issue was the pathDelim mismatch. But worth investigating if empty string is a valid override value.

---

### 6. Layer Composition Complexity

**Problem**: Building a "custom config" version of the extraction layer required duplicating ~70 lines of layer composition code in `makeCliExtractionLayer`.

**Current Structure**:
```
CoreDependenciesLayer (ConfigServiceDefault)
├── LlmExtractionBundle
│   └── needs ConfigService
├── OntologyBundle
│   └── needs ConfigService, StorageService, NlpService
├── EmbeddingBundle
│   └── needs ConfigService, StorageService
└── ExtractionWorkflowBundle
    └── needs all of the above
```

Every bundle pre-provides `CoreDependenciesLayer`, making it impossible to substitute a different ConfigService without rebuilding everything.

**Better Architecture**:
```
// Layers should declare requirements, not provide them
export const LlmExtractionBundle: Layer<
  EntityExtractor | RelationExtractor,
  never,
  ConfigService | LanguageModel  // Requirements as inputs
>

// Composition at the edge
const app = LlmExtractionBundle.pipe(
  Layer.provide(myCustomConfigLayer),  // Choose config at composition time
  Layer.provide(makeLanguageModelLayer)
)
```

---

### 7. Embedding Provider Configuration Confusion

**Problem**: Provider selection exists (`EMBEDDING_PROVIDER=nomic|voyage`) but default behavior is unclear.

**Current State**:
- `NomicEmbeddingProvider` exists (local, transformers.js)
- `VoyageEmbeddingProvider` exists (API-based)
- `EmbeddingInfrastructure` layer uses `EmbeddingProviderFromConfig` to select
- But the `.env` may default to Voyage, which fails without API key

**Symptom**: Semantic search fails with Voyage API error, falls back to BM25:
```
[WARN] Semantic search failed, using BM25 fallback
```

**Better Solution Needed**:
- Default to `nomic` (local) in development
- Only use `voyage` when explicitly configured with API key
- Add health check for embedding provider at startup
- Consider deterministic mock embeddings for tests

**Files**:
- `src/Runtime/EmbeddingLayers.ts` - Provider selection logic
- `src/Service/NomicEmbeddingProvider.ts` - Local provider
- `src/Service/VoyageEmbeddingProvider.ts` - API provider

---

### 8. Service Dependencies Not Explicit in Types

**Problem**: Layer bundles hide their actual requirements. Hard to know what services a layer needs without tracing through code.

**Example**:
```typescript
// What does OntologyService.Default actually need?
// Have to read the source to find out:
// - ConfigService
// - StorageService
// - NlpService (which needs EmbeddingService...)
// - RdfBuilder
// - OntologyRegistryService (optional)
```

**Better Solution**:
- Document dependency graph
- Use explicit Layer type annotations
- Consider `Layer.Tag` pattern for clearer requirements

---

## Recommendations

### Short Term
1. **Document CLI usage**: Options must come before positional args
2. **Fix Voyage schema**: Update to match actual API response
3. **Add integration test**: Test extraction with mock LLM to verify layer composition

### Medium Term
1. **Refactor layer bundles**: Remove pre-provided `CoreDependenciesLayer`, make ConfigService a requirement
2. **Create TestConfigProvider factory**: Easy creation of config providers for testing
3. **Add `ConfigProvider.fromMapEnvStyle()` helper**: Matches env var conventions

### Long Term
1. **Service dependency analysis**: Map out full dependency graph
2. **Layer composition patterns doc**: Document best practices for testable layers
3. **Consider Effect's built-in testing utilities**: `TestServices`, `TestClock`, etc.

---

## Related Files

- `src/Cli/Commands/Extract.ts` - CLI command implementation
- `src/Runtime/WorkflowLayers.ts` - Layer bundles and `makeCliExtractionLayer`
- `src/Service/Config.ts` - ConfigService and providers
- `src/Runtime/EmbeddingLayers.ts` - Voyage embedding integration

---

## Test Commands

```bash
# DUL-only extraction (no external vocabs)
bun run extract --no-external-vocabs -t "Test text" ontology.ttl

# With external vocabs
bun run extract -t "Test text" ontology.ttl

# Verify config override is working
ONTOLOGY_EXTERNAL_VOCABS_PATH="" bun run extract ...
```
