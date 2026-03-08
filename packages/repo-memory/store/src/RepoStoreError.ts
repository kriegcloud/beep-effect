import { $RepoMemoryStoreId } from "@beep/identity/packages";
import { StatusCauseFields, TaggedErrorClass } from "@beep/schema";

const $I = $RepoMemoryStoreId.create("RepoStoreError");

/**
 * Typed persistence error emitted by repo-memory store algebras.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoStoreError extends TaggedErrorClass<RepoStoreError>($I`RepoStoreError`)("RepoStoreError", {
  ...StatusCauseFields,
}) {}
