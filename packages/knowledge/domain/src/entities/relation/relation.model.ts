/**
 * Relation domain model for Knowledge slice
 *
 * Represents a relationship between entities (subject-predicate-object triple).
 *
 * @module knowledge-domain/entities/Relation
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { Confidence, EvidenceSpan } from "../../value-objects";

const $I = $KnowledgeDomainId.create("entities/Relation");

/**
 * Relation model for the knowledge slice.
 *
 * Represents a relationship between two entities via an ontology property.
 * Follows RDF triple semantics: subject-predicate-object.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const relation = Entities.Relation.Model.insert.make({
 *   id: KnowledgeEntityIds.RelationId.make("knowledge_relation__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   subjectId: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__subject-uuid"),
 *   predicate: "http://schema.org/memberOf",
 *   objectId: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__object-uuid"),
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`RelationModel`)(
  makeFields(KnowledgeEntityIds.RelationId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Entity ID of the subject (source entity)
     */
    subjectId: KnowledgeEntityIds.KnowledgeEntityId.annotations({
      description: "Entity ID of the triple subject",
    }),

    /**
     * Ontology property URI (predicate)
     *
     * @example "http://schema.org/memberOf"
     */
    predicate: S.String.annotations({
      description: "Ontology property URI",
    }),

    /**
     * Entity ID of the object (target entity)
     * For literal values, this field is null and literalValue is used
     */
    objectId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.KnowledgeEntityId.annotations({
        description: "Entity ID reference for object properties",
      })
    ),

    /**
     * Literal value for datatype properties
     * For entity references, this field is null and objectId is used
     */
    literalValue: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Literal value for datatype properties",
      })
    ),

    /**
     * Type of the literal value (if applicable)
     * XSD datatype or language tag
     */
    literalType: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "XSD datatype or language tag for literal",
      })
    ),

    /**
     * Ontology scoping - which ontology was used for extraction
     */
    ontologyId: BS.toOptionalWithDefault(S.String)("default").annotations({
      description: "Ontology scope for this relation",
    }),

    /**
     * Extraction run ID that created this relation
     */
    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),

    /**
     * Evidence span showing where this relation was expressed in source text
     */
    evidence: BS.FieldOptionOmittable(
      EvidenceSpan.annotations({
        description: "Text span where this relation was expressed in source",
      })
    ),

    /**
     * System-generated grounding confidence (0-1)
     */
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

  /**
   * Check if this relation has a literal object (vs entity reference)
   */
  get isLiteralRelation(): boolean {
    return this.literalValue !== undefined && this.objectId === undefined;
  }

  /**
   * Check if this relation has an entity reference object
   */
  get isEntityRelation(): boolean {
    return this.objectId !== undefined;
  }
}
