/**
 * @fileoverview
 * Handler for accepting an organization invitation.
 *
 * @module @beep/iam-client/organization/invitations/accept/handler
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for accepting an organization invitation.
 * User joins organization, affects session.
 *
 * @category Organization/Invitations/Accept
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.organization.acceptInvitation(encoded))
);
