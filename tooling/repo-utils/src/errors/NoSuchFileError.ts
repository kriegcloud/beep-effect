/**
 * Error representing a file or directory that could not be found.
 *
 * Typically raised when traversing the filesystem for markers like `.git`
 * or `bun.lock` and reaching the root without success, or when an expected
 * file path does not exist on disk.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("errors/NoSuchFileError");

/**
 * Raised when a required file or directory cannot be located.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export class NoSuchFileError extends S.TaggedErrorClass<NoSuchFileError>($I`NoSuchFileError`)(
  "NoSuchFileError",
  {
    path: S.String,
    message: S.String,
  },
  $I.annote("NoSuchFileError", {
    title: "No Such File Error",
    description: "Raised when a required file or directory cannot be located on the filesystem.",
  })
) {}
// bench
