# Phase 2 Handoff - Answer Generation

**Phase**: 2 - Answer Generation
**Status**: NOT STARTED
**Estimated Duration**: 2 days
**Agent Recommendation**: `effect-code-writer` or `effect-expert`
**Predecessor**: Phase 1 (Schema Foundation) - COMPLETE

## Session Memory (4-Tier Structure)

### Tier 1: Critical Context (ALWAYS load)

**Spec Purpose**: Add grounded answer generation with citations and reasoning traces to GraphRAG pipeline

**Phase 2 Goal**: Create prompt templates and answer generation service that produces `GroundedAnswer` instances with citation markers

**Key Constraints**:
- MUST use Phase 1 schemas from `@beep/knowledge-server/GraphRAG/AnswerSchemas`
- MUST integrate with existing OpenAI client from `@beep/shared-openai`
- MUST produce citation markers in format `{{entity:id}}` and `{{relation:id}}`
- MUST handle missing/insufficient context gracefully (low confidence answer)
- NEVER use `as any` or type assertions for schema decode

**Phase 2 Deliverables**:
- `packages/knowledge/server/src/GraphRAG/PromptTemplates.ts` - Prompt construction utilities
- `packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts` - Service implementation
- `packages/knowledge/server/src/GraphRAG/CitationParser.ts` - Parse citation markers from LLM response

### Tier 2: Execution Checklist

**Pre-Flight**:
- [ ] Read `specs/knowledge-graphrag-plus/README.md` Phase 2 section
- [ ] Read `specs/knowledge-graphrag-plus/handoffs/HANDOFF_P2.md` (this document)
- [ ] Review Phase 1 schemas in `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`
- [ ] Review existing GraphRAG service in `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`
- [ ] Check OpenAI client patterns in `@beep/shared-openai`

**Implementation**:
- [ ] Create `PromptTemplates.ts` with:
  - [ ] `buildGroundedAnswerPrompt(context, question)` function
  - [ ] System prompt explaining citation format requirements
  - [ ] User prompt template with context and question slots
- [ ] Create `CitationParser.ts` with:
  - [ ] `parseCitationMarkers(text)` - Extract `{{entity:id}}` and `{{relation:id}}` patterns
  - [ ] `extractEntityIds(text)` - Return array of KnowledgeEntityIds
  - [ ] `extractRelationIds(text)` - Return array of RelationIds
- [ ] Create `GroundedAnswerGenerator.ts` with:
  - [ ] `GroundedAnswerGenerator` Effect service tag
  - [ ] `generate(context, question)` method returning `Effect<GroundedAnswer, GenerationError>`
  - [ ] Integration with OpenAI chat completions API
  - [ ] Citation parsing from LLM response
  - [ ] Default confidence scoring (1.0 for citations found, will be validated in Phase 3)
- [ ] Export all new modules from `packages/knowledge/server/src/GraphRAG/index.ts`

**Validation**:
- [ ] Run `bun run check --filter @beep/knowledge-server`
- [ ] Create unit tests:
  - [ ] `test/GraphRAG/PromptTemplates.test.ts` - Prompt construction
  - [ ] `test/GraphRAG/CitationParser.test.ts` - Citation extraction
  - [ ] `test/GraphRAG/GroundedAnswerGenerator.test.ts` - Service integration (mock OpenAI)
- [ ] Run `bun run test --filter @beep/knowledge-server`

**Documentation**:
- [ ] Update `REFLECTION_LOG.md` with design decisions
- [ ] Note any deviations from README spec
- [ ] Document patterns for Phase 3 reuse

**Handoff Creation** (REQUIRED):
- [ ] Create `handoffs/HANDOFF_P3.md` with Phase 3 context
- [ ] Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` for Phase 3 kickoff

### Tier 3: Technical Details

**Prompt Template Structure**:
```typescript
import * as Effect from "effect/Effect";

export interface GraphContext {
  entities: ReadonlyArray<{
    id: string;
    mention: string;
    types: ReadonlyArray<string>;
    attributes?: Record<string, string>;
  }>;
  relations: ReadonlyArray<{
    id: string;
    subjectId: string;
    predicate: string;
    objectId: string;
  }>;
}

export const buildGroundedAnswerPrompt = (
  context: GraphContext,
  question: string
): { system: string; user: string } => {
  const systemPrompt = `You are a knowledge assistant that answers questions using ONLY the provided context.

CITATION FORMAT (REQUIRED):
- When mentioning an entity, cite it: {{entity:entity_id}}
- When describing a relationship, cite it: {{relation:relation_id}}
- Every factual claim MUST have a citation

If the context does not contain enough information, say "I don't have enough information" and explain what's missing.`;

  const userPrompt = `## Context

### Entities
${formatEntities(context.entities)}

### Relations
${formatRelations(context.relations)}

## Question
${question}

## Answer (with citations)`;

  return { system: systemPrompt, user: userPrompt };
};
```

**Citation Parser Pattern**:
```typescript
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";

const ENTITY_CITATION_REGEX = /\{\{entity:([^}]+)\}\}/g;
const RELATION_CITATION_REGEX = /\{\{relation:([^}]+)\}\}/g;

export const extractEntityIds = (text: string): ReadonlyArray<string> => {
  const matches = text.matchAll(ENTITY_CITATION_REGEX);
  return A.fromIterable(matches).map(m => m[1]);
};

export const extractRelationIds = (text: string): ReadonlyArray<string> => {
  const matches = text.matchAll(RELATION_CITATION_REGEX);
  return A.fromIterable(matches).map(m => m[1]);
};
```

**Generator Service Pattern**:
```typescript
import * as Effect from "effect/Effect";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { GroundedAnswer, Citation } from "./AnswerSchemas";

export class GroundedAnswerGenerator extends Context.Tag("GroundedAnswerGenerator")<
  GroundedAnswerGenerator,
  {
    readonly generate: (
      context: GraphContext,
      question: string
    ) => Effect.Effect<GroundedAnswer, GenerationError>;
  }
>() {}

export class GenerationError extends S.TaggedError<GenerationError>()("GenerationError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}
```

**Phase 1 Learnings to Apply**:
1. Use `S.NonEmptyString` directly from `effect/Schema` (not `BS.NonEmptyString`)
2. Reuse `Confidence` from `@beep/knowledge-domain/value-objects`
3. Use `KnowledgeEntityIds.KnowledgeEntityId` and `RelationId` for type safety
4. Use `S.Class<T>("ClassName")` pattern for error classes

### Tier 4: Historical Context

**Phase 1 Completion Summary**:
- Created 4 schemas: `InferenceStep`, `ReasoningTrace`, `Citation`, `GroundedAnswer`
- Located at `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`
- 23 unit tests passing
- Key insight: Reuse existing `Confidence` schema from value-objects

**Related Specs**:
- `specs/knowledge-sparql-integration/` - SPARQL client (needed for Phase 3)
- `specs/knowledge-reasoning-engine/` - Reasoner (needed for Phase 3)

**Dependencies**:
- `@beep/shared-openai` - OpenAI client for LLM calls
- `@beep/knowledge-domain` - Entity ID types
- Phase 1 schemas from this spec

**Phase 3 Preview**:
Phase 3 will validate citations against the actual knowledge graph:
- Use SPARQL to verify entities/relations exist
- Use Reasoner to get inference paths for inferred relationships
- Compute final confidence scores based on validation results

---

## Handoff Protocol

**When resuming this phase**:
1. Load Tier 1 + Tier 2 into working memory
2. Check completion status in Tier 2 checklist
3. Reference Tier 3 for implementation details
4. Update `REFLECTION_LOG.md` with any new learnings

**When completing this phase**:
1. Mark all Tier 2 checkboxes complete
2. Update this document's Status to COMPLETE
3. Create `HANDOFF_P3.md` with lessons learned (REQUIRED)
4. Generate `P3_ORCHESTRATOR_PROMPT.md` from template (REQUIRED)
5. Update `REFLECTION_LOG.md` with Phase 2 entries
