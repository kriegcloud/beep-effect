/**
 * Error representing a file or directory that could not be found.
 *
 * Typically raised when traversing the filesystem for markers like `.git`
 * or `bun.lock` and reaching the root without success, or when an expected
 * file path does not exist on disk.
 *
 * @since 0.0.0
 * @category errors
 */
import * as S from "effect/Schema";

/**
 * Raised when a required file or directory cannot be located.
 *
 * @since 0.0.0
 * @category errors
 */
export class NoSuchFileError extends S.TaggedErrorClass<NoSuchFileError>(
  "@beep/repo-utils/errors/NoSuchFileError/NoSuchFileError"
)(
  "NoSuchFileError",
  {
    path: S.String,
    message: S.String,
  },
  {
    title: "No Such File Error",
    description: "Raised when a required file or directory cannot be located on the filesystem.",
  }
) {}
