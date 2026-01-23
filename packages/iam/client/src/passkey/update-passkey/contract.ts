/**
 * @fileoverview
 * Update passkey contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for updating a passkey's name.
 *
 * @module @beep/iam-client/passkey/update-passkey/contract
 * @category Passkey/UpdatePasskey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("passkey/update-passkey");

/**
 * Payload for updating a passkey.
 *
 * @example
 * ```typescript
 * import { UpdatePasskey } from "@beep/iam-client/passkey"
 *
 * const payload = UpdatePasskey.Payload.make({
 *   id: "passkey_123",
 *   name: "Work Laptop"
 * })
 * ```
 *
 * @category Passkey/UpdatePasskey/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.PasskeyId,
    name: S.String,
  },
  formValuesAnnotation({
    id: "",
    name: "",
  })
) {}

/**
 * Schema representing the updated passkey.
 *
 * @category Passkey/UpdatePasskey/Schemas
 * @since 0.1.0
 */
export const Passkey = S.Struct({
  id: IamEntityIds.PasskeyId,
  name: S.optionalWith(S.String, { nullable: true }),
  publicKey: S.String,
  userId: SharedEntityIds.UserId,
  webauthnUserID: S.String, // WebAuthn spec user handle - intentionally S.String per W3C spec
  counter: S.Number,
  deviceType: S.String,
  backedUp: S.Boolean,
  transports: S.optionalWith(S.String, { nullable: true }),
  createdAt: BS.DateFromAllAcceptable,
}).annotations(
  $I.annotations("Passkey", {
    description: "A registered passkey for WebAuthn authentication.",
  })
);

export type Passkey = S.Schema.Type<typeof Passkey>;

/**
 * Success response containing the updated passkey.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdatePasskey } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* UpdatePasskey.Handler({
 *     id: "passkey_123",
 *     name: "Work Laptop"
 *   })
 *   console.log(`Updated passkey: ${result.name}`)
 * })
 * ```
 *
 * @category Passkey/UpdatePasskey/Schemas
 * @since 0.1.0
 */
export const Success = Passkey;

/**
 * Contract wrapper for update passkey operations.
 *
 * @example
 * ```typescript
 * import { UpdatePasskey } from "@beep/iam-client/passkey"
 *
 * const handler = UpdatePasskey.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Passkey/UpdatePasskey/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("UpdatePasskey", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
