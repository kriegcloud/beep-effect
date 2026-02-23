/**
 * @fileoverview
 * Set active session contract schemas and wrapper for Better Auth integration.
 *
 * Defines the payload and success schemas for setting a specific session as active.
 *
 * @module @beep/iam-client/multi-session/set-active/contract
 * @category MultiSession/SetActive
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("multi-session/set-active");

/**
 * Payload for setting a session as active.
 *
 * @example
 * ```typescript
 * import { SetActive } from "@beep/iam-client/multi-session"
 *
 * const payload = SetActive.Payload.make({
 *   sessionToken: "session-token-to-activate"
 * })
 * ```
 *
 * @category MultiSession/SetActive/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    sessionToken: S.Redacted(S.String),
  },
  $I.annotations("Payload", {
    description: "The payload for setting a session as active.",
  })
) {}

/**
 * Success response - session activation confirmed.
 *
 * Better Auth returns { status: boolean } on success.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { SetActive } from "@beep/iam-client/multi-session"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* SetActive.Handler({ sessionToken: "..." })
 *   console.log(result.status) // true
 * })
 * ```
 *
 * @category MultiSession/SetActive/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    status: S.Boolean,
  },
  $I.annotations("Success", {
    description: "The success response for setting a session as active.",
  })
) {}

/**
 * Set active session contract wrapper combining payload, success, and error schemas.
 *
 * @example
 * ```typescript
 * import { SetActive } from "@beep/iam-client/multi-session"
 *
 * const handler = SetActive.Wrapper.implement(
 *   (payload) => client.multiSession.setActive(payload)
 * )
 * ```
 *
 * @category MultiSession/SetActive/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SetActive", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
