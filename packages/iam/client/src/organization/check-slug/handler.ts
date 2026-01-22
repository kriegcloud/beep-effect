/**
 * @fileoverview
 * Handler for checking organization slug availability.
 *
 * @module @beep/iam-client/organization/check-slug/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for checking organization slug availability.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.CheckSlug.Handler({
 *   slug: "my-org"
 * })
 * // result.status is true if slug is available
 * ```
 *
 * @category Organization/CheckSlug
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encoded) => client.organization.checkSlug(encoded))
);
