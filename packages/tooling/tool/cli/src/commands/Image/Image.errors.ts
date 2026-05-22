/**
 * Image command error types.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Image/Image.errors");

/**
 * Error raised by image curation commands.
 *
 * @example
 * ```ts
 * import { ImageCommandError } from "@beep/repo-cli/commands/Image/index"
 *
 * const error = ImageCommandError.make({ message: "No videos found" })
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class ImageCommandError extends TaggedErrorClass<ImageCommandError>($I`ImageCommandError`)(
  "ImageCommandError",
  {
    message: S.String,
    cause: S.optionalKey(S.DefectWithStack),
  },
  $I.annote("ImageCommandError", {
    description: "A failure raised while preparing or applying an image curation operation.",
  })
) {
  static readonly new = (message: string) => (cause: unknown) =>
    ImageCommandError.make({
      message,
      cause,
    });
}
