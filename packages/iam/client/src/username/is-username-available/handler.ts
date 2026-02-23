/**
 * @fileoverview
 * Username availability handler implementation.
 *
 * Implements the username availability contract using Better Auth's username plugin.
 *
 * @module @beep/iam-client/username/is-username-available/handler
 * @category Username/IsUsernameAvailable
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Username availability handler that checks if a username is available.
 *
 * Calls Better Auth's username.isUsernameAvailable method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { IsUsernameAvailable } from "@beep/iam-client/username"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* IsUsernameAvailable.Handler({ username: "desired-name" })
 *   if (result.status) {
 *     console.log("Username is available!")
 *   }
 * })
 * ```
 *
 * @category Username/IsUsernameAvailable/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.isUsernameAvailable(encodedPayload))
);
