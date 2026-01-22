/**
 * @fileoverview
 * List user passkeys handler implementation.
 *
 * Implements the list user passkeys contract using Better Auth's passkey client.
 *
 * @module @beep/iam-client/passkey/list-user-passkeys/handler
 * @category Passkey/ListUserPasskeys
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * List user passkeys handler that retrieves all passkeys for the current user.
 *
 * Calls Better Auth's passkey.listUserPasskeys method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListUserPasskeys } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const passkeys = yield* ListUserPasskeys.Handler
 *   console.log(`User has ${passkeys.length} passkeys`)
 * })
 * ```
 *
 * @category Passkey/ListUserPasskeys/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.passkey.listUserPasskeys())
);
