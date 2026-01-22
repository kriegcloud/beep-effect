# Migration Design

> Step-by-step migration plan from AiService to @effect/ai

---

## Executive Summary

This document provides a detailed migration plan for replacing the custom `AiService` with `@effect/ai`'s `LanguageModel` service. The migration follows an incremental approach with verification steps between each change.

---

## Migration Overview

### Current State

```
AiService (custom)
├── generateObject() - UNUSED
├── generateObjectWithSystem() - USED (5 calls)
└── generateText() - UNUSED

Dependencies:
├── EntityExtractor → AiService
├── MentionExtractor → AiService
└── RelationExtractor → AiService
```

### Target State

```
LanguageModel.LanguageModel (@effect/ai)
├── generateObject(prompt, schema) - With Prompt.make() for system prompts
└── generate(request) - For streaming (future use)

Dependencies:
├── EntityExtractor → LanguageModel.LanguageModel
├── MentionExtractor → LanguageModel.LanguageModel
└── RelationExtractor → LanguageModel.LanguageModel
```

---

## System Prompt Migration (CRITICAL)

### Current Pattern

```typescript
// packages/knowledge/server/src/Extraction/EntityExtractor.ts:171
yield* ai.generateObjectWithSystem(
  EntityOutput,           // schema
  buildSystemPrompt(),    // system prompt
  buildEntityPrompt(...), // user prompt
  config.aiConfig         // config
)
```

### Target Pattern

```typescript
import { LanguageModel, Prompt } from "@effect/ai"

// Create combined prompt with system message
const prompt = Prompt.make([
  { role: "system", content: buildSystemPrompt() },
  { role: "user", content: buildEntityPrompt(...) }
])

const model = yield* LanguageModel.LanguageModel
const result = yield* model.generateObject(prompt, EntityOutput)
```

### Key Differences

| Aspect | Current AiService | @effect/ai LanguageModel |
|--------|-------------------|--------------------------|
| System prompt | Separate parameter | Part of Prompt.make([...]) |
| Schema position | First argument | Second argument |
| Config | Fourth argument | Options object (optional) |
| Return type | `AiGenerationResult<A>` | `{ value: A, usage: {...} }` |

---

## Migration Order

### Phase 4 Steps

| Step | File | Action | Risk | Verification |
|------|------|--------|------|--------------|
| 1 | package.json | Verify @effect/ai installed | Low | `bun install` |
| 2 | `Runtime/LlmLayers.ts` | Create provider Layers | Low | Type check |
| 3 | `Runtime/index.ts` | Export Layers | Low | Type check |
| 4 | `MentionExtractor.ts` | Migrate (simplest) | Medium | Unit test |
| 5 | `RelationExtractor.ts` | Migrate | Medium | Unit test |
| 6 | `EntityExtractor.ts` | Migrate (most complex) | Medium | Unit test |
| 7 | `ExtractionPipeline.ts` | Update Layer composition | Medium | Integration test |
| 8 | `PromptTemplates.ts` | Keep unchanged | Low | - |
| 9 | `Ai/AiService.ts` | DELETE | Low | Final verification |
| 10 | `Ai/index.ts` | Remove AiService export | Low | Type check |

### Order Rationale

1. **MentionExtractor first**: Simplest extractor with straightforward prompt structure
2. **RelationExtractor second**: Similar complexity to Mention, but different prompt
3. **EntityExtractor last**: Uses batching and has most complex logic
4. **Pipeline after extractors**: Depends on all extractors being migrated

---

## Step-by-Step Instructions

### Step 1: Verify Dependencies

```bash
# Check @effect/ai packages are installed
cat package.json | grep "@effect/ai"
# Expected: @effect/ai, @effect/ai-anthropic, @effect/ai-openai

# If missing:
bun add @effect/ai @effect/ai-anthropic @effect/ai-openai
```

### Step 2: Create LlmLayers.ts

```bash
# Create Runtime directory if not exists
mkdir -p packages/knowledge/server/src/Runtime
```

Create `packages/knowledge/server/src/Runtime/LlmLayers.ts`:

```typescript
/**
 * LlmLayers - Provider Layer definitions for @effect/ai
 *
 * @module knowledge-server/Runtime/LlmLayers
 * @since 0.1.0
 */
import { AnthropicClient, AnthropicLanguageModel } from "@effect/ai-anthropic"
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai"
import { FetchHttpClient } from "@effect/platform"
import * as Config from "effect/Config"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

// Provider Layer factories
const makeAnthropicLayer = (apiKey: string, model: string) =>
  AnthropicLanguageModel.layer({ model }).pipe(
    Layer.provide(
      AnthropicClient.layer({ apiKey }).pipe(
        Layer.provide(FetchHttpClient.layer)
      )
    )
  )

const makeOpenAiLayer = (apiKey: string, model: string) =>
  OpenAiLanguageModel.layer({ model }).pipe(
    Layer.provide(
      OpenAiClient.layer({ apiKey }).pipe(
        Layer.provide(FetchHttpClient.layer)
      )
    )
  )

// Config-driven selection
const LlmConfig = Config.all({
  provider: Config.string("LLM_PROVIDER").pipe(Config.withDefault("anthropic")),
  apiKey: Config.string("LLM_API_KEY"),
  model: Config.string("LLM_MODEL").pipe(Config.withDefault("claude-sonnet-4-20250514")),
})

export const LlmLive = Layer.unwrapEffect(
  Effect.gen(function*() {
    const config = yield* LlmConfig
    return config.provider === "openai"
      ? makeOpenAiLayer(config.apiKey, config.model)
      : makeAnthropicLayer(config.apiKey, config.model)
  })
)
```

**Verification**:
```bash
bun tsc --noEmit packages/knowledge/server/src/Runtime/LlmLayers.ts
```

### Step 3: Create Runtime/index.ts

```typescript
export * from "./LlmLayers"
```

### Step 4: Migrate MentionExtractor

**Current** (`MentionExtractor.ts`):
```typescript
import { AiService } from "../Ai/AiService"

const ai = yield* AiService

const result = yield* ai.generateObjectWithSystem(
  MentionOutput,
  buildSystemPrompt(),
  buildMentionPrompt(chunk.text, chunk.index),
  config.aiConfig
)
```

**Target**:
```typescript
import { LanguageModel, Prompt } from "@effect/ai"

const model = yield* LanguageModel.LanguageModel

const prompt = Prompt.make([
  { role: "system", content: buildSystemPrompt() },
  { role: "user", content: buildMentionPrompt(chunk.text, chunk.index) }
])

const result = yield* model.generateObject(prompt, MentionOutput)
```

**Changes**:
1. Replace import: `AiService` → `LanguageModel, Prompt` from `@effect/ai`
2. Replace service access: `yield* AiService` → `yield* LanguageModel.LanguageModel`
3. Replace call: `ai.generateObjectWithSystem(schema, system, user)` → `model.generateObject(Prompt.make([...]), schema)`
4. Update result access: `result.data` → `result.value`

**Verification**:
```bash
bun tsc --noEmit packages/knowledge/server/src/Extraction/MentionExtractor.ts
```

### Step 5: Migrate RelationExtractor

Apply same pattern as Step 4. Key difference: prompt uses `buildRelationPrompt`.

### Step 6: Migrate EntityExtractor

**Additional complexity**: Batching loop

```typescript
// Current pattern in batch loop
for (const batch of batches) {
  const result = yield* ai.generateObjectWithSystem(
    EntityOutput,
    buildSystemPrompt(),
    buildEntityPrompt(batch, ontologyContext),
    config.aiConfig
  )
  allEntities.push(...result.data.entities)
  totalTokens += result.usage.totalTokens
}

// Target pattern
for (const batch of batches) {
  const prompt = Prompt.make([
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: buildEntityPrompt(batch, ontologyContext) }
  ])
  const result = yield* model.generateObject(prompt, EntityOutput)
  allEntities.push(...result.value.entities)
  totalTokens += result.usage.inputTokens + result.usage.outputTokens
}
```

**Note**: Token tracking differs:
- Current: `result.usage.totalTokens`
- Target: `result.usage.inputTokens + result.usage.outputTokens`

### Step 7: Update ExtractionPipeline

Update Layer composition to use `LlmLive`:

```typescript
// ExtractionPipeline.ts or index.ts
import { LlmLive } from "../Runtime/LlmLayers"

export const ExtractionPipelineLive = Layer.mergeAll(
  ExtractionPipeline.Default,
  EntityExtractor.Default,
  MentionExtractor.Default,
  RelationExtractor.Default,
).pipe(Layer.provide(LlmLive))
```

### Step 8: Keep PromptTemplates Unchanged

`PromptTemplates.ts` only returns strings - no changes needed.

### Step 9: Delete AiService.ts

```bash
rm packages/knowledge/server/src/Ai/AiService.ts
```

### Step 10: Update Ai/index.ts

Remove AiService export, keep PromptTemplates:

```typescript
// Before
export * from "./AiService"
export * from "./PromptTemplates"

// After
export * from "./PromptTemplates"
```

---

## Verification Commands

### After Each Step

```bash
# Type check specific file
bun tsc --noEmit packages/knowledge/server/src/PATH/TO/FILE.ts

# Check entire package
bun run check --filter @beep/knowledge-server
```

### Final Verification

```bash
# Full build
bun run build --filter @beep/knowledge-server

# Run tests (after Phase 5)
bun run test --filter @beep/knowledge-server
```

---

## Rollback Strategy

### Per-File Rollback

```bash
# Revert specific file
git checkout HEAD -- packages/knowledge/server/src/Extraction/EntityExtractor.ts
```

### Full Rollback

```bash
# Stash all changes
git stash push -m "P4 migration progress" packages/knowledge/server/

# Restore original state
git checkout HEAD -- packages/knowledge/server/src/
```

### Rollback Trigger Conditions

Rollback if ANY of:
- 3+ consecutive type errors on same file
- Build fails with circular dependency
- Config resolution fails at runtime

---

## Migration Checklist

### Pre-Migration

- [ ] `@effect/ai` packages installed
- [ ] Environment variables documented
- [ ] Backup/branch created

### During Migration

- [ ] Step 1: Dependencies verified
- [ ] Step 2: `LlmLayers.ts` created and compiles
- [ ] Step 3: `Runtime/index.ts` created
- [ ] Step 4: `MentionExtractor.ts` migrated and compiles
- [ ] Step 5: `RelationExtractor.ts` migrated and compiles
- [ ] Step 6: `EntityExtractor.ts` migrated and compiles
- [ ] Step 7: `ExtractionPipeline.ts` updated
- [ ] Step 8: `PromptTemplates.ts` unchanged
- [ ] Step 9: `AiService.ts` deleted
- [ ] Step 10: `Ai/index.ts` updated

### Post-Migration

- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] No `AiService` imports remain
- [ ] `grep -r "AiService" packages/knowledge/server/src/` returns empty
- [ ] `HANDOFF_P5.md` created

---

## Error Handling Migration

### Current Pattern

```typescript
// AiService returns AiExtractionError
yield* ai.generateObjectWithSystem(...).pipe(
  Effect.catchTag("AiExtractionError", (e) => ...)
)
```

### Target Pattern

```typescript
// @effect/ai returns LanguageModelResponse.Failure
yield* model.generateObject(...).pipe(
  Effect.catchAll((failure) => {
    // Convert to domain error if needed
    return Effect.fail(new AiExtractionError({
      message: String(failure),
      retryable: true,
      cause: failure.message
    }))
  })
)
```

**Decision**: Keep `AiExtractionError` for domain-level error handling, wrap LanguageModel failures.

---

## Token Usage Migration

### Field Mapping

| AiService | @effect/ai |
|-----------|------------|
| `usage.promptTokens` | `usage.inputTokens` |
| `usage.completionTokens` | `usage.outputTokens` |
| `usage.totalTokens` | Compute: `inputTokens + outputTokens` |

### Helper Function

```typescript
const totalTokens = (usage: { inputTokens: number; outputTokens: number }) =>
  usage.inputTokens + usage.outputTokens
```

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Type mismatches | Medium | Medium | Incremental migration with verification |
| Missing system prompt | Low | High | Template enforces Prompt.make([...]) pattern |
| Config errors at runtime | Low | Medium | Test with mock Layer first |
| Token counting differs | Low | Low | Document field mapping |

---

## Timeline Estimate

| Step | Duration |
|------|----------|
| Steps 1-3 (Setup) | 15 min |
| Step 4 (MentionExtractor) | 20 min |
| Step 5 (RelationExtractor) | 15 min |
| Step 6 (EntityExtractor) | 30 min |
| Steps 7-10 (Cleanup) | 15 min |
| Verification | 15 min |
| **Total** | ~2 hours |
