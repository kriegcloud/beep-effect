/**
 * Extraction Pipeline Stage Template
 *
 * Use this template when implementing extraction pipeline stages.
 * Replace {{StageName}} with your stage name (e.g., MentionExtractor, EntityExtractor).
 *
 * The 6-phase pipeline:
 * 1. Chunk - Text chunking with sentence preservation
 * 2. Mention - Surface mention detection
 * 3. Entity - Ontology-guided entity extraction
 * 4. Scope - Property scoping by entity type
 * 5. Relation - Relation extraction with domain/range constraints
 * 6. Ground - Embedding-based grounding and confidence filtering
 *
 * @template
 */
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";

// =============================================================================
// Stage Input/Output Schemas
// =============================================================================

/**
 * Input schema for this stage.
 *
 * Typically receives output from the previous stage.
 */
export class {{StageName}}Input extends S.Class<{{StageName}}Input>(
  "{{StageName}}Input"
)({
  /** Text chunk to process */
  text: S.String,

  /** Character offset in original document */
  startOffset: S.Number,

  /** Chunk index for ordering */
  chunkIndex: S.Number,

  /** Previous stage output (if applicable) */
  previousStageData: S.optional(S.Unknown),
}) {}

/**
 * Output schema for this stage.
 *
 * Will be passed to the next stage.
 */
export class {{StageName}}Output extends S.Class<{{StageName}}Output>(
  "{{StageName}}Output"
)({
  /** Extracted items from this stage */
  items: S.Array(ExtractedItem),

  /** Chunk metadata preserved for downstream */
  chunkIndex: S.Number,
  startOffset: S.Number,

  /** Stage-specific metrics */
  processingTimeMs: S.Number,
  itemCount: S.Number,
}) {}

/**
 * Individual extracted item.
 *
 * Customize based on what this stage extracts.
 */
export class ExtractedItem extends S.Class<ExtractedItem>("ExtractedItem")({
  /** Unique ID for this extraction */
  id: S.String,

  /** The extracted text span */
  text: S.String,

  /** Position in source */
  startOffset: S.Number,
  endOffset: S.Number,

  /** Confidence from LLM (0-1) */
  confidence: S.Number,

  /** Stage-specific data */
  metadata: S.Record({ key: S.String, value: S.Unknown }),
}) {}

// =============================================================================
// LLM Output Schema (for generateObject)
// =============================================================================

/**
 * Schema for LLM structured output.
 *
 * Use with @effect/ai generateObject for type-safe extraction.
 * Constrain to ontology types when applicable.
 */
export class LlmExtractionResult extends S.Class<LlmExtractionResult>(
  "LlmExtractionResult"
)({
  /** Extracted items */
  extractions: S.Array(
    S.Struct({
      text: S.String,
      type: S.String, // Constrain to ontology classes in implementation
      confidence: S.Number,
      startChar: S.Number,
      endChar: S.Number,
    })
  ),

  /** LLM reasoning (optional, for debugging) */
  reasoning: S.optional(S.String),
}) {}

// =============================================================================
// Error Types
// =============================================================================

export class {{StageName}}Error extends S.TaggedError<{{StageName}}Error>()(
  "{{StageName}}Error",
  {
    message: S.String,
    stage: S.Literal("{{StageName}}"),
    chunkIndex: S.optional(S.Number),
    cause: S.optional(S.Unknown),
  }
) {}

// =============================================================================
// Stage Service Definition
// =============================================================================

/**
 * {{StageName}} extraction stage.
 *
 * Key patterns:
 * - Use Effect.Service with accessors: true
 * - Accept OntologyContext for type/property constraints
 * - Return Effect with typed errors
 * - Include evidence spans for provenance
 */
export class {{StageName}} extends Effect.Service<{{StageName}}>()(
  "@beep/knowledge-server/{{StageName}}",
  {
    dependencies: [
      // AiService.Default,      // For LLM calls
      // OntologyService.Default, // For type constraints
    ],
    accessors: true,
    effect: Effect.gen(function* () {
      // const ai = yield* AiService;
      // const ontology = yield* OntologyService;

      return {
        /**
         * Extract from a single chunk.
         */
        extract: (input: {{StageName}}Input, ontologyContext: OntologyContext) =>
          Effect.gen(function* () {
            const startTime = Date.now();

            // Build prompt with ontology guidance
            const prompt = yield* buildPrompt(input, ontologyContext);

            // Create constrained schema based on ontology
            const schema = makeConstrainedSchema(ontologyContext);

            // Call LLM with structured output
            // const llmResult = yield* ai.generateObject({
            //   schema,
            //   prompt,
            //   model: "gpt-4o-mini", // Or configured model
            // });

            // Mock result for template
            const llmResult: LlmExtractionResult = {
              extractions: [],
              reasoning: undefined,
            };

            // Transform LLM output to stage output
            const items = A.map(llmResult.extractions, (extraction) => ({
              id: `${input.chunkIndex}-${extraction.startChar}`,
              text: extraction.text,
              startOffset: input.startOffset + extraction.startChar,
              endOffset: input.startOffset + extraction.endChar,
              confidence: extraction.confidence,
              metadata: { type: extraction.type },
            }));

            const processingTimeMs = Date.now() - startTime;

            yield* Effect.logDebug("{{StageName}}: extraction complete", {
              chunkIndex: input.chunkIndex,
              itemCount: items.length,
              processingTimeMs,
            });

            return {
              items,
              chunkIndex: input.chunkIndex,
              startOffset: input.startOffset,
              processingTimeMs,
              itemCount: items.length,
            };
          }),

        /**
         * Extract from multiple chunks with bounded concurrency.
         */
        extractBatch: (
          inputs: ReadonlyArray<{{StageName}}Input>,
          ontologyContext: OntologyContext,
          concurrency: number = 5
        ) =>
          Effect.gen(function* () {
            const results = yield* Effect.forEach(
              inputs,
              (input) =>
                Effect.gen(function* () {
                  return yield* {{StageName}}.extract(input, ontologyContext);
                }),
              { concurrency }
            );

            return results;
          }),

        /**
         * Stream extraction for large document processing.
         */
        extractStream: (
          inputStream: Stream.Stream<{{StageName}}Input, never, never>,
          ontologyContext: OntologyContext,
          concurrency: number = 5
        ) =>
          inputStream.pipe(
            Stream.mapEffect(
              (input) => {{StageName}}.extract(input, ontologyContext),
              { concurrency }
            )
          ),
      };
    }),
  }
) {}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Ontology context for constraining extraction.
 */
interface OntologyContext {
  /** Valid class IRIs for this extraction */
  readonly classIris: ReadonlyArray<string>;
  /** Class definitions with labels and properties */
  readonly classDefinitions: ReadonlyMap<string, ClassDefinition>;
  /** Valid property IRIs */
  readonly propertyIris: ReadonlyArray<string>;
}

interface ClassDefinition {
  readonly iri: string;
  readonly label: string;
  readonly comment: string;
  readonly properties: ReadonlyArray<string>;
}

/**
 * Build LLM prompt with ontology guidance.
 */
const buildPrompt = (
  input: {{StageName}}Input,
  ontologyContext: OntologyContext
): Effect.Effect<string, never> =>
  Effect.succeed(`
Extract {{StageName}}s from the following text.

## Valid Types
${ontologyContext.classIris.join(", ")}

## Type Definitions
${Array.from(ontologyContext.classDefinitions.values())
  .map((c) => `- ${c.label}: ${c.comment}`)
  .join("\n")}

## Text to Process
${input.text}

## Instructions
1. Identify all {{StageName}}s in the text
2. Only use types from the valid types list
3. Include character offsets relative to the text start
4. Provide confidence scores (0-1)
`);

/**
 * Create schema constrained to ontology types.
 */
const makeConstrainedSchema = (
  ontologyContext: OntologyContext
): S.Schema<LlmExtractionResult> => {
  // In real implementation, dynamically constrain 'type' field
  // to S.Literal(...ontologyContext.classIris)
  return LlmExtractionResult;
};

// =============================================================================
// Stage Composition
// =============================================================================

/**
 * Compose multiple stages into a pipeline.
 *
 * @example
 * ```typescript
 * const pipeline = composePipeline([
 *   MentionExtractor,
 *   EntityExtractor,
 *   RelationExtractor,
 *   Grounder,
 * ]);
 * ```
 */
export const composePipeline = <
  Stages extends ReadonlyArray<ExtractionStage<unknown, unknown>>,
>(
  stages: Stages
) => ({
  run: (input: unknown, ontologyContext: OntologyContext) =>
    Effect.gen(function* () {
      let current = input;
      for (const stage of stages) {
        current = yield* stage.extract(current as never, ontologyContext);
      }
      return current;
    }),
});

interface ExtractionStage<In, Out> {
  extract: (
    input: In,
    ontologyContext: OntologyContext
  ) => Effect.Effect<Out, unknown>;
}
