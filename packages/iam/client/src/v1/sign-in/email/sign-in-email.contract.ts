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
  // Default form values use Encoded types (plain strings for Redacted fields, etc.)
  Common.withFormAnnotations(
    $I.annotations("Payload", {
      description: "The payload for signing in with an email and password.",
    }),
    {
      email: "",
      password: "",
      rememberMe: true,
      callbackURL: "/",
    }
  )
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    redirect: S.optionalWith(S.Boolean, { default: () => true }),
    token: S.optionalWith(S.Redacted(S.String), { as: "Option", nullable: true }),
    url: BS.OptionFromNullishOptionalProperty(BS.URLString, null),
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "The success response for signing in with an email and password.",
  })
) {}
