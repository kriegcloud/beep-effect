/**
 * Re-exports File repository implementation.
 *
 * @example
 * ```typescript
 * import { FileRepo } from "@beep/shared-infra"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const fileRepo = yield* FileRepo
 *   const files = yield* fileRepo.listPaginated({ userId, offset: 0, limit: 20 })
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./File.repo.ts";

/**
 * Re-exports consolidated shared repository namespace with layer composition.
 *
 * @example
 * ```typescript
 * import { SharedRepos } from "@beep/shared-infra"
 * import * as Effect from "effect/Effect"
 *
 * const program = myEffect.pipe(Effect.provide(SharedRepos.layer))
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as SharedRepos from "./repositories.ts";
