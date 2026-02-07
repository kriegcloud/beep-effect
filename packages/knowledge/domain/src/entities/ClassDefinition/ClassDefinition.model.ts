import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { ClassIri } from "../../value-objects/ClassIri.value";

const $I = $KnowledgeDomainId.create("entities/ClassDefinition");

export class Model extends M.Class<Model>($I`ClassDefinitionModel`)(
  makeFields(KnowledgeEntityIds.ClassDefinitionId, {
    organizationId: SharedEntityIds.OrganizationId,
    ontologyId: KnowledgeEntityIds.OntologyId.annotations({
      description: "Reference to the parent ontology",
    }),
    iri: ClassIri,
    label: S.String.annotations({
      description: "Human-readable label from rdfs:label",
    }),
    comment: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Class description from rdfs:comment",
      })
    ),
    localName: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Local name extracted from IRI",
      })
    ),
    properties: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Property IRIs that can be used with this class",
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
        description: "Parent class IRIs from rdfs:subClassOf",
      })
    ),
    narrower: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Child class IRIs from skos:narrower",
      })
    ),
    related: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Related class IRIs from skos:related",
      })
    ),
    equivalentClass: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Equivalent class IRIs from owl:equivalentClass",
      })
    ),
    exactMatch: BS.FieldOptionOmittable(
      S.Array(S.String).annotations({
        description: "Exact match concepts in other vocabularies",
      })
    ),
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
