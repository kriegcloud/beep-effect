# Handoff: Phase 5 - Test Coverage

> Context document for Phase 5 of the knowledge completion spec.

---

## Prerequisites

Phase 4 (LLM Refactoring) ✅ COMPLETE with:
- [x] `@effect/ai`, `@effect/ai-anthropic`, `@effect/ai-openai` dependencies added
- [x] `Runtime/LlmLayers.ts` created with config-driven provider selection
- [x] `Runtime/index.ts` created with exports
- [x] `MentionExtractor.ts` migrated to @effect/ai
- [x] `RelationExtractor.ts` migrated to @effect/ai
- [x] `EntityExtractor.ts` migrated to @effect/ai
- [x] `ExtractionPipeline.ts` updated (aiConfig removed)
- [x] `AiService.ts` deleted
- [x] `Ai/index.ts` updated (AiService export removed)
- [x] `bun run check --filter @beep/knowledge-server` passes
- [x] `grep -r "AiService" packages/knowledge/server/src/` returns no results

### P4 Key Findings

**Critical Implementation Details**:

1. **Redacted API key**: `Config.redacted("LLM_API_KEY")` returns `Redacted<string>`, required by provider clients.

2. **Token counting changed**: `result.usage.totalTokens` → `(result.usage.inputTokens ?? 0) + (result.usage.outputTokens ?? 0)`

3. **Result access changed**: `result.data` → `result.value`

4. **FetchHttpClient required**: LlmLayers composition requires `FetchHttpClient.layer` from `@effect/platform`.

---

## Phase 5 Objective

**Add comprehensive test coverage** for knowledge services:
1. Create mock LanguageModel Layer
2. Write tests for all extraction services
3. Write tests for supporting services
4. Achieve coverage thresholds

---

## Context Budget Estimate

| Item | Tokens |
|------|--------|
| HANDOFF_P5.md | ~1,200 |
| Test template | ~500 |
| Service files (for reference) | ~6,000 |
| Test files being created | ~4,000 |
| **Total** | ~11,700 |

---

## Test Infrastructure

### Mock LanguageModel Layer

Create: `packages/knowledge/server/test/_shared/TestLayers.ts`

```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { LanguageModel } from "@effect/ai"

// Mock responses for different schema types
const mockResponses = new Map<string, unknown>()

export const MockLlmLive = Layer.succeed(
  LanguageModel.LanguageModel,
  {
    generateObject: <A>({ schema, objectName }: { schema: any; objectName: string }) =>
      Effect.gen(function* () {
        const mockData = mockResponses.get(objectName) ?? generateMockFromSchema(schema)
        return {
          value: mockData as A,
          usage: { inputTokens: 100, outputTokens: 50 }
        }
      }),
    // Add other methods as needed
  }
)

// Helper to set mock responses for specific tests
export const setMockResponse = (objectName: string, response: unknown) => {
  mockResponses.set(objectName, response)
}
```

### Test Pattern

Use `@beep/testkit`:

```typescript
import { effect, layer, strictEqual } from "@beep/testkit"
import * as Effect from "effect/Effect"
import * as Duration from "effect/Duration"
import { MockLlmLive } from "../_shared/TestLayers"

// For tests requiring shared expensive setup
layer(TestLayer, { timeout: Duration.seconds(30) })("ServiceName", (it) => {
  it.effect("should do something", () =>
    Effect.gen(function* () {
      const service = yield* ServiceName
      const result = yield* service.doSomething()
      strictEqual(result.success, true)
    })
  )
})
```

---

## Test Files to Create

| File | Service Under Test | Priority |
|------|-------------------|----------|
| `test/_shared/TestLayers.ts` | Mock infrastructure | P0 |
| `test/Extraction/EntityExtractor.test.ts` | EntityExtractor | P0 |
| `test/Extraction/MentionExtractor.test.ts` | MentionExtractor | P0 |
| `test/Extraction/RelationExtractor.test.ts` | RelationExtractor | P0 |
| `test/Extraction/ExtractionPipeline.test.ts` | ExtractionPipeline | P0 |
| `test/Ontology/OntologyService.test.ts` | OntologyService | P1 |
| `test/Embedding/EmbeddingService.test.ts` | EmbeddingService | P1 |
| `test/EntityResolution/EntityResolutionService.test.ts` | EntityResolutionService | P1 |
| `test/Grounding/GroundingService.test.ts` | GroundingService | P1 |

---

## Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Test file count | 6 | 9 |
| Line coverage | 60% | 80% |
| Pass rate | 90% | 100% |

---

## Test Scenarios per Service

### EntityExtractor

- [ ] Extracts entities from simple text
- [ ] Handles empty input
- [ ] Handles malformed LLM response
- [ ] Respects extraction config

### MentionExtractor

- [ ] Extracts mentions with positions
- [ ] Links mentions to entities
- [ ] Handles overlapping mentions

### RelationExtractor

- [ ] Extracts relations between entities
- [ ] Handles no relations found
- [ ] Validates relation types against ontology

### ExtractionPipeline

- [ ] Full pipeline execution
- [ ] Handles partial failures gracefully
- [ ] Streaming output works

### OntologyService

- [ ] Parses OWL ontology
- [ ] Resolves class hierarchy
- [ ] Validates entity types

### EmbeddingService

- [ ] Generates embeddings for text
- [ ] Handles batch requests
- [ ] Error handling for provider failures

### EntityResolutionService

- [ ] Clusters similar entities
- [ ] Selects canonical entities
- [ ] Creates sameAs links

### GroundingService

- [ ] Filters low-confidence entities
- [ ] Grounds entities to knowledge base
- [ ] Handles unknown entities

---

## Verification

```bash
# Run all knowledge tests
bun run test --filter @beep/knowledge-server

# Check coverage (if configured)
bun run test --filter @beep/knowledge-server --coverage
```

---

## Exit Criteria

Phase 5 is complete when:

- [ ] `test/_shared/TestLayers.ts` created with MockLlmLive
- [ ] At least 6 test files created
- [ ] All tests pass
- [ ] Line coverage ≥60%
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P6.md` created

---

## Agent Assignment

| Agent | Task |
|-------|------|
| `test-writer` | Create all test files |
| `package-error-fixer` | Fix any test failures |

---

## Notes

- Start with extraction tests (P0) before supporting services (P1)
- MockLlmLive must support both `generateObject` and system prompt equivalent
- Use `setMockResponse` helper to customize responses per test
- Follow `@beep/testkit` patterns strictly (no raw `bun:test`)
