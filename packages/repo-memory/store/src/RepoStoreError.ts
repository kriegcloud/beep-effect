import { $RepoMemoryStoreId } from "@beep/identity/packages";
import { StatusCauseTaggedErrorClass } from "@beep/schema";

const $I = $RepoMemoryStoreId.create("RepoStoreError");

/**
 * Typed persistence error emitted by repo-memory store algebras.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoStoreError extends StatusCauseTaggedErrorClass<RepoStoreError>($I`RepoStoreError`)(
  "RepoStoreError",
  $I.annote("RepoStoreError", {
    description: "Typed persistence error emitted by repo-memory store algebras.",
  })
) {}
