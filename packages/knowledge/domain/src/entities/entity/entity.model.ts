/**
 * Entity domain model for Knowledge slice
 *
 * Represents an extracted entity from text with types,
 * attributes, and provenance information.
 *
 * @module knowledge-domain/entities/Entity
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { Attributes, Confidence, EvidenceSpan } from "../../value-objects";

const $I = $KnowledgeDomainId.create("entities/Entity");

/**
 * Entity model for the knowledge slice.
 *
 * Represents an extracted entity from text (e.g., Person, Organization, Event).
 * Entities have types from an ontology, attributes, and provenance tracking.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const entity = Entities.Entity.Model.insert.make({
 *   id: KnowledgeEntityIds.KnowledgeEntityId.make("knowledge_entity__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   mention: "Cristiano Ronaldo",
 *   types: ["http://schema.org/Person", "http://schema.org/Athlete"],
 *   attributes: { "http://schema.org/birthDate": "1985-02-05" },
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`EntityModel`)(
  makeFields(KnowledgeEntityIds.KnowledgeEntityId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Original text mention from source
     *
     * @example "Cristiano Ronaldo", "Al-Nassr"
     */
    mention: S.String.annotations({
      description: "Exact text span extracted from source",
    }),

    /**
     * Ontology class URIs this entity instantiates
     *
     * @example ["http://schema.org/Person", "http://schema.org/Athlete"]
     */
    types: S.NonEmptyArray(S.String).annotations({
      description: "Ontology class URIs (at least one required)",
    }),

    /**
     * Entity attributes as property-value pairs
     */
    attributes: Attributes.annotations({
      description: "Property-value pairs from extraction",
    }),

    /**
     * Ontology scoping - which ontology was used for extraction
     */
    ontologyId: BS.FieldOptionOmittable(
      KnowledgeEntityIds.OntologyId.annotations({
        description: "Ontology scope for this entity (omit for default ontology)",
      })
    ),

    /**
     * Source document ID for provenance tracking
     */
    documentId: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Source document ID for provenance tracking",
      })
    ),

    /**
     * Source URI where the document was loaded from
     */
    sourceUri: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Storage URI of source document",
      })
    ),

    /**
     * Extraction run ID that created this entity
     */
    extractionId: BS.FieldOptionOmittable(KnowledgeEntityIds.ExtractionId),

    /**
     * System-generated grounding confidence (0-1)
     */
    groundingConfidence: BS.FieldOptionOmittable(
      Confidence.annotations({
        description: "System-verified confidence that entity is grounded in source text (0-1)",
      })
    ),

    /**
     * Evidence spans showing where this entity was mentioned in source text
     */
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
