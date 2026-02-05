import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/extraction-config");

export class ExtractionConfig extends S.Class<ExtractionConfig>($I`ExtractionConfig`)(
  {
    chunkSize: S.optional(BS.PosInt),
    chunkOverlap: S.optional(S.NonNegativeInt),
    maxChunks: S.optional(BS.PosInt),
    enableGrounding: S.optional(S.Boolean),
  },
  $I.annotations("ExtractionConfig", {
    description: "Configuration for extraction operations",
  })
) {}
