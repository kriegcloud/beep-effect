/**
 * @fileoverview
 * Device code request handler implementation.
 *
 * @module @beep/iam-client/device/code/handler
 * @category Device/Code
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Device code request handler (RFC 8628 Device Authorization Grant).
 *
 * Calls Better Auth's device.code method to request a device code.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Code } from "@beep/iam-client/device"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Code.Handler({})
 *   console.log(`Visit ${result.verificationUri} and enter: ${result.userCode}`)
 * })
 * ```
 *
 * @category Device/Code/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.device.code(encodedPayload))
);
