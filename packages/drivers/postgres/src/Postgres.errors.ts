/**
 * Technical Postgres driver errors and diagnostics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PostgresId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { Cause, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { getPgErrorName, type PgErrorName } from "./Postgres.sqlstate.ts";

const $I = $PostgresId.create("Postgres.errors");

type ErrorContext = {
  readonly columnName?: string | undefined;
  readonly constraintName?: string | undefined;
  readonly detail?: string | undefined;
  readonly hint?: string | undefined;
  readonly message?: string | undefined;
  readonly params?: ReadonlyArray<unknown> | undefined;
  readonly query?: string | undefined;
  readonly schemaName?: string | undefined;
  readonly severity?: string | undefined;
  readonly sourceLocation?: string | undefined;
  readonly sqlState?: string | undefined;
  readonly sqlStateName?: PgErrorName | undefined;
  readonly tableName?: string | undefined;
  readonly where?: string | undefined;
};

const readProperty = <A>(value: object, key: string, guard: (candidate: unknown) => candidate is A): O.Option<A> =>
  pipe(
    Result.try(() => Reflect.get(value, key) as unknown),
    Result.getOrUndefined,
    O.fromUndefinedOr,
    O.filter(guard)
  );

const safeBoolean = (evaluate: () => boolean): boolean =>
  pipe(
    Result.try(evaluate),
    Result.getOrElse(() => false)
  );

const isObject = (value: unknown): value is object => safeBoolean(() => P.isObject(value));

const isError = (value: unknown): value is Error => safeBoolean(() => value instanceof Error);

const isCause = (value: unknown): value is Cause.Cause<unknown> => safeBoolean(() => Cause.isCause(value));

const isPostgresError = (value: unknown): value is PostgresError => safeBoolean(() => S.is(PostgresError)(value));

const hasSeen = (seen: ReadonlyArray<object>, value: object): boolean =>
  pipe(
    seen,
    A.some((seenValue) => seenValue === value)
  );

const readCauseReasons = (cause: Cause.Cause<unknown>): ReadonlyArray<Cause.Reason<unknown>> =>
  pipe(
    Result.try(() => cause.reasons),
    Result.getOrElse(A.empty<Cause.Reason<unknown>>)
  );

const readString = (value: unknown, key: string): O.Option<string> =>
  isObject(value) ? readProperty(value, key, P.isString) : O.none();

const readArray = (value: unknown, key: string): O.Option<ReadonlyArray<unknown>> =>
  isObject(value)
    ? readProperty(value, key, (candidate): candidate is ReadonlyArray<unknown> => A.isArray(candidate))
    : O.none();

const readUnknown = (value: unknown, key: string): O.Option<unknown> =>
  isObject(value) ? readProperty(value, key, P.isUnknown) : O.none();

const getErrorMessage = (value: unknown): O.Option<string> =>
  isError(value) ? readProperty(value, "message", P.isString) : readString(value, "message");

const readCause = (value: unknown): O.Option<unknown> =>
  isObject(value) ? O.firstSomeOf([readUnknown(value, "cause"), readUnknown(value, "reason")]) : O.none();

const firstMapped = <Input, Output>(
  values: ReadonlyArray<Input>,
  map: (value: Input) => O.Option<Output>
): O.Option<Output> =>
  A.reduce(values, O.none<Output>(), (current, value) => (O.isSome(current) ? current : map(value)));

const reasonValue = (reason: Cause.Reason<unknown>): O.Option<unknown> => {
  return pipe(
    Result.try((): O.Option<unknown> => {
      if (Cause.isFailReason(reason)) {
        return O.some(reason.error);
      }
      if (Cause.isDieReason(reason)) {
        return O.some(reason.defect);
      }
      return O.none();
    }),
    Result.getOrElse(O.none)
  );
};

const findInCause = <A>(
  cause: Cause.Cause<unknown>,
  seen: ReadonlyArray<object>,
  extract: (value: unknown, seen: ReadonlyArray<object>) => O.Option<A>
): O.Option<A> =>
  firstMapped(readCauseReasons(cause), (reason) =>
    pipe(
      reasonValue(reason),
      O.flatMap((value) => extract(value, seen))
    )
  );

const extractSourceLocation = (value: unknown): O.Option<string> => {
  const stack = isError(value) ? O.getOrUndefined(readString(value, "stack")) : undefined;
  if (stack === undefined) {
    return O.none();
  }

  for (const line of Str.split(stack, "\n")) {
    const match = line.match(/at\s+(?:.*?\s+)?\(?([^()]+):(\d+):(\d+)\)?/);
    const filePath = match?.[1];
    const lineNumber = match?.[2];
    const columnNumber = match?.[3];

    if (
      filePath !== undefined &&
      lineNumber !== undefined &&
      columnNumber !== undefined &&
      Str.startsWith("/")(filePath) &&
      !Str.includes("node_modules")(filePath)
    ) {
      return O.some(`${filePath}:${lineNumber}:${columnNumber}`);
    }
  }

  return O.none();
};

const extractPgLikeError = (value: unknown, seen: ReadonlyArray<object> = []): O.Option<object> => {
  if (!isObject(value) || hasSeen(seen, value)) {
    return O.none();
  }

  const nextSeen = A.append(seen, value);

  if (isCause(value)) {
    return findInCause(value, nextSeen, extractPgLikeError);
  }

  if (O.isSome(readString(value, "code"))) {
    return O.some(value);
  }

  return pipe(
    readCause(value),
    O.flatMap((cause) => extractPgLikeError(cause, nextSeen))
  );
};

const parseDrizzleMessage = (value: unknown): ErrorContext => {
  const message = O.getOrUndefined(getErrorMessage(value));
  const match = message?.match(/^Failed query:\s*(.+?)(?:\nparams:\s*(.*))?$/s);

  if (match === null || match === undefined) {
    return {};
  }

  const paramsText = match[2]?.trim();
  return {
    query: match[1]?.trim(),
    params: paramsText === undefined || paramsText.length === 0 ? undefined : A.of(paramsText),
  };
};

const extractDrizzleQueryContext = (
  value: unknown,
  seen: ReadonlyArray<object> = []
): Pick<ErrorContext, "params" | "query"> => {
  if (!isObject(value) || hasSeen(seen, value)) {
    return parseDrizzleMessage(value);
  }

  const nextSeen = A.append(seen, value);

  if (isCause(value)) {
    return pipe(
      firstMapped(readCauseReasons(value), (reason) =>
        pipe(
          reasonValue(reason),
          O.map((reasonCause) => extractDrizzleQueryContext(reasonCause, nextSeen)),
          O.filter((context) => context.query !== undefined || context.params !== undefined)
        )
      ),
      O.getOrElse(() => ({}))
    );
  }

  const tag = O.getOrUndefined(readUnknown(value, "_tag"));
  if (tag === "EffectDrizzleQueryError") {
    return {
      query: O.getOrUndefined(readString(value, "query")),
      params: O.getOrUndefined(readArray(value, "params")),
    };
  }

  const messageContext = parseDrizzleMessage(value);
  if (messageContext.query !== undefined) {
    return messageContext;
  }

  return O.match(readCause(value), {
    onNone: () => ({}),
    onSome: (cause) => extractDrizzleQueryContext(cause, nextSeen),
  });
};

const extractPostgresError = (value: unknown, seen: ReadonlyArray<object> = []): O.Option<PostgresError> => {
  if (isPostgresError(value)) {
    return O.some(value);
  }
  if (!isObject(value) || hasSeen(seen, value)) {
    return O.none();
  }

  const nextSeen = A.append(seen, value);

  if (isCause(value)) {
    return findInCause(value, nextSeen, extractPostgresError);
  }

  return pipe(
    readCause(value),
    O.flatMap((cause) => extractPostgresError(cause, nextSeen))
  );
};

const optionFrom = <A>(value: A | undefined): O.Option<A> => O.fromUndefinedOr(value);

const optionFromSafeDefect = (value: unknown): O.Option<unknown> =>
  !isCause(value) && safeBoolean(() => S.is(S.DefectWithStack)(value)) ? optionFrom(value) : O.none();

/**
 * Technical failure raised by the `@beep/postgres` driver boundary.
 *
 * @example
 * ```ts
 * import { PostgresError } from "@beep/postgres"
 *
 * const error = PostgresError.fromUnknown("connect", new Error("boom"))
 * void error
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class PostgresError extends TaggedErrorClass<PostgresError>($I`PostgresError`)(
  "PostgresError",
  {
    operation: S.String,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
    message: S.OptionFromOptionalKey(S.String),
    sqlState: S.OptionFromOptionalKey(S.String),
    sqlStateName: S.OptionFromOptionalKey(S.String),
    severity: S.OptionFromOptionalKey(S.String),
    detail: S.OptionFromOptionalKey(S.String),
    hint: S.OptionFromOptionalKey(S.String),
    where: S.OptionFromOptionalKey(S.String),
    schemaName: S.OptionFromOptionalKey(S.String),
    tableName: S.OptionFromOptionalKey(S.String),
    columnName: S.OptionFromOptionalKey(S.String),
    constraintName: S.OptionFromOptionalKey(S.String),
    query: S.OptionFromOptionalKey(S.String),
    params: S.OptionFromOptionalKey(S.Unknown.pipe(S.Array)),
    sourceLocation: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("PostgresError", {
    description: "Technical Postgres driver failure scoped to a driver operation.",
  })
) {
  /**
   * Normalize an unknown Postgres-adjacent failure into a {@link PostgresError}.
   *
   * @example
   * ```ts
   * import { PostgresError } from "@beep/postgres"
   *
   * const error = PostgresError.fromUnknown("query", new Error("failed"))
   * void error.operation
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown = (operation: string, cause?: unknown, context: ErrorContext = {}): PostgresError => {
    const existingError = O.getOrUndefined(extractPostgresError(cause));
    if (existingError !== undefined) {
      return existingError;
    }

    const pgError = O.getOrUndefined(extractPgLikeError(cause));
    const drizzleContext = extractDrizzleQueryContext(cause);
    const sqlState = context.sqlState ?? O.getOrUndefined(readString(pgError, "code"));
    const sqlStateName =
      context.sqlStateName ?? (sqlState === undefined ? undefined : O.getOrUndefined(getPgErrorName(sqlState)));

    return new PostgresError({
      operation,
      cause: optionFromSafeDefect(cause),
      message: optionFrom(
        context.message ?? O.getOrUndefined(getErrorMessage(pgError)) ?? O.getOrUndefined(getErrorMessage(cause))
      ),
      sqlState: optionFrom(sqlState),
      sqlStateName: optionFrom(sqlStateName),
      severity: optionFrom(context.severity ?? O.getOrUndefined(readString(pgError, "severity"))),
      detail: optionFrom(context.detail ?? O.getOrUndefined(readString(pgError, "detail"))),
      hint: optionFrom(context.hint ?? O.getOrUndefined(readString(pgError, "hint"))),
      where: optionFrom(context.where ?? O.getOrUndefined(readString(pgError, "where"))),
      schemaName: optionFrom(context.schemaName ?? O.getOrUndefined(readString(pgError, "schema"))),
      tableName: optionFrom(context.tableName ?? O.getOrUndefined(readString(pgError, "table"))),
      columnName: optionFrom(context.columnName ?? O.getOrUndefined(readString(pgError, "column"))),
      constraintName: optionFrom(context.constraintName ?? O.getOrUndefined(readString(pgError, "constraint"))),
      query: optionFrom(context.query ?? drizzleContext.query),
      params: optionFrom(context.params ?? drizzleContext.params),
      sourceLocation: optionFrom(context.sourceLocation ?? O.getOrUndefined(extractSourceLocation(cause))),
    });
  };
}

/**
 * Normalize unknown Postgres-adjacent failures into structured diagnostics.
 *
 * @example
 * ```ts
 * import { extractPostgresDiagnostics } from "@beep/postgres"
 *
 * const diagnostics = extractPostgresDiagnostics(new Error("failed"))
 * void diagnostics
 * ```
 *
 * @category error handling
 * @since 0.0.0
 */
export const extractPostgresDiagnostics = (cause: unknown): PostgresError =>
  PostgresError.fromUnknown("diagnostics", cause);
