# Master Orchestration: Knowledge GraphRAG Plus

> Complete phase workflows, checkpoints, and handoff protocols for implementing grounded answer generation with citation validation.

---

## Overview

This spec enhances the GraphRAG pipeline with verifiable citations and reasoning transparency. Each phase builds incrementally:

1. **Phase 1**: Schema Foundation - Define grounded answer data structures
2. **Phase 2**: Answer Generation - LLM integration with citation prompts
3. **Phase 3**: Citation Validation - SPARQL verification + reasoning traces

**Estimated Timeline**: 2-3 weeks (10 working days with buffer)

---

## Critical Dependencies

**BLOCKING**: This spec CANNOT start until BOTH prerequisite specs are complete:

| Prerequisite Spec | Status | Why Required |
|-------------------|--------|--------------|
| `specs/knowledge-sparql-integration/` (Phase 1.1) | MUST BE COMPLETE | Citation validation queries the graph via SPARQL |
| `specs/knowledge-reasoning-engine/` (Phase 1.2) | MUST BE COMPLETE | Reasoning traces require inference path extraction |

**Verification Command**:
```bash
# Check prerequisite specs are marked COMPLETE in their README.md
cat specs/knowledge-sparql-integration/README.md | grep "Status:"
cat specs/knowledge-reasoning-engine/README.md | grep "Status:"
```

---

## Phase 0: Planning

**Duration**: 1 session
**Status**: Complete (this document)
**Agents**: `reflector`, `doc-writer`

### Objectives

1. Calculate complexity score
2. Define phase breakdown
3. Create orchestration documents
4. Define success criteria

### Deliverables

- [x] QUICK_START.md - 5-minute onboarding
- [x] MASTER_ORCHESTRATION.md - This document
- [x] AGENT_PROMPTS.md - Sub-agent prompts
- [x] Complexity calculation added to README.md
- [x] REFLECTION_LOG.md initialized

---

## Phase 1: Schema Foundation

**Duration**: 1 day
**Status**: Pending
**Agents**: `test-writer` (for schema validation tests), `effect-code-writer` (if needed)

### Objectives

1. Define grounded answer schema structure
2. Define citation schema with entity/relation references
3. Define reasoning trace schema for inference paths
4. Enforce confidence score range validation (0.0-1.0)

### Tasks

#### Task 1.1: Create AnswerSchemas.ts

**Agent**: Manual or `effect-code-writer`
**Complexity**: Small
**Estimated Time**: 2 hours

**Deliverable**: `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`

**Schema Definitions Required**:

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
- `depth` SHOULD equal `inferenceSteps.length` (document as convention, not enforced)

**Critical Patterns**:
- Use `S.Class` for schema classes (NOT `S.Struct`)
- Use `BS.NonEmptyString` for text fields
- Use `S.Array(T)` for collections (NOT `S.array(t)`)
- Use `S.optional` for optional fields
- Use `KnowledgeEntityIds.EntityId` branded type (NOT plain `S.String`)

#### Task 1.2: Add Schema Validation Tests

**Agent**: `test-writer`
**Complexity**: Small
**Estimated Time**: 2 hours

**Deliverable**: `packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts`

**Test Coverage Required**:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
import { GroundedAnswer, Citation, ReasoningTrace, InferenceStep } from "../../src/GraphRAG/AnswerSchemas.js";

effect("Citation validates with entity IDs", () =>
  Effect.gen(function* () {
    const citation = new Citation({
      claimText: "Alice knows Bob",
      entityIds: ["knowledge_entity__alice", "knowledge_entity__bob"],
      confidence: 0.95,
    });
    strictEqual(citation.claimText, "Alice knows Bob");
  })
);

effect("Citation rejects confidence out of range", () =>
  Effect.gen(function* () {
    const result = yield* S.decodeUnknownEither(Citation)({
      claimText: "test",
      entityIds: ["knowledge_entity__test"],
      confidence: 1.5,  // Invalid
    });
    strictEqual(result._tag, "Left");  // Should fail validation
  })
);

effect("GroundedAnswer accepts valid structure", () =>
  Effect.gen(function* () {
    const answer = new GroundedAnswer({
      text: "Answer text",
      citations: [],
      confidence: 0.8,
    });
    strictEqual(answer.confidence, 0.8);
  })
);
```

**Verification**:
```bash
bun run test --filter @beep/knowledge-server
bun run check --filter @beep/knowledge-server
```

### Checkpoints

- [ ] AnswerSchemas.ts created with all 4 schema classes
- [ ] Confidence validation enforces 0.0-1.0 range
- [ ] EntityId/RelationId fields use branded types
- [ ] Tests validate schema structure and edge cases
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

### Phase 1 Handoff Requirements

**Before proceeding to Phase 2, you MUST create**:
1. `handoffs/HANDOFF_P2.md` - Full context document
2. `handoffs/P2_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt

**Update**:
- `REFLECTION_LOG.md` with Phase 1 learnings

---

## Phase 2: Answer Generation

**Duration**: 2 days
**Status**: Pending
**Agents**: `codebase-researcher`, `effect-code-writer`, `test-writer`

### Objectives

1. Create OpenAI-based answer generation service
2. Design prompt templates with citation requirements
3. Parse citation markers from LLM responses
4. Integrate with `@beep/shared-openai`

### Tasks

#### Task 2.1: Research OpenAI Integration Patterns

**Agent**: `codebase-researcher`
**Complexity**: Small
**Estimated Time**: 1 hour

**Research Questions**:
1. How is `@beep/shared-openai` structured?
2. What is the OpenAI client service pattern?
3. How are chat completions called?
4. What response schema does OpenAI return?
5. Are there existing prompt template patterns?

**Examine Files**:
- `packages/shared/openai/src/`
- Any existing usage of OpenAI in codebase

**Output**: Document findings in working memory for Task 2.2

#### Task 2.2: Create Prompt Templates

**Agent**: Manual or `effect-code-writer`
**Complexity**: Medium
**Estimated Time**: 4 hours

**Deliverable**: `packages/knowledge/server/src/GraphRAG/PromptTemplates.ts`

**Prompt Template Structure**:

```typescript
import * as F from "effect/Function";

export interface GraphContext {
  entities: Array<{ id: string; mention: string; types: string[] }>;
  relations: Array<{ id: string; subject: string; predicate: string; object: string }>;
}

export const formatCitationPrompt = (query: string, context: GraphContext): string =>
  F.pipe(
    [
      "You are a knowledge graph assistant. Answer the user's question using ONLY the provided context.",
      "",
      "Context:",
      formatEntities(context.entities),
      formatRelations(context.relations),
      "",
      "Requirements:",
      "1. Answer using ONLY the provided entities and relations",
      "2. Cite entities with format: {{entity:entity_id}}",
      "3. Cite relations with format: {{relation:relation_id}}",
      "4. If answer requires inference, explain your reasoning",
      "5. If context is insufficient, state that explicitly",
      "",
      `Question: ${query}`,
      "",
      "Answer:",
    ],
    (lines) => lines.join("\n")
  );

const formatEntities = (entities: GraphContext["entities"]): string =>
  entities
    .map((e) => `- ${e.mention} (ID: ${e.id}, Types: ${e.types.join(", ")})`)
    .join("\n");

const formatRelations = (relations: GraphContext["relations"]): string =>
  relations
    .map((r) => `- ${r.subject} --[${r.predicate}]--> ${r.object} (ID: ${r.id})`)
    .join("\n");
```

**Critical Pattern**: Use `F.pipe` for string composition, NOT native `.join()`.

#### Task 2.3: Create GroundedAnswerGenerator Service

**Agent**: `effect-code-writer`
**Complexity**: Medium
**Estimated Time**: 6 hours

**Deliverable**: `packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts`

**Service Definition**:

```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { OpenAIClient } from "@beep/shared-openai";
import { GroundedAnswer, Citation } from "./AnswerSchemas.js";
import { formatCitationPrompt, type GraphContext } from "./PromptTemplates.js";

export class GroundedAnswerGenerator extends Effect.Service<GroundedAnswerGenerator>()(
  "@beep/knowledge-server/GraphRAG/GroundedAnswerGenerator",
  {
    dependencies: [OpenAIClient.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const openai = yield* OpenAIClient;

      return {
        generate: (query: string, context: GraphContext) =>
          Effect.gen(function* () {
            const prompt = formatCitationPrompt(query, context);

            const response = yield* openai.chat.completions.create({
              model: "gpt-4",
              messages: [{ role: "user", content: prompt }],
            });

            const rawAnswer = response.choices[0].message.content;
            if (!rawAnswer) {
              return yield* Effect.fail(
                new AnswerGenerationError({ message: "Empty response from OpenAI" })
              );
            }

            // Parse citation markers from response
            const citations = yield* parseCitations(rawAnswer, context);
            const cleanedText = removeCitationMarkers(rawAnswer);

            return new GroundedAnswer({
              text: cleanedText,
              citations,
              confidence: computeInitialConfidence(citations),
              reasoning: undefined,  // Set in Phase 3 validation
            });
          }),
      };
    }),
  }
) {}

export class AnswerGenerationError extends S.TaggedError<AnswerGenerationError>()(
  "AnswerGenerationError",
  {
    message: S.String,
  }
) {}

const parseCitations = (text: string, context: GraphContext): Effect.Effect<Citation[]> =>
  Effect.gen(function* () {
    // Extract {{entity:id}} and {{relation:id}} markers
    const entityPattern = /\{\{entity:([^}]+)\}\}/g;
    const relationPattern = /\{\{relation:([^}]+)\}\}/g;

    // Implementation: parse markers, validate IDs exist in context
    // Return Citation[] with preliminary confidence 1.0 (refined in Phase 3)
  });

const computeInitialConfidence = (citations: Citation[]): number => {
  // Placeholder: average of citation confidences
  // Phase 3 will refine with validation
  return citations.length > 0 ? 0.8 : 0.3;
};
```

**Note**: Citation parsing is CRITICAL. LLM may not follow format perfectly. Handle gracefully.

#### Task 2.4: Add Integration Tests

**Agent**: `test-writer`
**Complexity**: Medium
**Estimated Time**: 4 hours

**Deliverable**: `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`

**Test Coverage**:
- Mock OpenAI client response
- Verify citation parsing extracts entity/relation IDs
- Verify invalid citation markers handled gracefully
- Verify empty response handled with error

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { GroundedAnswerGenerator } from "../../src/GraphRAG/GroundedAnswerGenerator.js";
import { OpenAIClient } from "@beep/shared-openai";

const MockOpenAILayer = Layer.succeed(
  OpenAIClient,
  {
    chat: {
      completions: {
        create: () =>
          Effect.succeed({
            choices: [
              {
                message: {
                  content: "Alice {{entity:ent1}} knows Bob {{entity:ent2}} via {{relation:rel1}}",
                },
              },
            ],
          }),
      },
    },
  }
);

const TestLayer = Layer.provide(GroundedAnswerGenerator.Default, MockOpenAILayer);

layer(TestLayer)("GroundedAnswerGenerator", (it) => {
  it.effect("parses citation markers", () =>
    Effect.gen(function* () {
      const gen = yield* GroundedAnswerGenerator;
      const result = yield* gen.generate("test query", {
        entities: [{ id: "ent1", mention: "Alice", types: ["Person"] }],
        relations: [{ id: "rel1", subject: "ent1", predicate: "knows", object: "ent2" }],
      });

      strictEqual(result.citations.length, 3);  // 2 entities + 1 relation
    })
  );
});
```

### Checkpoints

- [ ] OpenAI integration patterns documented
- [ ] Prompt templates generate citation-formatted prompts
- [ ] GroundedAnswerGenerator service created
- [ ] Citation parsing extracts entity/relation markers
- [ ] Tests validate parsing and error handling
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

### Phase 2 Handoff Requirements

**Before proceeding to Phase 3, you MUST create**:
1. `handoffs/HANDOFF_P3.md` - Full context document
2. `handoffs/P3_ORCHESTRATOR_PROMPT.md` - Copy-paste prompt

**Update**:
- `REFLECTION_LOG.md` with Phase 2 learnings

---

## Phase 3: Citation Validation

**Duration**: 5 days
**Status**: Pending
**Agents**: `codebase-researcher`, `effect-code-writer`, `test-writer`

### Objectives

1. Validate citations against graph via SPARQL queries
2. Generate reasoning traces for inferred relationships
3. Compute confidence scores based on validation
4. Integrate all components in end-to-end flow

### Tasks

#### Task 3.1: Research SPARQL Client Usage

**Agent**: `codebase-researcher`
**Complexity**: Small
**Estimated Time**: 1 hour

**Research Questions**:
1. How is SPARQL client defined in Phase 1.1?
2. What query methods are available?
3. What error types does it return?
4. Are there existing usage examples?

**Examine Files**:
- Output from `specs/knowledge-sparql-integration/`
- `packages/knowledge/server/src/` SPARQL-related services

**Output**: Document SPARQL client API for Task 3.2

#### Task 3.2: Create CitationValidator Service

**Agent**: `effect-code-writer`
**Complexity**: Large
**Estimated Time**: 8 hours

**Deliverable**: `packages/knowledge/server/src/GraphRAG/CitationValidator.ts`

**Service Definition**:

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { SparqlClient } from "@beep/knowledge-server";  // From Phase 1.1
import { Citation } from "./AnswerSchemas.js";

export class CitationValidator extends Effect.Service<CitationValidator>()(
  "@beep/knowledge-server/GraphRAG/CitationValidator",
  {
    dependencies: [SparqlClient.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const sparql = yield* SparqlClient;

      return {
        validate: (citation: Citation) =>
          Effect.gen(function* () {
            // Validate entities exist
            const entityConfidences = yield* Effect.all(
              A.map(citation.entityIds, (id) => validateEntity(sparql, id)),
              { concurrency: "unbounded" }
            );

            // Validate relation exists (if present)
            const relationConfidence = citation.relationId
              ? yield* validateRelation(sparql, citation.relationId)
              : 1.0;

            // Citation confidence = min of all component confidences
            const minConfidence = Math.min(
              ...entityConfidences,
              relationConfidence
            );

            return {
              ...citation,
              confidence: minConfidence,
            };
          }),

        validateAll: (citations: Citation[]) =>
          Effect.gen(function* () {
            return yield* Effect.all(
              A.map(citations, (c) => validateCitation(c)),
              { concurrency: "unbounded" }
            );
          }),
      };
    }),
  }
) {}

const validateEntity = (
  sparql: SparqlClient,
  entityId: string
): Effect.Effect<number> =>
  Effect.gen(function* () {
    const result = yield* sparql.query(`
      ASK { ?entity rdf:type ?type }
      WHERE {
        FILTER (?entity = <${entityId}>)
      }
    `);

    // result is boolean (ASK query)
    return result ? 1.0 : 0.0;
  });

const validateRelation = (
  sparql: SparqlClient,
  relationId: string
): Effect.Effect<number> =>
  Effect.gen(function* () {
    const result = yield* sparql.query(`
      ASK { ?subject ?predicate ?object }
      WHERE {
        FILTER (?relation = <${relationId}>)
      }
    `);

    return result ? 1.0 : 0.0;
  });
```

**Critical Patterns**:
- Use `Effect.all` with `concurrency: "unbounded"` for parallel validation
- Return confidence 1.0 (exact match) or 0.0 (not found)
- Future: fuzzy matching for 0.5-0.9 scores

#### Task 3.3: Research Reasoning Engine Usage

**Agent**: `codebase-researcher`
**Complexity**: Small
**Estimated Time**: 1 hour

**Research Questions**:
1. How is Reasoning Engine defined in Phase 1.2?
2. What inference path methods are available?
3. How are inference steps represented?
4. What is the max inference depth?

**Examine Files**:
- Output from `specs/knowledge-reasoning-engine/`
- `packages/knowledge/server/src/` Reasoner-related services

**Output**: Document Reasoner API for Task 3.4

#### Task 3.4: Create ReasoningTraceFormatter Service

**Agent**: `effect-code-writer`
**Complexity**: Medium
**Estimated Time**: 6 hours

**Deliverable**: `packages/knowledge/server/src/GraphRAG/ReasoningTraceFormatter.ts`

**Service Definition**:

```typescript
import * as Effect from "effect/Effect";
import { ReasoningEngine } from "@beep/knowledge-server";  // From Phase 1.2
import { ReasoningTrace, InferenceStep } from "./AnswerSchemas.js";

export class ReasoningTraceFormatter extends Effect.Service<ReasoningTraceFormatter>()(
  "@beep/knowledge-server/GraphRAG/ReasoningTraceFormatter",
  {
    dependencies: [ReasoningEngine.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const reasoner = yield* ReasoningEngine;

      return {
        format: (relationId: string) =>
          Effect.gen(function* () {
            // Get inference path from Reasoner
            const path = yield* reasoner.getInferencePath(relationId);

            if (!path || path.steps.length === 0) {
              return undefined;  // Direct relation, no inference
            }

            const inferenceSteps = path.steps.map(
              (step) =>
                new InferenceStep({
                  rule: step.rule,
                  premises: step.premises,
                })
            );

            return new ReasoningTrace({
              inferenceSteps,
              depth: inferenceSteps.length,
            });
          }),
      };
    }),
  }
) {}
```

#### Task 3.5: Create ConfidenceScorer Service

**Agent**: `effect-code-writer`
**Complexity**: Small
**Estimated Time**: 3 hours

**Deliverable**: `packages/knowledge/server/src/GraphRAG/ConfidenceScorer.ts`

**Service Definition**:

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import { GroundedAnswer, Citation, ReasoningTrace } from "./AnswerSchemas.js";

export class ConfidenceScorer extends Effect.Service<ConfidenceScorer>()(
  "@beep/knowledge-server/GraphRAG/ConfidenceScorer",
  {
    effect: Effect.gen(function* () {
      return {
        computeAnswerConfidence: (answer: GroundedAnswer) =>
          Effect.gen(function* () {
            if (A.isEmptyReadonlyArray(answer.citations)) {
              return 0.0;  // No citations = ungrounded
            }

            // Weighted average of citation confidences
            const citationConfidences = A.map(
              answer.citations,
              (c) => c.confidence
            );

            const avg = A.reduce(
              citationConfidences,
              0,
              (acc, conf) => acc + conf
            ) / citationConfidences.length;

            // Apply penalty for inference depth
            const inferenceDepthPenalty = answer.reasoning
              ? 0.1 * answer.reasoning.depth
              : 0;

            return Math.max(0, avg - inferenceDepthPenalty);
          }),
      };
    }),
  }
) {}
```

**Confidence Formula**:
```
Answer Confidence = avg(citation_confidences) - (0.1 * inference_depth)
```

#### Task 3.6: Integrate All Services in Validation Pipeline

**Agent**: `effect-code-writer`
**Complexity**: Medium
**Estimated Time**: 4 hours

**Deliverable**: Update `GroundedAnswerGenerator` to include validation flow

**Integration Pattern**:

```typescript
// In GroundedAnswerGenerator.ts
import { CitationValidator } from "./CitationValidator.js";
import { ReasoningTraceFormatter } from "./ReasoningTraceFormatter.js";
import { ConfidenceScorer } from "./ConfidenceScorer.js";

export class GroundedAnswerGenerator extends Effect.Service<GroundedAnswerGenerator>()(
  "@beep/knowledge-server/GraphRAG/GroundedAnswerGenerator",
  {
    dependencies: [
      OpenAIClient.Default,
      CitationValidator.Default,
      ReasoningTraceFormatter.Default,
      ConfidenceScorer.Default,
    ],
    accessors: true,
    effect: Effect.gen(function* () {
      const openai = yield* OpenAIClient;
      const validator = yield* CitationValidator;
      const formatter = yield* ReasoningTraceFormatter;
      const scorer = yield* ConfidenceScorer;

      return {
        generateValidated: (query: string, context: GraphContext) =>
          Effect.gen(function* () {
            // Step 1: Generate raw answer with citations
            const rawAnswer = yield* generateRawAnswer(openai, query, context);

            // Step 2: Validate citations against graph
            const validatedCitations = yield* validator.validateAll(rawAnswer.citations);

            // Step 3: Generate reasoning traces for inferred relations
            const citationsWithReasoning = yield* Effect.all(
              A.map(validatedCitations, (citation) =>
                Effect.gen(function* () {
                  if (!citation.relationId) return citation;

                  const reasoning = yield* formatter.format(citation.relationId);
                  return reasoning ? { ...citation, reasoning } : citation;
                })
              ),
              { concurrency: "unbounded" }
            );

            // Step 4: Compute final answer confidence
            const answerWithCitations = {
              ...rawAnswer,
              citations: citationsWithReasoning,
            };
            const finalConfidence = yield* scorer.computeAnswerConfidence(answerWithCitations);

            return new GroundedAnswer({
              text: rawAnswer.text,
              citations: citationsWithReasoning,
              confidence: finalConfidence,
              reasoning: rawAnswer.reasoning,
            });
          }),
      };
    }),
  }
) {}
```

#### Task 3.7: Add End-to-End Tests

**Agent**: `test-writer`
**Complexity**: Large
**Estimated Time**: 8 hours

**Deliverable**: `packages/knowledge/server/test/GraphRAG/ValidationPipeline.test.ts`

**Test Coverage**:
- Full pipeline: Query → Generation → Validation → Confidence
- Citation with existing entity/relation → confidence 1.0
- Citation with non-existent entity → confidence 0.0
- Citation with inferred relation → reasoning trace present, confidence adjusted
- Empty citations → low confidence

```typescript
import { layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { GroundedAnswerGenerator } from "../../src/GraphRAG/GroundedAnswerGenerator.js";
import { CitationValidator } from "../../src/GraphRAG/CitationValidator.js";
import { ReasoningTraceFormatter } from "../../src/GraphRAG/ReasoningTraceFormatter.js";
import { ConfidenceScorer } from "../../src/GraphRAG/ConfidenceScorer.js";

// Mock layers for SPARQL, Reasoner, OpenAI
const TestLayer = Layer.mergeAll(
  MockSparqlLayer,
  MockReasonerLayer,
  MockOpenAILayer,
  GroundedAnswerGenerator.Default,
  CitationValidator.Default,
  ReasoningTraceFormatter.Default,
  ConfidenceScorer.Default
);

layer(TestLayer)("Validation Pipeline", (it) => {
  it.effect("validates grounded answer with high confidence", () =>
    Effect.gen(function* () {
      const gen = yield* GroundedAnswerGenerator;
      const result = yield* gen.generateValidated("test query", mockContext);

      // All citations validated → high confidence
      strictEqual(result.confidence > 0.8, true);
    })
  );

  it.effect("flags ungrounded claims with low confidence", () =>
    Effect.gen(function* () {
      const gen = yield* GroundedAnswerGenerator;
      const result = yield* gen.generateValidated("test query", emptyContext);

      // No valid citations → low confidence
      strictEqual(result.confidence < 0.5, true);
    })
  );

  it.effect("includes reasoning trace for inferred relations", () =>
    Effect.gen(function* () {
      const gen = yield* GroundedAnswerGenerator;
      const result = yield* gen.generateValidated("test query", inferredContext);

      // Inferred relation → reasoning trace present
      const citationWithReasoning = result.citations.find((c) => c.reasoning);
      strictEqual(citationWithReasoning !== undefined, true);
    })
  );
});
```

### Checkpoints

- [ ] CitationValidator service created and validates against SPARQL
- [ ] ReasoningTraceFormatter service created and formats inference paths
- [ ] ConfidenceScorer service created and computes final confidence
- [ ] All services integrated in validation pipeline
- [ ] End-to-end tests validate full flow
- [ ] Ungrounded claims flagged with confidence < 0.5
- [ ] Inferred relationships include reasoning traces
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

### Phase 3 Completion

**Update**:
- `REFLECTION_LOG.md` with Phase 3 learnings
- README.md status to COMPLETE
- Document final validation results

---

## Agent Delegation Matrix

| Phase | Task | Agent | Capability | Expected Output |
|-------|------|-------|------------|-----------------|
| P1 | Schema definition | `effect-code-writer` | write-files | AnswerSchemas.ts |
| P1 | Schema tests | `test-writer` | write-files | AnswerSchemas.test.ts |
| P2 | OpenAI research | `codebase-researcher` | read-only | Pattern documentation |
| P2 | Prompt templates | `effect-code-writer` | write-files | PromptTemplates.ts |
| P2 | Answer generator | `effect-code-writer` | write-files | GroundedAnswerGenerator.ts |
| P2 | Generator tests | `test-writer` | write-files | GroundedAnswerGenerator.test.ts |
| P3 | SPARQL research | `codebase-researcher` | read-only | API documentation |
| P3 | Citation validator | `effect-code-writer` | write-files | CitationValidator.ts |
| P3 | Reasoner research | `codebase-researcher` | read-only | API documentation |
| P3 | Reasoning formatter | `effect-code-writer` | write-files | ReasoningTraceFormatter.ts |
| P3 | Confidence scorer | `effect-code-writer` | write-files | ConfidenceScorer.ts |
| P3 | Integration | `effect-code-writer` | write-files | Updated GroundedAnswerGenerator.ts |
| P3 | E2E tests | `test-writer` | write-files | ValidationPipeline.test.ts |

---

## Risk Mitigation

| Risk | Impact | Mitigation | Status |
|------|--------|------------|--------|
| Citation parsing ambiguity | M | Strict citation format in prompts, graceful fallback | Documented in Task 2.2 |
| SPARQL query latency | M | Batch validation queries with `concurrency: "unbounded"`, add timeouts | Implemented in Task 3.2 |
| Inference depth explosion | L | Max depth limit (default: 5 hops) enforced by Reasoner (Phase 1.2) | Deferred to Phase 1.2 |
| Confidence calibration | M | A/B test scoring weights with real queries in production | Post-launch task |
| OpenAI API failures | M | Retry logic in `@beep/shared-openai`, fallback to low-confidence answer | Assumed handled by shared package |

---

## Verification Gates

Each phase has strict verification gates before proceeding:

### Phase 1 → Phase 2 Gate

- [ ] All 4 schema classes compile without errors
- [ ] Confidence validation enforces 0.0-1.0 range
- [ ] Tests pass for valid and invalid schemas
- [ ] `bun run check --filter @beep/knowledge-server` exits 0
- [ ] HANDOFF_P2.md and P2_ORCHESTRATOR_PROMPT.md created

### Phase 2 → Phase 3 Gate

- [ ] GroundedAnswerGenerator service compiles
- [ ] Prompt templates generate valid citation-formatted prompts
- [ ] Citation parsing extracts entity/relation markers
- [ ] Tests pass for parsing and error handling
- [ ] `bun run check --filter @beep/knowledge-server` exits 0
- [ ] HANDOFF_P3.md and P3_ORCHESTRATOR_PROMPT.md created

### Phase 3 → Completion Gate

- [ ] All validation services (Validator, Formatter, Scorer) compile
- [ ] Services integrate in validation pipeline
- [ ] End-to-end tests validate full flow
- [ ] Ungrounded claims flagged correctly
- [ ] Reasoning traces present for inferred relations
- [ ] `bun run check --filter @beep/knowledge-server` exits 0
- [ ] `bun run test --filter @beep/knowledge-server` exits 0
- [ ] REFLECTION_LOG.md updated with final learnings

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| P1 | 1 day | Schemas + validation tests |
| P2 | 2 days | Answer generator + prompt templates |
| P3 | 5 days | Citation validator + reasoning formatter + confidence scorer |
| **Total** | **10 days** | **Grounded answer generation with full validation** |

**Buffer**: 2-3 weeks (includes testing, iteration, dependency wait time)

---

## Success Criteria

Spec is complete when:

- [ ] All phases pass verification gates
- [ ] Generated answers include entity/relation citations
- [ ] Citations link to actual graph nodes (EntityId/RelationId)
- [ ] Ungrounded claims flagged with confidence < 0.5
- [ ] Inference traces show reasoning path when applicable
- [ ] Citation validation queries complete within 500ms per citation
- [ ] End-to-end test: Query → Answer → Validated citations passes
- [ ] REFLECTION_LOG.md documents all key learnings
- [ ] README.md status updated to COMPLETE

---

## Related Documentation

- [README.md](README.md) - Spec overview
- [QUICK_START.md](QUICK_START.md) - 5-minute onboarding
- [AGENT_PROMPTS.md](AGENT_PROMPTS.md) - Copy-paste agent prompts
- [REFLECTION_LOG.md](REFLECTION_LOG.md) - Learnings and patterns
- [specs/_guide/README.md](../_guide/README.md) - Spec creation guide
