/**
 * @fileoverview
 * Revoke sessions contract schemas for the IAM client.
 *
 * Defines the success response schema for revoking ALL sessions for the current user.
 *
 * @module @beep/iam-client/core/revoke-sessions/contract
 * @category Core/RevokeSessions
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("core/revoke-sessions");

/**
 * Success response for revoking all sessions.
 *
 * @example
 * ```typescript
 * import { RevokeSessions } from "@beep/iam-client/core"
 * import * as S from "effect/Schema"
 *
 * const response = { success: true }
 * const decoded = S.decodeUnknownSync(RevokeSessions.Success)(response)
 * ```
 *
 * @category Core/RevokeSessions/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    success: S.Boolean,
  },
  $I.annotations("Success", {
    description: "Success response for revoking all sessions including the current one.",
  })
) {}

/**
 * Contract wrapper for revoke all sessions operations.
 *
 * No payload required - revokes ALL sessions for the current user.
 *
 * @example
 * ```typescript
 * import { RevokeSessions } from "@beep/iam-client/core"
 *
 * const handler = RevokeSessions.Wrapper.implement(() => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Core/RevokeSessions/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("RevokeSessions", {
  success: Success,
  error: Common.IamError,
});
