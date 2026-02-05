import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/sparql/SparqlQuery");

export class SparqlQueryType extends BS.StringLiteralKit("SELECT", "CONSTRUCT", "ASK", "DESCRIBE").annotations(
  $I.annotations("SparqlQueryType", {
    title: "SPARQL Query Type",
    description: "Type of SPARQL query operation",
  })
) {
  static readonly make = S.decodeUnknownSync(this);
}
export declare namespace SparqlQueryType {
  export type Type = typeof SparqlQueryType.Type;
  export type Encoded = typeof SparqlQueryType.Encoded;
}

export const PrefixMap = S.Record({ key: S.String, value: S.String }).annotations(
  $I.annotations("PrefixMap", {
    title: "Prefix Map",
    description: "PREFIX declarations (prefix -> IRI expansion)",
  })
);
export declare namespace PrefixMap {
  export type Type = typeof PrefixMap.Type;
  export type Encoded = typeof PrefixMap.Encoded;
}

export class SparqlQuery extends S.Class<SparqlQuery>($I`SparqlQuery`)({
  queryString: S.String.annotations({
    title: "Query String",
    description: "Original SPARQL query text",
  }),
  queryType: SparqlQueryType.annotations({
    title: "Query Type",
    description: "Type of SPARQL query (SELECT, CONSTRUCT, ASK, DESCRIBE)",
  }),
  prefixes: PrefixMap.annotations({
    title: "Prefixes",
    description: "PREFIX declarations (prefix -> full IRI)",
  }),
  variables: S.Array(S.String).annotations({
    title: "Variables",
    description: "Projected variable names (SELECT only, without ? prefix)",
  }),
}) {}
