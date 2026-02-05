import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Mention");

export class Model extends M.Class<Model>($I`MentionModel`)(
  makeFields(KnowledgeEntityIds.MentionId, {
    organizationId: SharedEntityIds.OrganizationId,

    entityId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "Entity this mention refers to",
    }),

    text: S.String.annotations({
      description: "Exact text span from source document",
    }),

    startChar: S.NonNegativeInt.annotations({
      description: "Character offset start (0-indexed)",
    }),

    endChar: S.NonNegativeInt.annotations({
      description: "Character offset end (exclusive)",
    }),

    documentId: DocumentsEntityIds.DocumentId.annotations({
      description: "ID of the source document containing this mention",
    }),

    chunkIndex: BS.FieldOptionOmittable(
      S.NonNegativeInt.annotations({
        description: "Chunk index within the document",
      })
    ),

    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),

    confidence: BS.FieldOptionOmittable(
      Confidence.annotations({
        description: "Extraction confidence score (0-1)",
      })
    ),

    isPrimary: BS.BoolWithDefault(false).annotations({
      description: "Whether this is the primary/canonical mention of the entity",
    }),

    context: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Surrounding context text for disambiguation",
      })
    ),
  }),
  $I.annotations("MentionModel", {
    description: "Individual entity mention in source text with character-level provenance.",
  })
) {
  static readonly utils = modelKit(Model);
}
