import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import { formValuesAnnotation } from "../../_common";

const $I = $IamClientId.create("sign-in/username/sign-in-username.contract");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    username: S.String,
    password: Common.UserPassword,
  },
  // Default form values use Encoded types (plain strings for Redacted fields, etc.)
  formValuesAnnotation({
    username: "",
    password: "",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    redirect: S.optionalWith(S.Boolean, { default: () => true }),
    token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
    url: BS.OptionFromNullishOptionalProperty(BS.URLString, null),
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "The success response for signing in with a username and password.",
  })
) {}

export const Wrapper = W.Wrapper.make("Username", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
}).middleware(Common.CaptchaMiddleware);
