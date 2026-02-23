/**
 * @fileoverview
 * JWKS handler implementation.
 *
 * @module @beep/iam-client/jwt/jwks/handler
 * @category JWT/JWKS
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * JWKS handler that retrieves the JSON Web Key Set.
 *
 * Calls Better Auth's jwks method to get public keys for token verification.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { JWKS } from "@beep/iam-client/jwt"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* JWKS.Handler
 *   console.log(`Found ${result.keys.length} keys`)
 * })
 * ```
 *
 * @category JWT/JWKS/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.jwks())
);
