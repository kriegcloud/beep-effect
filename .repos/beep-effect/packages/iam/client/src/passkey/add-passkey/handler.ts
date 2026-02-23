/**
 * @fileoverview
 * Add passkey handler implementation.
 *
 * Implements the add passkey contract using Better Auth's passkey client.
 *
 * @module @beep/iam-client/passkey/add-passkey/handler
 * @category Passkey/AddPasskey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Add passkey handler that registers a new passkey for the user.
 *
 * Calls Better Auth's passkey.addPasskey method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { AddPasskey } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* AddPasskey.Handler({
 *     name: "My Laptop"
 *   })
 *   console.log(`Added passkey: ${result.id}`)
 * })
 * ```
 *
 * @category Passkey/AddPasskey/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.passkey.addPasskey(encodedPayload))
);
