/**
 * @fileoverview
 * Generate one-time token handler implementation.
 *
 * Implements the generate one-time token contract using Better Auth's oneTimeToken client.
 *
 * @module @beep/iam-client/one-time-token/generate/handler
 * @category OneTimeToken/Generate
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Generate one-time token handler that creates a single-use authentication token.
 *
 * Calls Better Auth's oneTimeToken.generate method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Generate } from "@beep/iam-client/one-time-token"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Generate.Handler({ email: "user@example.com" })
 *   console.log(`Token: ${result.token}`)
 * })
 * ```
 *
 * @category OneTimeToken/Generate/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.oneTimeToken.generate({ query: encodedPayload }))
);
