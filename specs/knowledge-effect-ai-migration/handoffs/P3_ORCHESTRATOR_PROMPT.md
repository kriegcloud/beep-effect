# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 of the Knowledge Server @effect/ai migration.

---

## Prompt

You are executing Phase 3 (Verification & Cleanup) of the `knowledge-effect-ai-migration` spec.

### Context

Phase 2 Implementation is complete. Migration results:

| Component | Status |
|-----------|--------|
| EmbeddingService uses EmbeddingModel | ✅ Complete |
| Error mapping (AiError → EmbeddingError) | ✅ Complete |
| TaskType kept but ignored | ✅ Complete |
| MockEmbeddingModelLayer | ✅ Created |
| OpenAiEmbeddingLayer + Config | ✅ Created |
| OpenAiProvider.ts | ✅ Deleted |
| Type check | ✅ Passes |
| Tests | ✅ 55 pass |

### Your Mission

Execute cleanup tasks and verify the migration is complete.

### Cleanup Tasks

Execute these tasks IN ORDER:

#### Task 1: Deprecate EmbeddingProvider Interface

**READ** the current file:
```
packages/knowledge/server/src/Embedding/EmbeddingProvider.ts
```

**ADD** deprecation JSDoc to these exports (DO NOT delete the file):

```typescript
/**
 * @deprecated Use EmbeddingModel.EmbeddingModel from @effect/ai instead.
 * This interface is no longer used internally.
 * @since 0.1.0
 * @category deprecated
 */
export interface EmbeddingProvider { ... }

/**
 * @deprecated Use MockEmbeddingModelLayer from providers/MockProvider instead.
 * @since 0.1.0
 * @category deprecated
 */
export const MockEmbeddingProvider = ...

/**
 * @deprecated Use MockEmbeddingModelLayer from providers/MockProvider instead.
 * @since 0.1.0
 * @category deprecated
 */
export const MockEmbeddingProviderLayer = ...

/**
 * @deprecated Internal type no longer used.
 * @since 0.1.0
 * @category deprecated
 */
export interface EmbeddingResult { ... }
```

**KEEP** without deprecation:
- `EmbeddingError` - Still used
- `TaskType` - Part of public API
- `EmbeddingConfig` - May be useful

#### Task 2: Remove Unused TaskType Value

**MODIFY** the TaskType definition:

```typescript
// BEFORE
export type TaskType = "search_query" | "search_document" | "clustering" | "classification";

// AFTER
export type TaskType = "search_query" | "search_document" | "clustering";
```

**VERIFY** no usages exist:
```bash
grep -r '"classification"' packages/knowledge/
```

This should return 0 matches outside the type definition itself.

#### Task 3: Update Exports in index.ts

**READ** and **VERIFY** exports in:
```
packages/knowledge/server/src/Embedding/index.ts
```

**ENSURE** these exports are present:
```typescript
// Types
export { EmbeddingError, type TaskType, type EmbeddingConfig } from "./EmbeddingProvider";

// Service
export { EmbeddingService, EmbeddingServiceLive } from "./EmbeddingService";

// New layers (from providers)
export {
  DeterministicMockEmbeddingModelLayer,
  MockEmbeddingModelLayer,
  makeMockEmbeddingModelLayer,
} from "./providers";

export {
  makeOpenAiEmbeddingLayer,
  OpenAiEmbeddingLayer,
  OpenAiEmbeddingLayerConfig,
  type OpenAiEmbeddingConfig,
} from "./providers";
```

**REMOVE** if present (deprecated):
```typescript
// These should NOT be exported anymore:
// - EmbeddingProvider (deprecated)
// - MockEmbeddingProvider (deprecated)
// - MockEmbeddingProviderLayer (deprecated)
// - EmbeddingResult (internal/deprecated)
```

#### Task 4: Run Full Verification Suite

**RUN** these commands:

```bash
# Type check - knowledge package
bun run check --filter @beep/knowledge-server

# Tests - knowledge package
bun run test --filter @beep/knowledge-server

# Lint
bun run lint --filter @beep/knowledge-server
```

**ALL commands must pass.**

If type check fails due to upstream package errors:
1. Check if errors are in dependencies (not your changes)
2. Use isolated syntax check: `bun tsc --noEmit packages/knowledge/server/src/Embedding/*.ts`
3. Document pre-existing issues separately

#### Task 5: Update AGENTS.md

**READ** the current file:
```
packages/knowledge/server/AGENTS.md
```

**UPDATE** the Embedding section to document:

1. New layer composition pattern:
```typescript
// Production usage
import { EmbeddingServiceLive, OpenAiEmbeddingLayerConfig } from "@beep/knowledge-server/Embedding";

const KnowledgeLive = EmbeddingServiceLive.pipe(
  Layer.provide(OpenAiEmbeddingLayerConfig)
);

// Testing usage
import { EmbeddingServiceLive, MockEmbeddingModelLayer } from "@beep/knowledge-server/Embedding";

const TestLayer = EmbeddingServiceLive.pipe(
  Layer.provide(MockEmbeddingModelLayer)
);
```

2. Environment variables:
- `OPENAI_API_KEY` - Required for OpenAiEmbeddingLayerConfig
- `OPENAI_EMBEDDING_MODEL` - Optional, defaults to "text-embedding-3-small"
- `OPENAI_EMBEDDING_DIMENSIONS` - Optional, defaults to 768

3. Remove any references to `OpenAiProvider` or `EmbeddingProvider`

#### Task 6: Update REFLECTION_LOG.md

**READ** then **UPDATE** the file:
```
specs/knowledge-effect-ai-migration/REFLECTION_LOG.md
```

**ADD** Phase 3 section:

```markdown
## Phase 3: Verification

**Completed**: [TODAY'S DATE]

### Cleanup Results

| Task | Status |
|------|--------|
| EmbeddingProvider deprecation | ✅ |
| Remove classification TaskType | ✅ |
| Export audit | ✅ |
| Documentation updates | ✅ |
| Full verification suite | ✅ |

### Test Insights

[Any test failures discovered and how they were resolved]

### Integration Learnings

[Any insights about using the new layers in practice]

### Pattern Promotion Assessment

[Evaluate patterns for PATTERN_REGISTRY promotion]
```

### Success Criteria

All tasks must be complete:

- [ ] `EmbeddingProvider` interface deprecated with JSDoc
- [ ] `classification` removed from `TaskType` union
- [ ] Exports verified - deprecated items removed from index.ts
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes
- [ ] `bun run lint --filter @beep/knowledge-server` passes
- [ ] AGENTS.md updated with new layer pattern
- [ ] REFLECTION_LOG.md Phase 3 section populated

### Outputs

1. **Modified EmbeddingProvider.ts** - Deprecation JSDoc added, classification removed
2. **Verified index.ts exports** - Clean export surface
3. **Updated AGENTS.md** - New layer composition documented
4. **Updated REFLECTION_LOG.md** - Phase 3 learnings captured

### Handoff Document

Read full task details in: `specs/knowledge-effect-ai-migration/handoffs/HANDOFF_P3.md`

### After Completion

The migration is COMPLETE when all success criteria are met.

Final actions:
1. Mark the spec as complete in `specs/README.md`
2. Consider promoting high-scoring patterns to `specs/_guide/PATTERN_REGISTRY.md`
3. Archive the spec or mark for future reference
