/**
 * @fileoverview
 * Approve device authorization contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for approving a device authorization request.
 * This is called when a user enters the user code on the verification page.
 *
 * @module @beep/iam-client/device/approve/contract
 * @category Device/Approve
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("device/approve");

/**
 * Payload for approving a device authorization request.
 *
 * @example
 * ```typescript
 * import { Approve } from "@beep/iam-client/device"
 *
 * const payload = Approve.Payload.make({
 *   userCode: "ABCD-EFGH"
 * })
 * ```
 *
 * @category Device/Approve/Schemas
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
 * Success response confirming device approval.
 *
 * @category Device/Approve/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
    deviceCode: S.String,
  },
  $I.annotations("Success", {
    description: "Confirmation of device authorization approval.",
  })
) {}

/**
 * Contract wrapper for device approval operations.
 *
 * Note: This operation mutates session state.
 *
 * @category Device/Approve/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ApproveDevice", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
