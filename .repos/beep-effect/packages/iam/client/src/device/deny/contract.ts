/**
 * @fileoverview
 * Deny device authorization contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for denying a device authorization request.
 *
 * @module @beep/iam-client/device/deny/contract
 * @category Device/Deny
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("device/deny");

/**
 * Payload for denying a device authorization request.
 *
 * @example
 * ```typescript
 * import { Deny } from "@beep/iam-client/device"
 *
 * const payload = Deny.Payload.make({
 *   userCode: "ABCD-EFGH"
 * })
 * ```
 *
 * @category Device/Deny/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userCode: S.String,
  },
  formValuesAnnotation({
    userCode: "",
  })
) {}

/**
 * Success response confirming device denial.
 *
 * @category Device/Deny/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Confirmation of device authorization denial.",
  })
) {}

/**
 * Contract wrapper for device denial operations.
 *
 * Note: This operation mutates session state.
 *
 * @category Device/Deny/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("DenyDevice", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
