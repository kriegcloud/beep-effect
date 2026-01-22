/**
 * @fileoverview
 * Handler for leaving an organization.
 *
 * @module @beep/iam-client/organization/leave/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for leaving an organization.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.Leave.Handler({
 *   organizationId: "org_123"
 * })
 * ```
 *
 * @category Organization/Leave
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encoded) => client.organization.leave(encoded))
);
