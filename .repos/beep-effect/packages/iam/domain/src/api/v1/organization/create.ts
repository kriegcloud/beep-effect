/**
 * @module organization/create
 *
 * Create a new organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Organization } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/create");

/**
 * Payload for creating an organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    ...Organization.Model.select.pick(
      "name",
      "slug",
      "logo",
      "metadata",
      "type",
      "ownerUserId",
      "isPersonal",
      "subscriptionTier",
      "subscriptionStatus"
    ).fields,
    maxMembers: S.NonNegativeInt,
    features: S.optionalWith(S.String, { as: "Option", exact: true }),
    settings: S.optionalWith(S.String, { as: "Option", exact: true }),
  },
  $I.annotations("CreateOrganizationPayload", {
    description: "Payload for creating an organization.",
  })
) {}

/**
 * Create organization endpoint contract.
 *
 * POST /organization/create
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("create", "/create")
  .setPayload(Payload)
  .addSuccess(Organization.Model)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to create the organization.",
      })
    )
  );
