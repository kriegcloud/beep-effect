/**
 * @fileoverview
 * Handler for creating an organization role.
 *
 * @module @beep/iam-client/organization/create-role/handler
 * @category Organization
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for creating an organization role.
 *
 * @example
 * ```typescript
 * import { Organization } from "@beep/iam-client"
 *
 * const result = yield* Organization.CreateRole.Handler({
 *   role: "editor",
 *   permission: { posts: ["create", "read", "update"] }
 * })
 * ```
 *
 * @category Organization/CreateRole
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
	Common.wrapIamMethod({
		wrapper: Contract.Wrapper,
		mutatesSession: true,
		// Better Auth type requires additionalFields, but runtime accepts our payload
	})((encoded) =>
		client.organization.createRole(encoded as Parameters<typeof client.organization.createRole>[0]),
	),
);
