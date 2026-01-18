/**
 * @fileoverview
 * Multi-session module re-exports for session management functionality.
 *
 * @module @beep/iam-client/multi-session/mod
 * @category MultiSession
 * @since 0.1.0
 */

/**
 * Re-exports reactive atoms for multi-session flows with toast feedback.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 *
 * const { listSessions, revoke, setActive } = MultiSession.Atoms.use()
 * await listSessions()
 * ```
 *
 * @category MultiSession/Exports
 * @since 0.1.0
 */
export * as Atoms from "./atoms";

/**
 * Re-exports WrapperGroup and composed Layer for multi-session handlers.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Multi-session handlers available via dependency injection
 * }).pipe(Effect.provide(MultiSession.layer))
 * ```
 *
 * @category MultiSession/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports list sessions contract and implementation.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 *
 * const sessions = yield* MultiSession.ListSessions.Handler
 * ```
 *
 * @category MultiSession/Exports
 * @since 0.1.0
 */
export { ListSessions } from "./list-sessions";

/**
 * Re-exports revoke session contract and implementation.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 *
 * const result = yield* MultiSession.Revoke.Handler({ sessionToken: "..." })
 * ```
 *
 * @category MultiSession/Exports
 * @since 0.1.0
 */
export { Revoke } from "./revoke";

/**
 * Re-exports Effect service and runtime for multi-session operations.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const service = yield* MultiSession.Service
 *   const sessions = yield* service.ListSessions
 * })
 * ```
 *
 * @category MultiSession/Exports
 * @since 0.1.0
 */
export { runtime, Service } from "./service";

/**
 * Re-exports set active session contract and implementation.
 *
 * @example
 * ```typescript
 * import { MultiSession } from "@beep/iam-client"
 *
 * const result = yield* MultiSession.SetActive.Handler({ sessionToken: "..." })
 * ```
 *
 * @category MultiSession/Exports
 * @since 0.1.0
 */
export { SetActive } from "./set-active";
