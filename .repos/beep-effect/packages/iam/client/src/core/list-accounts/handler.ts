/**
 * @fileoverview
 * List accounts handler implementation.
 *
 * Implements the list accounts contract using Better Auth's client.
 *
 * @module @beep/iam-client/core/list-accounts/handler
 * @category Core/ListAccounts
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * List accounts handler that retrieves all linked accounts for the current user.
 *
 * Calls Better Auth's listAccounts method and validates the response.
 * Does not mutate session state.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { ListAccounts } from "@beep/iam-client/core"
 *
 * const program = Effect.gen(function* () {
 *   const accounts = yield* ListAccounts.Handler
 *   console.log(`User has ${accounts.length} linked accounts`)
 * })
 * ```
 *
 * @category Core/ListAccounts/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })(() => client.listAccounts())
);
