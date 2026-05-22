/**
 * Image command error types.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity";
import { CauseTaggedError } from "@beep/schema";

const $I = $RepoCliId.create("commands/Image/Image.errors");

/**
 * Error raised by image curation commands.
 *
 * @example
 * ```ts
 * import { ImageCommandError } from "@beep/repo-cli/commands/Image/index"
 *
 * const error = new ImageCommandError({ message: "No videos found" })
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class ImageCommandError extends CauseTaggedError<ImageCommandError>($I`ImageCommandError`)(
  "ImageCommandError",
  {},
  $I.annote("ImageCommandError", {
    description: "A failure raised while preparing or applying an image curation operation.",
  })
) {}
