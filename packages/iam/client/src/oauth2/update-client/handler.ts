/**
 * @fileoverview
 * Update OAuth2 client handler implementation.
 *
 * @module @beep/iam-client/oauth2/update-client/handler
 * @category OAuth2/UpdateClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Update OAuth2 client handler that updates an OAuth2 client configuration.
 *
 * Calls Better Auth's oauth2.updateClient method.
 * Admin-only endpoint.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { UpdateClient } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const updated = yield* UpdateClient.Handler({
 *     clientId: "my-oauth-client",
 *     name: "New Name"
 *   })
 *   console.log(`Updated: ${updated.name}`)
 * })
 * ```
 *
 * @category OAuth2/UpdateClient/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.updateClient(encodedPayload))
);
