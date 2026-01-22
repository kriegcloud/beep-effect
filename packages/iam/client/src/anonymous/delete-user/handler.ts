/**
 * @fileoverview
 * Handler for deleting an anonymous user.
 *
 * @module @beep/iam-client/anonymous/delete-user/handler
 * @category Anonymous
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Handler for deleting an anonymous user.
 *
 * @example
 * ```typescript
 * import { Anonymous } from "@beep/iam-client"
 *
 * const result = yield* Anonymous.DeleteUser.Handler({})
 * // result.success is true if user was deleted
 * ```
 *
 * @category Anonymous/DeleteUser
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
	Common.wrapIamMethod({
		wrapper: Contract.Wrapper,
		mutatesSession: true,
	})(() => client.deleteAnonymousUser()),
);
