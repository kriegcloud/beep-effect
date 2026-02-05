import { $KnowledgeServerId } from "@beep/identity/packages";
import {
  type SparqlExecutionError,
  type SparqlSyntaxError,
  SparqlUnsupportedFeatureError,
} from "@beep/knowledge-domain/errors";
import type { Quad, SparqlBindings } from "@beep/knowledge-domain/value-objects";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";
import { RdfStore, RdfStoreLive } from "../Rdf/RdfStoreService";
import { executeAsk, executeConstruct, executeSelect } from "./QueryExecutor";
import { type ParseResult, SparqlParser, SparqlParserLive } from "./SparqlParser";

const $I = $KnowledgeServerId.create("Sparql/SparqlService");

export type SelectResult = SparqlBindings;
export type ConstructResult = ReadonlyArray<Quad>;
export type AskResult = boolean;

export type QueryResult = SelectResult | ConstructResult | AskResult;

export type SparqlServiceError = SparqlSyntaxError | SparqlExecutionError | SparqlUnsupportedFeatureError;

const getQueryTypeString: (ast: sparqljs.SparqlQuery) => string = Match.type<sparqljs.SparqlQuery>().pipe(
  Match.when({ type: "update" }, () => "UPDATE"),
  Match.when({ type: "query" }, (q) => q.queryType),
  Match.exhaustive
);

const asQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.Query> = F.flow(
  O.liftPredicate((ast): ast is sparqljs.Query => ast.type === "query")
);

const asSelectQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.SelectQuery> = F.flow(
  asQuery,
  O.flatMap(O.liftPredicate((q): q is sparqljs.SelectQuery => q.queryType === "SELECT"))
);

const asConstructQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.ConstructQuery> = F.flow(
  asQuery,
  O.flatMap(O.liftPredicate((q): q is sparqljs.ConstructQuery => q.queryType === "CONSTRUCT"))
);

const asAskQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.AskQuery> = F.flow(
  asQuery,
  O.flatMap(O.liftPredicate((q): q is sparqljs.AskQuery => q.queryType === "ASK"))
);

export interface SparqlServiceShape {
  readonly select: (queryString: string) => Effect.Effect<SelectResult, SparqlServiceError>;
  readonly construct: (queryString: string) => Effect.Effect<ConstructResult, SparqlServiceError>;
  readonly ask: (queryString: string) => Effect.Effect<AskResult, SparqlServiceError>;
  readonly query: (queryString: string) => Effect.Effect<QueryResult, SparqlServiceError>;
}

export class SparqlService extends Context.Tag($I`SparqlService`)<SparqlService, SparqlServiceShape>() {}

const serviceEffect: Effect.Effect<SparqlServiceShape, never, SparqlParser | RdfStore> = Effect.gen(function* () {
  const parser = yield* SparqlParser;
  const store = yield* RdfStore;

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

  const parseAsConstruct = (
    queryString: string
  ): Effect.Effect<ParseResult & { ast: sparqljs.ConstructQuery }, SparqlSyntaxError | SparqlUnsupportedFeatureError> =>
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

  return SparqlService.of({
    select: (queryString: string): Effect.Effect<SelectResult, SparqlServiceError> =>
      Effect.gen(function* () {
        const { ast } = yield* parseAsSelect(queryString);
        return yield* executeSelect(ast, store);
      }).pipe(
        Effect.withSpan("SparqlService.select", {
          attributes: { queryLength: Str.length(queryString) },
        })
      ),

    construct: (queryString: string): Effect.Effect<ConstructResult, SparqlServiceError> =>
      Effect.gen(function* () {
        const { ast } = yield* parseAsConstruct(queryString);
        return yield* executeConstruct(ast, store);
      }).pipe(
        Effect.withSpan("SparqlService.construct", {
          attributes: { queryLength: Str.length(queryString) },
        })
      ),

    ask: (queryString: string): Effect.Effect<AskResult, SparqlServiceError> =>
      Effect.gen(function* () {
        const { ast } = yield* parseAsAsk(queryString);
        return yield* executeAsk(ast, store);
      }).pipe(
        Effect.withSpan("SparqlService.ask", {
          attributes: { queryLength: Str.length(queryString) },
        })
      ),

    query: (queryString: string): Effect.Effect<QueryResult, SparqlServiceError> =>
      Effect.gen(function* () {
        const { ast } = yield* parser.parse(queryString);

        const dispatchQuery = F.pipe(
          Match.type<sparqljs.SparqlQuery>(),
          Match.when({ type: "query", queryType: "SELECT" }, (q) => executeSelect(q, store)),
          Match.when({ type: "query", queryType: "CONSTRUCT" }, (q) => executeConstruct(q, store)),
          Match.when({ type: "query", queryType: "ASK" }, (q) => executeAsk(q, store)),
          Match.orElse((unsupported) =>
            Effect.fail(
              new SparqlUnsupportedFeatureError({
                feature: `${getQueryTypeString(unsupported)} queries`,
                queryString,
                message: `${getQueryTypeString(unsupported)} queries are not supported`,
              })
            )
          )
        );

        return yield* dispatchQuery(ast);
      }).pipe(
        Effect.withSpan("SparqlService.query", {
          attributes: { queryLength: Str.length(queryString) },
        })
      ),
  });
});

export const SparqlServiceLive = Layer.effect(SparqlService, serviceEffect).pipe(
  Layer.provide(Layer.merge(SparqlParserLive, RdfStoreLive))
);
