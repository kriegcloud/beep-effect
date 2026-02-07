# Agent Prompts: Knowledge GraphRAG Plus

> Ready-to-use prompts for specialized agents in GraphRAG enhancement.

---

## Phase 1 Agents

### test-writer: Schema Validation Tests

```
Create validation tests for grounded answer schemas.

Target: packages/knowledge/server/test/GraphRAG/AnswerSchemas.test.ts

Test coverage required:
1. Citation schema validates with entity IDs
2. Citation rejects confidence out of range (< 0.0 or > 1.0)
3. Citation accepts optional relationId
4. GroundedAnswer validates with citations array
5. GroundedAnswer accepts optional reasoning trace
6. ReasoningTrace validates depth matches inferenceSteps length
7. InferenceStep validates with rule and premises

Critical patterns:
- Use `@beep/testkit` helpers: `effect`, `strictEqual`
- Use `S.decodeUnknownEither` to test validation failures
- Test edge cases: empty arrays, boundary confidence values (0.0, 1.0)

Schema location: packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts

Expected schemas:
- InferenceStep (rule: string, premises: string[])
- ReasoningTrace (inferenceSteps: InferenceStep[], depth: number)
- Citation (claimText: string, entityIds: EntityId[], relationId?: RelationId, confidence: number)
- GroundedAnswer (text: string, citations: Citation[], confidence: number, reasoning?: ReasoningTrace)

Verification:
bun run test --filter @beep/knowledge-server
```

---

## Phase 2 Agents

### codebase-researcher: OpenAI Integration Patterns

```
Analyze OpenAI integration patterns in the beep-effect codebase.

Research questions:
1. How is @beep/shared-openai structured?
2. What is the OpenAI client service pattern (Effect.Service)?
3. How are chat.completions.create() calls structured?
4. What response schema does OpenAI return? (Verify from types, not assumptions)
5. Are there existing prompt template patterns in the codebase?
6. How are LLM errors handled (Effect.fail patterns)?

Examine files:
- packages/shared/openai/src/
- Any existing usage of OpenAI client in packages/
- Search for "chat.completions.create" usage patterns

Output format:
Provide a concise summary (10-15 lines) with:
- OpenAI client service signature
- Response structure (verified from types)
- Error handling patterns
- Prompt template patterns (if any exist)
- Example usage code snippet

This will inform Task 2.2 (Prompt Templates) and Task 2.3 (GroundedAnswerGenerator).
```

### effect-code-writer: Prompt Templates

```
Create prompt templates for citation-formatted answer generation.

Target: packages/knowledge/server/src/GraphRAG/PromptTemplates.ts

Requirements:
1. Define GraphContext interface with entities and relations
2. Create formatCitationPrompt function that generates prompts with citation requirements
3. Use F.pipe for string composition (NOT native .join())
4. Include clear citation marker format: {{entity:id}} and {{relation:id}}
5. Instruct LLM to explain reasoning if inference required

Critical patterns:
- Use `import * as F from "effect/Function"`
- Use F.pipe for functional composition
- NO native string methods (.split(), .join())

Prompt structure:
You are a knowledge graph assistant. Answer using ONLY provided context.

Context:
[Formatted entities list]
[Formatted relations list]

Requirements:
1. Answer using ONLY provided entities and relations
2. Cite entities with format: {{entity:entity_id}}
3. Cite relations with format: {{relation:relation_id}}
4. If answer requires inference, explain your reasoning
5. If context insufficient, state explicitly

Question: [user query]

Answer:

Example interface:
export interface GraphContext {
  entities: Array<{ id: string; mention: string; types: string[] }>;
  relations: Array<{ id: string; subject: string; predicate: string; object: string }>;
}

export const formatCitationPrompt: (query: string, context: GraphContext) => string

Verification:
bun run check --filter @beep/knowledge-server
```

### effect-code-writer: GroundedAnswerGenerator Service

```
Create GroundedAnswerGenerator service with OpenAI integration.

Target: packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts

Requirements:
1. Define Effect.Service with OpenAIClient dependency
2. Implement generate method: (query, context) => Effect<GroundedAnswer>
3. Call OpenAI chat.completions.create with citation prompt
4. Parse citation markers from response ({{entity:id}}, {{relation:id}})
5. Handle empty/invalid responses with tagged error
6. Return GroundedAnswer with initial confidence (refined in Phase 3)

Critical patterns:
- Use `Effect.Service` with `dependencies`, `accessors: true`, `effect: Effect.gen`
- Import OpenAIClient from @beep/shared-openai
- Use `yield*` for async operations (NO async/await)
- Define AnswerGenerationError as S.TaggedError
- Use Effect.fail for error conditions

Service signature:
export class GroundedAnswerGenerator extends Effect.Service<GroundedAnswerGenerator>()(
  "@beep/knowledge-server/GraphRAG/GroundedAnswerGenerator",
  {
    dependencies: [OpenAIClient.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const openai = yield* OpenAIClient;
      return {
        generate: (query: string, context: GraphContext) => Effect.gen(...)
      };
    }),
  }
) {}

Parse citation markers:
- Extract {{entity:id}} and {{relation:id}} from response text
- Validate IDs exist in provided context
- Create Citation objects with preliminary confidence 1.0 (Phase 3 refines)
- Remove markers from text for clean display

Handle errors:
- Empty response → AnswerGenerationError
- Invalid citation IDs → log warning, continue with reduced confidence
- OpenAI API failure → propagate Effect error

Verification:
bun run check --filter @beep/knowledge-server
```

### test-writer: GroundedAnswerGenerator Tests

```
Create integration tests for GroundedAnswerGenerator service.

Target: packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts

Test coverage:
1. Parses citation markers from LLM response
2. Handles empty response with error
3. Handles invalid citation IDs gracefully
4. Computes initial confidence based on citation count
5. Removes citation markers from display text

Critical patterns:
- Use `@beep/testkit` layer helper: `layer(TestLayer)("suite", (it) => ...)`
- Mock OpenAIClient with Layer.succeed
- Use Effect.gen for test bodies (NO async/await)
- Use strictEqual for assertions

Mock OpenAI response:
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

Test scenarios:
- Valid citation markers → citations array length matches markers
- Invalid entity ID in marker → warning logged, citation excluded
- Empty response → AnswerGenerationError thrown
- No citations in response → low initial confidence (< 0.5)

Verification:
bun run test --filter @beep/knowledge-server
```

---

## Phase 3 Agents

### codebase-researcher: SPARQL Client API

```
Analyze SPARQL client API from Phase 1.1 integration.

Research questions:
1. How is SPARQL client service defined? (Effect.Service pattern)
2. What query methods are available? (ASK, SELECT, CONSTRUCT?)
3. What is the ASK query response type? (boolean or object?)
4. How are SPARQL errors handled? (Effect.fail patterns)
5. Are there timeout or retry configurations?
6. Are there existing usage examples in the codebase?

Examine files:
- Output from specs/knowledge-sparql-integration/
- packages/knowledge/server/src/ SPARQL-related services
- Search for "SPARQL" or "sparql" in knowledge packages

Output format:
Provide a concise API summary (10-15 lines) with:
- SPARQL client service signature
- query() method signature and return type
- ASK query response structure (verified from types)
- Error types
- Example usage code snippet

This will inform Task 3.2 (CitationValidator) implementation.
```

### codebase-researcher: Reasoning Engine API

```
Analyze Reasoning Engine API from Phase 1.2 integration.

Research questions:
1. How is Reasoning Engine service defined? (Effect.Service pattern)
2. What inference path methods are available?
3. How are inference steps represented? (structure)
4. What is the max inference depth limit?
5. Are there confidence adjustments for inference depth?
6. Are there existing usage examples?

Examine files:
- Output from specs/knowledge-reasoning-engine/
- packages/knowledge/server/src/ Reasoner-related services
- Search for "Reasoner" or "inference" in knowledge packages

Output format:
Provide a concise API summary (10-15 lines) with:
- Reasoning Engine service signature
- getInferencePath() method signature and return type
- InferencePath structure (verified from types)
- Max depth configuration
- Example usage code snippet

This will inform Task 3.4 (ReasoningTraceFormatter) implementation.
```

### effect-code-writer: CitationValidator Service

```
Create CitationValidator service for SPARQL-based citation validation.

Target: packages/knowledge/server/src/GraphRAG/CitationValidator.ts

Requirements:
1. Define Effect.Service with SparqlClient dependency
2. Implement validate method: (citation) => Effect<Citation>
3. Validate entities exist via SPARQL ASK queries
4. Validate relation exists via SPARQL ASK queries
5. Compute citation confidence = min(entity_conf, relation_conf)
6. Use Effect.all with concurrency: "unbounded" for parallel validation

Critical patterns:
- Use `Effect.Service` with `dependencies`, `accessors: true`
- Import SparqlClient from Phase 1.1 (check exact import path)
- Use `yield*` for async operations
- Use Effect.all for parallel queries (entities can be validated concurrently)
- Return confidence 1.0 (exists) or 0.0 (not found)

Service signature:
export class CitationValidator extends Effect.Service<CitationValidator>()(
  "@beep/knowledge-server/GraphRAG/CitationValidator",
  {
    dependencies: [SparqlClient.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const sparql = yield* SparqlClient;
      return {
        validate: (citation: Citation) => Effect.gen(...),
        validateAll: (citations: Citation[]) => Effect.gen(...)
      };
    }),
  }
) {}

Entity validation:
const validateEntity = (sparql: SparqlClient, entityId: string): Effect.Effect<number> =>
  Effect.gen(function* () {
    const result = yield* sparql.query(`ASK { ?entity rdf:type ?type } WHERE { FILTER (?entity = <${entityId}>) }`);
    return result ? 1.0 : 0.0;
  });

Relation validation: similar ASK query pattern

Confidence computation:
citation.confidence = Math.min(...entityConfidences, relationConfidence)

Future enhancements (NOT in this phase):
- Fuzzy entity matching for 0.5-0.9 scores
- Caching validated citations

Verification:
bun run check --filter @beep/knowledge-server
```

### effect-code-writer: ReasoningTraceFormatter Service

```
Create ReasoningTraceFormatter service for inference path formatting.

Target: packages/knowledge/server/src/GraphRAG/ReasoningTraceFormatter.ts

Requirements:
1. Define Effect.Service with ReasoningEngine dependency
2. Implement format method: (relationId) => Effect<ReasoningTrace | undefined>
3. Get inference path from Reasoner
4. Convert inference steps to ReasoningTrace schema
5. Return undefined for direct relations (no inference)

Critical patterns:
- Use `Effect.Service` with `dependencies`, `accessors: true`
- Import ReasoningEngine from Phase 1.2 (check exact import path)
- Use `yield*` for async operations
- Map inference path steps to InferenceStep schema instances

Service signature:
export class ReasoningTraceFormatter extends Effect.Service<ReasoningTraceFormatter>()(
  "@beep/knowledge-server/GraphRAG/ReasoningTraceFormatter",
  {
    dependencies: [ReasoningEngine.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const reasoner = yield* ReasoningEngine;
      return {
        format: (relationId: string) => Effect.gen(...)
      };
    }),
  }
) {}

Implementation:
1. Call reasoner.getInferencePath(relationId)
2. If no path or path.steps.length === 0, return undefined (direct relation)
3. Map path.steps to InferenceStep instances
4. Create ReasoningTrace with inferenceSteps and depth

Example reasoning trace:
{
  inferenceSteps: [
    { rule: "sameAs transitivity", premises: ["Alice", "Alice_LinkedIn"] },
    { rule: "knows direct", premises: ["Alice_LinkedIn", "Bob_LinkedIn"] },
    { rule: "sameAs transitivity", premises: ["Bob_LinkedIn", "Bob"] }
  ],
  depth: 3
}

Verification:
bun run check --filter @beep/knowledge-server
```

### effect-code-writer: ConfidenceScorer Service

```
Create ConfidenceScorer service for answer confidence computation.

Target: packages/knowledge/server/src/GraphRAG/ConfidenceScorer.ts

Requirements:
1. Define Effect.Service (no external dependencies)
2. Implement computeAnswerConfidence: (answer) => Effect<number>
3. Return 0.0 for empty citations (ungrounded)
4. Compute weighted average of citation confidences
5. Apply penalty for inference depth (0.1 * depth)

Critical patterns:
- Use `Effect.Service` with `effect: Effect.gen`
- Use `A.isEmptyReadonlyArray` to check empty citations
- Use `A.map` and `A.reduce` for citation confidence aggregation
- Use Math.max to prevent negative confidence

Service signature:
export class ConfidenceScorer extends Effect.Service<ConfidenceScorer>()(
  "@beep/knowledge-server/GraphRAG/ConfidenceScorer",
  {
    effect: Effect.gen(function* () {
      return {
        computeAnswerConfidence: (answer: GroundedAnswer) => Effect.gen(...)
      };
    }),
  }
) {}

Confidence formula:
confidence = avg(citation_confidences) - (0.1 * inference_depth)
confidence = Math.max(0, confidence)  // Floor at 0.0

Special cases:
- Empty citations → return 0.0 immediately
- No reasoning trace → inference_depth = 0

Verification:
bun run check --filter @beep/knowledge-server
```

### effect-code-writer: Validation Pipeline Integration

```
Integrate all validation services in GroundedAnswerGenerator.

Target: packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts (update)

Requirements:
1. Add CitationValidator, ReasoningTraceFormatter, ConfidenceScorer to dependencies
2. Create generateValidated method that orchestrates full pipeline
3. Pipeline: Generate → Validate Citations → Add Reasoning → Score Confidence

Critical patterns:
- Add all 3 services to dependencies array
- Use `yield*` to access services
- Use Effect.all with concurrency for parallel citation processing
- Preserve original generate method for Phase 2 compatibility

Updated service signature:
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
        generate: ...,  // Keep Phase 2 method
        generateValidated: (query: string, context: GraphContext) => Effect.gen(...)
      };
    }),
  }
) {}

Pipeline steps:
1. Generate raw answer (call existing generate method)
2. Validate all citations (validator.validateAll)
3. Add reasoning traces to citations with inferred relations (formatter.format)
4. Compute final answer confidence (scorer.computeAnswerConfidence)
5. Return GroundedAnswer with validated citations and final confidence

Use Effect.all for parallel citation enrichment:
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

Verification:
bun run check --filter @beep/knowledge-server
```

### test-writer: End-to-End Validation Pipeline Tests

```
Create end-to-end tests for the full validation pipeline.

Target: packages/knowledge/server/test/GraphRAG/ValidationPipeline.test.ts

Test coverage:
1. Full pipeline: Query → Generation → Validation → Confidence
2. Citation with existing entity/relation → confidence 1.0
3. Citation with non-existent entity → confidence 0.0
4. Citation with inferred relation → reasoning trace present, confidence adjusted
5. Empty citations → low confidence (< 0.5)
6. Mixed citations (some valid, some invalid) → intermediate confidence

Critical patterns:
- Use `layer(TestLayer)` with all mock services
- Mock SparqlClient, ReasoningEngine, OpenAIClient
- Use Effect.gen for test bodies
- Use strictEqual for assertions

Mock layers needed:
1. MockOpenAILayer - Returns response with citation markers
2. MockSparqlLayer - Returns ASK query results (true/false)
3. MockReasonerLayer - Returns inference paths
4. Service layers - GroundedAnswerGenerator, CitationValidator, ReasoningTraceFormatter, ConfidenceScorer

Test layer composition:
const TestLayer = Layer.mergeAll(
  MockSparqlLayer,
  MockReasonerLayer,
  MockOpenAILayer,
  GroundedAnswerGenerator.Default,
  CitationValidator.Default,
  ReasoningTraceFormatter.Default,
  ConfidenceScorer.Default
);

Test scenarios:
1. All citations valid → high confidence (> 0.8)
2. Some citations invalid → medium confidence (0.4-0.7)
3. No valid citations → low confidence (< 0.3)
4. Inferred relation → reasoning trace includes inference steps
5. Direct relation → no reasoning trace (undefined)

Verification:
bun run test --filter @beep/knowledge-server
bun run check --filter @beep/knowledge-server
```

---

## Cross-Phase Agents

### codebase-researcher: GraphRAG Service Patterns

```
Analyze existing service patterns in knowledge packages.

Research questions:
1. How are Effect.Service definitions structured in @beep/knowledge-server?
2. What layer composition patterns exist?
3. How are service dependencies declared?
4. What error handling patterns are standard?
5. Are there logging/telemetry patterns?

Examine files:
- packages/knowledge/server/src/services/
- packages/knowledge/server/src/db/Db/Db.ts
- Other Effect.Service definitions in knowledge packages

Output format:
Service definition checklist with:
- Service naming convention
- Dependency declaration pattern
- Error type definition pattern
- Logging pattern (if any)
- Example service code

This informs all service creation tasks in Phases 2-3.
```

### architecture-pattern-enforcer: GraphRAG Structure Validation

```
Validate the GraphRAG implementation structure.

Check against:
1. Layer dependency order (domain -> tables -> server)
2. Cross-package import restrictions
3. Path alias usage (@beep/knowledge-*)
4. Module organization patterns
5. Export index conventions

Input files:
- packages/knowledge/server/src/GraphRAG/AnswerSchemas.ts
- packages/knowledge/server/src/GraphRAG/GroundedAnswerGenerator.ts
- packages/knowledge/server/src/GraphRAG/CitationValidator.ts
- packages/knowledge/server/src/GraphRAG/ReasoningTraceFormatter.ts
- packages/knowledge/server/src/GraphRAG/ConfidenceScorer.ts
- packages/knowledge/server/src/GraphRAG/PromptTemplates.ts

Output: outputs/architecture-review.md with:
- Violations found (if any)
- Compliance with Effect patterns
- Recommendations for improvement
```

---

## Reflection Prompts

### reflector: Pattern Extraction

```
Analyze REFLECTION_LOG.md and extract reusable patterns from GraphRAG implementation.

Focus areas:
1. Citation validation patterns (SPARQL-based verification)
2. LLM response parsing patterns (citation marker extraction)
3. Confidence scoring patterns (aggregation, depth penalties)
4. Service composition patterns (multi-dependency orchestration)
5. Error handling patterns (graceful degradation for invalid citations)

Extract patterns that score 75+ on quality rubric for promotion to:
- specs/_guide/PATTERN_REGISTRY.md
- .claude/skills/ (if 90+)

Output: outputs/meta-reflection-graphrag.md with:
- Pattern candidates
- Quality scores
- Applicability analysis
- Promotion recommendations
```

---

## Verification Commands

All agents should verify their outputs with these commands:

```bash
# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint
bun run lint:fix --filter @beep/knowledge-server
```

---

## Agent Selection Quick Reference

| Task Type | Agent | Capability |
|-----------|-------|------------|
| Research code patterns | `codebase-researcher` | read-only |
| Research Effect docs | `mcp-researcher` | read-only |
| Create service implementation | `effect-code-writer` | write-files |
| Create tests | `test-writer` | write-files |
| Validate structure | `architecture-pattern-enforcer` | write-reports |
| Extract patterns | `reflector` | write-reports |
