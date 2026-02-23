/**
 * @fileoverview
 * Verify one-time token contract schemas for the IAM client.
 *
 * Defines the payload and success response schemas for verifying a one-time token.
 *
 * @module @beep/iam-client/one-time-token/verify/contract
 * @category OneTimeToken/Verify
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("one-time-token/verify");

/**
 * Payload for verifying a one-time token.
 *
 * @example
 * ```typescript
 * import { Verify } from "@beep/iam-client/one-time-token"
 *
 * const payload = Verify.Payload.make({
 *   token: "abc123..."
 * })
 * ```
 *
 * @category OneTimeToken/Verify/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    token: S.Redacted(S.String),
  },
  formValuesAnnotation({
    token: "",
  })
) {}

/**
 * Success response containing the authenticated session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Verify } from "@beep/iam-client/one-time-token"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Verify.Handler({ token: "abc123..." })
 *   console.log(`Authenticated as ${result.user.name}`)
 * })
 * ```
 *
 * @category OneTimeToken/Verify/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    session: Common.DomainSessionFromBetterAuthSession,
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the authenticated session and user.",
  })
) {}

/**
 * Contract wrapper for one-time token verify operations.
 *
 * @example
 * ```typescript
 * import { Verify } from "@beep/iam-client/one-time-token"
 *
 * const handler = Verify.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category OneTimeToken/Verify/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("VerifyOneTimeToken", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
