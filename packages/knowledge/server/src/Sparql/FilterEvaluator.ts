/**
 * SPARQL Filter Expression Evaluator
 *
 * Evaluates FILTER expressions from sparqljs AST against variable bindings.
 * Supports comparison, logical, and string operations per SPARQL 1.1 spec.
 *
 * @module knowledge-server/Sparql/FilterEvaluator
 * @since 0.1.0
 */

import { SparqlExecutionError } from "@beep/knowledge-domain/errors";
import { BlankNode, IRI, Literal, Term } from "@beep/knowledge-domain/value-objects";
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

/**
 * Solution binding map: variable name (without ?) -> bound Term
 *
 * @since 0.1.0
 * @category types
 */
export type SolutionBindings = Record<string, typeof Term.Type>;

/**
 * XSD namespace constants for datatype handling
 */
const XSD_NUMERIC_TYPES = [
  "http://www.w3.org/2001/XMLSchema#integer",
  "http://www.w3.org/2001/XMLSchema#decimal",
  "http://www.w3.org/2001/XMLSchema#float",
  "http://www.w3.org/2001/XMLSchema#double",
] as const;

/**
 * XSD string datatype - default for plain literals
 */
const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";

/**
 * Type guard for Literal terms
 */
const isLiteral = (term: typeof Term.Type): term is Literal => P.isObject(term) && "value" in term;

/**
 * Type guard for IRI terms
 */
const isIRI = S.is(IRI);

/**
 * Type guard for BlankNode terms
 */
const isBlankNode = S.is(BlankNode);

/**
 * Get the effective value of a term for comparison
 * IRIs and BlankNodes use their string value
 * Literals use their lexical value
 */
const getTermValue = (term: typeof Term.Type): string =>
  F.pipe(
    term,
    O.liftPredicate(isLiteral),
    O.map((lit) => lit.value),
    O.getOrElse(() => term as string)
  );

/**
 * Attempt to parse a literal as a number for numeric comparisons
 */
const tryParseNumber = (term: typeof Term.Type): O.Option<number> =>
  F.pipe(
    term,
    O.liftPredicate(isLiteral),
    O.filter((lit) =>
      F.pipe(
        lit.datatype,
        O.fromNullable,
        O.match({
          onNone: () => true,
          onSome: (dt) => A.some(XSD_NUMERIC_TYPES, (t) => t === dt),
        })
      )
    ),
    O.map((lit) => Number(lit.value)),
    O.filter((n) => !Number.isNaN(n))
  );

/**
 * Convert sparqljs term to domain Term
 * Variables are resolved from bindings
 *
 * @internal
 */
const resolveTerm = (
  sparqlTerm: sparqljs.Term,
  bindings: SolutionBindings
): Effect.Effect<O.Option<typeof Term.Type>, SparqlExecutionError> =>
  F.pipe(
    Match.value(sparqlTerm.termType),
    Match.when("Variable", () => Effect.succeed(R.get(bindings, sparqlTerm.value))),
    Match.when("NamedNode", () => Effect.succeed(O.some(S.decodeUnknownSync(IRI)(sparqlTerm.value)))),
    Match.when("BlankNode", () => Effect.succeed(O.some(S.decodeUnknownSync(Term)(`_:${sparqlTerm.value}`)))),
    Match.when("Literal", () => {
      const literalTerm = sparqlTerm as sparqljs.LiteralTerm;
      const datatype = S.decodeOption(S.UndefinedOr(IRI))(literalTerm.datatype?.value);
      const language = F.pipe(literalTerm.language, O.fromNullable, O.filter(P.not(Str.isEmpty)), O.getOrUndefined);

      return Effect.succeed(
        O.some(
          new Literal({
            value: literalTerm.value,
            datatype: F.pipe(
              language,
              O.fromNullable,
              O.match({
                onNone: () => O.getOrUndefined(datatype),
                onSome: () => undefined,
              })
            ),
            language,
          })
        )
      );
    }),
    Match.orElse((termType) =>
      Effect.fail(
        new SparqlExecutionError({
          query: "",
          message: `Unknown term type in filter expression: ${termType}`,
        })
      )
    )
  );

/**
 * Normalize datatype for comparison
 * Per RDF/SPARQL semantics, undefined datatype is equivalent to xsd:string
 */
const normalizeDatatype = (datatype: string | undefined): string =>
  F.pipe(
    datatype,
    O.fromNullable,
    O.getOrElse(() => XSD_STRING)
  );

/**
 * Compare two terms for equality per SPARQL semantics
 * - Literals must match value, datatype (with xsd:string normalization), and language
 * - IRIs must match exactly
 * - BlankNodes must match exactly
 */
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

/**
 * Compare two terms for ordering per SPARQL semantics
 * Returns -1, 0, or 1 for less than, equal, or greater than
 */
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

/**
 * Safely get an expression argument from args array
 * Returns None if index is out of bounds or element is not an Expression
 */
const getExpressionArg = (
  args: ReadonlyArray<sparqljs.Expression | sparqljs.Pattern | undefined>,
  index: number
): O.Option<sparqljs.Expression> =>
  F.pipe(
    A.get(args, index),
    O.flatMap(O.fromNullable),
    O.filter((val): val is sparqljs.Expression => "termType" in val || ("type" in val && val.type === "operation"))
  );

/**
 * Check if expression is an OperationExpression
 */
const isOperationExpression = (e: sparqljs.Expression): e is sparqljs.OperationExpression =>
  "type" in e && e.type === "operation";

/**
 * Expression term types - subset of Term that appears in Expression
 */
type ExpressionTerm = sparqljs.IriTerm | sparqljs.VariableTerm | sparqljs.LiteralTerm | sparqljs.QuadTerm;

/**
 * Check if expression is a Term (IriTerm, VariableTerm, LiteralTerm, or QuadTerm)
 */
const isTermExpression = (e: sparqljs.Expression): e is ExpressionTerm => "termType" in e;

/**
 * Check if a value is a Variable term
 */
const isVariableTerm = (v: unknown): v is sparqljs.VariableTerm =>
  P.isObject(v) && "termType" in v && v.termType === "Variable";

/**
 * Evaluate a SPARQL FILTER expression against bindings
 *
 * Supports:
 * - Comparison operators: =, !=, <, >, <=, >=
 * - Logical operators: &&, ||, !
 * - Functions: bound, isIRI, isBlank, isLiteral, str, regex
 *
 * @param expression - sparqljs filter expression
 * @param bindings - current solution bindings
 * @returns Effect yielding boolean result
 *
 * @since 0.1.0
 * @category evaluation
 */
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
            onNone: () => false,
            onSome: (termVal) =>
              F.pipe(
                termVal,
                O.liftPredicate(isLiteral),
                O.match({
                  onNone: () => true,
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

/**
 * Operator handler type for cleaner dispatch
 */
type OperatorHandler = (
  args: ReadonlyArray<sparqljs.Expression | sparqljs.Pattern | undefined>,
  bindings: SolutionBindings
) => Effect.Effect<boolean, SparqlExecutionError>;

/**
 * Handle logical NOT operator
 */
const handleNot: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: () => Effect.succeed(false),
      onSome: (arg) =>
        F.pipe(
          evaluateFilter(arg, bindings),
          Effect.map((inner) => !inner)
        ),
    })
  );

/**
 * Handle logical AND operator
 */
const handleAnd: OperatorHandler = (args, bindings) =>
  F.pipe(
    O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
    O.match({
      onNone: () => Effect.succeed(false),
      onSome: ([arg0, arg1]) =>
        Effect.gen(function* () {
          const left = yield* evaluateFilter(arg0, bindings);
          return left ? yield* evaluateFilter(arg1, bindings) : false;
        }),
    })
  );

/**
 * Handle logical OR operator
 */
const handleOr: OperatorHandler = (args, bindings) =>
  F.pipe(
    O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
    O.match({
      onNone: () => Effect.succeed(false),
      onSome: ([arg0, arg1]) =>
        Effect.gen(function* () {
          const left = yield* evaluateFilter(arg0, bindings);
          return left ? true : yield* evaluateFilter(arg1, bindings);
        }),
    })
  );

/**
 * Handle BOUND function
 */
const handleBound: OperatorHandler = (args, bindings) =>
  F.pipe(
    A.get(args, 0),
    O.flatMap(O.fromNullable),
    O.match({
      onNone: () => Effect.succeed(false),
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

/**
 * Handle isIRI/isURI function
 */
const handleIsIRI: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: () => Effect.succeed(false),
      onSome: (arg) =>
        F.pipe(
          resolveExpressionToTerm(arg, bindings),
          Effect.map(
            O.match({
              onNone: () => false,
              onSome: (term) => isIRI(term),
            })
          )
        ),
    })
  );

/**
 * Handle isBlank function
 */
const handleIsBlank: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: () => Effect.succeed(false),
      onSome: (arg) =>
        F.pipe(
          resolveExpressionToTerm(arg, bindings),
          Effect.map(
            O.match({
              onNone: () => false,
              onSome: (term) => isBlankNode(term),
            })
          )
        ),
    })
  );

/**
 * Handle isLiteral function
 */
const handleIsLiteral: OperatorHandler = (args, bindings) =>
  F.pipe(
    getExpressionArg(args, 0),
    O.match({
      onNone: () => Effect.succeed(false),
      onSome: (arg) =>
        F.pipe(
          resolveExpressionToTerm(arg, bindings),
          Effect.map(
            O.match({
              onNone: () => false,
              onSome: (term) => isLiteral(term),
            })
          )
        ),
    })
  );

/**
 * Handle REGEX function
 */
const handleRegex: OperatorHandler = (args, bindings) =>
  F.pipe(
    O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
    O.match({
      onNone: () => Effect.succeed(false),
      onSome: ([arg0, arg1]) =>
        Effect.gen(function* () {
          const textResolved = yield* resolveExpressionToTerm(arg0, bindings);
          const patternResolved = yield* resolveExpressionToTerm(arg1, bindings);

          return yield* F.pipe(
            O.all([textResolved, patternResolved]),
            O.match({
              onNone: () => Effect.succeed(false),
              onSome: ([textTerm, patternTerm]) =>
                Effect.gen(function* () {
                  const text = getTermValue(textTerm);
                  const pattern = getTermValue(patternTerm);

                  const flags = yield* F.pipe(
                    getExpressionArg(args, 2),
                    O.match({
                      onNone: () => Effect.succeed(""),
                      onSome: (arg2) =>
                        F.pipe(
                          resolveExpressionToTerm(arg2, bindings),
                          Effect.map(
                            O.match({
                              onNone: () => "",
                              onSome: getTermValue,
                            })
                          )
                        ),
                    })
                  );

                  return yield* F.pipe(
                    Effect.try({
                      try: () => new RegExp(pattern, flags).test(text),
                      catch: () => false as const,
                    }),
                    Effect.orElseSucceed(() => false)
                  );
                }),
            })
          );
        }),
    })
  );

/**
 * Handle equality operators (= and !=)
 */
const handleEquality =
  (isEquals: boolean): OperatorHandler =>
  (args, bindings) =>
    F.pipe(
      O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
      O.match({
        onNone: () => Effect.succeed(false),
        onSome: ([arg0, arg1]) =>
          Effect.gen(function* () {
            const leftResolved = yield* resolveExpressionToTerm(arg0, bindings);
            const rightResolved = yield* resolveExpressionToTerm(arg1, bindings);

            return F.pipe(
              O.all([leftResolved, rightResolved]),
              O.match({
                onNone: () => false,
                onSome: ([left, right]) => {
                  const equal = termsEqual(left, right);
                  return isEquals ? equal : !equal;
                },
              })
            );
          }),
      })
    );

/**
 * Handle ordering comparisons (<, >, <=, >=)
 */
const handleOrdering =
  (compareFn: (cmp: number) => boolean): OperatorHandler =>
  (args, bindings) =>
    F.pipe(
      O.all([getExpressionArg(args, 0), getExpressionArg(args, 1)]),
      O.match({
        onNone: () => Effect.succeed(false),
        onSome: ([arg0, arg1]) =>
          Effect.gen(function* () {
            const leftResolved = yield* resolveExpressionToTerm(arg0, bindings);
            const rightResolved = yield* resolveExpressionToTerm(arg1, bindings);

            return F.pipe(
              O.all([leftResolved, rightResolved]),
              O.flatMap(([left, right]) => compareTerms(left, right)),
              O.match({
                onNone: () => false,
                onSome: compareFn,
              })
            );
          }),
      })
    );

/**
 * Evaluate an operation expression
 *
 * @internal
 */
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

/**
 * Resolve an expression to a Term value
 * Handles both direct terms and nested operations
 *
 * @internal
 */
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
              onNone: () => Effect.succeed(O.none()),
              onSome: (arg) =>
                F.pipe(
                  resolveExpressionToTerm(arg, bindings),
                  Effect.map(O.map((term) => new Literal({ value: getTermValue(term) })))
                ),
            })
          )
        ),
        Match.orElse(() => Effect.succeed(O.none()))
      )
    ),
    Match.orElse(() => Effect.succeed(O.none()))
  );

/**
 * Evaluate multiple FILTER expressions with AND semantics
 * All must be true for the solution to pass
 *
 * @since 0.1.0
 * @category evaluation
 */
export const evaluateFilters = (
  expressions: ReadonlyArray<sparqljs.Expression>,
  bindings: SolutionBindings
): Effect.Effect<boolean, SparqlExecutionError> =>
  Effect.reduce(expressions, true as boolean, (acc, expr) =>
    acc ? evaluateFilter(expr, bindings) : Effect.succeed(false)
  ).pipe(Effect.withSpan("FilterEvaluator.evaluateFilters"));

/**
 * Check if an expression is a filter expression
 * Used to identify FILTER patterns in WHERE clause
 *
 * @since 0.1.0
 * @category utilities
 */
export const isFilterExpression = (
  pattern: sparqljs.Pattern
): pattern is { type: "filter"; expression: sparqljs.Expression } =>
  P.isObject(pattern) && "type" in pattern && pattern.type === "filter";
