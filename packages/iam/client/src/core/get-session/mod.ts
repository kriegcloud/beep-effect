/**
 * @fileoverview Get-session module re-exports.
 *
 * Aggregates contract schemas and handler implementation for
 * retrieving the current authenticated session.
 *
 * @module @beep/iam-client/core/get-session/mod
 * @category Core/GetSession
 * @since 0.1.0
 */

/**
 * Re-exports contract schemas for get-session operation.
 *
 * @example
 * ```typescript
 * import { SessionData, Success, Wrapper } from "@beep/iam-client/core/get-session"
 * ```
 *
 * @category Core/GetSession
 * @since 0.1.0
 */
export * from "./contract.ts";

/**
 * Re-exports handler implementation for get-session operation.
 *
 * @example
 * ```typescript
 * import { Handler } from "@beep/iam-client/core/get-session"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* Handler
 * })
 * ```
 *
 * @category Core/GetSession
 * @since 0.1.0
 */
export * from "./handler.ts";
