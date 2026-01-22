# Phase 5 Orchestrator Prompt

> Copy-paste this prompt to start Phase 5 of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 5: Test Coverage

You are orchestrating Phase 5 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Add comprehensive test coverage for knowledge services:
1. Create mock LanguageModel Layer
2. Write tests for extraction services
3. Write tests for supporting services
4. Achieve coverage thresholds

## Prerequisites Check

Verify Phase 4 refactoring complete:
```bash
bun run check --filter @beep/knowledge-server
# Should pass with no errors

ls packages/knowledge/server/src/Ai/AiService.ts 2>/dev/null
# Should NOT exist (file deleted)
```

## Required Reading

1. `specs/knowledge-completion/handoffs/HANDOFF_P5.md` - Phase context
2. `specs/knowledge-completion/templates/test-layer.template.ts` - Test patterns
3. `.claude/commands/patterns/effect-testing-patterns.md` - Testkit reference

## Tasks

### Task 1: Create Test Infrastructure

Use `test-writer` agent to create:
- `packages/knowledge/server/test/_shared/TestLayers.ts`
- MockLlmLive with `generateObject` support
- Helper utilities for mock responses

Verify:
```bash
bun tsc --noEmit packages/knowledge/server/test/_shared/TestLayers.ts
```

### Task 2: Create Extraction Tests (P0)

Use `test-writer` agent to create:
1. `test/Extraction/EntityExtractor.test.ts`
2. `test/Extraction/MentionExtractor.test.ts`
3. `test/Extraction/RelationExtractor.test.ts`
4. `test/Extraction/ExtractionPipeline.test.ts`

Verify each:
```bash
bun run test --filter @beep/knowledge-server -- test/Extraction/EntityExtractor.test.ts
```

### Task 3: Create Supporting Service Tests (P1)

Use `test-writer` agent to create:
1. `test/Ontology/OntologyService.test.ts`
2. `test/Embedding/EmbeddingService.test.ts`
3. `test/EntityResolution/EntityResolutionService.test.ts`
4. `test/Grounding/GroundingService.test.ts`

### Task 4: Verify Coverage

```bash
bun run test --filter @beep/knowledge-server
# All tests should pass

# Check coverage metrics
bun run test --filter @beep/knowledge-server --coverage
```

## Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Test file count | 6 | 9 |
| Line coverage | 60% | 80% |
| Pass rate | 90% | 100% |

## Exit Criteria

Phase 5 is complete when:
- [ ] `test/_shared/TestLayers.ts` created
- [ ] At least 6 test files created
- [ ] All tests pass (`bun run test` exits 0)
- [ ] Line coverage ≥60%
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P6.md` created

## Quality Gate

Must have ≥6 test files passing to proceed to Phase 6.

## Next Phase

After Phase 5 completion, proceed to Phase 6 (GraphRAG Implementation) using:
`specs/knowledge-completion/handoffs/HANDOFF_P6.md`
```
