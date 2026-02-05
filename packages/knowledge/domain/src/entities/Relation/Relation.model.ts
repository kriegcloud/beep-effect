import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { Confidence, EvidenceSpan } from "../../value-objects";

const $I = $KnowledgeDomainId.create("entities/Relation");

export class Model extends M.Class<Model>($I`RelationModel`)(
  makeFields(KnowledgeEntityIds.RelationId, {
    organizationId: SharedEntityIds.OrganizationId,

    subjectId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "Entity ID of the triple subject",
    }),

    predicate: S.String.annotations({
      description: "Ontology property URI",
    }),

    objectId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.KnowledgeEntityId.annotations({
        description: "Entity ID reference for object properties",
      })
    ),

    literalValue: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Literal value for datatype properties",
      })
    ),

    literalType: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "XSD datatype or language tag for literal",
      })
    ),

    ontologyId: BS.toOptionalWithDefault(KnowledgeEntityIds.OntologyId)("default").annotations({
      description: "Ontology scope for this relation",
    }),

    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),

    evidence: BS.FieldOptionOmittable(
      EvidenceSpan.annotations({
        description: "Text span where this relation was expressed in source",
      })
    ),

    groundingConfidence: BS.FieldOptionOmittable(
      Confidence.annotations({
        description: "System-verified confidence that relation is grounded in source text (0-1)",
      })
    ),
  }),
  $I.annotations("RelationModel", {
    description: "Knowledge graph relation (subject-predicate-object triple) with evidence.",
  })
) {
  static readonly utils = modelKit(Model);

  get isLiteralRelation(): boolean {
    return this.literalValue !== undefined && this.objectId === undefined;
  }

  get isEntityRelation(): boolean {
    return this.objectId !== undefined;
  }
}
