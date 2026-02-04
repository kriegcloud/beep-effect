/**
 * SPARQL Parser Service
 *
 * Effect.Service wrapping sparqljs for parsing SPARQL 1.1 queries.
 *
 * @module knowledge-server/Sparql/SparqlParser
 * @since 0.1.0
 */
import { SparqlSyntaxError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { type PrefixMap, SparqlQuery, type SparqlQueryType } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import type * as sparqljs from "sparqljs";
import * as Sparqljs from "sparqljs";

/**
 * Result of parsing a SPARQL query.
 * Separates domain value object from library-specific AST.
 *
 * @since 0.1.0
 * @category models
 */
export interface ParseResult {
  readonly query: SparqlQuery;
  readonly ast: sparqljs.SparqlQuery;
}

/**
 * Extract query type from sparqljs AST
 */
const extractQueryType = (ast: sparqljs.SparqlQuery): SparqlQueryType | undefined => {
  if (ast.type === "query") {
    return ast.queryType as SparqlQueryType;
  }
  return undefined; // UPDATE operations not supported
};

/**
 * Extract PREFIX declarations from sparqljs AST
 */
const extractPrefixes = (ast: sparqljs.SparqlQuery): PrefixMap => {
  // sparqljs stores prefixes as Record<string, string>
  // Clone to domain PrefixMap
  return { ...ast.prefixes };
};

/**
 * Check if a value is a Wildcard
 */
const isWildcard = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.Wildcard =>
  "termType" in v && v.termType === "Wildcard";

/**
 * Check if a value is a VariableTerm
 */
const isVariableTerm = (v: sparqljs.Variable | sparqljs.Wildcard | sparqljs.VariableTerm): v is sparqljs.VariableTerm =>
  "termType" in v && v.termType === "Variable";

/**
 * Check if a value is a VariableExpression
 */
const isVariableExpression = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.VariableExpression =>
  "variable" in v && v.variable !== undefined;

/**
 * Extract variable name from a Variable or Wildcard element
 * Returns Option.none for Wildcards
 */
const extractVariableName = (v: sparqljs.Variable | sparqljs.Wildcard): O.Option<string> => {
  // Skip wildcards (SELECT *)
  if (isWildcard(v)) {
    return O.none();
  }

  // Check for VariableTerm (regular variable like ?s)
  if (isVariableTerm(v)) {
    return O.some(v.value); // Variable name without ?
  }

  // Check for VariableExpression (SELECT (?a AS ?b))
  if (isVariableExpression(v) && isVariableTerm(v.variable)) {
    return O.some(v.variable.value);
  }

  return O.none();
};

/**
 * Extract projected variable names from SELECT query
 * Returns empty array for CONSTRUCT/ASK
 */
const extractVariables = (ast: sparqljs.SparqlQuery): ReadonlyArray<string> => {
  if (ast.type !== "query" || ast.queryType !== "SELECT") {
    return [];
  }

  const selectQuery = ast as sparqljs.SelectQuery;
  if (!selectQuery.variables) {
    return [];
  }

  // Variables is Variable[] | [Wildcard]
  // We handle both cases by iterating and filtering
  return A.filterMap(selectQuery.variables, extractVariableName);
};

/**
 * Check for unsupported SPARQL features
 */
const checkUnsupportedFeatures = (
  ast: sparqljs.SparqlQuery,
  queryString: string
): Effect.Effect<void, SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    // UPDATE operations not supported
    if (ast.type === "update") {
      return yield* new SparqlUnsupportedFeatureError({
        feature: "UPDATE operations",
        queryString,
        message: "UPDATE operations (INSERT/DELETE) are not supported in Phase 1",
      });
    }

    // DESCRIBE not supported in Phase 1
    if (ast.type === "query" && ast.queryType === "DESCRIBE") {
      return yield* new SparqlUnsupportedFeatureError({
        feature: "DESCRIBE queries",
        queryString,
        message: "DESCRIBE queries are not supported in Phase 1",
      });
    }

    // Check for property paths (would need to inspect patterns deeply)
    // For now, basic support - we'll catch this during execution if needed
  });

/**
 * Convert sparqljs AST to domain SparqlQuery
 */
const astToSparqlQuery = (
  ast: sparqljs.SparqlQuery,
  queryString: string
): Effect.Effect<SparqlQuery, SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    yield* checkUnsupportedFeatures(ast, queryString);

    const queryType = extractQueryType(ast);
    if (queryType === undefined) {
      return yield* new SparqlUnsupportedFeatureError({
        feature: "non-query operations",
        queryString,
        message: "Only SELECT, CONSTRUCT, and ASK queries are supported",
      });
    }

    return new SparqlQuery({
      queryString,
      queryType,
      prefixes: extractPrefixes(ast),
      variables: [...extractVariables(ast)],
    });
  });

/**
 * SparqlParser Effect.Service
 *
 * Wraps sparqljs library for parsing SPARQL 1.1 queries into domain value objects.
 *
 * @since 0.1.0
 * @category services
 */
export class SparqlParser extends Effect.Service<SparqlParser>()("@beep/knowledge-server/SparqlParser", {
  accessors: true,
  effect: Effect.gen(function* () {
    // Create parser instance
    const parser = new Sparqljs.Parser();

    return {
      /**
       * Parse a SPARQL query string into domain value object and AST.
       *
       * @param queryString - SPARQL query text
       * @returns Effect yielding ParseResult with query and AST
       *
       * @since 0.1.0
       */
      parse: (queryString: string): Effect.Effect<ParseResult, SparqlSyntaxError | SparqlUnsupportedFeatureError> =>
        Effect.gen(function* () {
          // Parse with sparqljs (synchronous, may throw)
          const ast = yield* Effect.try({
            try: () => parser.parse(queryString),
            catch: (error) => {
              // sparqljs throws Error with message containing line/column info
              // Try to extract location from error message
              const errorMsg = String(error instanceof Error ? error.message : error);

              // sparqljs error format: "Parse error on line X"
              const lineMatch = errorMsg.match(/line\s+(\d+)/i);
              const columnMatch = errorMsg.match(/column\s+(\d+)/i);

              return new SparqlSyntaxError({
                query: queryString,
                message: errorMsg,
                line: lineMatch ? Number(lineMatch[1]) : undefined,
                column: columnMatch ? Number(columnMatch[1]) : undefined,
              });
            },
          });

          // Convert to domain value object
          const query = yield* astToSparqlQuery(ast, queryString);

          return { query, ast } as ParseResult;
        }).pipe(
          Effect.withSpan("SparqlParser.parse", {
            attributes: { queryLength: queryString.length },
          })
        ),
    };
  }),
}) {}
