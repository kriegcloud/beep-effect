import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $KnowledgeDomainId.create("entities/Ontology/Ontology.values");

export class OntologyStatus extends BS.StringLiteralKit("draft", "active", "deprecated").annotations(
  $I.annotations("OntologyStatus", {
    description: "Status of the ontology definition",
  })
) {}

export class OntologyFormat extends BS.StringLiteralKit("turtle", "rdfxml", "jsonld", "ntriples").annotations(
  $I.annotations("OntologyFormat", { description: "Serialization format of the ontology" })
) {}

export declare namespace OntologyFormat {
  export type Type = typeof OntologyFormat.Type;
}

export declare namespace OntologyStatus {
  export type Type = typeof OntologyStatus.Type;
}
