/**
 * Typed store error model for repo-memory persistence boundaries.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoMemoryStoreId } from "@beep/identity/packages";
import { StatusCauseTaggedErrorClass } from "@beep/schema";

const $I = $RepoMemoryStoreId.create("RepoStoreError");

/**
 * Typed persistence error emitted by repo-memory store algebras.
 *
 * @example
 * ```ts
 * import { RepoStoreError } from "@beep/repo-memory-store"
 *
 * const error = RepoStoreError.new("sqlite", "Unable to persist repository.", 500)
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class RepoStoreError extends StatusCauseTaggedErrorClass<RepoStoreError>($I`RepoStoreError`)(
  "RepoStoreError",
  $I.annote("RepoStoreError", {
    description: "Typed persistence error emitted by repo-memory store algebras.",
  })
) {}
