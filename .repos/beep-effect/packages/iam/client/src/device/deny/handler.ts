/**
 * @fileoverview
 * Deny device authorization handler implementation.
 *
 * @module @beep/iam-client/device/deny/handler
 * @category Device/Deny
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Deny device authorization handler.
 *
 * Calls Better Auth's device.deny method when a user denies a device authorization request.
 * This operation mutates session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Deny } from "@beep/iam-client/device"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Deny.Handler({ userCode: "ABCD-EFGH" })
 *   console.log(`Device denied: ${result.success}`)
 * })
 * ```
 *
 * @category Device/Deny/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.device.deny(encodedPayload))
);
