/**
 * @fileoverview
 * Link OAuth2 account handler implementation.
 *
 * @module @beep/iam-client/oauth2/link/handler
 * @category OAuth2/Link
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Link OAuth2 account handler.
 *
 * Calls Better Auth's oauth2.link method to initiate OAuth2 account linking.
 * This operation mutates session state after the OAuth flow completes.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Link } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Link.Handler({
 *     clientId: "my-oauth-provider",
 *     callbackURL: "/settings/accounts"
 *   })
 *   window.location.href = result.url
 * })
 * ```
 *
 * @category OAuth2/Link/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.oauth2.link(encodedPayload))
);
