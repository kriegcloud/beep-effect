import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Session } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

export const $I = $IamDomainId.create("api/v1/core/list-sessions");

export class Success extends S.Class<Success>($I`Success`)(
  {
    sessions: S.Array(Session.Model).annotations({
      description: "List of active sessions for the user.",
    }),
  },
  $I.annotations("ListSessionsSuccess", {
    description: "Success response with list of sessions.",
  })
) {}

export const Contract = HttpApiEndpoint.get("listSessions", "/list-sessions")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
