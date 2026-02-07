# Quick Start: Knowledge GraphRAG Plus

> 5-minute triage guide for new Claude instances.

---

## Directory Context

You are working in the **beep-effect** repository. This spec enhances the knowledge graph with grounded answer generation and citation validation:

```
beep-effect/
├── packages/knowledge/          # Your work goes here
│   ├── domain/                  # EntityId, RelationId types
│   ├── server/                  # GraphRAG services (new)
│   └── ...
├── specs/knowledge-graphrag-plus/  # This spec
└── specs/knowledge-sparql-integration/  # PREREQUISITE (Phase 1.1)
    └── specs/knowledge-reasoning-engine/  # PREREQUISITE (Phase 1.2)
```

---

## What is This Spec?

This spec adds **grounded answer generation** to GraphRAG, enabling:
- LLM responses with entity/relation citations
- Citation validation against the actual knowledge graph
- Reasoning traces for inferred relationships
- Confidence scoring to flag ungrounded claims

**Key Value**: Prevents LLM hallucination by requiring verifiable citations.

---

## Current Status

**CRITICAL DEPENDENCY**: This spec is SEQUENTIAL, not parallel. MUST wait for:
- `specs/knowledge-sparql-integration/` (Phase 1.1) - Citation validation needs SPARQL queries
- `specs/knowledge-reasoning-engine/` (Phase 1.2) - Reasoning traces need inference engine

| Phase  | Description                              | Status      |
|--------|------------------------------------------|-------------|
| **P1** | Schema Foundation: GroundedAnswer schema | **Pending** |
| P2     | Answer Generation: OpenAI prompts        | Pending     |
| P3     | Citation Validation: SPARQL verification | Pending     |

---

## Quick Decision Tree

### "Can I start this spec now?"

```
START
  │
  ├─ Does specs/knowledge-sparql-integration/ show Status: COMPLETE?
  │   ├─ NO → WAIT - citation validation requires SPARQL
  │   └─ YES → Does specs/knowledge-reasoning-engine/ show Status: COMPLETE?
  │       ├─ NO → WAIT - reasoning traces require inference engine
  │       └─ YES → Proceed to Phase 1
```

### "Which phase should I work on?"

```
START
  │
  ├─ Does @beep/knowledge-server have GraphRAG/AnswerSchemas.ts?
  │   ├─ NO → Start Phase 1 (Schema Foundation)
  │   └─ YES → Does GraphRAG/GroundedAnswerGenerator.ts exist?
  │       ├─ NO → Start Phase 2 (Answer Generation)
  │       └─ YES → Does GraphRAG/CitationValidator.ts exist?
  │           ├─ NO → Start Phase 3 (Citation Validation)
  │           └─ YES → Spec complete
```

### "What files do I read first?"

1. **Current phase prompt**: `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`
2. **Full context**: `handoffs/HANDOFF_P[N].md`
3. **Phase workflow**: `MASTER_ORCHESTRATION.md` (find Phase N section)
4. **Agent prompts**: `AGENT_PROMPTS.md` (copy-paste prompts for sub-agents)

---

## Key Patterns to Follow

### Grounded Answer Schema (Phase 1)

```typescript
import * as S from "effect/Schema";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds } from "@beep/knowledge-domain";

export class Citation extends S.Class<Citation>("Citation")({
  claimText: BS.NonEmptyString,
  entityIds: S.Array(KnowledgeEntityIds.EntityId),
  relationId: S.optional(KnowledgeEntityIds.RelationId),
  confidence: S.Number.pipe(S.between(0, 1)),
}) {}

export class GroundedAnswer extends S.Class<GroundedAnswer>("GroundedAnswer")({
  text: BS.NonEmptyString,
  citations: S.Array(Citation),
  confidence: S.Number.pipe(S.between(0, 1)),
  reasoning: S.optional(ReasoningTrace),
}) {}
```

### Answer Generation Service (Phase 2)

```typescript
import * as Effect from "effect/Effect";
import { OpenAIClient } from "@beep/shared-openai";

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
            const prompt = formatPromptWithCitationRequirements(query, context);
            const response = yield* openai.chat.completions.create({
              model: "gpt-4",
              messages: [{ role: "user", content: prompt }],
            });
            return parseCitationsFromResponse(response.choices[0].message.content);
          }),
      };
    }),
  }
) {}
```

### Citation Validation (Phase 3)

```typescript
import * as Effect from "effect/Effect";
import { SparqlClient } from "@beep/knowledge-server";

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
            // Verify entities exist via SPARQL
            const entityExists = yield* sparql.query(`
              ASK { ?entity rdf:type ?type }
            `);

            // Verify relation exists via SPARQL
            const relationExists = yield* sparql.query(`
              ASK { ?subject ?predicate ?object }
            `);

            return computeConfidence(entityExists, relationExists);
          }),
      };
    }),
  }
) {}
```

---

## Critical Rules

1. **Namespace imports**: Always use `import * as Effect from "effect/Effect"`
2. **No async/await**: Use `Effect.gen` with `yield*`
3. **Branded IDs**: Use `KnowledgeEntityIds.EntityId`, NOT plain `S.String`
4. **Confidence range**: Always validate 0.0-1.0 with `S.Number.pipe(S.between(0, 1))`
5. **Sequential dependency**: NEVER start before Phase 1.1 + 1.2 complete

---

## Verification Commands

```bash
# Type check knowledge packages
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint:fix --filter @beep/knowledge-server
```

---

## Getting Started

### For Phase 1 (Schema Foundation)

1. Read `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Create `packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts`
3. Define `GroundedAnswer`, `Citation`, `ReasoningTrace`, `InferenceStep` schemas
4. Add confidence validation (0.0-1.0 range)
5. Use `KnowledgeEntityIds` for entity/relation IDs
6. Run verification commands
7. Update `REFLECTION_LOG.md`
8. Create `handoffs/HANDOFF_P2.md` and `P2_ORCHESTRATOR_PROMPT.md`

### For Phase 2 (Answer Generation)

1. Read `handoffs/P2_ORCHESTRATOR_PROMPT.md`
2. Create `GroundedAnswerGenerator` service
3. Design prompt templates with citation markers
4. Integrate with `@beep/shared-openai`
5. Parse citation markers from LLM response
6. Run verification commands
7. Update `REFLECTION_LOG.md`
8. Create `handoffs/HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md`

### For Phase 3 (Citation Validation)

1. Read `handoffs/P3_ORCHESTRATOR_PROMPT.md`
2. Create `CitationValidator` service (depends on SPARQL client)
3. Create `ReasoningTraceFormatter` (depends on Reasoner)
4. Create `ConfidenceScorer` service
5. Integrate all services in end-to-end flow
6. Run verification commands
7. Update `REFLECTION_LOG.md`

---

## Common Pitfalls

| Pitfall                         | Solution                                                        |
|---------------------------------|-----------------------------------------------------------------|
| Starting before Phase 1.1/1.2   | WAIT - citation validation requires SPARQL + Reasoner           |
| Using plain `S.String` for IDs  | Use `KnowledgeEntityIds.EntityId` branded types                 |
| Assuming OpenAI response shape  | Verify from OpenAI SDK types, parse citations from content     |
| Forgetting confidence range     | Always use `S.Number.pipe(S.between(0, 1))`                     |
| Skipping handoff files          | Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` |

---

## Tech Stack Summary

| Component | Technology | Package |
|-----------|------------|---------|
| Schema definitions | Effect Schema | `effect/Schema` |
| Service definitions | Effect Service | `effect/Effect` |
| LLM integration | OpenAI API | `@beep/shared-openai` |
| Citation validation | SPARQL queries | `@beep/knowledge-server` (Phase 1.1) |
| Reasoning traces | Inference engine | `@beep/knowledge-server` (Phase 1.2) |

---

## Success Metrics

Phase completion criteria:

**Phase 1**: Schemas validate structure, enforce confidence range, reference branded EntityIds
**Phase 2**: Service generates answers with citation markers, integrates with OpenAI
**Phase 3**: Citations validate against graph, reasoning traces show inference paths, confidence scores flag ungrounded claims

---

## Next Steps

1. Verify Phase 1.1 (SPARQL) and Phase 1.2 (Reasoner) are complete
2. Open `handoffs/P1_ORCHESTRATOR_PROMPT.md`
3. Copy the prompt into your session
4. Begin Phase 1 implementation
