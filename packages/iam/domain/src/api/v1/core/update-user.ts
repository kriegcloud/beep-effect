import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/update-user");

/**
 * Payload for updating a user's profile.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The name of the user.
     */
    name: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The name of the user.",
    }),

    /**
     * The image URL of the user.
     */
    image: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The image URL of the user.",
    }),
  },
  $I.annotations("UpdateUserPayload", {
    description: "Payload for updating a user's profile.",
  })
) {}

/**
 * Success response after updating a user's profile.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The updated user object.
     */
    user: S.optionalWith(User.Model, { as: "Option", exact: true }).annotations({
      description: "The updated user object.",
    }),
  },
  $I.annotations("UpdateUserSuccess", {
    description: "Success response after updating a user's profile.",
  })
) {}

/**
 * Update user endpoint contract.
 *
 * POST /update-user
 *
 * Updates the authenticated user's profile (name and/or image).
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("update-user", "/update-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to update user.",
      })
    )
  )
  .addSuccess(Success);
