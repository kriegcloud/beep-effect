import type { UnsafeTypes } from "@beep/types";
import { SqlError } from "@effect/sql/SqlError";
import * as Cause from "effect/Cause";
import * as Data from "effect/Data";
import * as S from "effect/Schema";
import postgres from "postgres";
// import type { DrizzleQueryError } from "drizzle-orm/errors";
import { type PostgresError, ReversedPostgresError } from "./postgres/postgres-error.enum";

export const DbErrorCause = S.instanceOf(postgres.PostgresError);

/**
 * Recursively extracts PostgresError from a nested Cause structure
 */
export const extractPostgresErrorFromCause = (cause: Cause.Cause<unknown>): postgres.PostgresError | null => {
  return Cause.match(cause, {
    onEmpty: () => null,
    onFail: (error) => {
      // Check if the error is a SqlError with a nested cause that might contain a PostgresError
      if (S.is(S.instanceOf(SqlError))(error)) {
        const sqlError = error as UnsafeTypes.UnsafeAny;
        if (sqlError.cause && typeof sqlError.cause === "object") {
          // The cause might be a PostgresError directly or another nested structure
          if (S.is(DbErrorCause)(sqlError.cause)) {
            return sqlError.cause;
          }
          // If it's another Cause, recurse into it
          if (sqlError.cause._id === "Cause") {
            return extractPostgresErrorFromCause(sqlError.cause);
          }
        }
      }
      // Check if error is directly a PostgresError
      if (S.is(DbErrorCause)(error)) {
        return error;
      }
      return null;
    },
    onDie: (defect) => {
      // Check if defect is a PostgresError
      if (S.is(DbErrorCause)(defect)) {
        return defect;
      }
      return null;
    },
    onInterrupt: () => null,
    onSequential: (left, right) => {
      // Try to extract from left cause first, then right
      return extractPostgresErrorFromCause(left) ?? extractPostgresErrorFromCause(right);
    },
    onParallel: (left, right) => {
      // Try to extract from left cause first, then right
      return extractPostgresErrorFromCause(left) ?? extractPostgresErrorFromCause(right);
    },
  });
};

/**
 * Extracts PostgresError from a SqlError by drilling down through nested cause structures
 */
export const extractPostgresErrorFromSqlError = (sqlError: unknown): postgres.PostgresError | null => {
  // Check if it's directly a PostgresError
  if (S.is(DbErrorCause)(sqlError)) {
    return sqlError;
  }

  // Check if it has a cause property to drill into
  if (sqlError && typeof sqlError === "object" && "cause" in sqlError) {
    const cause = (sqlError as any).cause;
    if (cause && typeof cause === "object") {
      // If it has a Cause structure, use our recursive extractor
      if (cause._id === "Cause") {
        return extractPostgresErrorFromCause(cause);
      }
      // Check if cause is directly a PostgresError
      if (S.is(DbErrorCause)(cause)) {
        return cause;
      }
    }
  }

  return null;
};

export class DbError extends Data.TaggedError("DbError")<{
  readonly type: keyof typeof PostgresError;
  readonly cause: postgres.PostgresError;
  // readonly drizzleError: DrizzleQueryError | null
}> {
  public override toString() {
    return `DbError: ${this.cause.message}`;
  }

  public override get message() {
    return this.cause.message;
  }

  static readonly match = (error: unknown) => {
    // Try to extract PostgresError from nested SqlError structure
    const postgresError = extractPostgresErrorFromSqlError(error);
    if (!postgresError) {
      console.error("Unknown error: ", error);
      throw new Error(`Unknown error: ${error}`);
    }

    return matchPgError(postgresError);
  };
}
export const matchPgError = (error: S.Schema.Type<typeof DbErrorCause>) => {
  const code = error.code as (typeof PostgresError)[keyof typeof PostgresError];
  return new DbError({ type: ReversedPostgresError[code], cause: error });
};
export type { PostgresError };
