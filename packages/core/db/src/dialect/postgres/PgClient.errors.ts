import type { UnsafeTypes } from "@beep/types";
import { SqlError } from "@effect/sql/SqlError";
import { DrizzleQueryError } from "drizzle-orm";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import postgres from "postgres";
import { PostgresErrorEnum, type PostgresErrorType, PostgresErrorTypeEnum } from "./PgError";
export const DbErrorCause = S.instanceOf(postgres.PostgresError);

const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isPostgresErrorInstance = S.is(DbErrorCause);

const isPostgresErrorLike = (value: unknown): value is { readonly name: string; readonly code: string } =>
  isPlainObject(value) &&
  (value as { readonly name?: unknown }).name === "PostgresError" &&
  typeof (value as { readonly code?: unknown }).code === "string";

const isSqlErrorInstance = S.is(S.instanceOf(SqlError));

const isSqlErrorLike = (value: unknown): value is { readonly cause?: unknown } =>
  isSqlErrorInstance(value) || (isPlainObject(value) && value._tag === "SqlError" && "cause" in value);

const isDbErrorLike = (value: unknown): value is { readonly cause: unknown } =>
  isPlainObject(value) && value._tag === "DbError" && "cause" in value;

const isFiberFailureLike = (value: unknown): value is { readonly cause: unknown } =>
  isPlainObject(value) && value._id === "FiberFailure" && "cause" in value;
/**
 * Recursively extracts PostgresError from a nested Cause structure
 */
export const extractPostgresErrorFromCause = (cause: Cause.Cause<unknown>): postgres.PostgresError | null => {
  return Cause.match(cause, {
    onEmpty: null,
    onFail: (failure) => extractPostgresError(failure),
    onDie: (defect) => extractPostgresError(defect),
    onInterrupt: () => null,
    onSequential: (left, right) => left ?? right,
    onParallel: (left, right) => left ?? right,
  });
};

/**
 * Attempts to extract a PostgresError from UnsafeTypes.UnsafeAny supported SQL error shape.
 */
export const extractPostgresErrorFromSqlError = (sqlError: unknown): postgres.PostgresError | null => {
  return extractPostgresError(sqlError);
};

const extractPostgresError = (value: unknown): postgres.PostgresError | null => {
  const visited = new Set<unknown>();
  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || current === null || visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (isPostgresErrorInstance(current)) {
      return current;
    }

    if (isPostgresErrorLike(current)) {
      return current as postgres.PostgresError;
    }

    if (current instanceof DbError) {
      return current.cause;
    }

    if (isDbErrorLike(current)) {
      queue.push(current.cause);
      continue;
    }

    if (current instanceof SqlError) {
      queue.push(current.cause);
    }

    if (isSqlErrorLike(current)) {
      queue.push(current.cause);
    }

    if (isFiberFailureLike(current)) {
      queue.push(current.cause);
    }

    if (Cause.isCause(current)) {
      const fromCause = extractPostgresErrorFromCause(current);
      if (fromCause) {
        return fromCause;
      }
    }

    if (isPlainObject(current)) {
      const candidates: ReadonlyArray<unknown> = [
        current.cause,
        current.failure,
        current.error,
        current.defect,
        current.value,
      ];

      for (const candidate of candidates) {
        if (candidate !== undefined) {
          queue.push(candidate);
        }
      }
    }

    if (Array.isArray(current)) {
      queue.push(...current);
    }
  }

  return null;
};

class PostgresError extends Data.Error<{
  name: "PostgresError";
  severity_local: string;
  severity: string;
  code: string;
  position: string;
  file: string;
  line: string;
  routine: string;

  detail?: string | undefined;
  hint?: string | undefined;
  internal_position?: string | undefined;
  internal_query?: string | undefined;
  where?: string | undefined;
  schema_name?: string | undefined;
  table_name?: string | undefined;
  column_name?: string | undefined;
  data?: string | undefined;
  type_name?: string | undefined;
  constraint_name?: string | undefined;

  /** Only set when debug is enabled */
  query: string;
  /** Only set when debug is enabled */
  parameters: UnsafeTypes.UnsafeAny[];
}> {}

export class DbError extends Data.TaggedError("DbError")<{
  readonly type: PostgresErrorType | "UNKNOWN";
  readonly cause: postgres.PostgresError;
}> {
  public override toString() {
    return `DbError: ${this.cause.message}`;
  }

  public override get message() {
    return this.cause.message;
  }

  static readonly match = (error: unknown) => {
    if (error instanceof DbError) {
      return error;
    }

    if (error instanceof DrizzleQueryError) {
      const query = error.query;
      const parameters = error.params;
      const cause = F.pipe(error, JSON.stringify, JSON.parse, (parsed) => {
        return new PostgresError({
          ...parsed?.cause?.cause?.failure?.cause,
          parameters,
          query,
        });
      });

      return new DbError({
        type: PostgresErrorTypeEnum[cause.code as keyof typeof PostgresErrorTypeEnum],
        cause,
      });
    }

    if (error instanceof SqlError && error.cause instanceof DrizzleQueryError) {
      const query = error?.cause?.query;
      const params = error?.cause?.params;
      const cause = F.pipe(error?.cause, JSON.stringify, JSON.parse, (parsed) => {
        const pgError: PostgresError = JSON.parse(JSON.stringify(parsed?.cause)).cause?.failure?.cause;
        return new PostgresError({ ...pgError, query: query, parameters: params });
      });
      const code = cause.code;
      return new DbError({
        type: PostgresErrorTypeEnum[code as keyof typeof PostgresErrorTypeEnum],
        cause,
      });
    }
    const postgresError = extractPostgresErrorFromSqlError(error);

    if (!postgresError) {
      throw new Error(`Unknown error: ${error}`);
    }

    return matchPgError(postgresError);
  };
}

export const matchPgError = (error: S.Schema.Type<typeof DbErrorCause>) => {
  const code = error.code as keyof typeof PostgresErrorEnum;
  return new DbError({ type: PostgresErrorTypeEnum[code as keyof typeof PostgresErrorTypeEnum], cause: error });
};
export { PostgresErrorEnum };
