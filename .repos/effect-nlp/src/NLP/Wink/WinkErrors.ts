/**
 * Wink Domain Errors
 * @since 3.0.0
 */

import { Data, Exit } from "effect";

/**
 * Memory limit error when wink-nlp hits instance creation limits
 * @since 3.0.0
 */
export class WinkMemoryError extends Data.TaggedError("WinkMemoryError")<{
  message: string;
  cause: unknown;
  instanceCount: number;
  exit?: Exit.Exit<unknown, unknown>;
}> {
  static fromCause(cause: unknown, instanceCount?: number): WinkMemoryError {
    const exit = Exit.fail(cause);
    return new WinkMemoryError({
      message: `Wink-NLP memory limit exceeded. Cannot create more than ~20 instances per process. ${
        instanceCount ? `Current count: ${instanceCount}` : ""
      }`,
      cause,
      instanceCount: instanceCount ?? 0,
      exit,
    });
  }

  static isMemoryLimitError(error: unknown): boolean {
    return Boolean(
      error instanceof RangeError &&
        error.message === "Invalid string length" &&
        error.stack?.includes("wink-eng-lite-web-model")
    );
  }
}

/**
 * Entity learning error for custom entity processing failures
 * @since 3.0.0
 */
export class WinkEntityError extends Data.TaggedError("WinkEntityError")<{
  message: string;
  cause: unknown;
  entityName?: string;
  exit?: Exit.Exit<unknown, unknown>;
}> {
  static fromCause(
    cause: unknown,
    entityName: string,
    context?: string
  ): WinkEntityError {
    const exit = Exit.fail(cause);
    return new WinkEntityError({
      message: `Failed to ${context || "process"} custom entities${
        entityName ? ` for "${entityName}"` : ""
      }: ${cause instanceof Error ? cause.message : String(cause)}`,
      cause,
      entityName: entityName ?? "",
      exit: exit ?? Exit.succeed(undefined),
    });
  }
}

/**
 * Tokenization error for text processing failures
 * @since 3.0.0
 */
export class WinkTokenizationError extends Data.TaggedError(
  "WinkTokenizationError"
)<{
  message: string;
  cause: unknown;
  text?: string;
  exit?: Exit.Exit<unknown, unknown>;
}> {
  static fromCause(cause: unknown, text?: string): WinkTokenizationError {
    const exit = Exit.fail(cause);
    const constructorArgs: {
      message: string;
      cause: unknown;
      exit: Exit.Exit<unknown, unknown>;
      text?: string;
    } = {
      message: `Failed to tokenize text${
        text ? ` "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"` : ""
      }: ${cause instanceof Error ? cause.message : String(cause)}`,
      cause,
      exit,
    };

    if (text !== undefined) {
      constructorArgs.text = text;
    }

    return new WinkTokenizationError(constructorArgs);
  }
}

/**
 * Union type for all Wink errors
 * @since 3.0.0
 */
export type WinkError =
  | WinkMemoryError
  | WinkEntityError
  | WinkTokenizationError;
