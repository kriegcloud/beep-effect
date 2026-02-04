/**
 * SparqlQuery value object
 *
 * Represents a parsed SPARQL query with metadata extracted from AST.
 *
 * @module knowledge-domain/value-objects/sparql/SparqlQuery
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/sparql/SparqlQuery");

/**
 * SPARQL query type discriminator
 *
 * @since 0.1.0
 * @category value-objects
 */
export const SparqlQueryType = S.Literal("SELECT", "CONSTRUCT", "ASK", "DESCRIBE").annotations(
  $I.annotations("SparqlQueryType", {
    title: "SPARQL Query Type",
    description: "Type of SPARQL query operation",
  })
);
export type SparqlQueryType = typeof SparqlQueryType.Type;

/**
 * PREFIX declarations mapping (prefix -> full IRI)
 *
 * @since 0.1.0
 * @category value-objects
 */
export const PrefixMap = S.Record({ key: S.String, value: S.String }).annotations(
  $I.annotations("PrefixMap", {
    title: "Prefix Map",
    description: "PREFIX declarations (prefix -> IRI expansion)",
  })
);
export type PrefixMap = typeof PrefixMap.Type;

/**
 * SparqlQuery - Immutable value object representing a parsed SPARQL query
 *
 * Contains metadata extracted from the parsed AST without storing the AST itself.
 * The parser service returns both this value object and the AST separately.
 *
 * @since 0.1.0
 * @category value-objects
 */
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
