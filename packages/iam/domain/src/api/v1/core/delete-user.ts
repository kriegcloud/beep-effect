import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/core/delete-user");

/**
 * Payload for deleting a user account.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The callback URL to redirect to after the user is deleted.
     */
    callbackURL: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The callback URL to redirect to after the user is deleted.",
    }),

    /**
     * The user's password. Required if session is not fresh.
     */
    password: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The user's password. Required if session is not fresh.",
    }),

    /**
     * The deletion verification token.
     */
    token: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The deletion verification token.",
    }),
  },
  $I.annotations("DeleteUserPayload", {
    description: "Payload for deleting a user account.",
  })
) {}

/**
 * Success response after deleting a user account.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Indicates if the operation was successful.
     */
    success: S.Boolean.annotations({
      description: "Indicates if the operation was successful.",
    }),

    /**
     * Status message of the deletion process.
     */
    message: S.String.annotations({
      description: "Status message of the deletion process.",
    }),
  },
  $I.annotations("DeleteUserSuccess", {
    description: "Success response after deleting a user account.",
  })
) {}

/**
 * Delete user endpoint contract.
 *
 * POST /delete-user
 *
 * Deletes the authenticated user's account.
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("delete-user", "/delete-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to delete user.",
      })
    )
  )
  .addSuccess(Success);
