import { $KnowledgeDomainId } from "@beep/identity/packages";
import { Attributes, Confidence } from "@beep/knowledge-domain/value-objects/Attributes.value";
import { EvidenceSpan } from "@beep/knowledge-domain/value-objects/EvidenceSpan.value";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Entity");

export class Model extends M.Class<Model>($I`EntityModel`)(
  makeFields(KnowledgeEntityIds.KnowledgeEntityId, {
    organizationId: SharedEntityIds.OrganizationId,
    mention: S.String.annotations({
      description: "Exact text span extracted from source",
    }),
    types: S.NonEmptyArray(S.String).annotations({
      description: "Ontology class URIs (at least one required)",
    }),
    attributes: Attributes.annotations({
      description: "Property-value pairs from extraction",
    }),
    ontologyId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.OntologyId.annotations({
        description: "Ontology scope for this entity (omit for default ontology)",
      })
    ),
    documentId: BS.FieldOptionOmittable(
      DocumentsEntityIds.DocumentId.annotations({
        description: "Source document ID for provenance tracking",
      })
    ),
    sourceUri: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Storage URI of source document",
      })
    ),
    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),
    groundingConfidence: BS.FieldOptionOmittable(
      Confidence.annotations({
        description: "System-verified confidence that entity is grounded in source text (0-1)",
      })
    ),
    mentions: BS.FieldOptionOmittable(
      S.Array(EvidenceSpan).annotations({
        description: "Text spans where this entity was mentioned in source",
      })
    ),
  }),
  $I.annotations("EntityModel", {
    description: "Extracted knowledge graph entity with types, attributes, and provenance.",
  })
) {
  static readonly utils = modelKit(Model);
}
