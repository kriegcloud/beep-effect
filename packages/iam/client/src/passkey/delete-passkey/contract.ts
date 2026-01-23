/**
 * @fileoverview
 * Delete passkey contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for removing a passkey.
 *
 * @module @beep/iam-client/passkey/delete-passkey/contract
 * @category Passkey/DeletePasskey
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("passkey/delete-passkey");

/**
 * Payload for deleting a passkey.
 *
 * @example
 * ```typescript
 * import { DeletePasskey } from "@beep/iam-client/passkey"
 *
 * const payload = DeletePasskey.Payload.make({
 *   id: "passkey_123"
 * })
 * ```
 *
 * @category Passkey/DeletePasskey/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    id: IamEntityIds.PasskeyId,
  },
  formValuesAnnotation({
    id: "",
  })
) {}

/**
 * Success response indicating passkey deletion.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { DeletePasskey } from "@beep/iam-client/passkey"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* DeletePasskey.Handler({ id: "passkey_123" })
 *   console.log(`Deleted: ${result.success}`)
 * })
 * ```
 *
 * @category Passkey/DeletePasskey/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response indicating passkey was deleted.",
  })
) {}

/**
 * Contract wrapper for delete passkey operations.
 *
 * @example
 * ```typescript
 * import { DeletePasskey } from "@beep/iam-client/passkey"
 *
 * const handler = DeletePasskey.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Passkey/DeletePasskey/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("DeletePasskey", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
