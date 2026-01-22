/**
 * @fileoverview
 * Handler for updating an organization team.
 *
 * @module @beep/iam-client/organization/update-team/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for updating an organization team.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.UpdateTeam.Handler({
 *   teamId: "team_123",
 *   data: { name: "New Team Name" }
 * })
 * ```
 *
 * @category Organization/UpdateTeam
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.organization.updateTeam(encoded))
);
