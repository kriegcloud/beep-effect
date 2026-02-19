/**
 * @fileoverview GetSession namespace export.
 *
 * Provides access to the get-session operation for retrieving
 * the current authenticated session with user data.
 *
 * @module @beep/iam-client/core/get-session
 * @category Core/GetSession
 * @since 0.1.0
 */

/**
 * Namespace containing get-session contract schemas and handler.
 *
 * Provides SessionData schema, Success response class, contract Wrapper,
 * and the Handler implementation for retrieving the current session.
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
 *     onNone: () => Effect.log("No session"),
 *     onSome: (session) => Effect.log("User:", session.user.email)
 *   })
 * })
 * ```
 *
 * @category Core/GetSession
 * @since 0.1.0
 */
export * as GetSession from "./mod.ts";
