/**
 * SPARQL Parser Service
 *
 * Effect.Service wrapping sparqljs for parsing SPARQL 1.1 queries.
 *
 * @module knowledge-server/Sparql/SparqlParser
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { SparqlSyntaxError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { SparqlQuery, SparqlQueryType } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as sparqljs from "sparqljs";
import * as Sparqljs from "sparqljs";

/** Local type alias for SparqlQueryType */
type SparqlQueryTypeValue = S.Schema.Type<typeof SparqlQueryType>;
/** Local type alias for PrefixMap (Record<string, string>) */
type PrefixMapValue = Record<string, string>;
/** Decoder for SparqlQueryType */
const decodeSparqlQueryType = S.decodeUnknownSync(SparqlQueryType);

const $I = $KnowledgeServerId.create("Sparql/SparqlParser");

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
 * Type predicate: checks if AST is a Query (not Update)
 */
const isQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.Query => ast.type === "query";

/**
 * Type predicate: checks if AST is an Update operation
 */
const isUpdate = (ast: sparqljs.SparqlQuery): ast is sparqljs.Update => ast.type === "update";

/**
 * Type predicate: checks if Query is a SELECT query
 */
const isSelectQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.SelectQuery =>
  isQuery(ast) && ast.queryType === "SELECT";

/**
 * Type predicate: checks if Query is a DESCRIBE query
 */
const isDescribeQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.DescribeQuery =>
  isQuery(ast) && ast.queryType === "DESCRIBE";

/**
 * Type predicate: checks if value is a Wildcard
 */
const isWildcard = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.Wildcard =>
  P.hasProperty(v, "termType") && (v as sparqljs.Wildcard).termType === "Wildcard";

/**
 * Type predicate: checks if value is a VariableTerm
 */
const isVariableTerm = (v: sparqljs.Variable | sparqljs.Wildcard | sparqljs.VariableTerm): v is sparqljs.VariableTerm =>
  P.hasProperty(v, "termType") && (v as sparqljs.VariableTerm).termType === "Variable";

/**
 * Type predicate: checks if value is a VariableExpression
 */
const isVariableExpression = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.VariableExpression =>
  P.hasProperty(v, "variable") && P.isNotUndefined((v as sparqljs.VariableExpression).variable);

/**
 * Extract query type from sparqljs AST
 * Returns Option.none for UPDATE operations (not supported)
 */
const extractQueryType = (ast: sparqljs.SparqlQuery): O.Option<SparqlQueryTypeValue> =>
  F.pipe(
    ast,
    O.liftPredicate(isQuery),
    O.map((query) => decodeSparqlQueryType(query.queryType))
  );

/**
 * Extract PREFIX declarations from sparqljs AST
 */
const extractPrefixes = (ast: sparqljs.SparqlQuery): PrefixMapValue => ({ ...ast.prefixes });

/**
 * Extract variable name from a Variable or Wildcard element
 * Returns Option.none for Wildcards
 */
const extractVariableName = (v: sparqljs.Variable | sparqljs.Wildcard): O.Option<string> =>
  F.pipe(
    v,
    O.liftPredicate(P.not(isWildcard)),
    O.flatMap((nonWildcard) =>
      F.pipe(
        nonWildcard,
        O.liftPredicate(isVariableTerm),
        O.map((term) => term.value),
        O.orElse(() =>
          F.pipe(
            nonWildcard,
            O.liftPredicate(isVariableExpression),
            O.flatMap((expr) =>
              F.pipe(
                expr.variable,
                O.liftPredicate(isVariableTerm),
                O.map((vt) => vt.value)
              )
            )
          )
        )
      )
    )
  );

/**
 * Extract projected variable names from SELECT query
 * Returns empty array for CONSTRUCT/ASK
 */
const extractVariables = (ast: sparqljs.SparqlQuery): ReadonlyArray<string> =>
  F.pipe(
    ast,
    O.liftPredicate(isSelectQuery),
    O.flatMap((selectQuery) => O.fromNullable(selectQuery.variables)),
    O.map((variables) => A.filterMap(variables, extractVariableName)),
    O.getOrElse(A.empty<string>)
  );

/**
 * Create an unsupported feature error for UPDATE operations
 */
const makeUpdateError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "UPDATE operations",
    queryString,
    message: "UPDATE operations (INSERT/DELETE) are not supported in Phase 1",
  });

/**
 * Create an unsupported feature error for DESCRIBE queries
 */
const makeDescribeError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "DESCRIBE queries",
    queryString,
    message: "DESCRIBE queries are not supported in Phase 1",
  });

/**
 * Create an unsupported feature error for non-query operations
 */
const makeNonQueryError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "non-query operations",
    queryString,
    message: "Only SELECT, CONSTRUCT, and ASK queries are supported",
  });

/**
 * Check for unsupported SPARQL features using Option pipelines
 */
const checkUnsupportedFeatures = (
  ast: sparqljs.SparqlQuery,
  queryString: string
): Effect.Effect<void, SparqlUnsupportedFeatureError> =>
  F.pipe(
    O.none<SparqlUnsupportedFeatureError>(),
    O.orElse(() =>
      F.pipe(
        ast,
        O.liftPredicate(isUpdate),
        O.map(() => makeUpdateError(queryString))
      )
    ),
    O.orElse(() =>
      F.pipe(
        ast,
        O.liftPredicate(isDescribeQuery),
        O.map(() => makeDescribeError(queryString))
      )
    ),
    O.match({
      onNone: () => Effect.void,
      onSome: Effect.fail,
    })
  );

/**
 * Convert sparqljs AST to domain SparqlQuery
 */
const astToSparqlQuery = (
  ast: sparqljs.SparqlQuery,
  queryString: string
): Effect.Effect<SparqlQuery, SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    yield* checkUnsupportedFeatures(ast, queryString);

    const queryType = yield* F.pipe(
      extractQueryType(ast),
      O.match({
        onNone: () => Effect.fail(makeNonQueryError(queryString)),
        onSome: Effect.succeed,
      })
    );

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
export class SparqlParser extends Effect.Service<SparqlParser>()($I`SparqlParser`, {
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
