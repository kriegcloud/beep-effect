/**
 * @module organization/set-active
 *
 * Set the active organization.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { Organization } from "@beep/iam-domain/entities";
import { $IamDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/set-active");

/**
 * Payload for setting the active organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    organizationId: S.optionalWith(SharedEntityIds.OrganizationId, { as: "Option", nullable: true }).annotations({
      description: "The organization ID to set as active.",
    }),
    organizationSlug: S.optionalWith(Organization.Model.fields.slug, { as: "Option", nullable: true }).annotations({
      description: "The organization slug to set as active. Can be null to unset.",
    }),
  },
  $I.annotations("SetActivePayload", {
    description: "Payload for setting the active organization.",
  })
) {}

/**
 * Success response with the active organization.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    organization: S.optionalWith(Organization.Model, { as: "Option", nullable: true }).annotations({
      description: "The newly active organization, or null if unset.",
    }),
  },
  $I.annotations("SetActiveSuccess", {
    description: "Success response with the active organization.",
  })
) {}

/**
 * Set active organization endpoint contract.
 *
 * POST /organization/set-active
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("set-active", "/set-active")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to set the active organization.",
      })
    )
  );
