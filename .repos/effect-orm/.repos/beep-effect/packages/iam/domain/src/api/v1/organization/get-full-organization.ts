/**
 * @module organization/get-full-organization
 *
 * Get the full organization details.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Invitation, Member } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Organization } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/get-full-organization");

/**
 * Full organization response with members and invitations.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    ...Organization.Model.fields,
    members: S.Array(Member.Model).annotations({
      description: "List of organization members.",
    }),
    invitations: S.Array(Invitation.Model).annotations({
      description: "List of pending invitations.",
    }),
  },
  $I.annotations("GetFullOrganizationSuccess", {
    description: "Full organization details with members and invitations.",
  })
) {}

/**
 * Get full organization endpoint contract.
 *
 * GET /organization/get-full-organization
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("get-full-organization", "/get-full-organization")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
