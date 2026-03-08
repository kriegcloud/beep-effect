import { $SharedDomainId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import { Match } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { ErrorCodeFromKey } from "./ErrorEnum.js";
import { extractPgError, formatDbError, RawPgError } from "./utils.js";

const $I = $SharedDomainId.create("errors/DbError/DbError");

type RawPgErrorType = typeof RawPgError.Type;
type KnownErrorCode = typeof ErrorCodeFromKey.Type;
type KnownRawPgError = RawPgErrorType & { readonly code: KnownErrorCode };

const hasKnownErrorCode = (error: RawPgErrorType): error is KnownRawPgError =>
  Match.value(error.code).pipe(Match.when(P.isString, S.is(ErrorCodeFromKey)), Match.orElse(thunkFalse));

/**
 * Typed shared domain error for normalized PostgreSQL and wrapper failures.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DbError extends TaggedErrorClass<DbError>($I`DbError`)("DbError", {
  type: S.OptionFromOptionalKey(ErrorCodeFromKey.From),
  pgError: S.OptionFromOptionalKey(RawPgError),
  cause: S.DefectWithStack,
  customMessage: S.OptionFromOptionalKey(S.String),
}) {
  static readonly $match = (error: unknown, customMessage?: undefined | string) => {
    const pgError = extractPgError(error);

    const shared = {
      cause: error,
      customMessage: O.fromNullishOr(customMessage),
    } as const;

    if (P.isNotNull(pgError)) {
      const makeSharedPg = (params: KnownRawPgError) =>
        new DbError({
          ...shared,
          type: O.some(params.code),
          pgError: O.some(params),
        });

      return Match.value(pgError).pipe(
        Match.when({ code: ErrorCodeFromKey.Enum.UNIQUE_VIOLATION }, makeSharedPg),
        Match.when({ code: ErrorCodeFromKey.Enum.FOREIGN_KEY_VIOLATION }, makeSharedPg),
        Match.when({ code: ErrorCodeFromKey.Enum.CHECK_VIOLATION }, makeSharedPg),
        Match.when(hasKnownErrorCode, makeSharedPg),
        Match.orElse(
          () =>
            new DbError({
              ...shared,
              type: O.some(ErrorCodeFromKey.Enum.UNKNOWN),
              pgError: O.some(pgError),
            })
        )
      );
    }

    return new DbError({
      ...shared,
      type: O.some(ErrorCodeFromKey.Enum.UNKNOWN),
      pgError: O.none(),
    });
  };

  static readonly format = formatDbError;
}

/**
 * PostgreSQL unique-violation error code.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const uniqueViolation = ErrorCodeFromKey.Enum.UNIQUE_VIOLATION;
