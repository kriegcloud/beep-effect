/**
 * Ontology domain model for Knowledge slice
 *
 * Represents an OWL/RDFS ontology definition used for extraction.
 *
 * @module knowledge-domain/entities/Ontology
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Ontology");

/**
 * Ontology status enum
 *
 * @since 0.1.0
 * @category schemas
 */
export class OntologyStatus extends BS.StringLiteralKit("draft", "active", "deprecated").annotations({
  identifier: "OntologyStatus",
  description: "Status of the ontology definition",
}) {}

export declare namespace OntologyStatus {
  export type Type = typeof OntologyStatus.Type;
}

/**
 * Ontology format enum
 *
 * @since 0.1.0
 * @category schemas
 */
export class OntologyFormat extends BS.StringLiteralKit("turtle", "rdfxml", "jsonld", "ntriples").annotations({
  identifier: "OntologyFormat",
  description: "Serialization format of the ontology",
}) {}

export declare namespace OntologyFormat {
  export type Type = typeof OntologyFormat.Type;
}

/**
 * Ontology model for the knowledge slice.
 *
 * Represents an OWL/RDFS ontology definition that can be used
 * for focused knowledge extraction. Tracks version history and metadata.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const ontology = Entities.Ontology.Model.insert.make({
 *   id: KnowledgeEntityIds.OntologyId.make("knowledge_ontology__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   name: "schema.org",
 *   namespace: "https://schema.org/",
 *   ontologyVersion: "1.0.0",
 *   status: "active",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`OntologyModel`)(
  makeFields(KnowledgeEntityIds.OntologyId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Human-readable name for the ontology
     */
    name: S.String.annotations({
      description: "Human-readable ontology name",
    }),

    /**
     * Namespace URI for the ontology
     *
     * @example "https://schema.org/"
     */
    namespace: S.String.annotations({
      description: "Ontology namespace URI",
    }),

    /**
     * Ontology version string (semantic versioning recommended)
     */
    ontologyVersion: BS.toOptionalWithDefault(BS.SemanticVersion)(BS.SemanticVersion.make("1.0.0")).annotations({
      description: "Semantic version of the ontology",
    }),

    /**
     * Description of the ontology
     */
    description: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Human-readable ontology description",
      })
    ),

    /**
     * Status of the ontology
     */
    status: BS.toOptionalWithDefault(OntologyStatus)("active").annotations({
      description: "Current status of the ontology",
    }),

    /**
     * Serialization format of the stored ontology
     */
    format: BS.toOptionalWithDefault(OntologyFormat)("turtle").annotations({
      description: "Serialization format of the ontology content",
    }),

    /**
     * Content hash for deduplication and versioning
     */
    contentHash: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SHA-256 hash of ontology content for versioning",
      })
    ),

    /**
     * Storage path for the ontology file
     */
    storagePath: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Storage path to the ontology file",
      })
    ),

    /**
     * Number of classes defined in the ontology
     */
    classCount: BS.FieldOptionOmittable(
      S.NonNegativeInt.annotations({
        description: "Number of OWL/RDFS classes defined",
      })
    ),

    /**
     * Number of properties defined in the ontology
     */
    propertyCount: BS.FieldOptionOmittable(
      S.NonNegativeInt.annotations({
        description: "Number of OWL/RDFS properties defined",
      })
    ),

    /**
     * Ontology-level metadata
     */
    metadata: BS.FieldOptionOmittable(
      S.Record({ key: S.String, value: S.String }).annotations({
        description: "Ontology-level metadata (title, creator, etc.)",
      })
    ),
  }),
  $I.annotations("OntologyModel", {
    description: "OWL/RDFS ontology definition for focused knowledge extraction.",
  })
) {
  static readonly utils = modelKit(Model);
}
