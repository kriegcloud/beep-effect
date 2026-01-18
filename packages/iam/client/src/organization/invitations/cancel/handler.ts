/**
 * @fileoverview
 * Handler for canceling an organization invitation.
 *
 * @module @beep/iam-client/organization/invitations/cancel/handler
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for canceling an organization invitation.
 *
 * @category Organization/Invitations/Cancel
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.cancelInvitation(encoded))
);
