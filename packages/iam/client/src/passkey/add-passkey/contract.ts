/**
 * @fileoverview
 * Add passkey contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for WebAuthn passkey registration.
 *
 * @module @beep/iam-client/passkey/add-passkey/contract
 * @category Passkey/AddPasskey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("passkey/add-passkey");

/**
 * Authenticator attachment type for passkey registration.
 *
 * @category Passkey/AddPasskey/Schemas
 * @since 0.1.0
 */
export const AuthenticatorAttachment = S.Literal("platform", "cross-platform");

/**
 * Payload for adding a new passkey.
 *
 * @example
 * ```typescript
 * import { AddPasskey } from "@beep/iam-client/passkey"
 *
 * // Add passkey with default settings
 * const payload1 = AddPasskey.Payload.make({})
 *
 * // Add passkey with custom name
 * const payload2 = AddPasskey.Payload.make({
 *   name: "My Laptop"
 * })
 * ```
 *
 * @category Passkey/AddPasskey/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    name: S.optional(S.String),
    authenticatorAttachment: S.optional(AuthenticatorAttachment),
  },
  formValuesAnnotation({})
) {}

/**
 * Schema representing a passkey.
 *
 * @category Passkey/AddPasskey/Schemas
 * @since 0.1.0
 */
export const Passkey = S.Struct({
  id: S.String,
  name: S.optionalWith(S.String, { nullable: true }),
  publicKey: S.String,
  userId: S.String,
  webauthnUserID: S.String,
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
 * Success response containing the newly registered passkey.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { AddPasskey } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* AddPasskey.Handler({})
 *   console.log(`Added passkey: ${result.id}`)
 * })
 * ```
 *
 * @category Passkey/AddPasskey/Schemas
 * @since 0.1.0
 */
export const Success = Passkey;

/**
 * Contract wrapper for add passkey operations.
 *
 * @example
 * ```typescript
 * import { AddPasskey } from "@beep/iam-client/passkey"
 *
 * const handler = AddPasskey.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Passkey/AddPasskey/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("AddPasskey", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
