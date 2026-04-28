/**
 * Technical errors raised by the Drizzle driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DrizzleId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { Cause, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $DrizzleId.create("Drizzle.errors");

type DrizzleErrorContext = {
  readonly params?: ReadonlyArray<unknown> | undefined;
  readonly query?: string | undefined;
};

const emptyContext = (): DrizzleErrorContext => ({});

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

const readString = (value: unknown, key: string): O.Option<string> => O.filter(readProperty(value, key), P.isString);

const readArray = (value: unknown, key: string): O.Option<ReadonlyArray<unknown>> =>
  O.filter(readProperty(value, key), (candidate): candidate is ReadonlyArray<unknown> => A.isArray(candidate));

const readCause = (value: unknown): O.Option<unknown> => readProperty(value, "cause");

const safeBoolean = (evaluate: () => boolean): boolean => Result.getOrElse(Result.try(evaluate), () => false);

const isCause = (value: unknown): value is Cause.Cause<unknown> => safeBoolean(() => Cause.isCause(value));

const isExistingDrizzleError = (value: unknown): value is DrizzleError => safeBoolean(() => S.is(DrizzleError)(value));

const readCauseReasons = (cause: Cause.Cause<unknown>): ReadonlyArray<Cause.Reason<unknown>> =>
  Result.getOrElse(
    Result.try(() => cause.reasons),
    A.empty<Cause.Reason<unknown>>
  );

const optionFromSafeDefect = (value: unknown): O.Option<unknown> =>
  safeBoolean(() => S.is(S.DefectWithStack)(value)) ? O.some(value) : O.none();

const parseDrizzleMessage = (cause: unknown): DrizzleErrorContext => {
  const message = readString(cause, "message");

  return O.match(message, {
    onNone: emptyContext,
    onSome: (text) => {
      const match = text.match(/^Failed query:\s*(.+?)(?:\nparams:\s*(.*))?$/s);
      if (match === null) {
        return emptyContext();
      }

      const paramsText = match[2]?.trim();
      return {
        query: match[1]?.trim(),
        params: paramsText === undefined || paramsText.length === 0 ? undefined : A.of(paramsText),
      };
    },
  });
};

const hasQueryContext = (context: DrizzleErrorContext): boolean => context.query !== undefined;

const hasSeenReference = (seen: ReadonlyArray<object>, value: object): boolean =>
  A.some(seen, (seenValue) => seenValue === value);

const contextFromDrizzleError = (error: DrizzleError): DrizzleErrorContext => ({
  query: O.getOrUndefined(error.query),
  params: O.getOrUndefined(error.params),
});

const existingDrizzleError = (value: unknown): O.Option<DrizzleError> =>
  isExistingDrizzleError(value) ? O.some(value) : O.none();

const reasonPayload = (reason: Cause.Reason<unknown>): O.Option<unknown> => {
  if (safeBoolean(() => Cause.isFailReason(reason))) {
    return readProperty(reason, "error");
  }
  if (safeBoolean(() => Cause.isDieReason(reason))) {
    return readProperty(reason, "defect");
  }
  return O.none();
};

const existingDrizzleErrorFromReason = (reason: Cause.Reason<unknown>): O.Option<DrizzleError> =>
  O.flatMap(reasonPayload(reason), existingDrizzleError);

const existingDrizzleErrorFromCause = (cause: Cause.Cause<unknown>): O.Option<DrizzleError> =>
  O.flatMap(
    A.findFirst(readCauseReasons(cause), (candidate) => O.isSome(existingDrizzleErrorFromReason(candidate))),
    existingDrizzleErrorFromReason
  );

const existingDrizzleErrorFromUnknown = (value: unknown): O.Option<DrizzleError> => {
  const direct = existingDrizzleError(value);
  if (O.isSome(direct)) {
    return direct;
  }

  return isCause(value) ? existingDrizzleErrorFromCause(value) : O.none();
};

const extractCauseReasonContext = (reason: Cause.Reason<unknown>, seen: ReadonlyArray<object>): DrizzleErrorContext => {
  const payload = reasonPayload(reason);
  if (O.isNone(payload)) {
    return emptyContext();
  }

  const existing = existingDrizzleError(payload.value);
  return O.isSome(existing) ? contextFromDrizzleError(existing.value) : extractNativeQueryContext(payload.value, seen);
};

const extractCauseContext = (cause: Cause.Cause<unknown>, seen: ReadonlyArray<object>): DrizzleErrorContext => {
  const reason = A.findFirst(readCauseReasons(cause), (candidate) =>
    hasQueryContext(extractCauseReasonContext(candidate, seen))
  );

  return O.match(reason, {
    onNone: emptyContext,
    onSome: (candidate) => extractCauseReasonContext(candidate, seen),
  });
};

const extractNativeQueryContext = (cause: unknown, seen: ReadonlyArray<object> = []): DrizzleErrorContext => {
  if (P.isObject(cause) && hasSeenReference(seen, cause)) {
    return parseDrizzleMessage(cause);
  }

  if (isCause(cause)) {
    return extractCauseContext(cause, A.append(seen, cause));
  }

  if (!P.isObject(cause)) {
    return parseDrizzleMessage(cause);
  }

  if (O.exists(readString(cause, "_tag"), (tag) => tag === "EffectDrizzleQueryError")) {
    return {
      query: O.getOrUndefined(readString(cause, "query")),
      params: O.getOrUndefined(readArray(cause, "params")),
    };
  }

  const messageContext = parseDrizzleMessage(cause);
  if (messageContext.query !== undefined) {
    return messageContext;
  }

  const nextSeen = A.append(seen, cause);

  return O.match(readCause(cause), {
    onNone: emptyContext,
    onSome: (nestedCause) => extractNativeQueryContext(nestedCause, nextSeen),
  });
};

/**
 * Technical failure raised by the `@beep/drizzle` driver boundary.
 *
 * `operation` identifies the driver operation that failed. Optional query
 * context is captured when Drizzle's native Effect query error exposes it.
 *
 * @example
 * ```ts
 * import { DrizzleError } from "@beep/drizzle"
 * import * as O from "effect/Option"
 *
 * const error = new DrizzleError({
 *   operation: "execute",
 *   cause: O.none(),
 *   query: O.none(),
 *   params: O.none()
 * })
 *
 * void error
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class DrizzleError extends TaggedErrorClass<DrizzleError>($I`DrizzleError`)(
  "DrizzleError",
  {
    operation: S.String,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
    query: S.OptionFromOptionalKey(S.String),
    params: S.OptionFromOptionalKey(S.Unknown.pipe(S.Array)),
  },
  $I.annote("DrizzleError", {
    description: "Technical Drizzle driver failure scoped to a driver operation.",
  })
) {
  /**
   * Normalize an unknown driver failure into a {@link DrizzleError}.
   *
   * @example
   * ```ts
   * import { DrizzleError } from "@beep/drizzle"
   *
   * const error = DrizzleError.fromUnknown("execute", new Error("boom"), {
   *   query: "select 1",
   *   params: []
   * })
   *
   * void error
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown = (
    operation: string,
    cause?: unknown,
    context: DrizzleErrorContext = {}
  ): DrizzleError => {
    return O.getOrElse(existingDrizzleErrorFromUnknown(cause), () => {
      const nativeContext = extractNativeQueryContext(cause);
      return new DrizzleError({
        operation,
        cause: optionFromSafeDefect(cause),
        query: O.fromUndefinedOr(context.query ?? nativeContext.query),
        params: O.fromUndefinedOr(context.params ?? nativeContext.params),
      });
    });
  };
}
