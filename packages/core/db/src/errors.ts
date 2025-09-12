import * as Match from "effect/Match";
import * as S from "effect/Schema";
import * as pg from "pg";
export class DbConnectionLostError extends S.TaggedError<DbConnectionLostError>("DbConnectionLostError")(
  "DbConnectionLostError",
  {
    cause: S.Unknown,
    message: S.String,
  }
) {}

export const DbErrorType = S.Literal("unique_violation", "foreign_key_violation", "connection_error");

export const DbErrorCause = S.instanceOf(pg.DatabaseError);

export class DbError extends S.TaggedError<DbError>("DbError")("DbError", {
  type: DbErrorType,
  cause: DbErrorCause,
}) {
  public override toString() {
    return `DbError: ${this.cause.message}`;
  }

  public override get message() {
    return this.cause.message;
  }

  static readonly match = (error: unknown) => {
    if (S.is(DbErrorCause)(error)) {
      return matchPgError(error);
    }
    return null;
  };
}

export const matchPgError = Match.type<S.Schema.Type<typeof DbErrorCause>>().pipe(
  Match.when({ code: "23505" }, (m) => new DbError({ type: "unique_violation", cause: m })),
  Match.when({ code: "23503" }, (m) => new DbError({ type: "foreign_key_violation", cause: m })),
  Match.when({ code: "08000" }, (m) => new DbError({ type: "connection_error", cause: m })),
  Match.orElse(() => null)
);
