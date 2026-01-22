/**
 * @fileoverview
 * Handler for getting the active member's role.
 *
 * @module @beep/iam-client/organization/get-active-member-role/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for getting the active member's role.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.GetActiveMemberRole.Handler({})
 * // result.role contains the role string
 * ```
 *
 * @category Organization/GetActiveMemberRole
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.getActiveMemberRole({ query: encoded }))
);
