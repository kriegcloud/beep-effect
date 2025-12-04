import * as pg from "pg";
import * as Match from "effect/Match";
import {thunkNull} from "@beep/utils/thunk";
import * as S from "effect/Schema";
import {PgErrorCodeFromKey} from "./pg-error-enum";
import {$SharedInfraId} from "@beep/identity/packages";


const $I = $SharedInfraId.create("Db/pg/errors");
export class RawPgError extends S.declare(
  (error: unknown): error is pg.DatabaseError => error instanceof pg.DatabaseError
) {
  static readonly is = S.is(RawPgError);
}

export class DatabaseError extends S.TaggedError<DatabaseError>($I`DatabaseError`)("DatabaseError", {
  type: PgErrorCodeFromKey.From,
  pgError: RawPgError,
  cause: S.Defect
}) {
  static readonly $match = (error: unknown) => {
    if (RawPgError.is(error)) {
      return Match.value(error).pipe(
        Match.when({code: PgErrorCodeFromKey.Enum.UNIQUE_VIOLATION}, (error) => new DatabaseError({
          type: PgErrorCodeFromKey.EnumReverse[error.code],
          pgError: error,
          cause: error
        })),
        Match.when({code: PgErrorCodeFromKey.Enum.FOREIGN_KEY_VIOLATION}, (error) => new DatabaseError({
          type: PgErrorCodeFromKey.EnumReverse[error.code],
          pgError: error,
          cause: error
        })),
        Match.when({code: PgErrorCodeFromKey.Enum.CONNECTION_EXCEPTION}, (error) => new DatabaseError({
          type: PgErrorCodeFromKey.EnumReverse[error.code],
          pgError: error,
          cause: error
        })),
        Match.orElse(thunkNull)
      );
    }
    return null;
  };
}