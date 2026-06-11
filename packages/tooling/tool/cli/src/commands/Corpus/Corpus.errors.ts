/**
 * Typed errors for corpus curation commands.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Err } from "@beep/utils";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Corpus/Corpus.errors");

/**
 * Error raised by corpus curation commands.
 *
 * @example
 * ```ts
 * import { CorpusCommandError } from "@beep/repo-cli/commands/Corpus/index"
 *
 * const error = CorpusCommandError.make({ message: "Invalid corpus root" })
 * console.log(error.message)
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class CorpusCommandError extends TaggedErrorClass<CorpusCommandError>($I`CorpusCommandError`)(
  "CorpusCommandError",
  {
    message: S.String,
    cause: S.optionalKey(S.Defect({ includeStack: true })),
  },
  $I.annote("CorpusCommandError", {
    description: "A failure raised while preparing or applying a corpus curation operation.",
  })
) {
  /**
   * Construct a corpus command error from an original cause and message.
   *
   * @category constructors
   */
  static readonly new: {
    (cause: unknown, message: string): CorpusCommandError;
    (message: string): (cause: unknown) => CorpusCommandError;
  } = dual(2, (cause: unknown, message: string): CorpusCommandError => CorpusCommandError.make({ cause, message }));

  static readonly mapError = Err.mapToError(this.new);
}
