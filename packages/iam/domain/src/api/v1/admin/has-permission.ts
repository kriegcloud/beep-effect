/**
 * @module has-permission
 *
 * Domain contract for checking admin permissions.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/admin/has-permission");

/**
 * Permission object schema.
 *
 * @since 0.1.0
 * @category Schema
 */
export const PermissionObject = S.Record({ key: S.String, value: S.Unknown }).annotations({
  description: "A permission object with key-value pairs.",
});

/**
 * Payload for checking admin permissions.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    /**
     * A single permission to check.
     */
    permission: S.optionalWith(PermissionObject, { as: "Option", exact: true }).annotations({
      description: "A single permission to check.",
    }),

    /**
     * Multiple permissions to check.
     */
    permissions: PermissionObject.annotations({
      description: "Multiple permissions to check.",
    }),
  },
  $I.annotations("HasPermissionPayload", {
    description: "Payload for checking admin permissions.",
  })
) {}

/**
 * Success response after checking permissions.
 *
 * @since 0.1.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    /**
     * Whether the user has the requested permissions.
     */
    success: S.Boolean.annotations({
      description: "Whether the user has the requested permissions.",
    }),

    /**
     * Error message if permission check failed.
     */
    error: S.optionalWith(S.String, { as: "Option", exact: true }).annotations({
      description: "Error message if permission check failed.",
    }),
  },
  $I.annotations("HasPermissionSuccess", {
    description: "Success response after checking permissions.",
  })
) {}

/**
 * Has permission endpoint contract.
 *
 * POST /admin/has-permission
 *
 * Checks if the current user has specific permissions.
 *
 * @since 0.1.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("has-permission", "/admin/has-permission")
  .setPayload(Payload)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to check permissions.",
      })
    )
  )
  .addSuccess(Success);
