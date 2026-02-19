import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Session, User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export const $I = $IamDomainId.create("api/v1/core/get-session");

export class Success extends S.Class<Success>($I`Success`)(
  {
    user: User.Model,
    session: Session.Model,
  },
  $I.annotations("GetSessionSuccess", {
    description: "Session response when idToken is provided.",
  })
) {}

export const Contract = HttpApiEndpoint.get("getSession", "/get-session")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
