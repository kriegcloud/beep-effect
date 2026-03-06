import { $RepoMemoryStoreId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoMemoryStoreId.create("RepoStoreError");

/**
 * Typed persistence error emitted by repo-memory store algebras.
 *
 * @since 0.0.0
 * @category Errors
 */
export class RepoStoreError extends TaggedErrorClass<RepoStoreError>($I`RepoStoreError`)("RepoStoreError", {
  message: S.String,
  status: S.Number,
  cause: S.OptionFromOptionalKey(S.DefectWithStack),
}) {}
