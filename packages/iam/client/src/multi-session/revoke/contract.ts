/**
 * @fileoverview
 * Revoke session contract schemas and wrapper for Better Auth integration.
 *
 * Defines the payload and success schemas for revoking a specific session.
 *
 * @module @beep/iam-client/multi-session/revoke/contract
 * @category MultiSession/Revoke
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("multi-session/revoke");

/**
 * Payload for revoking a session.
 *
 * @example
 * ```typescript
 * import { Revoke } from "@beep/iam-client/multi-session"
 *
 * const payload = Revoke.Payload.make({
 *   sessionToken: "session-token-to-revoke"
 * })
 * ```
 *
 * @category MultiSession/Revoke/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    sessionToken: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for revoking a session.",
  })
) {}

/**
 * Success response - session revocation confirmed.
 *
 * Better Auth returns { status: boolean } on success.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Revoke } from "@beep/iam-client/multi-session"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Revoke.Handler({ sessionToken: "..." })
 *   console.log(result.status) // true
 * })
 * ```
 *
 * @category MultiSession/Revoke/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for revoking a session.",
  })
) {}

/**
 * Revoke session contract wrapper combining payload, success, and error schemas.
 *
 * @example
 * ```typescript
 * import { Revoke } from "@beep/iam-client/multi-session"
 *
 * const handler = Revoke.Wrapper.implement(
 *   (payload) => client.multiSession.revoke(payload)
 * )
 * ```
 *
 * @category MultiSession/Revoke/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("Revoke", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
