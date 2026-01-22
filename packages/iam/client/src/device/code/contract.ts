/**
 * @fileoverview
 * Device code request contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for requesting a device code
 * per RFC 8628 (Device Authorization Grant).
 *
 * @module @beep/iam-client/device/code/contract
 * @category Device/Code
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("device/code");

/**
 * Payload for requesting a device code.
 *
 * @example
 * ```typescript
 * import { Code } from "@beep/iam-client/device"
 *
 * const payload = Code.Payload.make({
 *   clientId: "my-device-app",
 *   scope: "read write"
 * })
 * ```
 *
 * @category Device/Code/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    client_id: S.String,
    scope: S.optional(S.String),
  },
  formValuesAnnotation({
    client_id: "",
    scope: undefined,
  })
) {}

/**
 * Success response with device code and verification URL.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Code } from "@beep/iam-client/device"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Code.Handler({})
 *   console.log(`Visit ${result.verificationUri} and enter code: ${result.userCode}`)
 * })
 * ```
 *
 * @category Device/Code/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    deviceCode: S.String,
    userCode: S.String,
    verificationUri: S.String,
    verificationUriComplete: S.String,
    expiresIn: S.Number,
    interval: S.Number,
  },
  $I.annotations("Success", {
    description: "Device authorization response with codes and verification URL.",
  })
) {}

/**
 * Contract wrapper for device code request operations.
 *
 * @category Device/Code/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RequestDeviceCode", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
