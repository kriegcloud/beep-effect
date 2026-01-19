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
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

/**
 * Configuration for AI generation
 *
 * @since 0.1.0
 * @category schemas
 */
export interface AiGenerationConfig {
  /**
   * Maximum tokens to generate
   */
  readonly maxTokens?: number;

  /**
   * Temperature for generation (0-2)
   */
  readonly temperature?: number;

  /**
   * Model identifier to use
   */
  readonly model?: string;
}

/**
 * LLM extraction error
 *
 * @since 0.1.0
 * @category errors
 */
export class AiExtractionError extends S.TaggedError<AiExtractionError>()(
  "AiExtractionError",
  {
    message: S.String,
    retryable: S.Boolean,
    cause: S.optional(S.String),
  }
) {}

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
  ) => Effect.Effect<AiGenerationResult<A>, AiExtractionError>;

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
  ) => Effect.Effect<AiGenerationResult<A>, AiExtractionError>;

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
  ) => Effect.Effect<AiGenerationResult<string>, AiExtractionError>;
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
    _schema: S.Schema<A, I>,
    _prompt: string,
    _config?: AiGenerationConfig
  ) =>
    Effect.fail(
      new AiExtractionError({
        message: "MockAiService: generateObject not implemented",
        retryable: false,
      })
    ),

  generateObjectWithSystem: <A, I>(
    _schema: S.Schema<A, I>,
    _systemPrompt: string,
    _userPrompt: string,
    _config?: AiGenerationConfig
  ) =>
    Effect.fail(
      new AiExtractionError({
        message: "MockAiService: generateObjectWithSystem not implemented",
        retryable: false,
      })
    ),

  generateText: (_prompt: string, _config?: AiGenerationConfig) =>
    Effect.fail(
      new AiExtractionError({
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
export const MockAiServiceLayer = Layer.succeed(AiService, MockAiService);
