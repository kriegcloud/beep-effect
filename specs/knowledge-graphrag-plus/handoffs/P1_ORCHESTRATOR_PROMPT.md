# Phase 1 Orchestrator Prompt - Schema Foundation

**Copy-paste this prompt to start Phase 1 implementation**

---

You are implementing Phase 1 (Schema Foundation) of the Knowledge GraphRAG Plus specification.

## Context

**Spec Location**: `specs/knowledge-graphrag-plus/`

**Phase Goal**: Create schema definitions for grounded answers with citations and reasoning traces.

**Duration**: 1 day

## Your Mission

Implement grounded answer schemas in `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`.

## Required Schemas

1. **InferenceStep** - Single step in reasoning trace
   - `rule: string` - Inference rule applied
   - `premises: string[]` - Input facts

2. **ReasoningTrace** - Inference path for inferred relationships
   - `inferenceSteps: InferenceStep[]` - Ordered steps
   - `depth: number` - Inference depth (≥1)

3. **Citation** - Link between claim and graph entities/relations
   - `claimText: string` - Text being cited
   - `entityIds: EntityId[]` - Referenced entities
   - `relationId?: RelationId` - Optional relation
   - `confidence: number` - Score 0.0-1.0

4. **GroundedAnswer** - Final answer with citations
   - `text: string` - Answer text
   - `citations: Citation[]` - Supporting citations
   - `confidence: number` - Overall score 0.0-1.0
   - `reasoning?: ReasoningTrace` - Optional inference path

## Critical Requirements

**Schema Patterns**:
- Use `S.Class<T>("ClassName")` for all schemas
- Use `BS.NonEmptyString` for text fields
- Use `S.Array(T)` for collections (PascalCase)
- Use `S.optional(T)` for optional fields
- Use `KnowledgeEntityIds.EntityId` and `KnowledgeEntityIds.RelationId` types
- Validate confidence: `S.Number.pipe(S.between(0, 1))`

**Imports**:
```typescript
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
```

**NEVER**:
- Use lowercase schema constructors (`S.string`, `S.array`)
- Use plain `S.String` for entity/relation IDs
- Use `S.Struct` instead of `S.Class`
- Forget confidence range validation

## Workflow

1. **Pre-Flight**:
   - Read `specs/knowledge-graphrag-plus/README.md` Phase 1 section
   - Read `specs/knowledge-graphrag-plus/handoffs/HANDOFF_P1.md` Tier 1-3
   - Review `.claude/rules/effect-patterns.md` Schema Type Selection

2. **Implementation**:
   - Create `packages/knowledge/server/src/GraphRAG/` directory
   - Implement `AnswerSchemas.ts` with all 4 schemas
   - Export all schemas from file

3. **Validation**:
   - Run `bun run check --filter @beep/knowledge-server`
   - Create `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts`
   - Add unit tests for:
     - Schema validation (valid inputs)
     - Confidence range enforcement (reject < 0 or > 1)
     - Required field validation
   - Run `bun run test --filter @beep/knowledge-server`

4. **Documentation**:
   - Update `REFLECTION_LOG.md` with design decisions
   - Note any deviations from spec
   - Document patterns for Phase 2 reuse

## Success Criteria

- [ ] All 4 schemas defined and exported
- [ ] Schemas compile without type errors
- [ ] Confidence validation enforces 0.0-1.0 range
- [ ] EntityId/RelationId types referenced correctly
- [ ] Unit tests pass
- [ ] `bun run check --filter @beep/knowledge-server` passes

## Reference

**Handoff Document**: `specs/knowledge-graphrag-plus/handoffs/HANDOFF_P1.md`

**Schema Template**: See Tier 3 in handoff document for complete implementation template

**Next Phase**: Phase 2 will build `GroundedAnswerGenerator` using these schemas

---

**Start implementation now. Report completion status and any blockers.**
