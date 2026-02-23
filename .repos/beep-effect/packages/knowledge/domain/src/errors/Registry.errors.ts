import { $KnowledgeDomainId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/registry");

export class RegistryError extends S.TaggedError<RegistryError>($I`RegistryError`)(
  "RegistryError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("RegistryError", {
    description: "EntityRegistry operation failed",
  })
) {}

export class SimilarityError extends S.TaggedError<SimilarityError>($I`SimilarityError`)(
  "SimilarityError",
  {
    message: S.String,
    mentionId: KnowledgeEntityIds.MentionRecordId,
    candidateCount: S.Number,
  },
  $I.annotations("SimilarityError", {
    description: "Embedding similarity computation failed",
  })
) {}
