import { SparqlExecutionError } from "@beep/knowledge-domain/errors";
import { BlankNode, IRI, Literal, Term } from "@beep/knowledge-domain/value-objects";
import { thunkEmptyStr, thunkFalse, thunkSucceedEffect, thunkTrue, thunkUndefined } from "@beep/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";
import { SparqlPattern } from "./SparqlModels.ts";

export type SolutionBindings = Record<string, typeof Term.Type>;

const XSD_NUMERIC_TYPES = [
  "http://www.w3.org/2001/XMLSchema#integer",
  "http://www.w3.org/2001/XMLSchema#decimal",
  "http://www.w3.org/2001/XMLSchema#float",
  "http://www.w3.org/2001/XMLSchema#double",
] as const;

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

const isLiteral = (term: typeof Term.Type): term is S.Schema.Type<typeof Literal> =>
  P.isObject(term) && P.hasProperty("value")(term);

const isIRI = S.is(IRI);

const isBlankNode = S.is(BlankNode);

const getTermValue = Match.type<Term.Type>().pipe(
  Match.when(isLiteral, (lit) => lit.value),
  Match.orElse((lit) => lit)
);
const tryParseNumber = (term: typeof Term.Type): O.Option<number> =>
  F.pipe(
    term,
    O.liftPredicate(isLiteral),
    O.filter((lit) =>
      F.pipe(
        lit.datatype,
        O.fromNullable,
        O.match({
          onNone: thunkTrue,
          onSome: (dt) => A.some(XSD_NUMERIC_TYPES, (t) => t === dt),
        })
      )
    ),
    O.map((lit) => Number(lit.value)),
    O.filter(P.not(Number.isNaN))
  );

const resolveTerm = (
  sparqlTerm: sparqljs.Term,
  bindings: SolutionBindings
): Effect.Effect<O.Option<typeof Term.Type>, SparqlExecutionError> =>
  Match.value(sparqlTerm).pipe(
    Match.discriminatorsExhaustive("termType")({
      Variable: (term) => Effect.succeed(R.get(bindings, term.value)),
      NamedNode: (term) => Effect.succeed(O.some(S.decodeUnknownSync(IRI)(term.value))),
      BlankNode: (term) => Effect.succeed(O.some(S.decodeUnknownSync(Term)(`_:${term.value}`))),
      Literal: (lit) => {
        const datatype = S.decodeOption(S.UndefinedOr(IRI))(lit.datatype?.value);
        const language = F.pipe(lit.language, O.fromNullable, O.filter(P.not(Str.isEmpty)), O.getOrUndefined);

        return Effect.succeed(
          O.some(
            new Literal({
              value: lit.value,
              datatype: F.pipe(
                language,
                O.fromNullable,
                O.match({
                  onNone: () => O.getOrUndefined(datatype),
                  onSome: thunkUndefined,
                })
              ),
              language,
            })
          )
        );
      },
      Quad: () =>
        Effect.fail(
          new SparqlExecutionError({
            query: "",
            message: `Unsupported term type in filter expression: Quad`,
          })
        ),
    })
  );

const normalizeDatatype = (datatype: string | undefined): string =>
  F.pipe(
    datatype,
    O.fromNullable,
    O.getOrElse(() => XSD_STRING)
  );

const termsEqual = (a: typeof Term.Type, b: typeof Term.Type): boolean => {
  if (isLiteral(a) && isLiteral(b)) {
    return (
      a.value === b.value &&
      normalizeDatatype(a.datatype) === normalizeDatatype(b.datatype) &&
      a.language === b.language
    );
  }

  if (isIRI(a) && isIRI(b)) {
    return a === b;
  }

  if (isBlankNode(a) && isBlankNode(b)) {
    return a === b;
  }

  return false;
};

const compareTerms = (a: typeof Term.Type, b: typeof Term.Type): O.Option<number> =>
  F.pipe(
    O.all([tryParseNumber(a), tryParseNumber(b)]),
    O.map(([aNum, bNum]) => {
      const diff = aNum - bNum;
      return diff < 0 ? -1 : diff > 0 ? 1 : 0;
    }),
    O.orElse(() => {
      if (isLiteral(a) && isLiteral(b)) {
        const aVal = a.value;
        const bVal = b.value;
        return O.some(aVal < bVal ? -1 : aVal > bVal ? 1 : 0);
      }
      return O.none();
    })
  );

const isExpressionNotPattern = (val: sparqljs.Expression | sparqljs.Pattern): val is sparqljs.Expression =>
  P.hasProperty("termType")(val) ||
  (P.hasProperty("type")(val) && !A.some(SparqlPattern.Options, (pt) => pt === (val as { type: string }).type));

const getExpressionArg = (
  args: ReadonlyArray<sparqljs.Expression | sparqljs.Pattern | undefined>,
  index: number
): O.Option<sparqljs.Expression> =>
  F.pipe(A.get(args, index), O.flatMap(O.fromNullable), O.filter(isExpressionNotPattern));

const isOperationExpression = (e: sparqljs.Expression): e is sparqljs.OperationExpression =>
  P.hasProperty("type")(e) && e.type === "operation";

type ExpressionTerm = sparqljs.IriTerm | sparqljs.VariableTerm | sparqljs.LiteralTerm | sparqljs.QuadTerm;

const isTermExpression = (e: sparqljs.Expression): e is ExpressionTerm => P.hasProperty("termType")(e);

const isVariableTerm = (v: unknown): v is sparqljs.VariableTerm =>
  P.isObject(v) && P.hasProperty("termType")(v) && v.termType === "Variable";

export const evaluateFilter = (
  expression: sparqljs.Expression,
  bindings: SolutionBindings
): Effect.Effect<boolean, SparqlExecutionError> =>
  F.pipe(
    Match.value(expression),
    Match.when(isOperationExpression, (op) => evaluateOperation(op, bindings)),
    Match.when(isTermExpression, (term) =>
      Effect.gen(function* () {
        const resolved = yield* resolveTerm(term, bindings);

        return F.pipe(
          resolved,
          O.match({
            onNone: thunkFalse,
            onSome: (termVal) =>
              F.pipe(
                termVal,
                O.liftPredicate(isLiteral),
                O.match({
                  onNone: thunkTrue,
                  onSome: (lit) => {
                    const val = lit.value;
                    return !Str.isEmpty(val) && Str.toLowerCase(val) !== "false" && val !== "0";
                  },
                })
              ),
          })
        );
      })
    ),
    Match.orElse(() =>
      Effect.fail(
        new SparqlExecutionError({
          query: "",
          message: `Unknown expression type in FILTER`,
        })
      )
    ),
    Effect.withSpan("FilterEvaluator.evaluateFilter")
  );

type OperatorHandler = (
  args: ReadonlyArray<sparqljs.Expression | sparqljs.Pattern | undefined>,
  bindings: SolutionBindings
) => Effect.Effect<boolean, SparqlExecutionError>;

const handleNot: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: (arg) =>
        F.pipe(
          evaluateFilter(arg, bindings),
          Effect.map((inner) => !inner)
        ),
    })
  );

const handleAnd: OperatorHandler = (args, bindings) =>
  F.pipe(
    O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: ([arg0, arg1]) =>
        Effect.gen(function* () {
          const left = yield* evaluateFilter(arg0, bindings);
          return left ? yield* evaluateFilter(arg1, bindings) : false;
        }),
    })
  );

const handleOr: OperatorHandler = (args, bindings) =>
  F.pipe(
    O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: ([arg0, arg1]) =>
        Effect.gen(function* () {
          const left = yield* evaluateFilter(arg0, bindings);
          return left ? true : yield* evaluateFilter(arg1, bindings);
        }),
    })
  );

const handleBound: OperatorHandler = (args, bindings) =>
  F.pipe(
    A.get(args, 0),
    O.flatMap(O.fromNullable),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: (varArg) =>
        F.pipe(
          Match.value(varArg),
          Match.when(isVariableTerm, (v) => Effect.succeed(O.isSome(R.get(bindings, v.value)))),
          Match.orElse(() =>
            Effect.fail(
              new SparqlExecutionError({
                query: "",
                message: "BOUND argument must be a variable",
              })
            )
          )
        ),
    })
  );

const handleIsIRI: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: (arg) =>
        F.pipe(
          resolveExpressionToTerm(arg, bindings),
          Effect.map(
            O.match({
              onNone: thunkFalse,
              onSome: isIRI,
            })
          )
        ),
    })
  );

const handleIsBlank: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: (arg) =>
        F.pipe(
          resolveExpressionToTerm(arg, bindings),
          Effect.map(
            O.match({
              onNone: thunkFalse,
              onSome: (term) => isBlankNode(term),
            })
          )
        ),
    })
  );

const handleIsLiteral: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: (arg) =>
        F.pipe(
          resolveExpressionToTerm(arg, bindings),
          Effect.map(
            O.match({
              onNone: thunkFalse,
              onSome: isLiteral,
            })
          )
        ),
    })
  );

const handleRegex: OperatorHandler = (args, bindings) =>
  F.pipe(
    O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
    O.match({
      onNone: thunkSucceedEffect(false),
      onSome: ([arg0, arg1]) =>
        Effect.gen(function* () {
          const textResolved = yield* resolveExpressionToTerm(arg0, bindings);
          const patternResolved = yield* resolveExpressionToTerm(arg1, bindings);

          return yield* F.pipe(
            O.all([textResolved, patternResolved]),
            O.match({
              onNone: thunkSucceedEffect(false),
              onSome: ([textTerm, patternTerm]) =>
                Effect.gen(function* () {
                  const text = getTermValue(textTerm);
                  const pattern = getTermValue(patternTerm);

                  const flags = yield* F.pipe(
                    getExpressionArg(args, 2),
                    O.match({
                      onNone: thunkSucceedEffect(Str.empty),
                      onSome: (arg2) =>
                        F.pipe(
                          resolveExpressionToTerm(arg2, bindings),
                          Effect.map(
                            O.match({
                              onNone: thunkEmptyStr,
                              onSome: getTermValue,
                            })
                          )
                        ),
                    })
                  );

                  return yield* F.pipe(
                    Effect.try({
                      try: () => new RegExp(pattern, flags).test(text),
                      catch: thunkFalse,
                    }),
                    Effect.orElseSucceed(thunkFalse)
                  );
                }),
            })
          );
        }),
    })
  );

const handleEquality =
  (isEquals: boolean): OperatorHandler =>
  (args, bindings) =>
    F.pipe(
      O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
      O.match({
        onNone: thunkSucceedEffect(false),
        onSome: ([arg0, arg1]) =>
          Effect.gen(function* () {
            const leftResolved = yield* resolveExpressionToTerm(arg0, bindings);
            const rightResolved = yield* resolveExpressionToTerm(arg1, bindings);

            return F.pipe(
              O.all([leftResolved, rightResolved]),
              O.match({
                onNone: thunkFalse,
                onSome: ([left, right]) => {
                  const equal = termsEqual(left, right);
                  return isEquals ? equal : !equal;
                },
              })
            );
          }),
      })
    );

const handleOrdering =
  (compareFn: (cmp: number) => boolean): OperatorHandler =>
  (args, bindings) =>
    F.pipe(
      O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
      O.match({
        onNone: thunkSucceedEffect(false),
        onSome: ([arg0, arg1]) =>
          Effect.gen(function* () {
            const leftResolved = yield* resolveExpressionToTerm(arg0, bindings);
            const rightResolved = yield* resolveExpressionToTerm(arg1, bindings);

            return F.pipe(
              O.all([leftResolved, rightResolved]),
              O.flatMap(([left, right]) => compareTerms(left, right)),
              O.match({
                onNone: thunkFalse,
                onSome: compareFn,
              })
            );
          }),
      })
    );

const evaluateOperation = (
  op: sparqljs.OperationExpression,
  bindings: SolutionBindings
): Effect.Effect<boolean, SparqlExecutionError> => {
  const operator = op.operator;
  const args = op.args;
  const lowerOp = Str.toLowerCase(operator);

  return F.pipe(
    Match.value(operator),
    Match.when("!", () => handleNot(args, bindings)),
    Match.when("&&", () => handleAnd(args, bindings)),
    Match.when("||", () => handleOr(args, bindings)),
    Match.when("=", () => handleEquality(true)(args, bindings)),
    Match.when("!=", () => handleEquality(false)(args, bindings)),
    Match.when("<", () => handleOrdering((cmp) => cmp < 0)(args, bindings)),
    Match.when(">", () => handleOrdering((cmp) => cmp > 0)(args, bindings)),
    Match.when("<=", () => handleOrdering((cmp) => cmp <= 0)(args, bindings)),
    Match.when(">=", () => handleOrdering((cmp) => cmp >= 0)(args, bindings)),
    Match.orElse(() =>
      F.pipe(
        Match.value(lowerOp),
        Match.when("bound", () => handleBound(args, bindings)),
        Match.when("isiri", () => handleIsIRI(args, bindings)),
        Match.when("isuri", () => handleIsIRI(args, bindings)),
        Match.when("isblank", () => handleIsBlank(args, bindings)),
        Match.when("isliteral", () => handleIsLiteral(args, bindings)),
        Match.when("regex", () => handleRegex(args, bindings)),
        Match.orElse(() =>
          Effect.fail(
            new SparqlExecutionError({
              query: "",
              message: `Unsupported FILTER operator: ${operator}`,
            })
          )
        )
      )
    )
  );
};

const resolveExpressionToTerm = (
  expr: sparqljs.Expression,
  bindings: SolutionBindings
): Effect.Effect<O.Option<typeof Term.Type>, SparqlExecutionError> =>
  F.pipe(
    Match.value(expr),
    Match.when(isTermExpression, (term) => resolveTerm(term, bindings)),
    Match.when(isOperationExpression, (op) =>
      F.pipe(
        Match.value(Str.toLowerCase(op.operator)),
        Match.when("str", () =>
          F.pipe(
            getExpressionArg(op.args, 0),
            O.match({
              onNone: thunkSucceedEffect(O.none()),
              onSome: (arg) =>
                F.pipe(
                  resolveExpressionToTerm(arg, bindings),
                  Effect.map(O.map((term) => new Literal({ value: getTermValue(term) })))
                ),
            })
          )
        ),
        Match.orElse(thunkSucceedEffect(O.none()))
      )
    ),
    Match.orElse(thunkSucceedEffect(O.none()))
  );

export const evaluateFilters = (
  expressions: ReadonlyArray<sparqljs.Expression>,
  bindings: SolutionBindings
): Effect.Effect<boolean, SparqlExecutionError> =>
  Effect.reduce(expressions, true as boolean, (acc, expr) =>
    acc ? evaluateFilter(expr, bindings) : Effect.succeed(false)
  ).pipe(Effect.withSpan("FilterEvaluator.evaluateFilters"));

export const isFilterExpression = (
  pattern: sparqljs.Pattern
): pattern is { readonly type: "filter"; readonly expression: sparqljs.Expression } =>
  P.isObject(pattern) && P.hasProperty("type")(pattern) && pattern.type === "filter";
