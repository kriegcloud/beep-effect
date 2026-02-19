# Phase 1 Handoff - Schema Foundation

**Phase**: 1 - Schema Foundation
**Status**: COMPLETE
**Estimated Duration**: 1 day
**Completed**: 2026-02-04
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
- [x] Read `specs/knowledge-graphrap-plus/README.md` Phase 1 section
- [x] Review `.claude/rules/effect-patterns.md` Schema Type Selection
- [x] Check `packages/knowledge/domain/src/EntityIds.ts` for EntityId/RelationId types
- [x] Read existing `@beep/schema` patterns in codebase

**Implementation**:
- [x] Create `packages/knowledge/server/src/GraphRAG/` directory (already existed)
- [x] Define `GroundedAnswer` schema with text, citations, confidence, reasoning fields
- [x] Define `Citation` schema with claimText, entityIds, relationId, confidence
- [x] Define `ReasoningTrace` schema with inferenceSteps, depth
- [x] Define `InferenceStep` schema with rule, premises
- [x] Add confidence range validation (0.0-1.0) - reused existing `Confidence` schema from value-objects
- [x] Export all schemas from `AnswerSchemas.ts`

**Validation**:
- [x] Run `bun run check --filter @beep/knowledge-server` - PASSED
- [x] Verify schema compiles without errors - PASSED
- [x] Add unit tests in `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts` - 23 tests
- [x] Run `bun run test --filter @beep/knowledge-server` - 313 tests passed

**Documentation**:
- [x] Update `REFLECTION_LOG.md` with schema design decisions (4 entries added)
- [x] Document any deviations from README spec (NonEmptyString source)
- [x] Note patterns that worked well for Phase 2 reuse (Confidence reuse, EntityId types)

**Handoff Creation** (REQUIRED):
- [x] Create `handoffs/HANDOFF_P2.md` with Phase 2 context
- [x] Create `handoffs/P2_ORCHESTRATOR_PROMPT.md` for Phase 2 kickoff

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

**When completing this phase** (ALL steps REQUIRED):
1. Mark all Tier 2 checkboxes complete
2. Update this document's Status to COMPLETE
3. **REQUIRED**: Create `HANDOFF_P{N+1}.md` with lessons learned and next phase context
4. **REQUIRED**: Create `P{N+1}_ORCHESTRATOR_PROMPT.md` for next phase kickoff
5. Update `REFLECTION_LOG.md` with phase learnings

> **CRITICAL**: A phase is NOT complete until handoff documents for the next phase are created.
> This ensures knowledge transfer between sessions and prevents context loss.
