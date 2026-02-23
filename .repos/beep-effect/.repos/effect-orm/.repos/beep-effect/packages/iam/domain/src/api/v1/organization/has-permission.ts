/**
 * @module organization/has-permission
 *
 * Check if the user has a specific permission.
 *
 * @category Contract
 * @since 1.0.0
 */

import { IamAuthError } from "@beep/iam-domain/api/common";
import { $IamDomainId } from "@beep/identity/packages";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("api/v1/organization/has-permission");

/**
 * Permission object for checking.
 *
 * @since 1.0.0
 * @category Schema
 */
export const PermissionObject = S.Record({ key: S.String, value: S.Unknown }).annotations({
  description: "Permission object to check.",
});

/**
 * Payload for checking permission.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    permission: S.optionalWith(PermissionObject, { as: "Option", exact: true }).annotations({
      description: "The permission to check (single permission).",
    }),
    permissions: PermissionObject.annotations({
      description: "The permissions to check.",
    }),
  },
  $I.annotations("HasPermissionPayload", {
    description: "Payload for checking permissions.",
  })
) {}

/**
 * Success response for permission check.
 *
 * @since 1.0.0
 * @category Schema
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    error: S.optionalWith(S.String, { as: "Option", nullable: true }).annotations({
      description: "Error message if permission check failed.",
    }),
    success: S.Boolean.annotations({
      description: "Whether the user has the permission.",
    }),
  },
  $I.annotations("HasPermissionSuccess", {
    description: "Success response for permission check.",
  })
) {}

/**
 * Has permission endpoint contract.
 *
 * POST /organization/has-permission
 *
 * @since 1.0.0
 * @category Contract
 */
export const Contract = HttpApiEndpoint.post("has-permission", "/has-permission")
  .setPayload(Payload)
  .addSuccess(Success)
  .addError(
    IamAuthError.annotations(
      $I.annotations("IamAuthError", {
        description: "An error indicating a failure to check permission.",
      })
    )
  );
