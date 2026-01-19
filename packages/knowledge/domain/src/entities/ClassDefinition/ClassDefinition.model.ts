/**
 * ClassDefinition domain model for Knowledge slice
 *
 * Represents an OWL/RDFS class definition extracted from an ontology.
 * Includes hierarchy information, SKOS labels, and associated properties.
 *
 * @module knowledge-domain/entities/ClassDefinition
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/ClassDefinition");

/**
 * ClassDefinition model for the knowledge slice.
 *
 * Represents an OWL/RDFS class extracted from an ontology file.
 * Includes metadata, hierarchy relationships, and SKOS annotations.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const classDef = Entities.ClassDefinition.Model.insert.make({
 *   id: KnowledgeEntityIds.ClassDefinitionId.make("knowledge_class_definition__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   ontologyId: KnowledgeEntityIds.OntologyId.make("knowledge_ontology__uuid"),
 *   iri: "http://schema.org/Person",
 *   label: "Person",
 *   comment: "A person (alive, dead, undead, or fictional).",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`ClassDefinitionModel`)(
  makeFields(KnowledgeEntityIds.ClassDefinitionId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Reference to the parent ontology
     */
    ontologyId: KnowledgeEntityIds.OntologyId.annotations({
      description: "Reference to the parent ontology",
    }),

    /**
     * Full IRI of the OWL/RDFS class
     *
     * @example "http://schema.org/Person"
     */
    iri: S.String.annotations({
      description: "Full IRI of the OWL/RDFS class",
    }),

    /**
     * Human-readable label (rdfs:label)
     *
     * @example "Person"
     */
    label: S.String.annotations({
      description: "Human-readable label from rdfs:label",
    }),

    /**
     * Description/documentation (rdfs:comment)
     *
     * @example "A person (alive, dead, undead, or fictional)."
     */
    comment: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Class description from rdfs:comment",
      })
    ),

    /**
     * Local name extracted from IRI
     *
     * @example "Person" from "http://schema.org/Person"
     */
    localName: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Local name extracted from IRI",
      })
    ),

    /**
     * Property IRIs applicable to this class (stored as JSON array)
     */
    properties: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Property IRIs that can be used with this class",
      })
    ),

    /**
     * SKOS preferred labels (skos:prefLabel)
     */
    prefLabels: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "SKOS preferred labels",
      })
    ),

    /**
     * SKOS alternative labels (skos:altLabel) - synonyms
     */
    altLabels: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "SKOS alternative labels - synonyms",
      })
    ),

    /**
     * SKOS hidden labels (skos:hiddenLabel) - misspellings, abbreviations
     */
    hiddenLabels: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "SKOS hidden labels - misspellings, abbreviations",
      })
    ),

    /**
     * SKOS definition (skos:definition)
     */
    definition: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SKOS definition - formal definition",
      })
    ),

    /**
     * SKOS scope note (skos:scopeNote)
     */
    scopeNote: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SKOS scope note - clarification of scope",
      })
    ),

    /**
     * SKOS example (skos:example)
     */
    example: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SKOS example - example usage",
      })
    ),

    /**
     * Parent class IRIs (rdfs:subClassOf / skos:broader)
     */
    broader: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Parent class IRIs from rdfs:subClassOf",
      })
    ),

    /**
     * Child class IRIs (skos:narrower)
     */
    narrower: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Child class IRIs from skos:narrower",
      })
    ),

    /**
     * Related class IRIs (skos:related)
     */
    related: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Related class IRIs from skos:related",
      })
    ),

    /**
     * Equivalent class IRIs (owl:equivalentClass)
     */
    equivalentClass: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Equivalent class IRIs from owl:equivalentClass",
      })
    ),

    /**
     * SKOS exact match (skos:exactMatch)
     */
    exactMatch: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Exact match concepts in other vocabularies",
      })
    ),

    /**
     * SKOS close match (skos:closeMatch)
     */
    closeMatch: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Close match concepts in other vocabularies",
      })
    ),
  }),
  $I.annotations("ClassDefinitionModel", {
    description: "OWL/RDFS class definition extracted from ontology.",
  })
) {
  static readonly utils = modelKit(Model);
}
