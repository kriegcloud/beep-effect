import { $IamClientId } from "@beep/identity/packages";
import { hasProperties } from "@beep/utils";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_common/errors");

export class BetterAuthError extends S.Class<BetterAuthError>($I`BetterAuthError`)(
  {
    code: S.String,
    message: S.String,
    status: S.Number,
    statusText: S.String,
  },
  $I.annotations("BetterAuthError", {
    description: "An error from a better-auth method",
  })
) {}

export declare namespace BetterAuthError {
  export type Type = typeof BetterAuthError.Type;
}

export class UnknownIamError extends S.TaggedError<UnknownIamError>($I`UnknownIamError`)("UnknownIamError", {
  cause: S.Defect,
}) {
  override get message() {
    return "An unknown error occurred";
  }
}

export class IamBetterAuthError extends S.TaggedError<IamBetterAuthError>($I`IamError`)(
  "IamError",
  {
    cause: BetterAuthError,
    message: S.String,
  },
  $I.annotations("IamError", {
    description: "An error from the IAM client",
  })
) {}

export class IamError extends S.Union(IamBetterAuthError, UnknownIamError) {
  static readonly fromUnknown = (error: unknown): IamError.Type => {
    if (
      P.isObject(error) &&
      hasProperties("code", "message", "status", "statusText")(error) &&
      P.struct({
        code: P.isString,
        message: P.isString,
        status: P.isNumber,
        statusText: P.isString,
      })(error)
    ) {
      console.log("error: ", error);
      return new IamBetterAuthError({
        cause: new BetterAuthError(error),
        message: error.message,
      });
    }
    return new UnknownIamError({
      cause: error,
    });
  };
}

export declare namespace IamError {
  export type Type = typeof IamError.Type;
}
