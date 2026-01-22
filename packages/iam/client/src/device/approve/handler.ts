/**
 * @fileoverview
 * Approve device authorization handler implementation.
 *
 * @module @beep/iam-client/device/approve/handler
 * @category Device/Approve
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Approve device authorization handler.
 *
 * Calls Better Auth's device.approve method when a user approves a device authorization request.
 * This operation mutates session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Approve } from "@beep/iam-client/device"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Approve.Handler({ userCode: "ABCD-EFGH" })
 *   console.log(`Device approved: ${result.success}`)
 * })
 * ```
 *
 * @category Device/Approve/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.device.approve(encodedPayload))
);
