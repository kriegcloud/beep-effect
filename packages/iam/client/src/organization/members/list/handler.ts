/**
 * @fileoverview
 * Handler for listing organization members.
 *
 * @module @beep/iam-client/organization/members/list/handler
 * @category Organization/Members
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing organization members.
 *
 * NOTE: Better Auth client expects payload wrapped in `query` object.
 *
 * @category Organization/Members/List
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.listMembers({ query: encoded }))
);
