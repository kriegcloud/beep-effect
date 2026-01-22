/**
 * @fileoverview
 * Device token exchange handler implementation.
 *
 * @module @beep/iam-client/device/token/handler
 * @category Device/Token
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Device token exchange handler.
 *
 * Calls Better Auth's device.token method to exchange a device code for tokens.
 * This endpoint is polled by the device until authorization is granted or denied.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Token } from "@beep/iam-client/device"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Token.Handler({ deviceCode: "device_code_123" })
 *   console.log(`Access token received`)
 * })
 * ```
 *
 * @category Device/Token/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.device.token(encodedPayload))
);
