# Phase 3 Orchestrator Prompt

Copy this prompt to start Phase 3 execution.

---

## Orchestrator Prompt

You are executing **Phase 3 (Citation Validation)** of the Knowledge GraphRAG Plus specification.

### Context

**Spec Location**: `specs/knowledge-graphrag-plus/`
**Phase**: 3 of 3 (Final Phase)
**Predecessor**: Phase 2 (Answer Generation) - COMPLETE
**Goal**: Validate citations against knowledge graph, compute confidence scores, format reasoning traces

### Phase 2 Deliverables (Available)

These modules were created in Phase 2 and are available for use:

1. `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts` - Schema definitions
2. `packages/knowledge/server/src/GraphRAG/PromptTemplates.ts` - Prompt construction, `GraphContext` type
3. `packages/knowledge/server/src/GraphRAG/CitationParser.ts` - Citation extraction utilities
4. `packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts` - LLM answer generation

### Phase 3 Deliverables (To Create)

Create these modules:

1. **CitationValidator.ts** - Validate citations against graph via SPARQL
   - `validateEntity(entityId)` - Check entity exists
   - `validateRelation(relationId)` - Check relation exists (direct or inferred)
   - `validateCitation(citation)` - Full validation with confidence

2. **ReasoningTraceFormatter.ts** - Format inference paths
   - `formatReasoningTrace(inferenceResult)` - Convert Reasoner output to schema
   - `getInferencePath(relationId)` - Query Reasoner for derivation path

3. **ConfidenceScorer.ts** - Compute confidence scores
   - `scoreCitation(validationResult)` - Individual citation score
   - `scoreAnswer(groundedAnswer)` - Aggregate answer confidence
   - Formula: `confidence = min(entity_conf, relation_conf) * (1.0 - 0.1 * depth)`

### Critical Dependencies

Phase 3 requires these existing services:
- `SparqlService` from `@beep/knowledge-server/Sparql/SparqlService`
- `ReasonerService` from `@beep/knowledge-server/Reasoning/ReasonerService`

**Verify dependencies exist before starting implementation**.

### Key Patterns from Phase 2

1. Use `Effect.Service<T>()` pattern for service definitions
2. Use `Effect.fn(function* () {...}, Layer, mock)` for tests (NOT `.pipe()`)
3. Import `GraphContext` from `PromptTemplates.ts`
4. Use `KnowledgeEntityIds.KnowledgeEntityId` and `RelationId` for type safety
5. Handle `exactOptionalPropertyTypes` when constructing objects with optional fields

### Execution Steps

1. **Read handoff document**: `specs/knowledge-graphrag-plus/handoffs/HANDOFF_P3.md`
2. **Verify dependencies**: Check SparqlService and ReasonerService exist
3. **Implement CitationValidator.ts**: SPARQL-based validation
4. **Implement ReasoningTraceFormatter.ts**: Inference path formatting
5. **Implement ConfidenceScorer.ts**: Score calculation
6. **Export from index.ts**: Add new module exports
7. **Create tests**: Unit tests for each module
8. **Run validation**: `bun run check --filter @beep/knowledge-server`
9. **Run tests**: `bun run test --filter @beep/knowledge-server`
10. **Update REFLECTION_LOG.md**: Document learnings

### Success Criteria

- [ ] Citations validated against real graph via SPARQL queries
- [ ] Ungrounded claims flagged with confidence < 0.5
- [ ] Reasoning traces show inference paths for inferred relations
- [ ] Citation validation queries complete within 500ms per citation
- [ ] All tests pass: `bun run test --filter @beep/knowledge-server`
- [ ] Type check passes: `bun run check --filter @beep/knowledge-server`

### Test Requirements

**Unit Tests** (with mocks):
- CitationValidator handles missing entities (confidence 0.0)
- ReasoningTraceFormatter renders inference paths correctly
- ConfidenceScorer computes scores according to formula

**Integration Tests** (with real services):
- End-to-end validation against test graph
- Inferred relation triggers reasoning trace generation

### Agent Recommendation

Use `effect-code-writer` or `effect-expert` agent for implementation.

For complex SPARQL queries, consider `codebase-researcher` to find existing query patterns.

### Start Command

```
Read specs/knowledge-graphrag-plus/handoffs/HANDOFF_P3.md for full context, then begin implementation.
```
