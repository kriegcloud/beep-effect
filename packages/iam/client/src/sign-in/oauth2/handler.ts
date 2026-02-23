/**
 * @fileoverview
 * OAuth2 sign-in handler implementation.
 *
 * @module @beep/iam-client/sign-in/oauth2/handler
 * @category SignIn/OAuth2
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * OAuth2 sign-in handler.
 *
 * Calls Better Auth's signIn.oauth2 method to initiate OAuth2 provider authentication.
 * This operation mutates session state after the OAuth flow completes.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { OAuth2 } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* OAuth2.Handler({
 *     providerId: "custom-provider",
 *     callbackURL: "/dashboard"
 *   })
 *   if (result.url) {
 *     window.location.href = result.url
 *   }
 * })
 * ```
 *
 * @category SignIn/OAuth2/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.signIn.oauth2(encodedPayload))
);
