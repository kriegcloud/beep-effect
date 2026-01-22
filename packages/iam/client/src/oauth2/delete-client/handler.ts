/**
 * @fileoverview
 * Delete OAuth2 client handler implementation.
 *
 * @module @beep/iam-client/oauth2/delete-client/handler
 * @category OAuth2/DeleteClient
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Delete OAuth2 client handler.
 *
 * Calls Better Auth's oauth2.deleteClient method.
 * Admin-only endpoint.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { DeleteClient } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* DeleteClient.Handler({ clientId: "my-oauth-client" })
 *   console.log(`Deleted: ${result.success}`)
 * })
 * ```
 *
 * @category OAuth2/DeleteClient/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.deleteClient(encodedPayload))
);
