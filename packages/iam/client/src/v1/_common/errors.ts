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
