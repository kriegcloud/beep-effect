/**
 * @fileoverview
 * Handler for deleting an organization role.
 *
 * @module @beep/iam-client/organization/delete-role/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for deleting an organization role.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.DeleteRole.Handler({
 *   roleName: "editor"
 * })
 * ```
 *
 * @category Organization/DeleteRole
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.organization.deleteRole(encoded))
);
