/**
 * @module organization/list-invitations
 *
 * List all invitations for an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Invitation } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/list-invitations");

/**
 * Success response with list of invitations.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    invitations: S.Array(Invitation.Model).annotations({
      description: "List of invitations for the organization.",
    }),
  },
  $I.annotations("ListInvitationsSuccess", {
    description: "Success response with list of invitations.",
  })
) {}

/**
 * List invitations endpoint contract.
 *
 * GET /organization/list-invitations
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("list-invitations", "/list-invitations")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
