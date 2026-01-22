/**
 * @fileoverview
 * Handler for getting an invitation by ID.
 *
 * @module @beep/iam-client/organization/get-invitation/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for getting an invitation by ID.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.GetInvitation.Handler({
 *   invitationId: "invitation_123"
 * })
 * ```
 *
 * @category Organization/GetInvitation
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.getInvitation({ query: encoded }))
);
