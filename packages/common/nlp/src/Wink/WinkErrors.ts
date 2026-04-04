/**
 * Wink runtime errors.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/WinkErrors
 */

import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import * as Inspectable from "effect/Inspectable";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $NlpId.create("Wink/WinkErrors");

const renderCause = (cause: unknown): string => Inspectable.toStringUnknown(cause);

/**
 * Failure raised while creating or accessing the wink runtime.
 *
 * @since 0.0.0
 * @category Errors
 */
export class WinkEngineError extends TaggedErrorClass<WinkEngineError>($I`WinkEngineError`)(
  "WinkEngineError",
  {
    cause: S.Unknown,
    message: S.String,
    operation: S.String,
  },
  $I.annote("WinkEngineError", {
    description: "Failure raised while creating or accessing the wink-nlp runtime.",
  })
) {
  /**
   * Create a runtime error from an unknown cause.
   *
   * @param cause {unknown} - The underlying failure or defect.
   * @param operation {string} - The wink runtime operation that failed.
   * @returns {WinkEngineError} - A typed wink runtime error value.
   */
  static fromCause(cause: unknown, operation: string): WinkEngineError {
    return new WinkEngineError({
      cause,
      message: `Wink runtime ${operation} failed: ${renderCause(cause)}`,
      operation,
    });
  }
}

/**
 * Failure raised while reading or tokenizing text through wink.
 *
 * @since 0.0.0
 * @category Errors
 */
export class WinkTokenizationError extends TaggedErrorClass<WinkTokenizationError>($I`WinkTokenizationError`)(
  "WinkTokenizationError",
  {
    cause: S.Unknown,
    message: S.String,
    operation: S.String,
    text: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("WinkTokenizationError", {
    description: "Failure raised while tokenizing text with wink-nlp.",
  })
) {
  /**
   * Create a tokenization error from an unknown cause.
   *
   * @param cause {unknown} - The underlying failure or defect.
   * @param operation {string} - The wink tokenization operation that failed.
   * @param text {string | undefined} - The source text involved in the failure, when available.
   * @returns {WinkTokenizationError} - A typed wink tokenization error value.
   */
  static fromCause(cause: unknown, operation: string, text?: string): WinkTokenizationError {
    return new WinkTokenizationError({
      cause,
      message: `Wink tokenization ${operation} failed: ${renderCause(cause)}`,
      operation,
      text: text === undefined ? O.none() : O.some(text),
    });
  }
}

/**
 * Failure raised while learning or managing custom entity patterns.
 *
 * @since 0.0.0
 * @category Errors
 */
export class WinkEntityError extends TaggedErrorClass<WinkEntityError>($I`WinkEntityError`)(
  "WinkEntityError",
  {
    cause: S.Unknown,
    entityName: S.OptionFromOptionalKey(S.String),
    message: S.String,
    operation: S.String,
  },
  $I.annote("WinkEntityError", {
    description: "Failure raised while learning or managing wink custom entities.",
  })
) {
  /**
   * Create an entity-learning error from an unknown cause.
   *
   * @param cause {unknown} - The underlying failure or defect.
   * @param operation {string} - The wink entity operation that failed.
   * @param entityName {string | undefined} - The entity or group name involved in the failure, when available.
   * @returns {WinkEntityError} - A typed wink entity error value.
   */
  static fromCause(cause: unknown, operation: string, entityName?: string): WinkEntityError {
    return new WinkEntityError({
      cause,
      entityName: entityName === undefined ? O.none() : O.some(entityName),
      message: `Wink entity ${operation} failed: ${renderCause(cause)}`,
      operation,
    });
  }
}

/**
 * Union of wink runtime errors.
 *
 * @since 0.0.0
 * @category Errors
 */
export type WinkError = WinkEngineError | WinkEntityError | WinkTokenizationError;
