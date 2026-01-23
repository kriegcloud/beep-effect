/**
 * @fileoverview
 * Device token exchange contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for exchanging a device code for tokens.
 * This endpoint is polled by the device until authorization is granted or denied.
 *
 * @module @beep/iam-client/device/token/contract
 * @category Device/Token
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("device/token");

/**
 * Payload for exchanging a device code for tokens.
 *
 * @example
 * ```typescript
 * import { Token } from "@beep/iam-client/device"
 *
 * const payload = Token.Payload.make({
 *   grant_type: "urn:ietf:params:oauth:grant-type:device_code",
 *   device_code: "device_code_from_code_endpoint",
 *   client_id: "my-device-app"
 * })
 * ```
 *
 * @category Device/Token/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    grant_type: S.Literal("urn:ietf:params:oauth:grant-type:device_code"),
    device_code: S.String,
    client_id: IamEntityIds.OAuthClientId,
  },
  formValuesAnnotation({
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    device_code: "",
    client_id: "",
  })
) {}

/**
 * Success response with access tokens.
 *
 * Note: This response is only returned when authorization is complete.
 * During polling, the handler may return errors like "authorization_pending".
 *
 * @category Device/Token/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    accessToken: S.Redacted(S.String),
    tokenType: S.String,
    expiresIn: S.Number,
    refreshToken: S.optional(S.Redacted(S.String)),
    scope: S.optional(S.String),
  },
  $I.annotations("Success", {
    description: "Access tokens from successful device authorization.",
  })
) {}

/**
 * Contract wrapper for device token exchange operations.
 *
 * @category Device/Token/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ExchangeDeviceToken", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
