/**
 * Typed technical errors for the Box driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $BoxId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { pipe, Result } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { BoxMethodName } from "./_generated/Box.models.gen.ts";
import { BOX_SDK_VERSION } from "./internal/Box.constants.ts";
import type { BoxMethodName as BoxMethodNameType } from "./_generated/Box.models.gen.ts";

const $I = $BoxId.create("Box.errors");

/**
 * Technical error reasons emitted by the Box driver.
 *
 * @example
 * ```ts
 * import { BoxErrorReason } from "@beep/box"
 *
 * console.log(BoxErrorReason.is.transport("transport"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const BoxErrorReason = LiteralKit([
  "config",
  "request encoding",
  "response decoding",
  "response status",
  "sdk shape",
  "sdk thrown",
  "stream",
  "transport",
]).pipe(
  $I.annoteSchema("BoxErrorReason", {
    description: "Redacted technical error reasons emitted by the Box driver.",
  })
);

/**
 * Type for {@link BoxErrorReason}.
 *
 * @example
 * ```ts
 * import type { BoxErrorReason } from "@beep/box"
 *
 * const reason: BoxErrorReason = "transport"
 * console.log(reason)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BoxErrorReason = typeof BoxErrorReason.Type;

/**
 * Sanitized context copied from Box API failures.
 *
 * @example
 * ```ts
 * import { BoxApiFailureContext } from "@beep/box"
 *
 * const context = BoxApiFailureContext.make({ values: { reason: "invalid" } })
 * console.log(context.values)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class BoxApiFailureContext extends S.Class<BoxApiFailureContext>($I`BoxApiFailureContext`)(
  {
    values: S.Unknown,
  },
  $I.annote("BoxApiFailureContext", {
    description: "Sanitized key-value context copied from a Box API failure.",
  })
) {}

/**
 * Options used when constructing Box driver errors.
 *
 * @example
 * ```ts
 * import { BoxErrorOptions } from "@beep/box"
 *
 * const options = BoxErrorOptions.make({ method: "files.getFileById" })
 * console.log(options.method)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class BoxErrorOptions extends S.Class<BoxErrorOptions>($I`BoxErrorOptions`)(
  {
    cause: S.String.pipe(S.optionalKey),
    code: S.String.pipe(S.optionalKey),
    context: BoxApiFailureContext.pipe(S.optionalKey),
    helpUrl: S.String.pipe(S.optionalKey),
    method: BoxMethodName.pipe(S.optionalKey),
    requestId: S.String.pipe(S.optionalKey),
    sdkVersion: S.String.pipe(S.optionalKey),
    status: S.Finite.pipe(S.optionalKey),
  },
  $I.annote("BoxErrorOptions", {
    description: "Sanitized options for constructing Box driver errors.",
  })
) {}

type BoxErrorOptionsInput = {
  readonly cause?: unknown;
  readonly code?: string;
  readonly context?: BoxApiFailureContext;
  readonly helpUrl?: string;
  readonly method?: BoxMethodNameType;
  readonly requestId?: string;
  readonly sdkVersion?: string;
  readonly status?: number;
};

/**
 * Technical failure raised by the Box driver boundary.
 *
 * @example
 * ```ts
 * import { BoxError } from "@beep/box"
 *
 * const error = BoxError.fromReason("transport", { method: "files.getFileById" })
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class BoxError extends TaggedErrorClass<BoxError>($I`BoxError`)(
  "BoxError",
  {
    cause: S.String.pipe(S.optionalKey),
    code: S.String.pipe(S.optionalKey),
    context: BoxApiFailureContext.pipe(S.optionalKey),
    helpUrl: S.String.pipe(S.optionalKey),
    method: BoxMethodName.pipe(S.optionalKey),
    reason: BoxErrorReason,
    requestId: S.String.pipe(S.optionalKey),
    sdkVersion: S.String.pipe(S.optionalKey),
    status: S.Finite.pipe(S.optionalKey),
  },
  $I.annote("BoxError", {
    description: "Sanitized technical failure raised by the Box driver boundary.",
  })
) {
  /**
   * Create a Box driver error from a redacted reason.
   *
   * @example
   * ```ts
   * import { BoxError } from "@beep/box"
   *
   * const error = BoxError.fromReason("config")
   * console.log(error.reason)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (reason: BoxErrorReason, options: BoxErrorOptionsInput = {}): BoxError =>
    BoxError.make({
      reason,
      ...(options.cause === undefined ? {} : { cause: causeLabelFromInput(options.cause) }),
      ...(options.code === undefined ? {} : { code: options.code }),
      ...(options.context === undefined ? {} : { context: options.context }),
      ...(options.helpUrl === undefined ? {} : { helpUrl: options.helpUrl }),
      ...(options.method === undefined ? {} : { method: options.method }),
      ...(options.requestId === undefined ? {} : { requestId: options.requestId }),
      sdkVersion: options.sdkVersion ?? BOX_SDK_VERSION,
      ...(options.status === undefined ? {} : { status: options.status }),
    });

  /**
   * Convert an unknown SDK throw into a sanitized Box driver error.
   *
   * @example
   * ```ts
   * import { BoxError } from "@beep/box"
   *
   * const error = BoxError.fromUnknown("files.getFileById", "boom")
   * console.log(error.method)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromUnknown = (method: BoxMethodNameType, cause: unknown): BoxError => {
    const responseInfo = responseInfoFromUnknown(cause);
    const code = pipe(responseInfo, O.flatMap(readString("code")), O.getOrUndefined);
    const context = pipe(responseInfo, O.flatMap(readContextInfo), O.getOrUndefined);
    const helpUrl = pipe(responseInfo, O.flatMap(readString("helpUrl")), O.getOrUndefined);
    const requestId = pipe(responseInfo, O.flatMap(readString("requestId")), O.getOrUndefined);
    const status = pipe(responseInfo, O.flatMap(readNumber("statusCode")), O.getOrUndefined);

    return BoxError.fromReason(reasonFromUnknown(cause), {
      cause: causeLabel(cause),
      method,
      ...(code === undefined ? {} : { code }),
      ...(context === undefined ? {} : { context }),
      ...(helpUrl === undefined ? {} : { helpUrl }),
      ...(requestId === undefined ? {} : { requestId }),
      ...(status === undefined ? {} : { status }),
    });
  };
}

const readProperty =
  (key: PropertyKey) =>
  (value: unknown): O.Option<unknown> =>
    P.isObject(value)
      ? O.fromUndefinedOr(
          Result.getOrElse(
            Result.try(() => Reflect.get(value, key)),
            () => undefined
          )
        )
      : O.none();

const readString =
  (key: PropertyKey) =>
  (value: unknown): O.Option<string> =>
    pipe(readProperty(key)(value), O.filter(P.isString));

const isFiniteNumber = (value: unknown): value is number => P.isNumber(value) && Number.isFinite(value);

const readNumber =
  (key: PropertyKey) =>
  (value: unknown): O.Option<number> =>
    pipe(readProperty(key)(value), O.filter(isFiniteNumber));

const responseInfoFromUnknown = (cause: unknown): O.Option<unknown> => readProperty("responseInfo")(cause);

const readContextInfo = (value: unknown): O.Option<BoxApiFailureContext> =>
  pipe(
    readProperty("contextInfo")(value),
    O.filter(P.isObject),
    O.map((contextInfo) => BoxApiFailureContext.make({ values: contextInfo }))
  );

const causeLabel = (cause: unknown): string =>
  pipe(
    O.firstSomeOf([readString("_tag")(cause), readString("name")(cause), readString("code")(cause)]),
    O.getOrElse(() => (P.isString(cause) ? "String" : "Unknown"))
  );

const causeLabelFromInput = (cause: unknown): string => (P.isString(cause) ? cause : causeLabel(cause));

const reasonFromUnknown = (cause: unknown): BoxErrorReason =>
  pipe(
    responseInfoFromUnknown(cause),
    O.match({
      onNone: () =>
        pipe(
          readString("_tag")(cause),
          O.filter((tag) => tag === "BoxSdkShapeError"),
          O.match({
            onNone: () => "sdk thrown",
            onSome: () => "sdk shape",
          })
        ),
      onSome: () => "response status",
    })
  );
