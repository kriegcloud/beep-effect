/**
 * @fileoverview
 * Unlink account handler implementation.
 *
 * Implements the unlink account contract using Better Auth's client and notifies
 * session watchers via `$sessionSignal` after successful unlinking.
 *
 * @module @beep/iam-client/core/unlink-account/handler
 * @category Core/UnlinkAccount
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Unlink account handler that removes a social provider from the current user's account.
 *
 * Calls Better Auth's unlinkAccount method, validates the response, and notifies
 * session watchers via `$sessionSignal` after successful unlinking.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UnlinkAccount } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UnlinkAccount.Handler({ providerId: "google" })
 *   console.log(result.success)  // true
 * })
 * ```
 *
 * @category Core/UnlinkAccount/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.unlinkAccount(encodedPayload))
);
