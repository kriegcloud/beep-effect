/**
 * @module create-user
 *
 * Domain contract for admin creating a user.
 *
 * @category exports
 * @since 0.1.0
 */

import { CommonFields, IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import { User } from "@beep/shared-domain/entities";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/create-user");

/**
 * Payload for admin creating a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * The email of the user.
     */
    email: CommonFields.UserEmail,

    /**
     * The password of the user.
     */
    password: CommonFields.UserPassword,

    /**
     * The name of the user.
     */
    name: CommonFields.Name,

    /**
     * The role to assign to the user.
     */
    role: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "The role to assign to the user.",
    }),

    /**
     * Additional data for the user.
     */
    data: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { as: "Option", exact: true }).annotations({
      description: "Additional data for the user.",
    }),
  },
  $I.annotations("CreateUserPayload", {
    description: "Payload for admin creating a user.",
  })
) {}

/**
 * Success response after admin creating a user.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * The created user object.
     */
    user: S.optionalWith(User.Model, { as: "Option", exact: true }).annotations({
      description: "The created user object.",
    }),
  },
  $I.annotations("CreateUserSuccess", {
    description: "Success response after admin creating a user.",
  })
) {}

/**
 * Admin create user endpoint contract.
 *
 * POST /admin/create-user
 *
 * Creates a new user as an admin.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("create-user", "/admin/create-user")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to create user.",
      })
    )
  )
  .addSuccess(Success);
