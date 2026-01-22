/**
 * @fileoverview
 * Register OAuth2 client handler implementation.
 *
 * @module @beep/iam-client/oauth2/register/handler
 * @category OAuth2/Register
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Register OAuth2 client handler (dynamic client registration per RFC 7591).
 *
 * Calls Better Auth's oauth2.register method.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Register } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Register.Handler({
 *     name: "My Application",
 *     redirectURLs: ["https://myapp.com/callback"]
 *   })
 *   console.log(`Client ID: ${result.clientId}`)
 * })
 * ```
 *
 * @category OAuth2/Register/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.register(encodedPayload))
);
