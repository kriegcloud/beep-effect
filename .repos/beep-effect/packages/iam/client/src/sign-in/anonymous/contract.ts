/**
 * @fileoverview
 * Anonymous sign-in contract schemas for the IAM client.
 *
 * Defines the success response schema for anonymous authentication.
 *
 * @module @beep/iam-client/sign-in/anonymous/contract
 * @category SignIn/Anonymous
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("sign-in/anonymous");

/**
 * Success response with anonymous user and session.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Anonymous } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Anonymous.Handler
 *   console.log(`Anonymous user ID: ${result.user.id}`)
 *   console.log(`Is anonymous: ${result.user.isAnonymous}`)
 * })
 * ```
 *
 * @category SignIn/Anonymous/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
    session: Common.DomainSessionFromBetterAuthSession,
  },
  $I.annotations("Success", {
    description: "Anonymous sign-in response with user and session.",
  })
) {}

/**
 * Contract wrapper for anonymous sign-in operations.
 *
 * No payload required - creates an anonymous session.
 *
 * Note: This operation mutates session state.
 *
 * @category SignIn/Anonymous/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("SignInAnonymous", {
  success: Success,
  error: Common.IamError,
});
