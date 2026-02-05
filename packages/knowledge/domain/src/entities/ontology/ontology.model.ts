import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("entities/Ontology");

export class OntologyStatus extends BS.StringLiteralKit("draft", "active", "deprecated").annotations({
  identifier: "OntologyStatus",
  description: "Status of the ontology definition",
}) {}

export declare namespace OntologyStatus {
  export type Type = typeof OntologyStatus.Type;
}

export class OntologyFormat extends BS.StringLiteralKit("turtle", "rdfxml", "jsonld", "ntriples").annotations({
  identifier: "OntologyFormat",
  description: "Serialization format of the ontology",
}) {}

export declare namespace OntologyFormat {
  export type Type = typeof OntologyFormat.Type;
}

export class Model extends M.Class<Model>($I`OntologyModel`)(
  makeFields(KnowledgeEntityIds.OntologyId, {
    organizationId: SharedEntityIds.OrganizationId,

    name: S.String.annotations({
      description: "Human-readable ontology name",
    }),

    namespace: S.String.annotations({
      description: "Ontology namespace URI",
    }),

    ontologyVersion: BS.toOptionalWithDefault(BS.SemanticVersion)(BS.SemanticVersion.make("1.0.0")).annotations({
      description: "Semantic version of the ontology",
    }),

    description: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Human-readable ontology description",
      })
    ),

    status: BS.toOptionalWithDefault(OntologyStatus)("active").annotations({
      description: "Current status of the ontology",
    }),

    format: BS.toOptionalWithDefault(OntologyFormat)("turtle").annotations({
      description: "Serialization format of the ontology content",
    }),

    contentHash: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "SHA-256 hash of ontology content for versioning",
      })
    ),

    storagePath: BS.FieldOptionOmittable(
      S.String.annotations({
        description: "Storage path to the ontology file",
      })
    ),

    classCount: BS.FieldOptionOmittable(
      S.NonNegativeInt.annotations({
        description: "Number of OWL/RDFS classes defined",
      })
    ),

    propertyCount: BS.FieldOptionOmittable(
      S.NonNegativeInt.annotations({
        description: "Number of OWL/RDFS properties defined",
      })
    ),

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
