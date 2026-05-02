/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import * as S from "effect/Schema";


const $I = $ScratchpadId.create("values/ProcessingMetadata/ProcessingMetadata.model");

export class ProcessingMetadata extends S.Class<ProcessingMetadata>($I`ProcessingMetadata`)(
  {
id: S.String,
    documentId: S.String,
    time: S.DateTimeUtcFromMillis,
    flow: S.String,
    user: S.String,
    collection: S.String,
    tags: S.Array(S.String)
  },
  $I.annote(
    "ProcessingMetadata",
    {
      description: ""
    }
  )
) {}
