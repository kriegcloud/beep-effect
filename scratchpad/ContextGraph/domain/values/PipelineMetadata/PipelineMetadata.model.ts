/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import * as S from "effect/Schema";


const $I = $ScratchpadId.create("values/PipelineMetadata/PipelineMetadata.model");

export class PipelineMetadata extends S.Class<PipelineMetadata>($I`PipelineMetadata`)(
  {
    id: S.String,
    root: S.String,
    user: S.String,
    collection: S.String,
  },
  $I.annote(
    "PipelineMetadata",
    {
      description: ""
    }
  )
) {}
