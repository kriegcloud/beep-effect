/**
 * Technical errors raised by the Drizzle driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DrizzleId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { Str, thunkEmptyRecord } from "@beep/utils";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $DrizzleId.create("Drizzle.errors");

type DrizzleErrorContext = {
  readonly params?: ReadonlyArray<unknown> | undefined;
  readonly query?: string | undefined;
};

const readString = (value: unknown, key: string): O.Option<string> => {
  if (!P.isObject(value)) {
    return O.none();
  }

  const candidate = Reflect.get(value, key);
  return P.isString(candidate) ? O.some(candidate) : O.none();
};

const readArray = (value: unknown, key: string): O.Option<ReadonlyArray<unknown>> => {
  if (!P.isObject(value)) {
    return O.none();
  }

  const candidate = Reflect.get(value, key);
  return A.isArray(candidate) ? O.some(candidate) : O.none();
};

const readCause = (value: unknown): O.Option<unknown> => {
  if (!P.isObject(value)) {
    return O.none();
  }

  const cause = Reflect.get(value, "cause");
  return O.fromUndefinedOr(cause);
};

const parseDrizzleMessage = (cause: unknown): DrizzleErrorContext => {
  if (!(cause instanceof Error)) {
    return {};
  }

  const match = cause.message.match(/^Failed query:\s*(.+?)(?:\nparams:\s*(.*))?$/s);
  if (match === null) {
    return {};
  }

  const paramsText = match[2]?.trim();
  return {
    query: match[1]?.trim(),
    params:
      paramsText === undefined || paramsText.length === 0 ? undefined : A.map(Str.split(",")(paramsText), Str.trim),
  };
};

const extractNativeQueryContext = (cause: unknown, seen: ReadonlyArray<object> = []): DrizzleErrorContext => {
  if (!P.isObject(cause) || A.contains(seen, cause)) {
    return parseDrizzleMessage(cause);
  }

  if (Reflect.get(cause, "_tag") === "EffectDrizzleQueryError") {
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
    onNone: thunkEmptyRecord,
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
    const nativeContext = extractNativeQueryContext(cause);
    return new DrizzleError({
      operation,
      cause: O.fromUndefinedOr(cause),
      query: O.fromUndefinedOr(context.query ?? nativeContext.query),
      params: O.fromUndefinedOr(context.params ?? nativeContext.params),
    });
  };
}
