/**
 * @fileoverview
 * Delete passkey handler implementation.
 *
 * Implements the delete passkey contract using Better Auth's passkey client.
 *
 * @module @beep/iam-client/passkey/delete-passkey/handler
 * @category Passkey/DeletePasskey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Delete passkey handler that removes a passkey from the user's account.
 *
 * Calls Better Auth's passkey.deletePasskey method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { DeletePasskey } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* DeletePasskey.Handler({ id: "passkey_123" })
 *   console.log(`Deleted: ${result.success}`)
 * })
 * ```
 *
 * @category Passkey/DeletePasskey/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.passkey.deletePasskey(encodedPayload))
);
