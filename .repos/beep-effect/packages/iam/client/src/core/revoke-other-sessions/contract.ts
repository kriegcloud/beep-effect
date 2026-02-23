/**
 * @fileoverview
 * Revoke other sessions contract schemas for the IAM client.
 *
 * Defines the success response schema for revoking all sessions except the current one.
 *
 * @module @beep/iam-client/core/revoke-other-sessions/contract
 * @category Core/RevokeOtherSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/revoke-other-sessions");

/**
 * Success response for revoking all other sessions.
 *
 * @example
 * ```typescript
 * import { RevokeOtherSessions } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const response = { success: true }
 * const decoded = S.decodeUnknownSync(RevokeOtherSessions.Success)(response)
 * ```
 *
 * @category Core/RevokeOtherSessions/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response for revoking all sessions except the current one.",
  })
) {}

/**
 * Contract wrapper for revoke other sessions operations.
 *
 * No payload required - revokes all sessions except the current one.
 *
 * @example
 * ```typescript
 * import { RevokeOtherSessions } from "@beep/iam-client/core"
 *
 * const handler = RevokeOtherSessions.Wrapper.implement(() => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/RevokeOtherSessions/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RevokeOtherSessions", {
  success: Success,
  error: Common.IamError,
});
