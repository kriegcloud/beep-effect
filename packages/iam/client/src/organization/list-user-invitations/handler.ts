/**
 * @fileoverview
 * Handler for listing user's invitations.
 *
 * @module @beep/iam-client/organization/list-user-invitations/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing user's invitations.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.ListUserInvitations.Handler({})
 * // result.invitations contains array of invitations
 * ```
 *
 * @category Organization/ListUserInvitations
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.organization.listUserInvitations())
);
