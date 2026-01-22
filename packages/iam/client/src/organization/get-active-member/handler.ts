/**
 * @fileoverview
 * Handler for getting the active member in the current organization.
 *
 * @module @beep/iam-client/organization/get-active-member/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for getting the active member in the current organization.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.GetActiveMember.Handler({})
 * // result.member contains the active member or null
 * ```
 *
 * @category Organization/GetActiveMember
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.organization.getActiveMember())
);
