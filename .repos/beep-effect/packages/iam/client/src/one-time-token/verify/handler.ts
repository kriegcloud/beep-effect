/**
 * @fileoverview
 * Verify one-time token handler implementation.
 *
 * Implements the verify one-time token contract using Better Auth's oneTimeToken client.
 *
 * @module @beep/iam-client/one-time-token/verify/handler
 * @category OneTimeToken/Verify
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Verify one-time token handler that authenticates with a one-time token.
 *
 * Calls Better Auth's oneTimeToken.verify method and validates the response.
 * Mutates session state (creates authenticated session).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Verify } from "@beep/iam-client/one-time-token"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Verify.Handler({ token: "abc123..." })
 *   console.log(`Authenticated as ${result.user.name}`)
 * })
 * ```
 *
 * @category OneTimeToken/Verify/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })((encodedPayload) => client.oneTimeToken.verify(encodedPayload))
);
