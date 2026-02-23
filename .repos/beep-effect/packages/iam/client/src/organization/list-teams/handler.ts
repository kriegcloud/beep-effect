/**
 * @fileoverview
 * Handler for listing organization teams.
 *
 * @module @beep/iam-client/organization/list-teams/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for listing organization teams.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.ListTeams.Handler({})
 * // result.teams contains array of teams
 * ```
 *
 * @category Organization/ListTeams
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.listTeams({ query: encoded }))
);
