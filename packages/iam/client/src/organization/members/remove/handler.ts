/**
 * @fileoverview
 * Handler for removing an organization member.
 *
 * @module @beep/iam-client/organization/members/remove/handler
 * @category Organization/Members
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for removing an organization member.
 *
 * @category Organization/Members/Remove
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.removeMember(encoded))
);
