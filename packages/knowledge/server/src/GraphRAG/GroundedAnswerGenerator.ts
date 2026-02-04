/**
 * Grounded Answer Generator Service
 *
 * Generates grounded answers with citations by calling an LLM with
 * graph context and parsing citation markers from the response.
 *
 * Uses @effect/ai LanguageModel for LLM interactions and produces
 * GroundedAnswer instances with full citation provenance.
 *
 * @module knowledge-server/GraphRAG/GroundedAnswerGenerator
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { LanguageModel } from "@effect/ai";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { Citation } from "./AnswerSchemas";
import { GroundedAnswer } from "./AnswerSchemas";
import { extractEntityIds, parseCitations, stripAllCitations } from "./CitationParser";
import { buildGroundedAnswerPrompt, type GraphContext } from "./PromptTemplates";

const $I = $KnowledgeServerId.create("GraphRAG/GroundedAnswerGenerator");

// =============================================================================
// Error Types
// =============================================================================

/**
 * Error during grounded answer generation
 *
 * Wraps failures from LLM calls, citation parsing, or validation.
 *
 * @since 0.1.0
 * @category errors
 */
export class GenerationError extends S.TaggedError<GenerationError>()("GenerationError", {
  /**
   * Human-readable error message
   */
  message: S.String,

  /**
   * Optional underlying cause
   */
  cause: S.optional(S.Unknown),
}) {}

// =============================================================================
// Confidence Computation
// =============================================================================

/**
 * Compute overall answer confidence from citation confidences
 *
 * Phase 2: Simple average of citation confidences.
 * Phase 3 will add validation-based scoring against the knowledge graph.
 *
 * @param citations - Array of citations with individual confidence scores
 * @returns Overall confidence score (0.0-1.0)
 *
 * @since 0.1.0
 * @category computation
 */
const computeConfidence = (citations: ReadonlyArray<Citation>): number => {
  if (A.isEmptyReadonlyArray(citations)) {
    return 0.0;
  }

  const sum = A.reduce(citations, 0, (acc, c) => acc + c.confidence);
  return sum / A.length(citations);
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * GroundedAnswerGenerator - LLM-powered answer generation with citations
 *
 * Generates answers grounded in knowledge graph context by:
 * 1. Formatting graph context and question into a structured prompt
 * 2. Calling the LLM with citation format instructions
 * 3. Parsing citation markers from the response
 * 4. Computing confidence scores
 *
 * @example
 * ```ts
 * import { GroundedAnswerGenerator } from "@beep/knowledge-server/GraphRAG";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   const generator = yield* GroundedAnswerGenerator;
 *
 *   const answer = yield* generator.generate(
 *     {
 *       entities: [
 *         { id: "knowledge_entity__abc", mention: "Alice", types: ["Person"] },
 *         { id: "knowledge_entity__def", mention: "Acme Corp", types: ["Organization"] }
 *       ],
 *       relations: [
 *         {
 *           id: "knowledge_relation__ghi",
 *           subjectId: "knowledge_entity__abc",
 *           predicate: "worksAt",
 *           objectId: "knowledge_entity__def"
 *         }
 *       ]
 *     },
 *     "Where does Alice work?"
 *   );
 *
 *   console.log(answer.text);       // "Alice works at Acme Corp"
 *   console.log(answer.citations);  // Citations linking to entities/relations
 *   console.log(answer.confidence); // Computed confidence score
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class GroundedAnswerGenerator extends Effect.Service<GroundedAnswerGenerator>()(
  $I`GroundedAnswerGenerator`,
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const languageModel = yield* LanguageModel.LanguageModel;

      /**
       * Generate a grounded answer for a question using graph context
       *
       * @param context - Graph context with entities and relations
       * @param question - User's natural language question
       * @returns GroundedAnswer with text, citations, and confidence
       */
      const generate = (
        context: GraphContext,
        question: string
      ): Effect.Effect<GroundedAnswer, GenerationError> =>
        Effect.gen(function* () {
          yield* Effect.logInfo("GroundedAnswerGenerator.generate: starting", {
            entityCount: A.length(context.entities),
            relationCount: A.length(context.relations),
            questionLength: question.length,
          });

          // 1. Build prompts
          const prompts = buildGroundedAnswerPrompt(context, question);

          yield* Effect.logDebug("GroundedAnswerGenerator.generate: prompts built", {
            systemPromptLength: prompts.system.length,
            userPromptLength: prompts.user.length,
          });

          // 2. Call LLM with generateText
          const response = yield* languageModel.generateText({
            prompt: [
              { role: "system" as const, content: prompts.system },
              { role: "user" as const, content: prompts.user },
            ],
          });

          yield* Effect.logDebug("GroundedAnswerGenerator.generate: LLM response received", {
            textLength: response.text.length,
            hasToolCalls: response.toolCalls.length > 0,
          });

          const responseText = response.text;

          // 3. Check if response has content
          if (responseText.trim().length === 0) {
            yield* Effect.logWarning("GroundedAnswerGenerator.generate: empty response from LLM");
            return new GroundedAnswer({
              text: "I don't have enough information to answer this question." as string & {
                readonly NonEmptyString: unique symbol;
              },
              citations: [],
              confidence: 0.0,
              reasoning: undefined,
            });
          }

          // 4. Parse citations
          const contextEntityIds = A.map(context.entities, (e) => e.id);
          const citations = parseCitations(responseText, contextEntityIds);

          yield* Effect.logDebug("GroundedAnswerGenerator.generate: citations parsed", {
            citationCount: A.length(citations),
            extractedEntityIds: extractEntityIds(responseText).length,
          });

          // 5. Compute confidence
          const confidence = computeConfidence(citations);

          // 6. Clean the response text for display (strip citation markers)
          const cleanText = stripAllCitations(responseText);

          yield* Effect.logInfo("GroundedAnswerGenerator.generate: complete", {
            citationCount: A.length(citations),
            confidence,
            textLength: cleanText.length,
          });

          // 7. Return GroundedAnswer
          return new GroundedAnswer({
            text: cleanText as string & { readonly NonEmptyString: unique symbol },
            citations: [...citations],
            confidence,
            reasoning: undefined,
          });
        }).pipe(
          Effect.mapError(
            (e) =>
              new GenerationError({
                message: `Failed to generate grounded answer: ${String(e)}`,
                cause: e,
              })
          ),
          Effect.withSpan("GroundedAnswerGenerator.generate", {
            captureStackTrace: false,
            attributes: {
              entityCount: A.length(context.entities),
              relationCount: A.length(context.relations),
            },
          })
        );

      return { generate };
    }),
  }
) {}

// =============================================================================
// Re-exports for convenience
// =============================================================================

export type { GraphContext } from "./PromptTemplates";
