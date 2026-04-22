/**
 * Repository registration store algebra.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoId, RepoRegistration, RepoRegistrationInput } from "@beep/repo-memory-model";
import { Context, type Effect } from "effect";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoRegistryStore");

/**
 * Contract for repository registration persistence.
 *
 * @example
 * ```ts
 * import type { RepoRegistryStoreShape } from "@beep/repo-memory-store"
 *
 * const methods = [
 *   "getRepo",
 *   "listRepos",
 *   "registerRepo"
 * ] satisfies ReadonlyArray<keyof RepoRegistryStoreShape>
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export interface RepoRegistryStoreShape {
  readonly getRepo: (repoId: RepoId) => Effect.Effect<RepoRegistration, RepoStoreError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoStoreError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoStoreError>;
}

/**
 * Repository registration store service.
 *
 * @example
 * ```ts
 * import { RepoRegistryStore } from "@beep/repo-memory-store"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* RepoRegistryStore
 *   return store.listRepos
 * })
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export class RepoRegistryStore extends Context.Service<RepoRegistryStore, RepoRegistryStoreShape>()(
  $I`RepoRegistryStore`
) {}
