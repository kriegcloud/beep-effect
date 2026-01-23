/**
 * @fileoverview
 * Revoke session contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for revoking a specific session.
 *
 * @module @beep/iam-client/core/revoke-session/contract
 * @category Core/RevokeSession
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/revoke-session");

/**
 * Payload for revoking a specific session.
 *
 * @example
 * ```typescript
 * import { RevokeSession } from "@beep/iam-client/core"
 *
 * const payload = RevokeSession.Payload.make({
 *   token: "session-token-to-revoke"
 * })
 * ```
 *
 * @category Core/RevokeSession/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)({
  token: S.Redacted(S.String),
}) {}

/**
 * Success response for revoking a session.
 *
 * @example
 * ```typescript
 * import { RevokeSession } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const response = { success: true }
 * const decoded = S.decodeUnknownSync(RevokeSession.Success)(response)
 * ```
 *
 * @category Core/RevokeSession/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response for revoking a specific session.",
  })
) {}

/**
 * Contract wrapper for revoke session operations.
 *
 * @example
 * ```typescript
 * import { RevokeSession } from "@beep/iam-client/core"
 *
 * const handler = RevokeSession.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/RevokeSession/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RevokeSession", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
