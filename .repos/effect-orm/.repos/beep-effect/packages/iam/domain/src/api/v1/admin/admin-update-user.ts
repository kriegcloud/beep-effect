/**
 * @module admin-update-user
 *
 * Domain contract for admin updating a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/admin-update-user");

/**
 * User data schema for admin updates.
 *
 * @since 0.1.0
 * @category Schema
 */
export const UserData = S.Struct({
  /**
   * The name of the user.
   */
  name: S.optionalWith(BS.NameAttribute, { as: "Option", exact: true }).annotations({
    description: "The name of the user.",
  }),

  /**
   * The email of the user.
   */
  email: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
    description: "The email of the user.",
  }),

  /**
   * The role of the user.
   */
  role: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
    description: "The role of the user.",
  }),

  /**
   * Whether the user is banned.
   */
  banned: S.optionalWith(S.Boolean, { as: "Option", exact: true }).annotations({
    description: "Whether the user is banned.",
  }),

  /**
   * The reason for banning the user.
   */
  banReason: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
    description: "The reason for banning the user.",
  }),

  /**
   * When the ban expires.
   */
  banExpires: S.optionalWith(S.Number, { as: "Option", nullable: true }).annotations({
    description: "When the ban expires (timestamp).",
  }),

  /**
   * The image URL of the user.
   */
  image: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
    description: "The image URL of the user.",
  }),
}).annotations(
  $I.annotations("UserData", {
    description: "User data for admin updates.",
  })
);

/**
 * Payload for admin updating a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The ID of the user to update.
     */
    userId: S.String.annotations({
      description: "The ID of the user to update.",
    }),

    /**
     * The data to update on the user.
     */
    data: UserData,
  },
  $I.annotations("AdminUpdateUserPayload", {
    description: "Payload for admin updating a user.",
  })
) {}

/**
 * Success response after admin updating a user.
 *
 * @since 0.1.0
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
  $I.annotations("AdminUpdateUserSuccess", {
    description: "Success response after admin updating a user.",
  })
) {}

/**
 * Admin update user endpoint contract.
 *
 * POST /admin/update-user
 *
 * Updates a user as an admin.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("admin-update-user", "/admin/update-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to update user.",
      })
    )
  )
  .addSuccess(Success);
