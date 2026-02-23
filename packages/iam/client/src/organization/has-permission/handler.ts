/**
 * @fileoverview
 * Handler for checking if user has permission.
 *
 * @module @beep/iam-client/organization/has-permission/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for checking if user has permission.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.HasPermission.Handler({
 *   permission: { posts: ["create", "read"] }
 * })
 * // result.success is true if user has the permission
 * ```
 *
 * @category Organization/HasPermission
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.hasPermission(encoded))
);
