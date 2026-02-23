import { $KnowledgeServerId } from "@beep/identity/packages";
import { SparqlExecutionError, SparqlSyntaxError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { Quad, SparqlBindings } from "@beep/knowledge-domain/values";
import { pipe } from "effect";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";
import { RdfStore, RdfStoreLive } from "../Rdf/RdfStoreService";
import { executeAsk, executeConstruct, executeDescribe, executeSelect } from "./QueryExecutor";
import { type ParseResult, SparqlParser, SparqlParserLive } from "./SparqlParser";

const $I = $KnowledgeServerId.create("Sparql/SparqlService");

export class SelectResult extends SparqlBindings.extend<SelectResult>($I`SelectResult`)({}) {}

export class ConstructResult extends S.Array(Quad) {}

export declare namespace ConstructResult {
  export type Type = typeof ConstructResult.Type;
  export type Encoded = typeof ConstructResult.Encoded;
}

export class AskResult extends S.Boolean {}

export declare namespace AskResult {
  export type Type = typeof AskResult.Type;
  export type Encoded = typeof AskResult.Encoded;
}

export class DescribeResult extends S.Array(Quad) {}

export declare namespace DescribeResult {
  export type Type = typeof DescribeResult.Type;
  export type Encoded = typeof DescribeResult.Encoded;
}

export class QueryResult extends S.Union(SelectResult, ConstructResult, AskResult, DescribeResult) {}

export declare namespace QueryResult {
  export type Type = typeof QueryResult.Type;
  export type Encoded = typeof QueryResult.Encoded;
}

export class SparqlServiceError extends S.Union(
  SparqlSyntaxError,
  SparqlExecutionError,
  SparqlUnsupportedFeatureError
) {}

export declare namespace SparqlServiceError {
  export type Type = typeof SparqlServiceError.Type;
  export type Encoded = typeof SparqlServiceError.Encoded;
}

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

const asDescribeQuery: (ast: sparqljs.SparqlQuery) => O.Option<sparqljs.DescribeQuery> = F.flow(
  asQuery,
  O.flatMap(O.liftPredicate((q): q is sparqljs.DescribeQuery => q.queryType === "DESCRIBE"))
);

export interface SparqlServiceShape {
  readonly select: (queryString: string) => Effect.Effect<SelectResult, SparqlServiceError.Type>;
  readonly construct: (queryString: string) => Effect.Effect<ConstructResult.Type, SparqlServiceError.Type>;
  readonly ask: (queryString: string) => Effect.Effect<AskResult.Type, SparqlServiceError.Type>;
  readonly describe: (queryString: string) => Effect.Effect<DescribeResult.Type, SparqlServiceError.Type>;
  readonly query: (queryString: string) => Effect.Effect<QueryResult.Type, SparqlServiceError.Type>;
}

export class SparqlService extends Context.Tag($I`SparqlService`)<SparqlService, SparqlServiceShape>() {}

const serviceEffect: Effect.Effect<SparqlServiceShape, never, SparqlParser | RdfStore> = Effect.gen(function* () {
  const parser = yield* SparqlParser;
  const store = yield* RdfStore;

  const parseAsSelect: (queryString: string) => Effect.Effect<
    ParseResult & {
      ast: sparqljs.SelectQuery;
    },
    SparqlSyntaxError | SparqlUnsupportedFeatureError
  > = Effect.fn("SparqlService.parseAsSelect")(function* (queryString: string) {
    const result = yield* parser.parse(queryString);

    const maybeSelect = F.pipe(
      asSelectQuery(result.ast),
      O.map((ast) => ({ ...result, ast }))
    );

    return yield* O.match(maybeSelect, {
      onNone: SparqlUnsupportedFeatureError.newThunk({
        feature: `non-SELECT query`,
        queryString,
        message: `Expected SELECT query but got ${getQueryTypeString(result.ast)}`,
      }),
      onSome: Effect.succeed,
    });
  });

  const parseAsConstruct: (queryString: string) => Effect.Effect<
    ParseResult & {
      ast: sparqljs.ConstructQuery;
    },
    SparqlSyntaxError | SparqlUnsupportedFeatureError
  > = Effect.fn("SparqlService.parseAsConstruct")(function* (queryString: string) {
    const result = yield* parser.parse(queryString);

    const maybeConstruct = F.pipe(
      asConstructQuery(result.ast),
      O.map((ast) => ({ ...result, ast }))
    );

    return yield* O.match(maybeConstruct, {
      onNone: SparqlUnsupportedFeatureError.newThunk({
        feature: `non-CONSTRUCT query`,
        queryString,
        message: `Expected CONSTRUCT query but got ${getQueryTypeString(result.ast)}`,
      }),
      onSome: Effect.succeed,
    });
  });

  const parseAsAsk: (
    queryString: string
  ) => Effect.Effect<ParseResult & { ast: sparqljs.AskQuery }, SparqlSyntaxError | SparqlUnsupportedFeatureError> =
    Effect.fn("SparqlService.parseAsAsk")(function* (queryString) {
      const result = yield* parser.parse(queryString);

      const maybeAsk = F.pipe(
        asAskQuery(result.ast),
        O.map((ast) => ({ ...result, ast }))
      );

      return yield* O.match(maybeAsk, {
        onNone: SparqlUnsupportedFeatureError.newThunk({
          feature: `non-ASK query`,
          queryString,
          message: `Expected ASK query but got ${getQueryTypeString(result.ast)}`,
        }),
        onSome: Effect.succeed,
      });
    });

  const parseAsDescribe: (
    queryString: string
  ) => Effect.Effect<ParseResult & { ast: sparqljs.DescribeQuery }, SparqlSyntaxError | SparqlUnsupportedFeatureError> =
    Effect.fn("SparqlService.parseAsDescribe")(function* (queryString: string) {
      const result = yield* parser.parse(queryString);

      return yield* F.pipe(
        asDescribeQuery(result.ast),
        O.map((ast) => ({ ...result, ast })),
        O.match({
          onNone: SparqlUnsupportedFeatureError.newThunk({
            feature: `non-DESCRIBE query`,
            queryString,
            message: `Expected DESCRIBE query but got ${getQueryTypeString(result.ast)}`,
          }),
          onSome: Effect.succeed,
        })
      );
    });

  const select: (queryString: string) => Effect.Effect<SelectResult, SparqlServiceError.Type> = Effect.fn(
    "SparqlService.select"
  )(function* (queryString) {
    return yield* pipe(
      parseAsSelect(queryString),
      Effect.andThen(({ ast }) => executeSelect(ast, store)),
      Effect.withSpan("SparqlService.select", {
        attributes: { queryLength: Str.length(queryString) },
      })
    );
  });
  const construct: (queryString: string) => Effect.Effect<ConstructResult.Type, SparqlServiceError.Type> = Effect.fn(
    function* (queryString: string) {
      return yield* pipe(
        parseAsConstruct(queryString),
        Effect.andThen(({ ast }) => executeConstruct(ast, store)),
        Effect.withSpan("SparqlService.construct", {
          attributes: { queryLength: Str.length(queryString) },
        })
      );
    }
  );

  const ask: (queryString: string) => Effect.Effect<AskResult.Type, SparqlServiceError.Type> = Effect.fn(
    "SparqlService.ask"
  )(function* (queryString: string) {
    return yield* pipe(
      parseAsAsk(queryString),
      Effect.andThen(({ ast }) => executeAsk(ast, store)),
      Effect.withSpan("SparqlService.ask", {
        attributes: { queryLength: Str.length(queryString) },
      })
    );
  });

  const describe: (queryString: string) => Effect.Effect<DescribeResult.Type, SparqlServiceError.Type> = Effect.fn(
    "SparqlService.describe"
  )(function* (queryString: string) {
    return yield* pipe(
      parseAsDescribe(queryString),
      Effect.andThen(({ ast }) => executeDescribe(ast, store)),
      Effect.withSpan("SparqlService.describe", {
        attributes: { queryLength: Str.length(queryString) },
      })
    );
  });
  const query = Effect.fn("SparqlService.query")(function* (queryString: string) {
    const { ast } = yield* parser.parse(queryString);
    return yield* F.pipe(
      ast,
      Match.type<sparqljs.SparqlQuery>().pipe(
        Match.when({ type: "query", queryType: "SELECT" }, (q) => executeSelect(q, store)),
        Match.when({ type: "query", queryType: "CONSTRUCT" }, (q) => executeConstruct(q, store)),
        Match.when({ type: "query", queryType: "ASK" }, (q) => executeAsk(q, store)),
        Match.when({ type: "query", queryType: "DESCRIBE" }, (q) => executeDescribe(q, store)),
        Match.orElse(
          (unsupported) =>
            new SparqlUnsupportedFeatureError({
              feature: `${getQueryTypeString(unsupported)} queries`,
              queryString,
              message: `${getQueryTypeString(unsupported)} queries are not supported`,
            })
        )
      ),
      Effect.withSpan("SparqlService.query", {
        attributes: { queryLength: Str.length(queryString) },
      })
    );
  });

  return SparqlService.of({
    select,
    construct,
    ask,
    describe,
    query,
  });
});

export const SparqlServiceLive = Layer.effect(SparqlService, serviceEffect).pipe(
  Layer.provide(Layer.merge(SparqlParserLive, RdfStoreLive))
);
