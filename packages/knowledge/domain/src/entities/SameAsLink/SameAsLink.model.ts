import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Confidence } from "@beep/knowledge-domain/value-objects";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";

const $I = $KnowledgeDomainId.create("entities/SameAsLink");

export class Model extends M.Class<Model>($I`SameAsLinkModel`)(
  makeFields(KnowledgeEntityIds.SameAsLinkId, {
    organizationId: SharedEntityIds.OrganizationId,

    canonicalId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the canonical (authoritative) entity",
    }),

    memberId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "ID of the member entity that is same-as canonical",
    }),

    confidence: Confidence.annotations({
      description: "Confidence score for this same-as determination (0-1)",
    }),

    sourceId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.ExtractionId.annotations({
        description: "Source extraction ID for provenance",
      })
    ),
  }),
  $I.annotations("SameAsLinkModel", {
    description: "owl:sameAs provenance link between resolved entities",
  })
) {
  static readonly utils = modelKit(Model);
}
