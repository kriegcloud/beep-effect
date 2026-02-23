/**
 * @fileoverview
 * Handler for updating an organization role.
 *
 * @module @beep/iam-client/organization/update-role/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for updating an organization role.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.UpdateRole.Handler({
 *   roleName: "editor",
 *   data: { permission: { posts: ["create", "read", "update", "delete"] } }
 * })
 * ```
 *
 * @category Organization/UpdateRole
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
    // Better Auth type requires additional fields in data, but runtime accepts our payload
  })((encoded) => client.organization.updateRole(encoded as Parameters<typeof client.organization.updateRole>[0]))
);
