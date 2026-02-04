# Phase 3 Handoff - Citation Validation

**Phase**: 3 - Citation Validation
**Status**: NOT STARTED
**Estimated Duration**: 5 days
**Agent Recommendation**: `effect-code-writer` or `effect-expert`
**Predecessor**: Phase 2 (Answer Generation) - COMPLETE

## Session Memory (4-Tier Structure)

### Tier 1: Critical Context (ALWAYS load)

**Spec Purpose**: Add grounded answer generation with citations and reasoning traces to GraphRAG pipeline

**Phase 3 Goal**: Validate citations against actual knowledge graph, compute confidence scores, and format reasoning traces for inferred relationships

**Key Constraints**:
- MUST use Phase 1 schemas from `@beep/knowledge-server/GraphRAG/AnswerSchemas`
- MUST use Phase 2 citation parsing from `@beep/knowledge-server/GraphRAG/CitationParser`
- MUST integrate with SPARQL client from `@beep/knowledge-server/Sparql/SparqlService`
- MUST integrate with Reasoner from `@beep/knowledge-server/Reasoning/ReasonerService`
- MUST validate citations against REAL graph data (no mocking in validation tests)
- Citation validation queries MUST complete within 500ms per citation
- NEVER use `as any` or type assertions for schema decode

**Phase 3 Deliverables**:
- `packages/knowledge/server/src/GraphRAG/CitationValidator.ts` - Validate citations via SPARQL
- `packages/knowledge/server/src/GraphRAG/ReasoningTraceFormatter.ts` - Format inference paths
- `packages/knowledge/server/src/GraphRAG/ConfidenceScorer.ts` - Compute final confidence scores

### Tier 2: Execution Checklist

**Pre-Flight**:
- [ ] Read `specs/knowledge-graphrag-plus/README.md` Phase 3 section
- [ ] Read `specs/knowledge-graphrag-plus/handoffs/HANDOFF_P3.md` (this document)
- [ ] Verify SPARQL client exists: check `packages/knowledge/server/src/Sparql/SparqlService.ts`
- [ ] Verify Reasoner exists: check `packages/knowledge/server/src/Reasoning/ReasonerService.ts`
- [ ] Review Phase 1 schemas in `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`
- [ ] Review Phase 2 citation parsing in `packages/knowledge/server/src/GraphRAG/CitationParser.ts`
- [ ] Review Phase 2 context types in `packages/knowledge/server/src/GraphRAG/PromptTemplates.ts`

**Implementation - CitationValidator**:
- [ ] Create `CitationValidator.ts` with:
  - [ ] `CitationValidator` Effect service tag
  - [ ] `validateEntityCitation(entityId)` - SPARQL query to verify entity exists
  - [ ] `validateRelationCitation(relationId)` - SPARQL query to verify relation exists
  - [ ] `validateCitation(citation)` - Combines entity + relation validation
  - [ ] `validateAllCitations(citations)` - Batch validation with parallel execution
- [ ] Entity validation returns: `{ found: boolean, confidence: number }`
- [ ] Relation validation returns: `{ found: boolean, isInferred: boolean, confidence: number }`

**Implementation - ReasoningTraceFormatter**:
- [ ] Create `ReasoningTraceFormatter.ts` with:
  - [ ] `formatReasoningTrace(inferenceResult)` - Convert Reasoner output to ReasoningTrace schema
  - [ ] `summarizeTrace(trace)` - Brief description for UI display
  - [ ] `getInferencePath(relationId)` - Query Reasoner for how relation was derived
- [ ] Handle direct vs inferred relations
- [ ] Calculate inference depth from path length

**Implementation - ConfidenceScorer**:
- [ ] Create `ConfidenceScorer.ts` with:
  - [ ] `scoreCitation(validationResult)` - Score individual citation
  - [ ] `scoreAnswer(groundedAnswer)` - Aggregate citation scores
  - [ ] `applyDepthPenalty(confidence, depth)` - Reduce confidence for deep inferences
- [ ] Scoring formula:
  ```
  citation_confidence = min(entity_confidence, relation_confidence)
  answer_confidence = weighted_avg(citation_confidences)
  inferred_penalty = 1.0 - (0.1 * inference_depth)
  final_confidence = citation_confidence * inferred_penalty
  ```

**Integration**:
- [ ] Create `ValidatedAnswerGenerator.ts` or update `GroundedAnswerGenerator.ts`:
  - [ ] After LLM generates answer, validate all citations
  - [ ] Attach reasoning traces for inferred relations
  - [ ] Compute final confidence scores
- [ ] Export all new modules from `packages/knowledge/server/src/GraphRAG/index.ts`

**Validation**:
- [ ] Run `bun run check --filter @beep/knowledge-server`
- [ ] Create unit tests:
  - [ ] `test/GraphRAG/CitationValidator.test.ts` - Entity/relation validation
  - [ ] `test/GraphRAG/ReasoningTraceFormatter.test.ts` - Trace formatting
  - [ ] `test/GraphRAG/ConfidenceScorer.test.ts` - Score calculation
- [ ] Create integration tests (with real SPARQL/Reasoner):
  - [ ] End-to-end citation validation against test graph
  - [ ] Inferred relation trace generation
- [ ] Run `bun run test --filter @beep/knowledge-server`

**Documentation**:
- [ ] Update `REFLECTION_LOG.md` with design decisions
- [ ] Note any deviations from README spec
- [ ] Document SPARQL query patterns for future optimization

### Tier 3: Technical Details

**SPARQL Query Patterns**:

Entity existence check:
```sparql
ASK WHERE {
  ?s ?p ?o .
  FILTER(?s = <entity_id> || ?o = <entity_id>)
}
```

Relation existence check:
```sparql
ASK WHERE {
  <subject_id> <predicate> <object_id> .
}
```

**Validation Result Types**:
```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

interface EntityValidationResult {
  readonly entityId: string;
  readonly found: boolean;
  readonly confidence: number;
}

interface RelationValidationResult {
  readonly relationId: string;
  readonly found: boolean;
  readonly isInferred: boolean;
  readonly confidence: number;
  readonly reasoningTrace?: ReasoningTrace;
}

interface CitationValidationResult {
  readonly citation: Citation;
  readonly entityResults: ReadonlyArray<EntityValidationResult>;
  readonly relationResult?: RelationValidationResult;
  readonly overallConfidence: number;
}
```

**Service Layer Pattern**:
```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

export class CitationValidator extends Effect.Service<CitationValidator>()(
  "@beep/knowledge-server/CitationValidator",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sparql = yield* SparqlService;
      const reasoner = yield* ReasonerService;

      const validateEntity = (entityId: string) => Effect.gen(function* () {
        // SPARQL ASK query
      });

      const validateRelation = (relationId: string) => Effect.gen(function* () {
        // Check direct existence
        // If not found, check Reasoner for inference path
      });

      return { validateEntity, validateRelation, ... };
    }),
  }
) {}
```

**Confidence Scoring Formula**:
```typescript
const scoreCitation = (result: CitationValidationResult): number => {
  // Entity confidence: avg of all entity validations
  const entityConfidence = result.entityResults.length > 0
    ? A.reduce(result.entityResults, 0, (acc, e) => acc + e.confidence) / result.entityResults.length
    : 1.0;

  // Relation confidence
  const relationConfidence = result.relationResult?.confidence ?? 1.0;

  // Base confidence = min of entity and relation
  let confidence = Math.min(entityConfidence, relationConfidence);

  // Apply depth penalty for inferred relations
  if (result.relationResult?.isInferred && result.relationResult.reasoningTrace) {
    const depth = result.relationResult.reasoningTrace.depth;
    confidence *= (1.0 - (0.1 * depth));
  }

  return Math.max(0, confidence);
};
```

**Phase 2 Learnings to Apply**:
1. Use `Effect.fn(function* () {...}, Layer, mock)` pattern for tests
2. Create custom mocks for services that return specific response types
3. Handle TypeScript `exactOptionalPropertyTypes` when constructing objects
4. Import `GraphContext` from `PromptTemplates.ts` for type consistency
5. Use `KnowledgeEntityIds.KnowledgeEntityId` and `RelationId` for type safety

### Tier 4: Historical Context

**Phase 1 Completion Summary**:
- Created 4 schemas: `InferenceStep`, `ReasoningTrace`, `Citation`, `GroundedAnswer`
- Located at `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`
- 23 unit tests passing

**Phase 2 Completion Summary**:
- Created `PromptTemplates.ts` - Prompt construction with citation format instructions
- Created `CitationParser.ts` - Extract entity/relation IDs from LLM responses
- Created `GroundedAnswerGenerator.ts` - LLM integration for grounded answers
- Key insight: Need separate mock helpers for `generateText` vs `generateObject`
- 47+ tests for Phase 2 modules

**Related Services**:
- `packages/knowledge/server/src/Sparql/SparqlService.ts` - SPARQL query execution
- `packages/knowledge/server/src/Reasoning/ReasonerService.ts` - Inference engine

**Confidence Thresholds (from README)**:
- `>= 0.5`: Valid citation, include in answer
- `< 0.5`: Flagged as potentially ungrounded
- `< 0.3`: Consider excluding from answer entirely

**Max Inference Depth**:
- Default limit: 5 hops
- Beyond 5 hops, confidence approaches 0.5 minimum

---

## Handoff Protocol

**When resuming this phase**:
1. Load Tier 1 + Tier 2 into working memory
2. Check completion status in Tier 2 checklist
3. Verify SPARQL and Reasoner services exist (critical dependencies)
4. Reference Tier 3 for implementation details
5. Update `REFLECTION_LOG.md` with any new learnings

**When completing this phase**:
1. Mark all Tier 2 checkboxes complete
2. Update this document's Status to COMPLETE
3. Update spec README.md Phase 3 status
4. Update `REFLECTION_LOG.md` with Phase 3 entries
5. Note: Phase 3 is final phase - no HANDOFF_P4.md needed
