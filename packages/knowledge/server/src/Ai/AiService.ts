/**
 * AiService - AI provider abstraction for knowledge extraction
 *
 * Provides a unified interface for LLM operations used in
 * the extraction pipeline.
 *
 * @module knowledge-server/Ai/AiService
 * @since 0.1.0
 */
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Errors } from "@beep/knowledge-domain";
const { LlmExtractionError } = Errors;

/**
 * Configuration for AI generation
 *
 * @since 0.1.0
 * @category schemas
 */
export class AiGenerationConfig extends S.Class<AiGenerationConfig>("@beep/knowledge-server/AiGenerationConfig")({
  /**
   * Maximum tokens to generate
   */
  maxTokens: S.optional(
    S.Number.pipe(S.int(), S.positive()).annotations({
      description: "Maximum tokens to generate",
      default: 4096,
    })
  ),

  /**
   * Temperature for generation (0-2)
   */
  temperature: S.optional(
    S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(2)).annotations({
      description: "Generation temperature (0 = deterministic, 2 = creative)",
      default: 0,
    })
  ),

  /**
   * Model identifier to use
   */
  model: S.optional(
    S.String.annotations({
      description: "Model identifier (provider-specific)",
    })
  ),
}) {}

/**
 * Result of an AI generation with usage statistics
 *
 * @since 0.1.0
 * @category schemas
 */
export interface AiGenerationResult<T> {
  readonly data: T;
  readonly usage: {
    readonly promptTokens: number;
    readonly completionTokens: number;
    readonly totalTokens: number;
  };
}

/**
 * AiService interface - AI provider abstraction
 *
 * Implementations can wrap different AI providers (OpenAI, Anthropic, etc.)
 * while exposing a consistent interface for the extraction pipeline.
 *
 * @since 0.1.0
 * @category services
 */
export interface AiService {
  /**
   * Generate structured output matching a schema
   *
   * @param schema - Effect Schema to validate/parse output
   * @param prompt - User prompt
   * @param config - Generation configuration
   * @returns Validated structured output
   */
  readonly generateObject: <A, I>(
    schema: S.Schema<A, I>,
    prompt: string,
    config?: AiGenerationConfig
  ) => Effect.Effect<AiGenerationResult<A>, LlmExtractionError>;

  /**
   * Generate structured output with system prompt
   *
   * @param schema - Effect Schema to validate/parse output
   * @param systemPrompt - System prompt
   * @param userPrompt - User prompt
   * @param config - Generation configuration
   * @returns Validated structured output
   */
  readonly generateObjectWithSystem: <A, I>(
    schema: S.Schema<A, I>,
    systemPrompt: string,
    userPrompt: string,
    config?: AiGenerationConfig
  ) => Effect.Effect<AiGenerationResult<A>, LlmExtractionError>;

  /**
   * Generate raw text completion
   *
   * @param prompt - User prompt
   * @param config - Generation configuration
   * @returns Generated text
   */
  readonly generateText: (
    prompt: string,
    config?: AiGenerationConfig
  ) => Effect.Effect<AiGenerationResult<string>, LlmExtractionError>;
}

/**
 * AiService Tag for dependency injection
 *
 * @since 0.1.0
 * @category context
 */
export const AiService = Context.GenericTag<AiService>("@beep/knowledge-server/AiService");

/**
 * Mock AiService for testing
 *
 * Returns empty results - useful for testing pipeline structure.
 *
 * @since 0.1.0
 * @category testing
 */
export const MockAiService: AiService = {
  generateObject: <A, I>(
    schema: S.Schema<A, I>,
    _prompt: string,
    _config?: AiGenerationConfig
  ) =>
    Effect.fail(
      new LlmExtractionError({
        message: "MockAiService: generateObject not implemented",
        retryable: false,
      })
    ),

  generateObjectWithSystem: <A, I>(
    schema: S.Schema<A, I>,
    _systemPrompt: string,
    _userPrompt: string,
    _config?: AiGenerationConfig
  ) =>
    Effect.fail(
      new LlmExtractionError({
        message: "MockAiService: generateObjectWithSystem not implemented",
        retryable: false,
      })
    ),

  generateText: (_prompt: string, _config?: AiGenerationConfig) =>
    Effect.fail(
      new LlmExtractionError({
        message: "MockAiService: generateText not implemented",
        retryable: false,
      })
    ),
};

/**
 * Layer providing MockAiService
 *
 * @since 0.1.0
 * @category layers
 */
export const MockAiServiceLayer = Effect.succeed(MockAiService).pipe(Effect.map((s) => Context.make(AiService, s)));
