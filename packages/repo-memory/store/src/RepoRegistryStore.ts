import { $RepoMemoryStoreId } from "@beep/identity/packages";
import type { RepoId, RepoRegistration, RepoRegistrationInput } from "@beep/repo-memory-model";
import { Context, type Effect } from "effect";
import type { RepoStoreError } from "./RepoStoreError.js";

const $I = $RepoMemoryStoreId.create("RepoRegistryStore");

/**
 * Contract for repository registration persistence.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface RepoRegistryStoreShape {
  readonly getRepo: (repoId: RepoId) => Effect.Effect<RepoRegistration, RepoStoreError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoStoreError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoStoreError>;
}

/**
 * Repository registration store service.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoRegistryStore extends Context.Service<RepoRegistryStore, RepoRegistryStoreShape>()(
  $I`RepoRegistryStore`
) {}
