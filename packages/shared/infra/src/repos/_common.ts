/**
 * Shared dependencies and utilities for repository services.
 *
 * @since 0.1.0
 */
import { SharedDb } from "@beep/shared-infra/Db";

/**
 * Shared dependencies for all repository services.
 *
 * @example
 * ```typescript
 * import { dependencies } from "@beep/shared-infra/repos/_common"
 * import * as Effect from "effect/Effect"
 *
 * export class MyRepo extends Effect.Service<MyRepo>()("MyRepo", {
 *   dependencies,
 *   effect: Effect.gen(function* () {
 *     // Repository implementation
 *   })
 * }) {}
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const dependencies = [SharedDb.SharedDb.Live] as const;
