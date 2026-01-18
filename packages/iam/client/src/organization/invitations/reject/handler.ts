/**
 * @fileoverview
 * Handler for rejecting an organization invitation.
 *
 * @module @beep/iam-client/organization/invitations/reject/handler
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for rejecting an organization invitation.
 *
 * @category Organization/Invitations/Reject
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.rejectInvitation(encoded))
);
