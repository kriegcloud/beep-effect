# Testkit Layer Refactor - Orchestrator Prompt

Copy-paste this prompt to start the refactoring with a fresh Claude Code session.

---

## Prompt

I need you to refactor all tests in `packages/knowledge/server/test/` to use the canonical `layer()` utility from `@beep/testkit` instead of manually calling `Effect.provide(TestLayer)` on each test.

**Handoff Document**: `specs/knowledge-sparql-integration/handoffs/HANDOFF_TESTKIT_LAYER_REFACTOR.md`

**Reference Implementation**: `packages/_internal/db-admin/test/AccountRepo.test.ts`

**Context Files to Read First**:
1. `specs/knowledge-sparql-integration/handoffs/HANDOFF_TESTKIT_LAYER_REFACTOR.md` - Full refactoring instructions
2. `packages/_internal/db-admin/test/AccountRepo.test.ts` - Canonical `layer()` pattern
3. `.claude/rules/effect-patterns.md` - Testing patterns

**Current Anti-Pattern** (MUST BE ELIMINATED):
```typescript
effect("test name", () =>
  Effect.gen(function* () {
    // test body
  }).pipe(Effect.provide(TestLayer))  // ❌ Repeated on EVERY test
);
```

**Required Pattern**:
```typescript
layer(TestLayer, { timeout: Duration.seconds(60) })("suite name", (it) => {
  it.effect("test name", () =>
    Effect.gen(function* () {
      // test body - NO Effect.provide needed
    }),
    TEST_TIMEOUT
  );
});
```

**Files to Refactor** (17 total):
```
packages/knowledge/server/test/
├── Extraction/
│   ├── EntityExtractor.test.ts
│   ├── GraphAssembler.test.ts
│   ├── RelationExtractor.test.ts
│   └── MentionExtractor.test.ts
├── GraphRAG/
│   ├── ContextFormatter.test.ts
│   └── RrfScorer.test.ts
├── Nlp/
│   └── NlpService.test.ts
├── Rdf/
│   ├── RdfStoreService.test.ts
│   ├── Serializer.test.ts
│   ├── RdfBuilder.test.ts
│   ├── integration.test.ts
│   └── benchmark.test.ts
├── Sparql/
│   ├── SparqlParser.test.ts
│   └── SparqlService.test.ts
└── Reasoning/
    ├── ForwardChainer.test.ts
    ├── ReasonerService.test.ts
    └── RdfsRules.test.ts
```

**Critical Requirements**:
1. Use `layer()` from `@beep/testkit` for all tests with service dependencies
2. Import `describe` from `bun:test` (NOT from `@beep/testkit`)
3. Add `const TEST_TIMEOUT = 60000;` at file top
4. Remove ALL `.pipe(Effect.provide(TestLayer))` calls
5. Group related tests within single `layer()` calls
6. Preserve all test assertions and logic exactly
7. Ensure same test count passes after refactoring

**Import Template**:
```typescript
import { describe, expect } from "bun:test";
import { layer, strictEqual, assertTrue, assertNone, deepStrictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
```

**Workflow - Part 1 (Test Refactoring)**:
1. Read handoff document and reference implementation
2. Start with simplest files (Rdf/RdfStoreService.test.ts)
3. For each file:
   - Count tests before
   - Identify TestLayer used
   - Transform to `layer()` pattern
   - Verify tests pass
   - Verify same count
4. Progress through all 17 files
5. Run full test suite: `bun test test/`
6. Verify all ~210+ tests pass

**Workflow - Part 2 (Spec Updates)**:
7. Read each spec's README.md:
   - `specs/knowledge-workflow-durability/README.md`
   - `specs/knowledge-graphrag-plus/README.md`
   - `specs/knowledge-entity-resolution-v2/README.md`
8. Add "Testing Standards" section after Deliverables with:
   - Required `layer()` pattern example
   - Forbidden anti-pattern warning
   - Reference implementation pointer
   - Spec-specific test examples
9. See Part 2 in handoff document for exact content to add

**Verification Commands**:
```bash
# Test single file
bun test test/Rdf/RdfStoreService.test.ts

# Test all knowledge tests
cd packages/knowledge/server && bun test test/

# Type check
bun run check --filter @beep/knowledge-server
```

**Success Criteria - Part 1 (Test Refactoring)**:
- [ ] All 17 test files use `layer()` pattern
- [ ] Zero `.pipe(Effect.provide(TestLayer))` patterns remain
- [ ] All tests pass
- [ ] Same test count before/after

**Success Criteria - Part 2 (Spec Updates)**:
- [ ] `specs/knowledge-workflow-durability/README.md` updated with Testing Standards section
- [ ] `specs/knowledge-graphrag-plus/README.md` updated with Testing Standards section
- [ ] `specs/knowledge-entity-resolution-v2/README.md` updated with Testing Standards section
- [ ] Each spec has spec-specific test examples

**Note**: The Reasoning tests may have pre-existing type errors - focus on structural refactoring and document any issues that prevent completion.

Begin by reading the handoff document and reference implementation.

---

## Example Session Start

**User**: [Paste prompt above]

**Expected AI Response**:
"I'll refactor all knowledge/server tests to use the canonical `layer()` utility. Let me start by reading the reference implementation and handoff document."

[AI reads AccountRepo.test.ts and HANDOFF_TESTKIT_LAYER_REFACTOR.md]

"I understand the transformation needed. Key changes:
1. Replace `effect()` calls with `layer(TestLayer, {...})('suite', (it) => { it.effect(...) })`
2. Remove `.pipe(Effect.provide(TestLayer))` from each test
3. Add `TEST_TIMEOUT` constant
4. Import `describe` from `bun:test`

Starting with `test/Rdf/RdfStoreService.test.ts` as it's the simplest..."

---

## Troubleshooting

### Import Errors
```typescript
// If layer() not found:
import { layer } from "@beep/testkit";

// If describe() causes issues:
import { describe, expect } from "bun:test";
```

### Timeout Issues
```typescript
// Duration must be imported for layer() options
import * as Duration from "effect/Duration";

// Bun test timeout must be number, not Duration
const TEST_TIMEOUT = 60000;
```

### Layer Not Providing Services
```typescript
// Ensure TestLayer provides all required services
const TestLayer = Layer.provideMerge(
  ServiceA.Default,
  ServiceB.Default
);

// Then use:
layer(TestLayer, { timeout: Duration.seconds(60) })("tests", (it) => {
  // ...
});
```

### Nested describe() with layer()
```typescript
// DON'T nest layer() inside describe()
// DO group related tests in single layer() call

describe("MyService", () => {
  layer(TestLayer, { timeout: Duration.seconds(60) })("CRUD operations", (it) => {
    it.effect("should create", () => ...);
    it.effect("should read", () => ...);
    it.effect("should update", () => ...);
    it.effect("should delete", () => ...);
  });

  layer(TestLayer, { timeout: Duration.seconds(60) })("error handling", (it) => {
    it.effect("should handle not found", () => ...);
    it.effect("should handle validation", () => ...);
  });
});
```

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1.0 | 2026-02-04 | Claude Code | Initial orchestrator prompt |
