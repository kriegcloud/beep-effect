/**
 * context graph field value object.
 *
 * @since 0.0.0
 * @packageDocumentationq
 */
import { $ScratchpadId } from "@beep/identity";
import * as S from "effect/Schema";
import { PipelineMetadata } from "../PipelineMetadata/index.ts"

const $I = $ScratchpadId.create("values/Chunk/Chunk.model");

export class Chunk extends S.Class<Chunk>($I`Chunk`)(
  {
    metadata: PipelineMetadata,
    chunk: S.String,
    documentId: S.String,
  },
  $I.annote(
    "Chunk",
    {
      description: ""
    }
  )
) {}
