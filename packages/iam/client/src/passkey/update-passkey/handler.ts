/**
 * @fileoverview
 * Update passkey handler implementation.
 *
 * Implements the update passkey contract using Better Auth's passkey client.
 *
 * @module @beep/iam-client/passkey/update-passkey/handler
 * @category Passkey/UpdatePasskey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Update passkey handler that updates a passkey's name.
 *
 * Calls Better Auth's passkey.updatePasskey method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdatePasskey } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UpdatePasskey.Handler({
 *     id: "passkey_123",
 *     name: "Work Laptop"
 *   })
 *   console.log(`Updated passkey: ${result.name}`)
 * })
 * ```
 *
 * @category Passkey/UpdatePasskey/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.passkey.updatePasskey(encodedPayload))
);
