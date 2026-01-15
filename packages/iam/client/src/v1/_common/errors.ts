import { $IamClientId } from "@beep/identity/packages";
import { BetterAuthError as _BetterAuthError } from "@better-auth/core/error";
import * as S from "effect/Schema";

const $I = $IamClientId.create("_common/errors");

export class BetterAuthError extends S.instanceOf(_BetterAuthError).annotations(
  $I.annotations("BetterAuthError", {
    description: "An error from the BetterAuth library",
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

export class IamError extends S.TaggedError<IamError>($I`IamError`)(
  "IamError",
  {
    cause: BetterAuthError,
    message: S.String,
  },
  $I.annotations("IamError", {
    description: "An error from the IAM client",
  })
) {
  static readonly fromUnknown = (error: unknown) => {
    if (S.is(BetterAuthError)(error)) {
      return new IamError({
        cause: error,
        message: error.message,
      });
    }
    return new UnknownIamError({
      cause: error,
    });
  };
}
