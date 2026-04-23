/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/SummarizedContent/SummarizedContent.model")

/**
 * Class for a single class label summary and description.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class SummarizedContent extends S.Class<SummarizedContent>($I`SummarizedContent`)(
  {
    summary: S.String,
    description: S.String,
  },
  $I.annote(
    "SummarizedContent",
    {
      description: "Class for a single class label summary and description.",
    },
  ),
) {
}
