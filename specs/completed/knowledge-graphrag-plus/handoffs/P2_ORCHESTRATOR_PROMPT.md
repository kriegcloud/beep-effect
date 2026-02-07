# Phase 2 Orchestrator Prompt - Answer Generation

**Copy-paste this prompt to start Phase 2 implementation**

---

You are implementing Phase 2 (Answer Generation) of the Knowledge GraphRAG Plus specification.

## Context

**Spec Location**: `specs/knowledge-graphrag-plus/`

**Phase Goal**: Create prompt templates and answer generation service that produces grounded answers with citation markers.

**Duration**: 2 days

**Predecessor**: Phase 1 (Schema Foundation) is COMPLETE. Schemas are available at `@beep/knowledge-server/GraphRAG/AnswerSchemas`.

## Your Mission

Implement the grounded answer generation pipeline:
1. Prompt templates for LLM with citation format instructions
2. Citation parser to extract `{{entity:id}}` and `{{relation:id}}` markers
3. Generator service integrating with OpenAI

## Required Files

### 1. `packages/knowledge/server/src/GraphRAG/PromptTemplates.ts`

```typescript
// Build prompts for grounded answer generation
export const buildGroundedAnswerPrompt: (
  context: GraphContext,
  question: string
) => { system: string; user: string }
```

**System Prompt Requirements**:
- Instruct LLM to use ONLY provided context
- Define citation format: `{{entity:entity_id}}` and `{{relation:relation_id}}`
- Require citations for every factual claim
- Handle insufficient context gracefully

### 2. `packages/knowledge/server/src/GraphRAG/CitationParser.ts`

```typescript
// Extract citations from LLM response text
export const extractEntityIds: (text: string) => ReadonlyArray<string>
export const extractRelationIds: (text: string) => ReadonlyArray<string>
export const parseCitations: (text: string, entityIds: ReadonlyArray<string>) => ReadonlyArray<Citation>
```

**Regex Patterns**:
- Entity: `/\{\{entity:([^}]+)\}\}/g`
- Relation: `/\{\{relation:([^}]+)\}\}/g`

### 3. `packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts`

```typescript
// Effect service for generating grounded answers
export class GroundedAnswerGenerator extends Context.Tag("GroundedAnswerGenerator")<...>

// Error type
export class GenerationError extends S.TaggedError<GenerationError>()("GenerationError", {...})
```

**Service Interface**:
```typescript
generate: (context: GraphContext, question: string) => Effect<GroundedAnswer, GenerationError>
```

## Critical Requirements

**Import Phase 1 Schemas**:
```typescript
import { Citation, GroundedAnswer } from "./AnswerSchemas";
```

**Use Effect Patterns**:
- `Effect.gen` for async operations
- `Effect.tryPromise` for OpenAI API calls
- `S.decode(GroundedAnswer)` for response validation
- `Context.Tag` for service definition
- `Layer.succeed` or `Layer.effect` for service implementation

**Citation Confidence**:
- Phase 2: Set confidence to 1.0 for all parsed citations (validation happens in Phase 3)
- Phase 3 will adjust confidence based on SPARQL validation

**NEVER**:
- Use `as any` or type assertions
- Use native array methods (use `A.*` from `effect/Array`)
- Hardcode API keys (use environment/config)
- Skip error handling for API failures

## Workflow

1. **Pre-Flight**:
   - Read `specs/knowledge-graphrag-plus/README.md` Phase 2 section
   - Read `specs/knowledge-graphrag-plus/handoffs/HANDOFF_P2.md` Tier 1-3
   - Review Phase 1 schemas in `AnswerSchemas.ts`
   - Check OpenAI client patterns in `@beep/shared-openai`

2. **Implementation**:
   - Create `PromptTemplates.ts` with prompt builder
   - Create `CitationParser.ts` with extraction utilities
   - Create `GroundedAnswerGenerator.ts` with Effect service
   - Update `index.ts` to export new modules

3. **Validation**:
   - Run `bun run check --filter @beep/knowledge-server`
   - Create unit tests for:
     - Prompt construction
     - Citation parsing (valid markers, edge cases)
     - Generator service (mock OpenAI responses)
   - Run `bun run test --filter @beep/knowledge-server`

4. **Documentation**:
   - Update `REFLECTION_LOG.md` with design decisions
   - Note any deviations from spec

5. **Handoff Creation** (REQUIRED):
   - Create `handoffs/HANDOFF_P3.md` with Phase 3 context
   - Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` for Phase 3 kickoff

## Success Criteria

- [ ] `PromptTemplates.ts` builds valid prompts with citation instructions
- [ ] `CitationParser.ts` extracts entity/relation citations from text
- [ ] `GroundedAnswerGenerator` service compiles and type-checks
- [ ] Generator returns `GroundedAnswer` with parsed citations
- [ ] Unit tests pass for all new modules
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `HANDOFF_P3.md` created with Phase 3 context
- [ ] `P3_ORCHESTRATOR_PROMPT.md` created for Phase 3 kickoff

## Reference

**Handoff Document**: `specs/knowledge-graphrag-plus/handoffs/HANDOFF_P2.md`

**Phase 1 Schemas**: `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`

**Phase 1 Learnings** (from REFLECTION_LOG.md):
1. Use `S.NonEmptyString` from `effect/Schema` directly
2. Reuse `Confidence` from `@beep/knowledge-domain/value-objects`
3. Use `KnowledgeEntityIds.KnowledgeEntityId` and `RelationId` for type safety

**Next Phase**: Phase 3 will validate citations against the knowledge graph using SPARQL and Reasoner

---

**Start implementation now. Report completion status and any blockers.**

**IMPORTANT**: Before marking this phase complete, you MUST create `HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md` for the next phase.
