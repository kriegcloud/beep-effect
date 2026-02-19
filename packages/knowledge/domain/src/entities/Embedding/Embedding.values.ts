import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Embedding/Embedding.values");

export class SimilarityResult extends S.Class<SimilarityResult>($I`SimilarityResult`)(
  {
    id: KnowledgeEntityIds.EmbeddingId,
    entityType: S.String,
    entityId: KnowledgeEntityIds.KnowledgeEntityId,
    contentText: S.optional(S.String),
    similarity: S.Number,
  },
  $I.annotations("SimilarityResult", {
    description: "Similarity search result row (embedding id, entity linkage, optional text, and similarity score).",
  })
) {}
