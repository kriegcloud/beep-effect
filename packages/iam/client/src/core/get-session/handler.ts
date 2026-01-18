/**
 * @fileoverview Handler implementation for get-session operation.
 *
 * Retrieves the current authenticated session with user data,
 * or returns Option.none() when no session exists. Automatically
 * decodes session data and checks for errors.
 *
 * @module @beep/iam-client/core/get-session/handler
 * @category Core/GetSession
 * @since 0.1.0
 */

import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Retrieves the current session and user data from Better Auth.
 *
 * Returns Option.none() when no active session exists, or Option.some(SessionData)
 * when a session is present. Automatically decodes session data and checks for errors.
 *
 * @example
 * ```typescript
 * import { GetSession } from "@beep/iam-client/core"
 * import * as Effect from "effect/Effect"
 * import * as O from "effect/Option"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* GetSession.Handler
 *   yield* O.match(result.data, {
 *     onNone: () => Effect.log("No active session"),
 *     onSome: (session) => Effect.log("Logged in as:", session.user.email)
 *   })
 * })
 * ```
 *
 * @category Core/GetSession/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    // GetSession needs custom response transformation because Better Auth returns
    // { data: sessionData | null } but our Success schema expects { data: Option<SessionData> }
    // The transform wraps response.data to match the Success schema's encoded shape
    transformResponse: (response) => ({ data: response.data }),
  })(() => client.getSession())
);
