/**
 * @fileoverview
 * Handler for removing a team member.
 *
 * @module @beep/iam-client/organization/remove-team-member/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for removing a team member.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.RemoveTeamMember.Handler({
 *   teamId: "team_123",
 *   userId: "user_456"
 * })
 * ```
 *
 * @category Organization/RemoveTeamMember
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.organization.removeTeamMember(encoded))
);
