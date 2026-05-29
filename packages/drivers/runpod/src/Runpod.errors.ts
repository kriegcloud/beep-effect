/**
 * Typed technical errors for the Runpod driver boundary.
 *
 * @packageDocumentation
 * @since 0.1.0
 */

import { $RunpodId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { pipe, Result } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import { RunpodHttpMethod, RunpodOperationDescriptor, RunpodOperationId } from "./_generated/Runpod.generated.ts";

const $I = $RunpodId.create("Runpod.errors");

/**
 * Technical error reasons emitted by the Runpod REST API driver.
 *
 * @category errors
 * @since 0.1.0
 */
export const RunpodErrorReason = LiteralKit([
  "config",
  "request encoding",
  "response decoding",
  "response status",
  "transport",
]).pipe(
  $I.annoteSchema("RunpodErrorReason", {
    description: "Redacted technical error reasons emitted by the Runpod REST API driver.",
  })
);

/**
 * Type for {@link RunpodErrorReason}.
 *
 * @category errors
 * @since 0.1.0
 */
export type RunpodErrorReason = typeof RunpodErrorReason.Type;

/**
 * Technical error reasons emitted by the Runpod documentation index driver.
 *
 * @category errors
 * @since 0.1.0
 */
export const RunpodDocsErrorReason = LiteralKit([
  "config",
  "parse",
  "response decoding",
  "response status",
  "transport",
]).pipe(
  $I.annoteSchema("RunpodDocsErrorReason", {
    description: "Redacted technical error reasons emitted by the Runpod documentation driver.",
  })
);

/**
 * Type for {@link RunpodDocsErrorReason}.
 *
 * @category errors
 * @since 0.1.0
 */
export type RunpodDocsErrorReason = typeof RunpodDocsErrorReason.Type;

const isRunpodOperationDescriptor = S.is(RunpodOperationDescriptor);

/**
 * Technical failure raised by the Runpod REST API driver boundary.
 *
 * @category errors
 * @since 0.1.0
 */
export class RunpodError extends TaggedErrorClass<RunpodError>($I`RunpodError`)(
  "RunpodError",
  {
    cause: S.optionalKey(S.String),
    method: S.optionalKey(RunpodHttpMethod),
    methodName: S.optionalKey(S.String),
    operationId: S.optionalKey(RunpodOperationId),
    path: S.optionalKey(S.String),
    reason: RunpodErrorReason,
    status: S.optionalKey(S.Number),
  },
  $I.annote("RunpodError", {
    description: "Redacted technical failure raised by the Runpod REST API driver boundary.",
  })
) {
  /**
   * Create a driver error scoped to a documented Runpod operation.
   *
   * @category constructors
   * @since 0.1.0
   */
  static readonly fromDescriptor: {
    (descriptor: RunpodOperationDescriptor, reason: RunpodErrorReason, options?: RunpodErrorOptions): RunpodError;
    (reason: RunpodErrorReason, options?: RunpodErrorOptions): (descriptor: RunpodOperationDescriptor) => RunpodError;
  } = dual(
    (args) => args.length >= 2 && isRunpodOperationDescriptor(args[0]),
    (descriptor: RunpodOperationDescriptor, reason: RunpodErrorReason, options: RunpodErrorOptions = {}) =>
      RunpodError.make({
        method: descriptor.method,
        methodName: descriptor.methodName,
        operationId: descriptor.operationId,
        path: descriptor.path,
        reason,
        ...R.getSomes({
          cause: causeFromUnknown(options.cause),
        }),
        ...R.getSomes({
          status: O.fromUndefinedOr(options.status),
        }),
      })
  );

  /**
   * Create a driver error before a specific operation descriptor exists.
   *
   * @category constructors
   * @since 0.1.0
   */
  static readonly config = (cause?: unknown): RunpodError =>
    RunpodError.make({
      reason: "config",
      ...R.getSomes({
        cause: causeFromUnknown(cause),
      }),
    });

  /**
   * Create a driver error for a raw request.
   *
   * @category constructors
   * @since 0.1.0
   */
  static readonly raw = (options: RunpodRawErrorOptions): RunpodError =>
    RunpodError.make({
      method: options.method,
      path: options.path,
      reason: options.reason,
      ...R.getSomes({
        cause: causeFromUnknown(options.cause),
      }),
      ...R.getSomes({
        status: O.fromUndefinedOr(options.status),
      }),
    });
}

/**
 * Technical failure raised by the Runpod documentation index driver boundary.
 *
 * @category errors
 * @since 0.1.0
 */
export class RunpodDocsError extends TaggedErrorClass<RunpodDocsError>($I`RunpodDocsError`)(
  "RunpodDocsError",
  {
    cause: S.optionalKey(S.String),
    reason: RunpodDocsErrorReason,
    status: S.optionalKey(S.Number),
    url: S.optionalKey(S.String),
  },
  $I.annote("RunpodDocsError", {
    description: "Redacted technical failure raised by the Runpod documentation index boundary.",
  })
) {
  /**
   * Create a Runpod documentation driver error.
   *
   * @category constructors
   * @since 0.1.0
   */
  static readonly fromReason = (reason: RunpodDocsErrorReason, options: RunpodDocsErrorOptions = {}): RunpodDocsError =>
    RunpodDocsError.make({
      reason,
      ...R.getSomes({
        cause: causeFromUnknown(options.cause),
      }),
      ...R.getSomes({
        status: O.fromUndefinedOr(options.status),
      }),
      ...R.getSomes({
        url: O.fromUndefinedOr(options.url),
      }),
    });
}

/**
 * Options used when constructing Runpod driver errors.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodErrorOptions extends S.Class<RunpodErrorOptions>($I`RunpodErrorOptions`)(
  {
    cause: S.optionalKey(S.DefectWithStack),
    status: S.optionalKey(S.Number),
  },
  $I.annote("RunpodErrorOptions", {
    description: "Options for configuring RunpodError instances.",
  })
) {}

/**
 * Options used when constructing Runpod driver errors for raw requests.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodRawErrorOptions extends S.Class<RunpodRawErrorOptions>($I`RunpodRawErrorOptions`)(
  {
    cause: S.optionalKey(S.DefectWithStack),
    method: RunpodHttpMethod,
    path: S.String,
    reason: RunpodErrorReason,
    status: S.optionalKey(S.Number),
  },
  $I.annote("RunpodRawErrorOptions", {
    description: "Options for configuring RunpodError instances for raw requests.",
  })
) {}

/**
 * Options used when constructing Runpod documentation driver errors.
 *
 * @category models
 * @since 0.1.0
 */
export class RunpodDocsErrorOptions extends S.Class<RunpodDocsErrorOptions>($I`RunpodDocsErrorOptions`)(
  {
    cause: S.optionalKey(S.DefectWithStack),
    status: S.optionalKey(S.Number),
    url: S.optionalKey(S.String),
  },
  $I.annote("RunpodDocsErrorOptions", {
    description: "Options for configuring RunpodDocsError instances.",
  })
) {}

const readProperty = (value: unknown, key: PropertyKey): O.Option<unknown> => {
  if (!P.isObject(value)) {
    return O.none();
  }

  return O.fromUndefinedOr(
    Result.getOrElse(
      Result.try(() => Reflect.get(value, key)),
      () => undefined
    )
  );
};

const readString = (value: unknown, key: PropertyKey): O.Option<string> =>
  O.filter(readProperty(value, key), P.isString);

const safeBoolean = (evaluate: () => boolean): boolean => Result.getOrElse(Result.try(evaluate), () => false);

const httpClientCauseLabel = (cause: unknown): O.Option<string> =>
  safeBoolean(() => HttpClientError.isHttpClientError(cause))
    ? pipe(
        readProperty(cause, "reason"),
        O.flatMap((reason) => readString(reason, "_tag")),
        O.map((tag) => `HttpClientError:${tag}`)
      )
    : O.none();

const causeFromUnknown = (cause: unknown): O.Option<string> =>
  P.isUndefined(cause)
    ? O.none()
    : O.firstSomeOf([
        httpClientCauseLabel(cause),
        readString(cause, "_tag"),
        readString(cause, "name"),
        P.isString(cause) ? O.some("String") : O.none(),
      ]);
