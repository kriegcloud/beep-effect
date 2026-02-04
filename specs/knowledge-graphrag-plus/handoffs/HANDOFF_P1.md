# Phase 1 Handoff - Schema Foundation

**Phase**: 1 - Schema Foundation
**Status**: NOT STARTED
**Estimated Duration**: 1 day
**Agent Recommendation**: `code-observability-writer` or `test-writer`

## Session Memory (4-Tier Structure)

### Tier 1: Critical Context (ALWAYS load)

**Spec Purpose**: Add grounded answer generation with citations and reasoning traces to GraphRAG pipeline

**Phase 1 Goal**: Create schema definitions for grounded answers, citations, and reasoning traces

**Key Constraints**:
- MUST use `@beep/schema` (BS) for all schema definitions
- MUST reference `KnowledgeEntityIds.EntityId` and `KnowledgeEntityIds.RelationId` types
- MUST enforce confidence scores in 0.0-1.0 range
- NEVER use plain `S.String` for entity/relation IDs

**Phase 1 Deliverables**:
- `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts` with:
  - `GroundedAnswer` schema
  - `Citation` schema
  - `ReasoningTrace` schema
  - `InferenceStep` schema

### Tier 2: Execution Checklist

**Pre-Flight**:
- [ ] Read `specs/knowledge-graphrag-plus/README.md` Phase 1 section
- [ ] Review `.claude/rules/effect-patterns.md` Schema Type Selection
- [ ] Check `packages/knowledge/domain/src/EntityIds.ts` for EntityId/RelationId types
- [ ] Read existing `@beep/schema` patterns in codebase

**Implementation**:
- [ ] Create `packages/knowledge/server/src/GraphRAG/` directory
- [ ] Define `GroundedAnswer` schema with text, citations, confidence, reasoning fields
- [ ] Define `Citation` schema with claimText, entityIds, relationId, confidence
- [ ] Define `ReasoningTrace` schema with inferenceSteps, depth
- [ ] Define `InferenceStep` schema with rule, premises
- [ ] Add confidence range validation (0.0-1.0) using `S.Number.pipe(S.between(0, 1))`
- [ ] Export all schemas from `AnswerSchemas.ts`

**Validation**:
- [ ] Run `bun run check --filter @beep/knowledge-server`
- [ ] Verify schema compiles without errors
- [ ] Add unit tests in `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts`
- [ ] Run `bun run test --filter @beep/knowledge-server`

**Documentation**:
- [ ] Update `REFLECTION_LOG.md` with schema design decisions
- [ ] Document any deviations from README spec
- [ ] Note patterns that worked well for Phase 2 reuse

### Tier 3: Technical Details

**Schema Structure Template**:
```typescript
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/knowledge-domain";

// Inference step in reasoning trace
export class InferenceStep extends S.Class<InferenceStep>("InferenceStep")({
  rule: S.String,
  premises: S.Array(S.String),
}) {}

// Reasoning trace for inferred relationships
export class ReasoningTrace extends S.Class<ReasoningTrace>("ReasoningTrace")({
  inferenceSteps: S.Array(InferenceStep),
  depth: S.Number.pipe(S.int(), S.greaterThanOrEqualTo(1)),
}) {}

// Citation linking claim to graph entities/relations
export class Citation extends S.Class<Citation>("Citation")({
  claimText: BS.NonEmptyString,
  entityIds: S.Array(KnowledgeEntityIds.EntityId),
  relationId: S.optional(KnowledgeEntityIds.RelationId),
  confidence: S.Number.pipe(S.between(0, 1)),
}) {}

// Grounded answer with citations and reasoning
export class GroundedAnswer extends S.Class<GroundedAnswer>("GroundedAnswer")({
  text: BS.NonEmptyString,
  citations: S.Array(Citation),
  confidence: S.Number.pipe(S.between(0, 1)),
  reasoning: S.optional(ReasoningTrace),
}) {}
```

**Validation Rules**:
- `confidence` MUST be 0.0-1.0 inclusive
- `entityIds` MUST be non-empty array when citation exists
- `inferenceSteps` MUST be non-empty when ReasoningTrace exists
- `depth` MUST match `inferenceSteps.length`

**Effect Patterns**:
- Use `S.Class` for schema classes (NOT `S.Struct`)
- Use `BS.NonEmptyString` for text fields
- Use `S.Array(T)` for collections (NOT `S.array(t)`)
- Use `S.optional` for optional fields (NOT `S.optionalWith`)

### Tier 4: Historical Context

**Related Specs**:
- `specs/knowledge-architecture-foundation/` - Package allocation patterns
- `specs/knowledge-ontology-comparison/` - Roadmap source

**Dependencies**:
- Phase 1.1 SPARQL Integration (for citation validation in Phase 3)
- Phase 1.2 Reasoning Engine (for inference traces in Phase 3)
- `@beep/knowledge-domain` EntityId types

**Phase 2 Preview**:
Next phase will build `GroundedAnswerGenerator` service using these schemas. Generator will:
- Accept user query + graph context
- Call OpenAI with citation-formatted prompt
- Return `GroundedAnswer` instance

**Design Rationale**:
- Citations as array (not map) to preserve order in answer text
- Confidence at both citation and answer level for granular flagging
- ReasoningTrace optional (only for inferred relationships)
- InferenceStep as separate class for reusability in other contexts

## Source Verification

### OpenAI API Response Structures

**CRITICAL**: Always verify actual API response shapes from source types, NEVER assume.

| Component | Source | Verified Shape |
|-----------|--------|----------------|
| `chat.completions.create()` response | OpenAI SDK types | `{ choices: [{ message: { content: string \| null } }] }` |
| Citation markers | Custom parsing (Phase 2) | `{{entity:id}}` and `{{relation:id}}` patterns |
| Graph context | Phase 1 schemas | `{ entities: Array<{ id, mention, types }>, relations: Array<{ id, subject, predicate, object }> }` |

**Note**: No citation markers in raw OpenAI response - Phase 2 must parse from `content` field.

**Verification Method**:
```typescript
// Check OpenAI SDK types in node_modules/openai/resources/chat/completions.d.ts
// OR use LSP hover in IDE for type inspection
```

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
3. Create `HANDOFF_P2.md` with lessons learned
4. Generate `P2_ORCHESTRATOR_PROMPT.md` from template
