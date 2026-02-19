/**
 * @module organization/list-members
 *
 * List all members of an organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Member } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/list-members");

/**
 * Success response with list of members.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    members: S.Array(Member.Model).annotations({
      description: "List of organization members.",
    }),
  },
  $I.annotations("ListMembersSuccess", {
    description: "Success response with list of organization members.",
  })
) {}

/**
 * List members endpoint contract.
 *
 * GET /organization/list-members
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.get("list-members", "/list-members")
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      HttpApiSchema.annotations({
        status: BS.HttpStatusCode.DecodedEnum.UNAUTHORIZED,
      })
    )
  );
