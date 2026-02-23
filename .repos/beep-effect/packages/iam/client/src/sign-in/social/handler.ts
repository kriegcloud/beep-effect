/**
 * @fileoverview
 * Social sign-in handler implementation.
 *
 * @module @beep/iam-client/sign-in/social/handler
 * @category SignIn/Social
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Social sign-in handler.
 *
 * Calls Better Auth's signIn.social method to initiate social provider authentication.
 * This operation mutates session state after the OAuth flow completes.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Social } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Social.Handler({
 *     provider: "google",
 *     callbackURL: "/dashboard"
 *   })
 *   if (result.url) {
 *     window.location.href = result.url
 *   }
 * })
 * ```
 *
 * @category SignIn/Social/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.signIn.social(encodedPayload))
);
