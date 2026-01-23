/**
 * @fileoverview
 * List user passkeys contract schemas for the IAM client.
 *
 * Defines the success response schema for listing all passkeys belonging to the current user.
 *
 * @module @beep/iam-client/passkey/list-user-passkeys/contract
 * @category Passkey/ListUserPasskeys
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("passkey/list-user-passkeys");

/**
 * Schema representing a passkey in the list response.
 *
 * @category Passkey/ListUserPasskeys/Schemas
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
 * Success response - array of user's passkeys.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListUserPasskeys } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const passkeys = yield* ListUserPasskeys.Handler
 *   console.log(`User has ${passkeys.length} passkeys`)
 * })
 * ```
 *
 * @category Passkey/ListUserPasskeys/Schemas
 * @since 0.1.0
 */
export const Success = S.Array(Passkey).annotations(
  $I.annotations("Success", {
    description: "Array of passkeys registered for the current user.",
  })
);

/**
 * Contract wrapper for list user passkeys operations.
 *
 * No payload required - lists all passkeys for the current user.
 *
 * @example
 * ```typescript
 * import { ListUserPasskeys } from "@beep/iam-client/passkey"
 *
 * const handler = ListUserPasskeys.Wrapper.implement(() => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Passkey/ListUserPasskeys/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("ListUserPasskeys", {
  success: Success,
  error: Common.IamError,
});
