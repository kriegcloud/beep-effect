/**
 * PropertyDefinition domain model for Knowledge slice
 *
 * Represents an OWL/RDFS property definition extracted from an ontology.
 * Includes domain/range constraints, SKOS labels, and property characteristics.
 *
 * @module knowledge-domain/entities/PropertyDefinition
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { ClassIri } from "../../value-objects";

const $I = $KnowledgeDomainId.create("entities/PropertyDefinition");

/**
 * Property range type enum
 *
 * @since 0.1.0
 * @category schemas
 */
export class PropertyRangeType extends BS.StringLiteralKit("object", "datatype").annotations({
  identifier: "PropertyRangeType",
  description: "Whether property links entities (object) or has literal values (datatype)",
}) {}

export declare namespace PropertyRangeType {
  export type Type = typeof PropertyRangeType.Type;
}

/**
 * PropertyDefinition model for the knowledge slice.
 *
 * Represents an OWL/RDFS property extracted from an ontology file.
 * Includes domain/range constraints and SKOS annotations.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/knowledge-domain";
 * import * as DateTime from "effect/DateTime";
 *
 * const propDef = Entities.PropertyDefinition.Model.insert.make({
 *   id: KnowledgeEntityIds.PropertyDefinitionId.make("knowledge_property_definition__uuid"),
 *   organizationId: SharedEntityIds.OrganizationId.make("shared_organization__uuid"),
 *   ontologyId: KnowledgeEntityIds.OntologyId.make("knowledge_ontology__uuid"),
 *   iri: "http://schema.org/memberOf",
 *   label: "member of",
 *   comment: "An Organization to which this person belongs.",
 *   rangeType: "object",
 *   createdAt: DateTime.unsafeNow(),
 *   updatedAt: DateTime.unsafeNow(),
 * });
 * ```
 *
 * @since 0.1.0
 * @category models
 */
export class Model extends M.Class<Model>($I`PropertyDefinitionModel`)(
  makeFields(KnowledgeEntityIds.PropertyDefinitionId, {
    organizationId: SharedEntityIds.OrganizationId,

    /**
     * Reference to the parent ontology
     */
    ontologyId: KnowledgeEntityIds.OntologyId.annotations({
      description: "Reference to the parent ontology",
    }),

    /**
     * Full IRI of the OWL/RDFS property
     *
     * @example "http://schema.org/memberOf"
     */
    iri: ClassIri.annotations({
      description: "Full IRI of the OWL/RDFS property",
    }),

    /**
     * Human-readable label (rdfs:label)
     *
     * @example "member of"
     */
    label: S.String.annotations({
      description: "Human-readable label from rdfs:label",
    }),

    /**
     * Description/documentation (rdfs:comment)
     *
     * @example "An Organization to which this person belongs."
     */
    comment: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Property description from rdfs:comment",
      })
    ),

    /**
     * Local name extracted from IRI
     *
     * @example "memberOf" from "http://schema.org/memberOf"
     */
    localName: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Local name extracted from IRI",
      })
    ),

    /**
     * Domain class IRIs (valid subject types from rdfs:domain)
     */
    domain: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Class IRIs that can use this property (rdfs:domain)",
      })
    ),

    /**
     * Range class IRIs or datatype (valid object types from rdfs:range)
     */
    range: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Class IRIs or datatypes for property values (rdfs:range)",
      })
    ),

    /**
     * Property type: object (links entities) or datatype (literal values)
     */
    rangeType: BS.toOptionalWithDefault(PropertyRangeType)("object").annotations({
      description: "Whether property links entities (object) or has literal values (datatype)",
    }),

    /**
     * Whether property is functional (has at most one value)
     */
    isFunctional: BS.BoolWithDefault(false).annotations({
      description: "Whether property is functional (owl:FunctionalProperty)",
    }),

    /**
     * Inverse property IRIs (owl:inverseOf)
     */
    inverseOf: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Inverse property IRIs from owl:inverseOf",
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
     * Parent property IRIs (rdfs:subPropertyOf / skos:broader)
     */
    broader: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Parent property IRIs from rdfs:subPropertyOf",
      })
    ),

    /**
     * Child property IRIs (skos:narrower)
     */
    narrower: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Child property IRIs from skos:narrower",
      })
    ),

    /**
     * Related property IRIs (skos:related)
     */
    related: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Related property IRIs from skos:related",
      })
    ),

    /**
     * SKOS exact match (skos:exactMatch)
     */
    exactMatch: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Exact match properties in other vocabularies",
      })
    ),

    /**
     * SKOS close match (skos:closeMatch)
     */
    closeMatch: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Close match properties in other vocabularies",
      })
    ),
  }),
  $I.annotations("PropertyDefinitionModel", {
    description: "OWL/RDFS property definition extracted from ontology.",
  })
) {
  static readonly utils = modelKit(Model);

  /**
   * Check if property is an ObjectProperty (links entities)
   */
  get isObjectProperty(): boolean {
    return PropertyRangeType.is.object(this.rangeType);
  }

  /**
   * Check if property is a DatatypeProperty (literal values)
   */
  get isDatatypeProperty(): boolean {
    return PropertyRangeType.is.datatype(this.rangeType);
  }
}
