import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as Common from "../../_common";

const $I = $IamClientId.create("sign-in/email");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: Common.UserEmail,
    password: Common.UserPassword,
    rememberMe: Common.RememberMe,
    callbackURL: Common.CallbackURL,
  },
  $I.annotations("Payload", {
    description: "The payload for signing in with an email and password.",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    redirect: S.Boolean,
    token: S.Redacted(S.String),
    url: BS.OptionFromNullishOptionalProperty(BS.URLString, null),
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "The success response for signing in with an email and password.",
  })
) {}
