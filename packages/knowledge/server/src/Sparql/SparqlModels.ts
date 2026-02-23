import { $KnowledgeServerId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $KnowledgeServerId.create("Sparql/SparqlModels");

export class SparqlTermType extends BS.StringLiteralKit(
  "NamedNode",
  "Literal",
  "BlankNode",
  "Quad",
  "Variable"
).annotations(
  $I.annotations("SparqlTermType", {
    description: "A sparql termType literal string as defined in the sparqljs library",
  })
) {}

export declare namespace SparqlTermType {
  export type Type = typeof SparqlTermType.Type;
}

export class SparqlPattern extends BS.StringLiteralKit(
  "bgp",
  "graph",
  "optional",
  "union",
  "group",
  "minus",
  "service",
  "filter",
  "bind",
  "values",
  "query"
).annotations(
  $I.annotations("SparqlPattern", {
    description: "A sparql pattern literal string as defined in the sparqljs library",
  })
) {}

export declare namespace SparqlPattern {
  export type Type = typeof SparqlPattern.Type;
}

export class SparqlBlockPattern extends SparqlPattern.derive(
  "optional",
  "union",
  "group",
  "graph",
  "minus",
  "service"
).annotations(
  $I.annotations("SparqlBlockPattern", {
    description: "A sparql pattern that can be used as a block pattern",
  })
) {}

export declare namespace SparqlBlockPattern {
  export type Type = typeof SparqlBlockPattern.Type;
}
