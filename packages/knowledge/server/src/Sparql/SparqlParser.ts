import { $KnowledgeServerId } from "@beep/identity/packages";
import { SparqlSyntaxError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import { SparqlQuery, SparqlQueryType } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";
import * as Sparqljs from "sparqljs";

type SparqlQueryTypeValue = S.Schema.Type<typeof SparqlQueryType>;
type PrefixMapValue = Record<string, string>;
const decodeSparqlQueryType = S.decodeUnknownSync(SparqlQueryType);

const $I = $KnowledgeServerId.create("Sparql/SparqlParser");

export interface ParseResult {
  readonly query: SparqlQuery;
  readonly ast: sparqljs.SparqlQuery;
}

const isQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.Query => ast.type === "query";

const isUpdate = (ast: sparqljs.SparqlQuery): ast is sparqljs.Update => ast.type === "update";

const isSelectQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.SelectQuery =>
  isQuery(ast) && ast.queryType === "SELECT";

const isDescribeQuery = (ast: sparqljs.SparqlQuery): ast is sparqljs.DescribeQuery =>
  isQuery(ast) && ast.queryType === "DESCRIBE";

const isWildcard = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.Wildcard =>
  P.hasProperty(v, "termType") && (v as sparqljs.Wildcard).termType === "Wildcard";

const isVariableTerm = (v: sparqljs.Variable | sparqljs.Wildcard | sparqljs.VariableTerm): v is sparqljs.VariableTerm =>
  P.hasProperty(v, "termType") && (v as sparqljs.VariableTerm).termType === "Variable";

const isVariableExpression = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.VariableExpression =>
  P.hasProperty(v, "variable") && P.isNotUndefined((v as sparqljs.VariableExpression).variable);

const extractQueryType = (ast: sparqljs.SparqlQuery): O.Option<SparqlQueryTypeValue> =>
  F.pipe(
    ast,
    O.liftPredicate(isQuery),
    O.map((query) => decodeSparqlQueryType(query.queryType))
  );

const extractPrefixes = (ast: sparqljs.SparqlQuery): PrefixMapValue => ({ ...ast.prefixes });

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

const extractVariables = (ast: sparqljs.SparqlQuery): ReadonlyArray<string> =>
  F.pipe(
    ast,
    O.liftPredicate(isSelectQuery),
    O.flatMap((selectQuery) => O.fromNullable(selectQuery.variables)),
    O.map((variables) => A.filterMap(variables, extractVariableName)),
    O.getOrElse(A.empty<string>)
  );

const makeUpdateError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "UPDATE operations",
    queryString,
    message: "UPDATE operations (INSERT/DELETE) are not supported in Phase 1",
  });

const makeDescribeError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "DESCRIBE queries",
    queryString,
    message: "DESCRIBE queries are not supported in Phase 1",
  });

const makeNonQueryError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "non-query operations",
    queryString,
    message: "Only SELECT, CONSTRUCT, and ASK queries are supported",
  });

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

export interface SparqlParserShape {
  readonly parse: (
    queryString: string
  ) => Effect.Effect<ParseResult, SparqlSyntaxError | SparqlUnsupportedFeatureError>;
}

export class SparqlParser extends Context.Tag($I`SparqlParser`)<SparqlParser, SparqlParserShape>() {}

const serviceEffect: Effect.Effect<SparqlParserShape> = Effect.gen(function* () {
  const parser = new Sparqljs.Parser();

  return SparqlParser.of({
    parse: (queryString: string): Effect.Effect<ParseResult, SparqlSyntaxError | SparqlUnsupportedFeatureError> =>
      Effect.gen(function* () {
        const ast = yield* Effect.try({
          try: () => parser.parse(queryString),
          catch: (error) => {
            const errorMsg = String(P.hasProperty(error, "message") ? (error as { message: unknown }).message : error);

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

        const query = yield* astToSparqlQuery(ast, queryString);

        return { query, ast } as ParseResult;
      }).pipe(
        Effect.withSpan("SparqlParser.parse", {
          attributes: { queryLength: Str.length(queryString) },
        })
      ),
  });
});

export const SparqlParserLive = Layer.effect(SparqlParser, serviceEffect);
