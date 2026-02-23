/**
 * @fileoverview
 * Handler for listing organization invitations.
 *
 * @module @beep/iam-client/organization/invitations/list/handler
 * @category Organization/Invitations
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing organization invitations.
 *
 * NOTE: Better Auth client expects payload wrapped in `query` object.
 *
 * @category Organization/Invitations/List
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.listInvitations({ query: encoded }))
);
