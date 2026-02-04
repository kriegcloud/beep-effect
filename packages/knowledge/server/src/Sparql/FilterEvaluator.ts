/**
 * SPARQL Filter Expression Evaluator
 *
 * Evaluates FILTER expressions from sparqljs AST against variable bindings.
 * Supports comparison, logical, and string operations per SPARQL 1.1 spec.
 *
 * @module knowledge-server/Sparql/FilterEvaluator
 * @since 0.1.0
 */
import {SparqlExecutionError} from "@beep/knowledge-domain/errors";
import {type IRI, isBlankNode, isIRI, Literal, type Term} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";

/**
 * Solution binding map: variable name (without ?) -> bound Term
 *
 * @since 0.1.0
 * @category types
 */
export type SolutionBindings = Record<string, Term>;

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
 * Check if a term is a Literal using structural check
 * (instanceof can fail across module boundaries in monorepos)
 */
const isLiteral = (term: Term): term is Literal =>
  typeof term === "object" && term !== null && "value" in term;

/**
 * Get the effective value of a term for comparison
 * IRIs and BlankNodes use their string value
 * Literals use their lexical value
 */
const getTermValue = (term: Term): string => {
  if (isLiteral(term)) {
    return term.value;
  }
  // IRI or BlankNode - both are branded strings
  return term as string;
};

/**
 * Attempt to parse a literal as a number for numeric comparisons
 */
const tryParseNumber = (term: Term): O.Option<number> => {
  if (!isLiteral(term)) {
    return O.none();
  }

  const datatype = term.datatype;

  // Check if it's a numeric datatype (or untyped, which we'll try to parse)
  if (datatype !== undefined && !A.some(XSD_NUMERIC_TYPES, (t) => t === datatype)) {
    // Non-numeric typed literal
    return O.none();
  }

  const parsed = Number(term.value);
  return Number.isNaN(parsed) ? O.none() : O.some(parsed);
};

/**
 * Convert sparqljs term to domain Term
 * Variables are resolved from bindings
 *
 * @internal
 */
const resolveTerm = (
  sparqlTerm: sparqljs.Term,
  bindings: SolutionBindings
): Effect.Effect<O.Option<Term>, SparqlExecutionError> =>
  Effect.gen(function* () {
    // Variable reference - look up in bindings
    if (sparqlTerm.termType === "Variable") {
      const varName = sparqlTerm.value;
      return R.get(bindings, varName);
    }

    // Named node (IRI)
    if (sparqlTerm.termType === "NamedNode") {
      // Return as IRI - the value is already the full IRI string
      return O.some(sparqlTerm.value as IRI.Type);
    }

    // Blank node
    if (sparqlTerm.termType === "BlankNode") {
      // Format: _:identifier
      return O.some(`_:${sparqlTerm.value}` as Term);
    }

    // Literal
    if (sparqlTerm.termType === "Literal") {
      const datatype = sparqlTerm.datatype?.value as IRI.Type | undefined;
      const language = Str.isEmpty(sparqlTerm.language) ? undefined : sparqlTerm.language;

      return O.some(
        new Literal({
          value: sparqlTerm.value,
          datatype: language !== undefined ? undefined : datatype,
          language,
        })
      );
    }

    // Unknown term type - should not happen with valid SPARQL
    return yield* new SparqlExecutionError({
      query: "",
      message: `Unknown term type in filter expression: ${sparqlTerm.termType}`,
    });
  });

/**
 * Compare two terms for equality per SPARQL semantics
 * - Literals must match value, datatype, and language
 * - IRIs must match exactly
 * - BlankNodes must match exactly
 */
const termsEqual = (a: Term, b: Term): boolean => {
  // Both must be same type
  if (isLiteral(a) && isLiteral(b)) {
    // Literal comparison: value, datatype, language must all match
    return a.value === b.value && a.datatype === b.datatype && a.language === b.language;
  }

  if (isIRI(a) && isIRI(b)) {
    return a === b;
  }

  if (isBlankNode(a) && isBlankNode(b)) {
    return a === b;
  }

  // Different types are never equal
  return false;
};

/**
 * Compare two terms for ordering per SPARQL semantics
 * Returns -1, 0, or 1 for less than, equal, or greater than
 */
const compareTerms = (a: Term, b: Term): O.Option<number> => {
  // Try numeric comparison first
  const aNum = tryParseNumber(a);
  const bNum = tryParseNumber(b);

  if (O.isSome(aNum) && O.isSome(bNum)) {
    const diff = aNum.value - bNum.value;
    if (diff < 0) return O.some(-1);
    if (diff > 0) return O.some(1);
    return O.some(0);
  }

  // Fall back to string comparison for literals
  if (isLiteral(a) && isLiteral(b)) {
    const aVal = a.value;
    const bVal = b.value;
    if (aVal < bVal) return O.some(-1);
    if (aVal > bVal) return O.some(1);
    return O.some(0);
  }

  // Cannot compare different types or non-literals
  return O.none();
};

/**
 * Safely get an expression argument from args array
 * Returns None if index is out of bounds or element is not an Expression
 */
const getExpressionArg = (
  args: ReadonlyArray<sparqljs.Expression | sparqljs.Pattern | undefined>,
  index: number
): O.Option<sparqljs.Expression> => {
  const arg = A.get(args, index);
  if (O.isNone(arg) || arg.value === undefined) {
    return O.none();
  }
  // Check if it looks like an Expression (has termType or type: "operation")
  const val = arg.value;
  if ("termType" in val || ("type" in val && val.type === "operation")) {
    return O.some(val as sparqljs.Expression);
  }
  return O.none();
};

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
  Effect.gen(function* () {
    // Handle operation expressions (most common case)
    if ("type" in expression && expression.type === "operation") {
      const op = expression as sparqljs.OperationExpression;
      return yield* evaluateOperation(op, bindings);
    }

    // Handle term expressions (variable or literal in filter position)
    if ("termType" in expression) {
      const term = expression as sparqljs.Term;
      const resolved = yield* resolveTerm(term, bindings);

      // In filter context, unbound variables are false
      if (O.isNone(resolved)) {
        return false;
      }

      // Effective boolean value: non-empty strings are true, "true" is true
      const termVal = resolved.value;
      if (isLiteral(termVal)) {
        const val = termVal.value;
        return !Str.isEmpty(val) && Str.toLowerCase(val) !== "false" && val !== "0";
      }

      // IRIs and blank nodes are truthy
      return true;
    }

    // Unknown expression type - treat as error
    return yield* new SparqlExecutionError({
      query: "",
      message: `Unknown expression type in FILTER`,
    });
  }).pipe(Effect.withSpan("FilterEvaluator.evaluateFilter"));

/**
 * Evaluate an operation expression
 *
 * @internal
 */
const evaluateOperation = (
  op: sparqljs.OperationExpression,
  bindings: SolutionBindings
): Effect.Effect<boolean, SparqlExecutionError> =>
  Effect.gen(function* () {
    const operator = op.operator;
    const args = op.args;

    // Logical NOT
    if (operator === "!") {
      const arg0 = getExpressionArg(args, 0);
      if (O.isNone(arg0)) return false;
      const inner = yield* evaluateFilter(arg0.value, bindings);
      return !inner;
    }

    // Logical AND
    if (operator === "&&") {
      const arg0 = getExpressionArg(args, 0);
      const arg1 = getExpressionArg(args, 1);
      if (O.isNone(arg0) || O.isNone(arg1)) return false;
      const left = yield* evaluateFilter(arg0.value, bindings);
      if (!left) return false; // Short circuit
      return yield* evaluateFilter(arg1.value, bindings);
    }

    // Logical OR
    if (operator === "||") {
      const arg0 = getExpressionArg(args, 0);
      const arg1 = getExpressionArg(args, 1);
      if (O.isNone(arg0) || O.isNone(arg1)) return false;
      const left = yield* evaluateFilter(arg0.value, bindings);
      if (left) return true; // Short circuit
      return yield* evaluateFilter(arg1.value, bindings);
    }

    // BOUND function - check if variable is bound
    if (Str.toLowerCase(operator) === "bound") {
      const arg0 = A.get(args, 0);
      if (O.isNone(arg0) || arg0.value === undefined) return false;
      const varArg = arg0.value;
      if (!("termType" in varArg) || varArg.termType !== "Variable") {
        return yield* new SparqlExecutionError({
          query: "",
          message: "BOUND argument must be a variable",
        });
      }
      const bound = R.get(bindings, (varArg as sparqljs.VariableTerm).value);
      return O.isSome(bound);
    }

    // isIRI / isURI function
    if (Str.toLowerCase(operator) === "isiri" || Str.toLowerCase(operator) === "isuri") {
      const arg0 = getExpressionArg(args, 0);
      if (O.isNone(arg0)) return false;
      const resolved = yield* resolveExpressionToTerm(arg0.value, bindings);
      if (O.isNone(resolved)) return false;
      return isIRI(resolved.value);
    }

    // isBlank function
    if (Str.toLowerCase(operator) === "isblank") {
      const arg0 = getExpressionArg(args, 0);
      if (O.isNone(arg0)) return false;
      const resolved = yield* resolveExpressionToTerm(arg0.value, bindings);
      if (O.isNone(resolved)) return false;
      return isBlankNode(resolved.value);
    }

    // isLiteral function
    if (Str.toLowerCase(operator) === "isliteral") {
      const arg0 = getExpressionArg(args, 0);
      if (O.isNone(arg0)) return false;
      const resolved = yield* resolveExpressionToTerm(arg0.value, bindings);
      if (O.isNone(resolved)) return false;
      return isLiteral(resolved.value);
    }

    // REGEX function
    if (Str.toLowerCase(operator) === "regex") {
      const arg0 = getExpressionArg(args, 0);
      const arg1 = getExpressionArg(args, 1);
      if (O.isNone(arg0) || O.isNone(arg1)) return false;

      const textResolved = yield* resolveExpressionToTerm(arg0.value, bindings);
      const patternResolved = yield* resolveExpressionToTerm(arg1.value, bindings);

      if (O.isNone(textResolved) || O.isNone(patternResolved)) {
        return false;
      }

      const text = getTermValue(textResolved.value);
      const pattern = getTermValue(patternResolved.value);

      // Optional flags argument
      let flags = "";
      const arg2 = getExpressionArg(args, 2);
      if (O.isSome(arg2)) {
        const flagsResolved = yield* resolveExpressionToTerm(arg2.value, bindings);
        if (O.isSome(flagsResolved)) {
          flags = getTermValue(flagsResolved.value);
        }
      }

      // Create regex and test - per SPARQL 1.1 spec, invalid regex patterns return false
      // (they don't raise an error, they simply don't match)
      return yield* Effect.try({
        try: () => new RegExp(pattern, flags).test(text),
        catch: () => false as const,
      }).pipe(Effect.orElseSucceed(() => false));
    }

    // Comparison operators
    if (operator === "=" || operator === "!=") {
      const arg0 = getExpressionArg(args, 0);
      const arg1 = getExpressionArg(args, 1);
      if (O.isNone(arg0) || O.isNone(arg1)) return false;

      const leftResolved = yield* resolveExpressionToTerm(arg0.value, bindings);
      const rightResolved = yield* resolveExpressionToTerm(arg1.value, bindings);

      // Unbound variables make comparison undefined -> false
      if (O.isNone(leftResolved) || O.isNone(rightResolved)) {
        return false;
      }

      const equal = termsEqual(leftResolved.value, rightResolved.value);
      return operator === "=" ? equal : !equal;
    }

    // Ordering comparisons: <, >, <=, >=
    if (operator === "<" || operator === ">" || operator === "<=" || operator === ">=") {
      const arg0 = getExpressionArg(args, 0);
      const arg1 = getExpressionArg(args, 1);
      if (O.isNone(arg0) || O.isNone(arg1)) return false;

      const leftResolved = yield* resolveExpressionToTerm(arg0.value, bindings);
      const rightResolved = yield* resolveExpressionToTerm(arg1.value, bindings);

      if (O.isNone(leftResolved) || O.isNone(rightResolved)) {
        return false;
      }

      const cmp = compareTerms(leftResolved.value, rightResolved.value);
      if (O.isNone(cmp)) {
        // Incomparable types
        return false;
      }

      const cmpVal = cmp.value;
      switch (operator) {
        case "<":
          return cmpVal < 0;
        case ">":
          return cmpVal > 0;
        case "<=":
          return cmpVal <= 0;
        case ">=":
          return cmpVal >= 0;
        default:
          return false;
      }
    }

    // Unsupported operator
    return yield* new SparqlExecutionError({
      query: "",
      message: `Unsupported FILTER operator: ${operator}`,
    });
  });

/**
 * Resolve an expression to a Term value
 * Handles both direct terms and nested operations
 *
 * @internal
 */
const resolveExpressionToTerm = (
  expr: sparqljs.Expression,
  bindings: SolutionBindings
): Effect.Effect<O.Option<Term>, SparqlExecutionError> =>
  Effect.gen(function* () {
    // Direct term (variable, literal, IRI)
    if ("termType" in expr) {
      return yield* resolveTerm(expr as sparqljs.Term, bindings);
    }

    // For STR() function, extract string value
    if ("type" in expr && expr.type === "operation") {
      const op = expr as sparqljs.OperationExpression;
      if (Str.toLowerCase(op.operator) === "str") {
        const arg0 = getExpressionArg(op.args, 0);
        if (O.isNone(arg0)) return O.none();
        const innerResolved = yield* resolveExpressionToTerm(arg0.value, bindings);
        if (O.isNone(innerResolved)) return O.none();
        const strVal = getTermValue(innerResolved.value);
        return O.some(new Literal({ value: strVal }));
      }
    }

    // Other expressions - not directly resolvable to term
    return O.none();
  });

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
