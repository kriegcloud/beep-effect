/**
 * @fileoverview
 * Get public OAuth2 client handler implementation.
 *
 * @module @beep/iam-client/oauth2/public-client/handler
 * @category OAuth2/PublicClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Get public OAuth2 client handler that retrieves public info about an OAuth2 client.
 *
 * Calls Better Auth's oauth2.publicClient method with query-wrapped payload.
 * Public endpoint (no auth required).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { PublicClient } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const info = yield* PublicClient.Handler({ clientId: "my-oauth-client" })
 *   console.log(`Client name: ${info.name}`)
 * })
 * ```
 *
 * @category OAuth2/PublicClient/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.publicClient({ query: encodedPayload }))
);
