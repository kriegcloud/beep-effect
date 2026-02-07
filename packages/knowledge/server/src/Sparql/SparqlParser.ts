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

const extractQueryType = (ast: sparqljs.SparqlQuery): O.Option<SparqlQueryTypeValue> =>
  F.pipe(
    ast,
    O.liftPredicate(isQuery),
    O.map((query) => decodeSparqlQueryType(query.queryType))
  );

const extractPrefixes = (ast: sparqljs.SparqlQuery): PrefixMapValue => ({ ...ast.prefixes });

const extractAnyVariableName = (value: unknown): O.Option<string> => {
  if (!P.hasProperty(value, "termType")) {
    return O.none();
  }

  if (value.termType === "Variable" && P.hasProperty(value, "value") && P.isString(value.value)) {
    return O.some(value.value);
  }

  if (
    P.hasProperty(value, "variable") &&
    P.hasProperty(value.variable, "termType") &&
    value.variable.termType === "Variable" &&
    P.hasProperty(value.variable, "value") &&
    P.isString(value.variable.value)
  ) {
    return O.some(value.variable.value);
  }

  return O.none();
};

const extractVariables = (ast: sparqljs.SparqlQuery): ReadonlyArray<string> => {
  if (!isQuery(ast)) {
    return A.empty<string>();
  }

  if (ast.queryType === "SELECT") {
    const variables = A.empty<string>();
    for (const variable of ast.variables) {
      const extracted = extractAnyVariableName(variable);
      if (O.isSome(extracted)) {
        variables.push(extracted.value);
      }
    }
    return variables;
  }

  if (ast.queryType === "DESCRIBE") {
    const variables = A.empty<string>();
    for (const value of ast.variables) {
      if (P.hasProperty(value, "termType") && value.termType === "Variable") {
        variables.push(value.value);
      }
    }
    return variables;
  }

  return A.empty<string>();
};

const makeUpdateError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "UPDATE operations",
    queryString,
    message: "UPDATE operations (INSERT/DELETE) are not supported in Phase 1",
  });

const makeNonQueryError = (queryString: string): SparqlUnsupportedFeatureError =>
  new SparqlUnsupportedFeatureError({
    feature: "non-query operations",
    queryString,
    message: "Only SELECT, CONSTRUCT, ASK, and DESCRIBE queries are supported",
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
