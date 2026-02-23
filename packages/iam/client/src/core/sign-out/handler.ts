/**
 * @fileoverview
 * Sign-out handler implementation.
 *
 * Implements the sign-out contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful sign-out.
 *
 * @module @beep/iam-client/core/sign-out/handler
 * @category Core/SignOut
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Sign-out handler that terminates the current user session.
 *
 * Calls Better Auth's sign-out method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful sign-out.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { SignOut } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SignOut.Handler
 *   console.log(result.success)  // true
 * })
 * ```
 *
 * @category Core/SignOut/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.signOut())
);
