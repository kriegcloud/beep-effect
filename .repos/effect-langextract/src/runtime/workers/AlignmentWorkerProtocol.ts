import { Schema } from "effect"

import { Extraction } from "../../Data.js"

export class AlignChunkRequest extends Schema.TaggedRequest<AlignChunkRequest>()(
  "AlignChunkRequest",
  {
    failure: Schema.Never,
    success: Schema.Array(Extraction),
    payload: {
      extractions: Schema.Array(Extraction),
      sourceText: Schema.String,
      tokenOffset: Schema.Int,
      charOffset: Schema.Int,
      enableFuzzyAlignment: Schema.optionalWith(Schema.Boolean, {
        exact: true
      }),
      fuzzyAlignmentThreshold: Schema.optionalWith(Schema.Number, {
        exact: true
      }),
      acceptMatchLesser: Schema.optionalWith(Schema.Boolean, {
        exact: true
      })
    }
  }
) {}

export const AlignmentWorkerMessage = Schema.Union(AlignChunkRequest)
export type AlignmentWorkerMessage = typeof AlignmentWorkerMessage.Type
