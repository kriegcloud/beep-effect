/**
 * DeleteCorpus tool definition.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";

const $I = $NlpId.create("Tools/DeleteCorpus");

class DeleteCorpusParameters extends S.Class<DeleteCorpusParameters>($I`DeleteCorpusParameters`)(
  {
    corpusId: S.String.check(S.isMinLength(1)).annotateKey({
      description: "Corpus identifier returned by CreateCorpus",
    }),
  },
  $I.annote("DeleteCorpusParameters", {
    description: "Inputs required to delete a previously created corpus session.",
  })
) {}

class DeleteCorpusSuccess extends S.Class<DeleteCorpusSuccess>($I`DeleteCorpusSuccess`)(
  {
    corpusId: S.String,
    deleted: S.Boolean,
  },
  $I.annote("DeleteCorpusSuccess", {
    description: "Deletion outcome for a corpus session.",
  })
) {}

/**
 * Tool for deleting a corpus session.
 *
 * @example
 * ```ts
 * import { DeleteCorpus } from "@beep/nlp/Tools/DeleteCorpus"
 *
 * console.log(DeleteCorpus)
 * ```
 *
 * @since 0.0.0
 * @category Tools
 */
export const DeleteCorpus = Tool.make("DeleteCorpus", {
  description: "Delete a corpus session and release its in-memory index state.",
  parameters: DeleteCorpusParameters,
  success: DeleteCorpusSuccess,
});
