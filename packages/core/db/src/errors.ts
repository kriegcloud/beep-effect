import { SqlError } from "@effect/sql/SqlError";
import { DrizzleQueryError } from "drizzle-orm";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import postgres from "postgres";
import { type PostgresError, type PostgresErrorCodeKey, ReversedPostgresError } from "./postgres/postgres-error.enum";

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
 * Attempts to extract a PostgresError from any supported SQL error shape.
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

export class DbError extends Data.TaggedError("DbError")<{
  readonly type: keyof typeof PostgresError;
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
        return new postgres.PostgresError({
          ...parsed?.cause?.cause?.failure?.cause,
          parameters,
          query,
        });
      });

      return new DbError({
        type: ReversedPostgresError[cause.code as PostgresErrorCodeKey],
        cause,
      });
    }

    if (error instanceof SqlError && error.cause instanceof DrizzleQueryError) {
      const query = error?.cause?.query;
      const params = error?.cause?.params;
      const cause = F.pipe(error?.cause, JSON.stringify, JSON.parse, (parsed) => {
        const pgError = JSON.parse(JSON.stringify(parsed?.cause)).cause?.failure?.cause;
        return new postgres.PostgresError({ ...pgError, query, parameters: params });
      });
      return new DbError({
        type: ReversedPostgresError[cause.code as PostgresErrorCodeKey],
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
  const code = error.code as PostgresErrorCodeKey;
  return new DbError({ type: ReversedPostgresError[code], cause: error });
};
export type { PostgresError };
