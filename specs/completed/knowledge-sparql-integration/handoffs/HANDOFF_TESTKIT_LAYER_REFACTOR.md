# Handoff: Knowledge Server Test Refactoring to `layer()` Utility

**Task**: Refactor all tests in `packages/knowledge/server/test/` to use `@beep/testkit` `layer()` utility
**Status**: NOT_STARTED
**Priority**: HIGH (improves test maintainability and follows codebase standards)
**Estimated Effort**: Medium (17 test files to refactor)

---

## Problem Statement

All tests in `packages/knowledge/server/test/` use the **anti-pattern** of manually calling `Effect.provide(TestLayer)` on each individual test:

```typescript
// CURRENT ANTI-PATTERN - used in knowledge/server/test
effect("should do something", () =>
  Effect.gen(function* () {
    const service = yield* SomeService;
    // test body
  }).pipe(Effect.provide(TestLayer))  // ❌ Repeated on every single test
);
```

This should be refactored to use the **canonical `layer()` utility** from `@beep/testkit`:

```typescript
// CANONICAL PATTERN - as seen in packages/_internal/db-admin/test/AccountRepo.test.ts
layer(TestLayer, { timeout: Duration.seconds(60) })("suite name", (it) => {
  it.effect("should do something", () =>
    Effect.gen(function* () {
      const service = yield* SomeService;
      // test body - NO Effect.provide needed
    }),
    TIMEOUT  // Optional timeout per test
  );
});
```

---

## Benefits of `layer()` Pattern

| Aspect | Anti-Pattern (`Effect.provide`) | Canonical (`layer()`) |
|--------|--------------------------------|----------------------|
| **Boilerplate** | `.pipe(Effect.provide(TestLayer))` on every test | Single `layer()` call per suite |
| **Resource Management** | Layer rebuilt for each test | Layer shared across suite |
| **Timeout Handling** | Must handle manually | Built-in support |
| **Consistency** | Easy to forget `Effect.provide` | Impossible to forget |
| **Readability** | Cluttered test bodies | Clean, focused tests |

---

## Files to Refactor

| File | Test Count | Notes |
|------|------------|-------|
| `test/Extraction/EntityExtractor.test.ts` | ~10 | Uses NLP services |
| `test/Extraction/GraphAssembler.test.ts` | ~8 | RDF graph assembly |
| `test/Extraction/RelationExtractor.test.ts` | ~6 | Relation extraction |
| `test/Extraction/MentionExtractor.test.ts` | ~5 | Mention extraction |
| `test/GraphRAG/ContextFormatter.test.ts` | ~5 | GraphRAG formatting |
| `test/GraphRAG/RrfScorer.test.ts` | ~5 | RRF scoring |
| `test/Nlp/NlpService.test.ts` | ~10 | NLP service tests |
| `test/Rdf/RdfStoreService.test.ts` | ~30 | RDF store CRUD |
| `test/Rdf/Serializer.test.ts` | ~8 | RDF serialization |
| `test/Rdf/RdfBuilder.test.ts` | ~15 | Fluent RDF builder |
| `test/Rdf/integration.test.ts` | ~5 | Integration tests |
| `test/Rdf/benchmark.test.ts` | ~5 | Performance tests |
| `test/Sparql/SparqlParser.test.ts` | ~45 | SPARQL parsing |
| `test/Sparql/SparqlService.test.ts` | ~28 | SPARQL execution |
| `test/Reasoning/ForwardChainer.test.ts` | ~10 | Forward chaining |
| `test/Reasoning/ReasonerService.test.ts` | ~15 | Reasoning service |
| `test/Reasoning/RdfsRules.test.ts` | ~10 | RDFS rules |

**Total**: ~17 files, ~210+ tests to refactor

---

## Reference Implementation

**Canonical Example**: `packages/_internal/db-admin/test/AccountRepo.test.ts`

Key patterns from the reference:

### 1. Import Structure
```typescript
import { describe, expect } from "bun:test";
import { assertNone, assertTrue, deepStrictEqual, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
```

### 2. Timeout Definition
```typescript
const TEST_TIMEOUT = 60000;  // bun:test doesn't accept Duration
```

### 3. Layer Usage
```typescript
describe("SuiteName", () => {
  layer(TestLayer, { timeout: Duration.seconds(60) })("operation group", (it) => {
    it.effect(
      "should do something specific",
      () =>
        Effect.gen(function* () {
          const service = yield* MyService;
          // test logic
          strictEqual(actual, expected);
        }),
      TEST_TIMEOUT  // Optional per-test timeout
    );

    it.effect(
      "should do another thing",
      () =>
        Effect.gen(function* () {
          // another test
        }),
      TEST_TIMEOUT
    );
  });
});
```

### 4. Nested describe() within layer()
```typescript
describe("MainSuite", () => {
  layer(TestLayer, { timeout: Duration.seconds(60) })("all tests", (it) => {
    // Multiple related tests share the same layer
    it.effect("test 1", () => ...);
    it.effect("test 2", () => ...);
    it.effect("test 3", () => ...);
  });
});
```

---

## Transformation Rules

### Before (Anti-Pattern)
```typescript
import { describe, effect, strictEqual } from "@beep/testkit";

describe("MyService", () => {
  describe("operation", () => {
    effect("should work", () =>
      Effect.gen(function* () {
        const service = yield* MyService;
        const result = yield* service.doSomething();
        strictEqual(result, expected);
      }).pipe(Effect.provide(TestLayer))
    );

    effect("should handle errors", () =>
      Effect.gen(function* () {
        const service = yield* MyService;
        // ...
      }).pipe(Effect.provide(TestLayer))
    );
  });
});
```

### After (Canonical)
```typescript
import { describe } from "bun:test";
import { layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";

const TEST_TIMEOUT = 60000;

describe("MyService", () => {
  layer(TestLayer, { timeout: Duration.seconds(60) })("operation", (it) => {
    it.effect(
      "should work",
      () =>
        Effect.gen(function* () {
          const service = yield* MyService;
          const result = yield* service.doSomething();
          strictEqual(result, expected);
        }),
      TEST_TIMEOUT
    );

    it.effect(
      "should handle errors",
      () =>
        Effect.gen(function* () {
          const service = yield* MyService;
          // ...
        }),
      TEST_TIMEOUT
    );
  });
});
```

---

## Special Cases

### 1. Tests with Custom Layers per Test
Some tests may need different layers. Use multiple `layer()` calls:

```typescript
describe("MyService", () => {
  layer(StandardLayer, { timeout: Duration.seconds(60) })("standard operations", (it) => {
    it.effect("normal test", () => ...);
  });

  layer(MockedLayer, { timeout: Duration.seconds(60) })("mocked operations", (it) => {
    it.effect("test with mocks", () => ...);
  });
});
```

### 2. Benchmark Tests with `live()`
Benchmark tests using `live()` from `@beep/testkit` can remain as-is since they need real clock access:

```typescript
live("benchmark test", () =>
  Effect.gen(function* () {
    const start = yield* Effect.clockWith(c => c.currentTimeMillis);
    // ...
  }).pipe(Effect.provide(BenchmarkLayer))
);
```

### 3. Tests Without Service Dependencies
Pure function tests that don't need layers can use `effect()` directly:

```typescript
effect("should parse correctly", () =>
  Effect.gen(function* () {
    const result = pureFunctionParse("input");
    strictEqual(result, expected);
  })
);
```

---

## Verification Steps

After refactoring each file:

1. **Run Tests**:
   ```bash
   bun test test/Rdf/RdfStoreService.test.ts
   ```

2. **Run All Knowledge Tests**:
   ```bash
   bun test test/
   ```

3. **Type Check**:
   ```bash
   bun run check --filter @beep/knowledge-server
   ```

4. **Verify Test Count**: Ensure the same number of tests pass before and after refactoring.

---

## Execution Order

Recommended order (simplest first):

1. **Phase 1 - Simple Services** (single Layer):
   - `test/Rdf/RdfStoreService.test.ts`
   - `test/Rdf/Serializer.test.ts`
   - `test/Rdf/RdfBuilder.test.ts`
   - `test/GraphRAG/ContextFormatter.test.ts`
   - `test/GraphRAG/RrfScorer.test.ts`

2. **Phase 2 - Parser/Service Tests**:
   - `test/Sparql/SparqlParser.test.ts`
   - `test/Sparql/SparqlService.test.ts`

3. **Phase 3 - Complex Services** (multiple dependencies):
   - `test/Extraction/EntityExtractor.test.ts`
   - `test/Extraction/RelationExtractor.test.ts`
   - `test/Extraction/MentionExtractor.test.ts`
   - `test/Extraction/GraphAssembler.test.ts`
   - `test/Nlp/NlpService.test.ts`

4. **Phase 4 - Reasoning** (may have type errors to fix first):
   - `test/Reasoning/ForwardChainer.test.ts`
   - `test/Reasoning/RdfsRules.test.ts`
   - `test/Reasoning/ReasonerService.test.ts`

5. **Phase 5 - Integration/Benchmarks**:
   - `test/Rdf/integration.test.ts`
   - `test/Rdf/benchmark.test.ts`

---

## Agent Instructions

When executing this refactor:

1. **Read the canonical example first**: `packages/_internal/db-admin/test/AccountRepo.test.ts`

2. **For each test file**:
   - Count tests before refactoring
   - Identify the TestLayer being used
   - Group tests by logical suite
   - Transform to `layer()` pattern
   - Remove all `.pipe(Effect.provide(TestLayer))` calls
   - Verify same test count passes after

3. **DO NOT change test logic** - only refactor the test structure

4. **Preserve all assertions** - use `@beep/testkit` assertion utilities

5. **Add TEST_TIMEOUT constant** at file top: `const TEST_TIMEOUT = 60000;`

6. **Import from bun:test** for `describe` and `expect` if needed

---

## Success Criteria

- [ ] All 17 test files refactored to use `layer()` utility
- [ ] Zero uses of `.pipe(Effect.provide(TestLayer))` pattern remain
- [ ] All tests pass: `bun test test/`
- [ ] Same total test count as before refactoring (~210+ tests)
- [ ] Type check passes (ignoring pre-existing Reasoning errors)

---

## Part 2: Update Related Knowledge Specs with Testing Guidance

After completing the test refactoring, update the following knowledge specs to include testing pattern guidance so future implementations follow the canonical patterns.

### Specs to Update

| Spec | Status | Location |
|------|--------|----------|
| Knowledge Workflow Durability | PLANNED | `specs/knowledge-workflow-durability/README.md` |
| Knowledge GraphRAG Plus | PLANNED | `specs/knowledge-graphrag-plus/README.md` |
| Knowledge Entity Resolution v2 | PLANNED | `specs/knowledge-entity-resolution-v2/README.md` |

### Testing Standards Section to Add

Add the following section to each spec's README.md (after the "Deliverables" section):

```markdown
---

## Testing Standards

All tests for this specification MUST follow the canonical `@beep/testkit` patterns.

### Required Pattern: `layer()` Utility

Tests with service dependencies MUST use the `layer()` utility from `@beep/testkit`:

```typescript
import { describe, expect } from "bun:test";
import { layer, strictEqual, assertTrue } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";

const TEST_TIMEOUT = 60000;

describe("MyService", () => {
  layer(TestLayer, { timeout: Duration.seconds(60) })("operations", (it) => {
    it.effect(
      "should perform operation",
      () =>
        Effect.gen(function* () {
          const service = yield* MyService;
          const result = yield* service.operation();
          strictEqual(result, expected);
        }),
      TEST_TIMEOUT
    );
  });
});
```

### Forbidden Anti-Pattern

**NEVER** use `Effect.provide(TestLayer)` on individual tests:

```typescript
// ❌ FORBIDDEN - This pattern is not allowed
effect("test", () =>
  Effect.gen(function* () {
    // ...
  }).pipe(Effect.provide(TestLayer))  // ❌ NO!
);
```

### Reference Implementation

See `packages/_internal/db-admin/test/AccountRepo.test.ts` for the canonical testing pattern.

### Test Organization

- Tests MUST be in `test/` directory mirroring `src/` structure
- Use `@beep/*` path aliases, NOT relative imports
- Group related tests in single `layer()` calls
- Use `live()` only for benchmarks requiring real clock
```

### Spec-Specific Test Requirements

#### Knowledge Workflow Durability (`specs/knowledge-workflow-durability/`)

Add after the Testing Standards section:

```markdown
### Workflow-Specific Testing

For @effect/workflow tests:

```typescript
import { layer } from "@beep/testkit";
import * as Duration from "effect/Duration";

// Workflow tests may need longer timeouts
const WORKFLOW_TEST_TIMEOUT = 120000;

describe("ExtractionWorkflow", () => {
  layer(WorkflowTestLayer, { timeout: Duration.seconds(120) })("workflow execution", (it) => {
    it.effect(
      "should checkpoint after each activity",
      () =>
        Effect.gen(function* () {
          const workflow = yield* WorkflowService;
          // Test checkpoint behavior
        }),
      WORKFLOW_TEST_TIMEOUT
    );
  });
});
```

- Use separate TestLayers for unit tests (mocked activities) vs integration tests (real activities)
- Test SSE progress events with dedicated layer providing mock SSE publisher
```

#### Knowledge GraphRAG Plus (`specs/knowledge-graphrag-plus/`)

Add after the Testing Standards section:

```markdown
### GraphRAG-Specific Testing

For citation validation and grounding tests:

```typescript
import { layer } from "@beep/testkit";

describe("CitationValidator", () => {
  layer(GraphRAGTestLayer, { timeout: Duration.seconds(60) })("citation validation", (it) => {
    it.effect(
      "should validate entity citations against graph",
      () =>
        Effect.gen(function* () {
          const validator = yield* CitationValidator;
          const sparql = yield* SparqlService;
          // Test citation grounding
        }),
      TEST_TIMEOUT
    );
  });
});
```

- TestLayer MUST provide SparqlService for graph queries
- Mock OpenAI responses for deterministic testing
- Test confidence propagation with known graph structures
```

#### Knowledge Entity Resolution v2 (`specs/knowledge-entity-resolution-v2/`)

Add after the Testing Standards section:

```markdown
### Entity Resolution-Specific Testing

For cross-batch entity resolution tests:

```typescript
import { layer } from "@beep/testkit";

describe("EntityRegistry", () => {
  layer(EntityResolutionTestLayer, { timeout: Duration.seconds(60) })("cross-batch resolution", (it) => {
    it.effect(
      "should deduplicate entities across batches",
      () =>
        Effect.gen(function* () {
          const registry = yield* EntityRegistry;
          const clusterer = yield* EntityClusterer;
          // Test cross-batch deduplication
        }),
      TEST_TIMEOUT
    );
  });
});
```

- Use separate layers for unit tests (mocked embeddings) vs integration tests (real embeddings)
- Test merge history with auditable layer providing event capture
- Test split/unmerge with multi-batch test scenarios
```

### Verification Checklist

After updating each spec:

- [ ] `specs/knowledge-workflow-durability/README.md` has Testing Standards section
- [ ] `specs/knowledge-graphrag-plus/README.md` has Testing Standards section
- [ ] `specs/knowledge-entity-resolution-v2/README.md` has Testing Standards section
- [ ] Each spec has spec-specific test examples
- [ ] No references to `Effect.provide(TestLayer)` anti-pattern

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-04 | Claude Code | Initial handoff document |
| 0.2.0 | 2026-02-04 | Claude Code | Added Part 2: Update related knowledge specs with testing guidance |
