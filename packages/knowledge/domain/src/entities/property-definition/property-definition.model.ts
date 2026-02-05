import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { ClassIri } from "../../value-objects";

const $I = $KnowledgeDomainId.create("entities/PropertyDefinition");

export class PropertyRangeType extends BS.StringLiteralKit("object", "datatype").annotations({
  identifier: "PropertyRangeType",
  description: "Whether property links entities (object) or has literal values (datatype)",
}) {}

export declare namespace PropertyRangeType {
  export type Type = typeof PropertyRangeType.Type;
}

export class Model extends M.Class<Model>($I`PropertyDefinitionModel`)(
  makeFields(KnowledgeEntityIds.PropertyDefinitionId, {
    organizationId: SharedEntityIds.OrganizationId,

    ontologyId: KnowledgeEntityIds.OntologyId.annotations({
      description: "Reference to the parent ontology",
    }),

    iri: ClassIri.annotations({
      description: "Full IRI of the OWL/RDFS property",
    }),

    label: S.String.annotations({
      description: "Human-readable label from rdfs:label",
    }),

    comment: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Property description from rdfs:comment",
      })
    ),

    localName: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Local name extracted from IRI",
      })
    ),

    domain: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Class IRIs that can use this property (rdfs:domain)",
      })
    ),

    range: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Class IRIs or datatypes for property values (rdfs:range)",
      })
    ),

    rangeType: BS.toOptionalWithDefault(PropertyRangeType)("object").annotations({
      description: "Whether property links entities (object) or has literal values (datatype)",
    }),

    isFunctional: BS.BoolWithDefault(false).annotations({
      description: "Whether property is functional (owl:FunctionalProperty)",
    }),

    inverseOf: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Inverse property IRIs from owl:inverseOf",
      })
    ),

    prefLabels: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "SKOS preferred labels",
      })
    ),

    altLabels: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "SKOS alternative labels - synonyms",
      })
    ),

    hiddenLabels: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "SKOS hidden labels - misspellings, abbreviations",
      })
    ),

    definition: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SKOS definition - formal definition",
      })
    ),

    scopeNote: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SKOS scope note - clarification of scope",
      })
    ),

    example: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SKOS example - example usage",
      })
    ),

    broader: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Parent property IRIs from rdfs:subPropertyOf",
      })
    ),

    narrower: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Child property IRIs from skos:narrower",
      })
    ),

    related: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Related property IRIs from skos:related",
      })
    ),

    exactMatch: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Exact match properties in other vocabularies",
      })
    ),

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

  get isObjectProperty(): boolean {
    return PropertyRangeType.is.object(this.rangeType);
  }

  get isDatatypeProperty(): boolean {
    return PropertyRangeType.is.datatype(this.rangeType);
  }
}
