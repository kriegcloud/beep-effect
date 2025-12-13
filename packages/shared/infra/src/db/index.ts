/**
 * Re-exports SharedDb namespace with database service implementation.
 *
 * @example
 * ```typescript
 * import { SharedDb } from "@beep/shared-infra/db"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const { makeQueryWithSchema } = yield* SharedDb.SharedDb
 *   // Use database utilities
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./Db";
