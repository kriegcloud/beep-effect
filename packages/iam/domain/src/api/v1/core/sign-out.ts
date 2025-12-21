import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/sign-out");

export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("SignOutSuccess", {
    description: "Sign out success response",
  })
) {}

export const Contract = HttpApiEndpoint.post("signOut", "/sign-out").addSuccess(Success).addError(IamAuthError);
