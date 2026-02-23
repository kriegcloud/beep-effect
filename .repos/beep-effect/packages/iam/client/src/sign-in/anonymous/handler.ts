/**
 * @fileoverview
 * Anonymous sign-in handler implementation.
 *
 * @module @beep/iam-client/sign-in/anonymous/handler
 * @category SignIn/Anonymous
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Anonymous sign-in handler.
 *
 * Calls Better Auth's signIn.anonymous method to create an anonymous session.
 * This operation mutates session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { Anonymous } from "@beep/iam-client/sign-in"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Anonymous.Handler
 *   console.log(`Anonymous user ID: ${result.user.id}`)
 * })
 * ```
 *
 * @category SignIn/Anonymous/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: true,
  })(() => client.signIn.anonymous())
);
