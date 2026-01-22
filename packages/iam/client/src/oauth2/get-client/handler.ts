/**
 * @fileoverview
 * Get OAuth2 client handler implementation.
 *
 * @module @beep/iam-client/oauth2/get-client/handler
 * @category OAuth2/GetClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Get OAuth2 client handler that retrieves an OAuth2 client by ID.
 *
 * Calls Better Auth's oauth2.getClient method with query-wrapped payload.
 * Admin-only endpoint.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { GetClient } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const client = yield* GetClient.Handler({ clientId: "my-oauth-client" })
 *   console.log(`Client name: ${client.name}`)
 * })
 * ```
 *
 * @category OAuth2/GetClient/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.getClient({ query: encodedPayload }))
);
