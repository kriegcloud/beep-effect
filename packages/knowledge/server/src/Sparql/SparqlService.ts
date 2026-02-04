/**
 * SPARQL Query Service
 *
 * Effect.Service for executing SPARQL queries against an RDF store.
 * Supports SELECT, CONSTRUCT, and ASK queries.
 *
 * @module knowledge-server/Sparql/SparqlService
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import {
  type SparqlExecutionError,
  type SparqlSyntaxError,
  SparqlUnsupportedFeatureError,
} from "@beep/knowledge-domain/errors";
import type { Quad, SparqlBindings } from "@beep/knowledge-domain/value-objects";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import type * as sparqljs from "sparqljs";
import { RdfStore } from "../Rdf/RdfStoreService";
import { executeAsk, executeConstruct, executeSelect } from "./QueryExecutor";
import { type ParseResult, SparqlParser } from "./SparqlParser";

const $I = $KnowledgeServerId.create("Sparql/SparqlService");

/**
 * Result types for different query forms
 *
 * @since 0.1.0
 * @category types
 */
export type SelectResult = SparqlBindings;
export type ConstructResult = ReadonlyArray<Quad>;
export type AskResult = boolean;

/**
 * Union of all possible query results
 *
 * @since 0.1.0
 * @category types
 */
export type QueryResult = SelectResult | ConstructResult | AskResult;

/**
 * Error types that can occur during query execution
 *
 * @since 0.1.0
 * @category types
 */
export type SparqlServiceError = SparqlSyntaxError | SparqlExecutionError | SparqlUnsupportedFeatureError;

/**
 * Extract query type string for error messages using Match
 */
const getQueryTypeString: (ast: sparqljs.SparqlQuery) => string = Match.type<sparqljs.SparqlQuery>().pipe(
  Match.when({ type: "update" }, () => "UPDATE"),
  Match.when({ type: "query" }, (q) => q.queryType),
  Match.exhaustive
);

/**
 * Narrow SparqlQuery to Query (SELECT/CONSTRUCT/ASK/DESCRIBE)
 */
const asQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.Query> = F.flow(
  O.liftPredicate((ast): ast is sparqljs.Query => ast.type === "query")
);

/**
 * Narrow Query to SelectQuery
 */
const asSelectQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.SelectQuery> = F.flow(
  asQuery,
  O.flatMap(O.liftPredicate((q): q is sparqljs.SelectQuery => q.queryType === "SELECT"))
);

/**
 * Narrow Query to ConstructQuery
 */
const asConstructQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.ConstructQuery> = F.flow(
  asQuery,
  O.flatMap(O.liftPredicate((q): q is sparqljs.ConstructQuery => q.queryType === "CONSTRUCT"))
);

/**
 * Narrow Query to AskQuery
 */
const asAskQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.AskQuery> = F.flow(
  asQuery,
  O.flatMap(O.liftPredicate((q): q is sparqljs.AskQuery => q.queryType === "ASK"))
);

/**
 * SparqlService Effect.Service
 *
 * Provides SPARQL query execution capabilities over an RDF store.
 * Supports SELECT, CONSTRUCT, and ASK query forms.
 *
 * @since 0.1.0
 * @category services
 *
 * @example
 * ```ts
 * import { SparqlService } from "@beep/knowledge-server/Sparql";
 *
 * const program = Effect.gen(function* () {
 *   const sparql = yield* SparqlService;
 *
 *   // Execute a SELECT query
 *   const bindings = yield* sparql.select(
 *     "SELECT ?s ?name WHERE { ?s <http://example.org/name> ?name }"
 *   );
 *
 *   // Execute an ASK query
 *   const exists = yield* sparql.ask(
 *     "ASK { <http://example.org/alice> <http://example.org/knows> ?someone }"
 *   );
 * });
 * ```
 */
export class SparqlService extends Effect.Service<SparqlService>()($I`SparqlService`, {
  accessors: true,
  effect: Effect.gen(function* () {
    const parser = yield* SparqlParser;
    const store = yield* RdfStore;

    /**
     * Parse and validate as SELECT query
     */
    const parseAsSelect = (
      queryString: string
    ): Effect.Effect<ParseResult & { ast: sparqljs.SelectQuery }, SparqlSyntaxError | SparqlUnsupportedFeatureError> =>
      Effect.gen(function* () {
        const result = yield* parser.parse(queryString);

        const maybeSelect = F.pipe(
          asSelectQuery(result.ast),
          O.map((ast) => ({ ...result, ast }))
        );

        return yield* O.match(maybeSelect, {
          onNone: () =>
            Effect.fail(
              new SparqlUnsupportedFeatureError({
                feature: `non-SELECT query`,
                queryString,
                message: `Expected SELECT query but got ${getQueryTypeString(result.ast)}`,
              })
            ),
          onSome: Effect.succeed,
        });
      });

    /**
     * Parse and validate as CONSTRUCT query
     */
    const parseAsConstruct = (
      queryString: string
    ): Effect.Effect<
      ParseResult & { ast: sparqljs.ConstructQuery },
      SparqlSyntaxError | SparqlUnsupportedFeatureError
    > =>
      Effect.gen(function* () {
        const result = yield* parser.parse(queryString);

        const maybeConstruct = F.pipe(
          asConstructQuery(result.ast),
          O.map((ast) => ({ ...result, ast }))
        );

        return yield* O.match(maybeConstruct, {
          onNone: () =>
            Effect.fail(
              new SparqlUnsupportedFeatureError({
                feature: `non-CONSTRUCT query`,
                queryString,
                message: `Expected CONSTRUCT query but got ${getQueryTypeString(result.ast)}`,
              })
            ),
          onSome: Effect.succeed,
        });
      });

    /**
     * Parse and validate as ASK query
     */
    const parseAsAsk = (
      queryString: string
    ): Effect.Effect<ParseResult & { ast: sparqljs.AskQuery }, SparqlSyntaxError | SparqlUnsupportedFeatureError> =>
      Effect.gen(function* () {
        const result = yield* parser.parse(queryString);

        const maybeAsk = F.pipe(
          asAskQuery(result.ast),
          O.map((ast) => ({ ...result, ast }))
        );

        return yield* O.match(maybeAsk, {
          onNone: () =>
            Effect.fail(
              new SparqlUnsupportedFeatureError({
                feature: `non-ASK query`,
                queryString,
                message: `Expected ASK query but got ${getQueryTypeString(result.ast)}`,
              })
            ),
          onSome: Effect.succeed,
        });
      });

    return {
      /**
       * Execute a SELECT query and return bindings
       *
       * @param queryString - SPARQL SELECT query
       * @returns Effect yielding SparqlBindings with variable bindings
       *
       * @since 0.1.0
       */
      select: (queryString: string): Effect.Effect<SelectResult, SparqlServiceError> =>
        Effect.gen(function* () {
          const { ast } = yield* parseAsSelect(queryString);
          return yield* executeSelect(ast, store);
        }).pipe(
          Effect.withSpan("SparqlService.select", {
            attributes: { queryLength: queryString.length },
          })
        ),

      /**
       * Execute a CONSTRUCT query and return constructed quads
       *
       * @param queryString - SPARQL CONSTRUCT query
       * @returns Effect yielding array of constructed Quads
       *
       * @since 0.1.0
       */
      construct: (queryString: string): Effect.Effect<ConstructResult, SparqlServiceError> =>
        Effect.gen(function* () {
          const { ast } = yield* parseAsConstruct(queryString);
          return yield* executeConstruct(ast, store);
        }).pipe(
          Effect.withSpan("SparqlService.construct", {
            attributes: { queryLength: queryString.length },
          })
        ),

      /**
       * Execute an ASK query and return boolean result
       *
       * @param queryString - SPARQL ASK query
       * @returns Effect yielding boolean (true if pattern matches)
       *
       * @since 0.1.0
       */
      ask: (queryString: string): Effect.Effect<AskResult, SparqlServiceError> =>
        Effect.gen(function* () {
          const { ast } = yield* parseAsAsk(queryString);
          return yield* executeAsk(ast, store);
        }).pipe(
          Effect.withSpan("SparqlService.ask", {
            attributes: { queryLength: queryString.length },
          })
        ),

      /**
       * Execute any supported query and return the appropriate result type
       *
       * @param queryString - SPARQL query (SELECT, CONSTRUCT, or ASK)
       * @returns Effect yielding QueryResult (type depends on query form)
       *
       * @since 0.1.0
       */
      query: (queryString: string): Effect.Effect<QueryResult, SparqlServiceError> =>
        Effect.gen(function* () {
          const { ast } = yield* parser.parse(queryString);

          const dispatchQuery = F.pipe(
            Match.type<sparqljs.SparqlQuery>(),
            Match.when({ type: "query", queryType: "SELECT" }, (q) => executeSelect(q, store)),
            Match.when({ type: "query", queryType: "CONSTRUCT" }, (q) => executeConstruct(q, store)),
            Match.when({ type: "query", queryType: "ASK" }, (q) => executeAsk(q, store)),
            Match.orElse(
              (unsupported) =>
                new SparqlUnsupportedFeatureError({
                  feature: `${getQueryTypeString(unsupported)} queries`,
                  queryString,
                  message: `${getQueryTypeString(unsupported)} queries are not supported`,
                })
            )
          );

          const result = dispatchQuery(ast);

          return yield* result instanceof SparqlUnsupportedFeatureError ? Effect.fail(result) : result;
        }).pipe(
          Effect.withSpan("SparqlService.query", {
            attributes: { queryLength: queryString.length },
          })
        ),
    };
  }),
  dependencies: [SparqlParser.Default, RdfStore.Default],
}) {}
