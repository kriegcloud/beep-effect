/**
 * @fileoverview
 * Handler for setting the active team.
 *
 * @module @beep/iam-client/organization/set-active-team/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for setting the active team.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.SetActiveTeam.Handler({
 *   teamId: "team_123"
 * })
 * ```
 *
 * @category Organization/SetActiveTeam
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.organization.setActiveTeam(encoded))
);
