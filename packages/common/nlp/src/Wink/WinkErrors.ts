/**
 * Wink runtime errors.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { Inspectable } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $NlpId.create("Wink/WinkErrors");

const renderCause = (cause: unknown): string => Inspectable.toStringUnknown(cause);
const getTextOption = (options: { readonly text?: string | undefined } | string): O.Option<string> =>
  O.fromNullishOr(P.isString(options) ? options : options.text);
const getEntityNameOption = (options: { readonly entityName?: string | undefined } | string): O.Option<string> =>
  O.fromNullishOr(P.isString(options) ? options : options.entityName);

/**
 * Failure raised while creating or accessing the wink runtime.
 *
 * @example
 * ```ts
 * import { WinkEngineError } from "@beep/nlp/Wink/WinkErrors"
 *
 * console.log(WinkEngineError)
 * ```
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
   * @param cause - The underlying failure or defect.
   * @param operation - The wink runtime operation that failed.
   * @returns A typed wink runtime error value.
   */
  static readonly fromCause: {
    (cause: unknown, operation: string): WinkEngineError;
    (operation: string): (cause: unknown) => WinkEngineError;
  } = dual(
    2,
    (cause: unknown, operation: string): WinkEngineError =>
      new WinkEngineError({
        cause,
        message: `Wink runtime ${operation} failed: ${renderCause(cause)}`,
        operation,
      })
  );
}

/**
 * Failure raised while reading or tokenizing text through wink.
 *
 * @example
 * ```ts
 * import { WinkTokenizationError } from "@beep/nlp/Wink/WinkErrors"
 *
 * console.log(WinkTokenizationError)
 * ```
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
   * @param cause - The underlying failure or defect.
   * @param operation - The wink tokenization operation that failed.
   * @param options - Additional tokenization failure detail.
   * @returns A typed wink tokenization error value.
   */
  static readonly fromCause: {
    (cause: unknown, operation: string, options: { readonly text?: string | undefined }): WinkTokenizationError;
    (operation: string, options: { readonly text?: string | undefined }): (cause: unknown) => WinkTokenizationError;
    (cause: unknown, operation: string, text: string): WinkTokenizationError;
  } = dual(
    3,
    (cause: unknown, operation: string, options: { readonly text?: string | undefined }): WinkTokenizationError =>
      new WinkTokenizationError({
        cause,
        message: `Wink tokenization ${operation} failed: ${renderCause(cause)}`,
        operation,
        text: getTextOption(options),
      })
  );
}

/**
 * Failure raised while learning or managing custom entity patterns.
 *
 * @example
 * ```ts
 * import { WinkEntityError } from "@beep/nlp/Wink/WinkErrors"
 *
 * console.log(WinkEntityError)
 * ```
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
   * @param cause - The underlying failure or defect.
   * @param operation - The wink entity operation that failed.
   * @param options - Additional entity failure detail.
   * @returns A typed wink entity error value.
   */
  static readonly fromCause: {
    (cause: unknown, operation: string, options: { readonly entityName?: string | undefined }): WinkEntityError;
    (operation: string, options: { readonly entityName?: string | undefined }): (cause: unknown) => WinkEntityError;
    (cause: unknown, operation: string, entityName: string): WinkEntityError;
  } = dual(
    3,
    (cause: unknown, operation: string, options: { readonly entityName?: string | undefined }): WinkEntityError =>
      new WinkEntityError({
        cause,
        entityName: getEntityNameOption(options),
        message: `Wink entity ${operation} failed: ${renderCause(cause)}`,
        operation,
      })
  );
}

/**
 * Union of wink runtime errors.
 *
 * @example
 * ```ts
 * import type { WinkError } from "@beep/nlp/Wink/WinkErrors"
 *
 * type Example = WinkError
 * ```
 *
 * @since 0.0.0
 * @category Errors
 */
export type WinkError = WinkEngineError | WinkEntityError | WinkTokenizationError;
