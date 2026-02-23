/**
 * @fileoverview
 * Handler for listing organization roles.
 *
 * @module @beep/iam-client/organization/list-roles/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing organization roles.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.ListRoles.Handler({})
 * // result.roles contains array of roles
 * ```
 *
 * @category Organization/ListRoles
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.listRoles({ query: encoded }))
);
