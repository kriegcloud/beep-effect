/**
 * @fileoverview
 * Handler for getting an organization role.
 *
 * @module @beep/iam-client/organization/get-role/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for getting an organization role.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.GetRole.Handler({
 *   roleName: "editor"
 * })
 * ```
 *
 * @category Organization/GetRole
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.getRole({ query: encoded }))
);
