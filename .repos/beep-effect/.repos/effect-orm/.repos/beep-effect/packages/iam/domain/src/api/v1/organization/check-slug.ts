/**
 * @module organization/check-slug
 *
 * Check if an organization slug is available.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/check-slug");

/**
 * Payload for checking slug availability.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    slug: S.String.annotations({
      description: "The organization slug to check. E.g., 'my-org'.",
    }),
  },
  $I.annotations("CheckSlugPayload", {
    description: "Payload for checking organization slug availability.",
  })
) {}

/**
 * Success response for slug check.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    available: S.Boolean.annotations({
      description: "Whether the slug is available.",
    }),
  },
  $I.annotations("CheckSlugSuccess", {
    description: "Success response indicating slug availability.",
  })
) {}

/**
 * Check slug endpoint contract.
 *
 * POST /organization/check-slug
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("check-slug", "/check-slug")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to check the slug.",
      })
    )
  );
