/**
 * @fileoverview
 * Handler for listing user's teams.
 *
 * @module @beep/iam-client/organization/list-user-teams/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing user's teams.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.ListUserTeams.Handler({})
 * // result.teams contains array of teams
 * ```
 *
 * @category Organization/ListUserTeams
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.organization.listUserTeams())
);
