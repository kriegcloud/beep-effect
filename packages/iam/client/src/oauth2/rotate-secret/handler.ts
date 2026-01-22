/**
 * @fileoverview
 * Rotate OAuth2 client secret handler implementation.
 *
 * @module @beep/iam-client/oauth2/rotate-secret/handler
 * @category OAuth2/RotateSecret
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Rotate OAuth2 client secret handler.
 *
 * Calls Better Auth's oauth2.client.rotateSecret method.
 * Admin-only endpoint.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { RotateSecret } from "@beep/iam-client/oauth2"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* RotateSecret.Handler({ clientId: "my-oauth-client" })
 *   console.log(`New secret generated for: ${result.clientId}`)
 * })
 * ```
 *
 * @category OAuth2/RotateSecret/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oauth2.client.rotateSecret(encodedPayload))
);
