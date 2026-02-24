/**
 * Re-exports SharedDb service providing database operations for shared schemas.
 *
 * @example
 * ```typescript
 * import { SharedDb } from "@beep/shared-server/db/Db"
 * import * as Effect from "effect/Effect"
 *
 * const program = myEffect.pipe(Effect.provide(SharedDb.SharedDb.Live))
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as SharedDb from "./Db";
