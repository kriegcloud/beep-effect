import * as Common from "@beep/iam-client/_common";
import { Contract, ContractKit } from "@beep/iam-client/_contract";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/email");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: Common.UserEmail,
    password: Common.UserPassword,
    rememberMe: Common.RememberMe,
    callbackURL: Common.CallbackURL,
  },
  // Default form values use Encoded types (plain strings for Redacted fields, etc.)
  [
    undefined,
    {
      [BS.DefaultFormValuesAnnotationId]: {
        email: "",
        password: "",
        rememberMe: true,
        callbackURL: "/",
      },
      undefined,
    },
  ]
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

export const C = Contract.make("Email", {
  description: "The contract for signing in with an email and password.",
  parameters: Payload.fields,
  success: Success,
});

export const Kit = ContractKit.make(C);
