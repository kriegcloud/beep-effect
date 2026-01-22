/**
 * @fileoverview
 * List OAuth2 clients handler implementation.
 *
 * @module @beep/iam-client/oauth2/get-clients/handler
 * @category OAuth2/GetClients
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * List OAuth2 clients handler that retrieves all registered OAuth2 clients.
 *
 * Calls Better Auth's oauth2.getClients method.
 * Admin-only endpoint.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { GetClients } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const clients = yield* GetClients.Handler
 *   console.log(`Found ${clients.length} OAuth2 clients`)
 * })
 * ```
 *
 * @category OAuth2/GetClients/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.oauth2.getClients())
);
