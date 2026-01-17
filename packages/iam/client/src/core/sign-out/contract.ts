import * as Common from "@beep/iam-client/_common";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/sign-out");

export class Success extends S.Class<Success>($I`Success`)({
  success: S.Boolean,
}) {}
export const Wrapper = W.Wrapper.make("SignOut", {
  success: Success,
  error: Common.IamError,
});
