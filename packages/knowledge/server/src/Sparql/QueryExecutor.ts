/**
 * SPARQL Query Executor
 *
 * Executes parsed SPARQL queries against RdfStore.
 * Implements pattern matching, solution joining, and result construction.
 *
 * @module knowledge-server/Sparql/QueryExecutor
 * @since 0.1.0
 */
import type { SparqlExecutionError, SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
import {
  type BlankNode,
  IRI,
  isBlankNode,
  Literal,
  makeBlankNode,
  Quad,
  QuadPattern,
  SparqlBinding,
  SparqlBindings,
  VariableName,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";
import type { RdfStore } from "../Rdf/RdfStoreService";

/**
 * Local type aliases to avoid namespace import issues
 * These types match the .Type exports from the domain value objects
 */
type TermType = IRI.Type | BlankNode.Type | Literal;
type VariableNameType = S.Schema.Type<typeof VariableName>;

import { evaluateFilters, type SolutionBindings } from "./FilterEvaluator";

/**
 * Base interface for SPARQL term-like values with termType discriminator
 */
interface SparqlTermLike {
  readonly termType: string;
  readonly value: string;
}

/**
 * Type guard for objects with termType property
 */
const hasSparqlTermType = (term: unknown): term is SparqlTermLike =>
  P.isObject(term) && P.isNotNull(term) && "termType" in term && P.isString((term as SparqlTermLike).termType);

/**
 * Type guard for property paths (not simple terms)
 */
const hasPathType = (term: unknown): term is { type: "path" } =>
  P.isObject(term) && P.isNotNull(term) && "type" in term && (term as { type: string }).type === "path";

/**
 * Runtime type guards for domain types
 */
const isIRI = S.is(IRI);
const isLiteral = S.is(Literal);

/**
 * Discriminator-based matcher for SPARQL term types
 */
const matchSparqlTermType =
  <R>(matchers: {
    readonly Variable: (term: sparqljs.VariableTerm) => R;
    readonly NamedNode: (term: sparqljs.IriTerm) => R;
    readonly BlankNode: (term: sparqljs.BlankTerm) => R;
    readonly Literal: (term: sparqljs.LiteralTerm) => R;
    readonly _: () => R;
  }) =>
  (term: SparqlTermLike): R =>
    Match.value(term.termType).pipe(
      Match.when("Variable", () => matchers.Variable(term as sparqljs.VariableTerm)),
      Match.when("NamedNode", () => matchers.NamedNode(term as sparqljs.IriTerm)),
      Match.when("BlankNode", () => matchers.BlankNode(term as sparqljs.BlankTerm)),
      Match.when("Literal", () => matchers.Literal(term as sparqljs.LiteralTerm)),
      Match.orElse(matchers._)
    ) as R;

/**
 * Create IRI from string value
 */
const makeIRI = S.decodeUnknownSync(IRI);

/**
 * Create VariableName from string value
 */
const makeVariableName = S.decodeUnknownSync(VariableName);

/**
 * Convert sparqljs term to domain Term (for non-variable terms)
 * Returns None for variables, property paths, or unknown types
 */
const sparqlTermToDomain = (term: unknown): O.Option<TermType> =>
  F.pipe(
    term,
    O.liftPredicate(hasSparqlTermType),
    O.filter((t) => t.termType !== "Variable"),
    O.filter(P.not(hasPathType)),
    O.flatMap((t) =>
      matchSparqlTermType({
        Variable: () => O.none<TermType>(),
        NamedNode: (node) => O.some<TermType>(makeIRI(node.value)),
        BlankNode: (node) => O.some<TermType>(makeBlankNode(`_:${node.value}`)),
        Literal: (lit) => {
          const datatype = F.pipe(O.fromNullable(lit.datatype?.value), O.map(makeIRI));
          const language = F.pipe(lit.language, O.liftPredicate(P.not(Str.isEmpty)), O.getOrUndefined);

          return O.some<TermType>(
            new Literal({
              value: lit.value,
              datatype: language !== undefined ? undefined : O.getOrUndefined(datatype),
              language,
            })
          );
        },
        _: () => O.none<TermType>(),
      })(t)
    )
  );

/**
 * Convert sparqljs subject to QuadPattern subject component
 */
const subjectToPatternComponent = (subject: sparqljs.Triple["subject"]): IRI.Type | BlankNode.Type | undefined =>
  F.pipe(
    subject,
    O.liftPredicate(hasSparqlTermType),
    O.flatMap((t) =>
      matchSparqlTermType({
        Variable: O.none<IRI.Type | BlankNode.Type>,
        NamedNode: (node) => O.some<IRI.Type | BlankNode.Type>(makeIRI(node.value)),
        BlankNode: (node) => O.some<IRI.Type | BlankNode.Type>(makeBlankNode(`_:${node.value}`)),
        Literal: O.none<IRI.Type | BlankNode.Type>,
        _: O.none<IRI.Type | BlankNode.Type>,
      })(t)
    ),
    O.getOrUndefined
  );

/**
 * Convert sparqljs predicate to QuadPattern predicate component
 * Property paths are not supported and return undefined
 */
const predicateToPatternComponent = (predicate: sparqljs.Triple["predicate"]): IRI.Type | undefined =>
  F.pipe(
    predicate,
    O.liftPredicate(hasSparqlTermType),
    O.filter(P.not(hasPathType)),
    O.flatMap((t) =>
      matchSparqlTermType({
        Variable: O.none<IRI.Type>,
        NamedNode: (node) => O.some(makeIRI(node.value)),
        BlankNode: O.none<IRI.Type>,
        Literal: O.none<IRI.Type>,
        _: O.none<IRI.Type>,
      })(t)
    ),
    O.getOrUndefined
  );

/**
 * Convert sparqljs object to QuadPattern object component
 */
const objectToPatternComponent = (object: sparqljs.Triple["object"]): TermType | undefined =>
  F.pipe(object, O.liftPredicate(P.not(hasPathType)), O.flatMap(sparqlTermToDomain), O.getOrUndefined);

/**
 * Build QuadPattern from sparqljs triple pattern
 */
const tripleToQuadPattern = (triple: sparqljs.Triple): QuadPattern =>
  new QuadPattern({
    subject: subjectToPatternComponent(triple.subject),
    predicate: predicateToPatternComponent(triple.predicate),
    object: objectToPatternComponent(triple.object),
  });

/**
 * Extract variable bindings from a matched quad given a triple pattern
 * Returns a partial binding for variables that match positions
 */
const extractBindingsFromQuad = (triple: sparqljs.Triple, quad: Quad): SolutionBindings => {
  const maybeAddBinding = (term: unknown, value: TermType): O.Option<readonly [string, TermType]> =>
    F.pipe(
      term,
      O.liftPredicate(hasSparqlTermType),
      O.filter((t) => t.termType === "Variable"),
      O.map((t) => [t.value, value] as const)
    );

  return R.fromEntries(
    A.filterMap(
      [
        maybeAddBinding(triple.subject, quad.subject),
        maybeAddBinding(triple.predicate, quad.predicate),
        maybeAddBinding(triple.object, quad.object),
      ],
      F.identity
    )
  );
};

/**
 * Check if two terms are equal for binding compatibility
 */
const termsCompatible = (a: TermType, b: TermType): boolean => {
  const aLit = isLiteral(a);
  const bLit = isLiteral(b);

  if (aLit && bLit) {
    const aTyped = a as Literal;
    const bTyped = b as Literal;
    return aTyped.value === bTyped.value && aTyped.datatype === bTyped.datatype && aTyped.language === bTyped.language;
  }

  if (isIRI(a) && isIRI(b)) {
    return a === b;
  }

  return isBlankNode(a) && isBlankNode(b) && a === b;
};

/**
 * Merge two bindings if compatible (no conflicting values for same variable)
 * Returns None if bindings conflict
 */
const mergeBindings = (a: SolutionBindings, b: SolutionBindings): O.Option<SolutionBindings> => {
  const bEntries = R.toEntries(b);

  const hasConflict = A.some(bEntries, ([key, value]) =>
    F.pipe(
      R.get(a, key),
      O.match({
        onNone: () => false,
        onSome: (existing) => !termsCompatible(existing, value),
      })
    )
  );

  return F.pipe(
    hasConflict,
    O.liftPredicate(P.not(F.identity)),
    O.map(() => ({ ...a, ...b }))
  );
};

/**
 * Apply bindings to a triple pattern to create a more specific QuadPattern
 * Variables with known bindings are replaced with their bound values
 */
const applyBindingsToTriple = (triple: sparqljs.Triple, bindings: SolutionBindings): QuadPattern => {
  const resolveSubject = (): IRI.Type | BlankNode.Type | undefined =>
    F.pipe(
      triple.subject,
      O.liftPredicate(hasSparqlTermType),
      O.filter((t) => t.termType === "Variable"),
      O.flatMap((t) => R.get(bindings, t.value)),
      O.flatMap((val) =>
        F.pipe(
          val,
          O.liftPredicate((v): v is IRI.Type | BlankNode.Type => isIRI(v) || isBlankNode(v))
        )
      ),
      O.getOrElse(() => subjectToPatternComponent(triple.subject))
    );

  const resolvePredicate = (): IRI.Type | undefined =>
    F.pipe(
      triple.predicate,
      O.liftPredicate(hasSparqlTermType),
      O.filter((t) => t.termType === "Variable"),
      O.flatMap((t) => R.get(bindings, t.value)),
      O.flatMap((val) => F.pipe(val, O.liftPredicate(isIRI))),
      O.getOrElse(() => predicateToPatternComponent(triple.predicate))
    );

  const resolveObject = (): TermType | undefined =>
    F.pipe(
      triple.object,
      O.liftPredicate(hasSparqlTermType),
      O.filter((t) => t.termType === "Variable"),
      O.flatMap((t) => R.get(bindings, t.value)),
      O.getOrElse(() => objectToPatternComponent(triple.object))
    );

  return new QuadPattern({
    subject: resolveSubject(),
    predicate: resolvePredicate(),
    object: resolveObject(),
  });
};

/**
 * Join a single solution with matches from a triple pattern
 */
const joinSolutionWithTriple = (
  existingSolution: SolutionBindings,
  triple: sparqljs.Triple,
  store: RdfStore
): Effect.Effect<ReadonlyArray<SolutionBindings>, never> =>
  Effect.gen(function* () {
    const pattern = applyBindingsToTriple(triple, existingSolution);
    const matches = yield* store.match(pattern);

    return A.filterMap(matches, (quad) => {
      const newBindings = extractBindingsFromQuad(triple, quad);
      return mergeBindings(existingSolution, newBindings);
    });
  });

/**
 * Execute a single Basic Graph Pattern (BGP) - a set of triple patterns
 * Uses nested loop join to find all compatible solutions
 */
const executeBGP = (
  triples: ReadonlyArray<sparqljs.Triple>,
  store: RdfStore
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(triples)) {
      return [{}];
    }

    const firstTriple = A.unsafeGet(triples, 0);
    const firstPattern = tripleToQuadPattern(firstTriple);
    const firstMatches = yield* store.match(firstPattern);

    const initialSolutions: ReadonlyArray<SolutionBindings> = A.map(firstMatches, (quad) =>
      extractBindingsFromQuad(firstTriple, quad)
    );

    const remainingTriples = A.drop(triples, 1);

    return yield* Effect.reduce(remainingTriples, initialSolutions, (solutions, triple) =>
      Effect.flatMap(
        Effect.forEach(solutions, (sol) => joinSolutionWithTriple(sol, triple, store)),
        (nestedSolutions) => Effect.succeed(A.flatten(nestedSolutions))
      )
    );
  }).pipe(Effect.withSpan("QueryExecutor.executeBGP"));

/**
 * Categorized pattern extraction result
 */
interface ExtractedPatterns {
  readonly triples: ReadonlyArray<sparqljs.Triple>;
  readonly filters: ReadonlyArray<sparqljs.Expression>;
  readonly optionals: ReadonlyArray<sparqljs.OptionalPattern>;
  readonly unions: ReadonlyArray<sparqljs.UnionPattern>;
}

/**
 * Pattern type matcher for WHERE clause patterns
 */
const matchPatternType =
  <R>(matchers: {
    readonly bgp: (pattern: sparqljs.BgpPattern) => R;
    readonly filter: (pattern: { type: "filter"; expression: sparqljs.Expression }) => R;
    readonly optional: (pattern: sparqljs.OptionalPattern) => R;
    readonly union: (pattern: sparqljs.UnionPattern) => R;
    readonly _: () => R;
  }) =>
  (pattern: sparqljs.Pattern): R =>
    Match.value(pattern.type).pipe(
      Match.when("bgp", () => matchers.bgp(pattern as sparqljs.BgpPattern)),
      Match.when("filter", () => matchers.filter(pattern as { type: "filter"; expression: sparqljs.Expression })),
      Match.when("optional", () => matchers.optional(pattern as sparqljs.OptionalPattern)),
      Match.when("union", () => matchers.union(pattern as sparqljs.UnionPattern)),
      Match.orElse(matchers._)
    ) as R;

/**
 * Extract filters and BGP triples from a WHERE clause pattern
 */
const extractPatternsAndFilters = (patterns: ReadonlyArray<sparqljs.Pattern>): ExtractedPatterns =>
  A.reduce(
    patterns,
    {
      triples: [] as sparqljs.Triple[],
      filters: [] as sparqljs.Expression[],
      optionals: [] as sparqljs.OptionalPattern[],
      unions: [] as sparqljs.UnionPattern[],
    },
    (acc, pattern) =>
      matchPatternType({
        bgp: (bgp) => ({ ...acc, triples: A.appendAll(acc.triples, bgp.triples) }),
        filter: (flt) => ({ ...acc, filters: A.append(acc.filters, flt.expression) }),
        optional: (opt) => ({ ...acc, optionals: A.append(acc.optionals, opt) }),
        union: (uni) => ({ ...acc, unions: A.append(acc.unions, uni) }),
        _: () => acc,
      })(pattern)
  );

/**
 * Process a single optional pattern for one solution
 */
const processOptionalForSolution = (
  solution: SolutionBindings,
  optional: sparqljs.OptionalPattern,
  store: RdfStore
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    const { triples, filters } = extractPatternsAndFilters(optional.patterns);
    const extendedSolutions = yield* executeBGP(triples, store);

    const compatible = yield* Effect.filter(
      A.filterMap(extendedSolutions, (ext) => mergeBindings(solution, ext)),
      (merged) => evaluateFilters(filters, merged)
    );

    return A.isEmptyReadonlyArray(compatible) ? [solution] : compatible;
  });

/**
 * Execute OPTIONAL patterns
 * Returns solutions extended with optional bindings where available
 */
const executeOptionals = (
  solutions: ReadonlyArray<SolutionBindings>,
  optionals: ReadonlyArray<sparqljs.OptionalPattern>,
  store: RdfStore
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.reduce(optionals, solutions, (currentSolutions, optional) =>
    Effect.flatMap(
      Effect.forEach(currentSolutions, (sol) => processOptionalForSolution(sol, optional, store)),
      (nestedSolutions) => Effect.succeed(A.flatten(nestedSolutions))
    )
  );

/**
 * Execute a single UNION branch
 */
const executeUnionBranch = (
  branch: sparqljs.Pattern,
  store: RdfStore
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    const { triples, filters } = extractPatternsAndFilters([branch]);
    const branchSolutions = yield* executeBGP(triples, store);
    return yield* Effect.filter(branchSolutions, (sol) => evaluateFilters(filters, sol));
  });

/**
 * Execute UNION patterns
 */
const executeUnions = (
  patterns: ReadonlyArray<sparqljs.UnionPattern>,
  store: RdfStore
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(patterns)) {
      return [{}];
    }

    const allBranches = A.flatMap(patterns, (union) => union.patterns);
    const branchResults = yield* Effect.forEach(allBranches, (branch) => executeUnionBranch(branch, store));

    return A.flatten(branchResults);
  });

/**
 * Join BGP and UNION solutions
 */
const joinBgpAndUnion = (
  bgpSolutions: ReadonlyArray<SolutionBindings>,
  unionSolutions: ReadonlyArray<SolutionBindings>
): ReadonlyArray<SolutionBindings> =>
  A.filterMap(
    A.flatMap(bgpSolutions, (bgpSol) => A.map(unionSolutions, (unionSol) => ({ bgpSol, unionSol }))),
    ({ bgpSol, unionSol }) => mergeBindings(bgpSol, unionSol)
  );

/**
 * Execute WHERE clause patterns
 */
const executeWhereClause = (
  where: ReadonlyArray<sparqljs.Pattern>,
  store: RdfStore
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    const { triples, filters, optionals, unions } = extractPatternsAndFilters(where);

    let solutions = yield* executeBGP(triples, store);

    solutions = yield* F.pipe(
      unions,
      O.liftPredicate(P.not(A.isEmptyReadonlyArray)),
      O.match({
        onNone: () => Effect.succeed(solutions),
        onSome: (nonEmptyUnions) =>
          Effect.map(executeUnions(nonEmptyUnions, store), (unionSolutions) =>
            A.isEmptyReadonlyArray(triples) ? unionSolutions : joinBgpAndUnion(solutions, unionSolutions)
          ),
      })
    );

    solutions = yield* F.pipe(
      optionals,
      O.liftPredicate(P.not(A.isEmptyReadonlyArray)),
      O.match({
        onNone: () => Effect.succeed(solutions),
        onSome: (nonEmptyOptionals) => executeOptionals(solutions, nonEmptyOptionals, store),
      })
    );

    solutions = yield* F.pipe(
      filters,
      O.liftPredicate(P.not(A.isEmptyReadonlyArray)),
      O.match({
        onNone: () => Effect.succeed(solutions),
        onSome: (nonEmptyFilters) => Effect.filter(solutions, (solution) => evaluateFilters(nonEmptyFilters, solution)),
      })
    );

    return solutions;
  }).pipe(Effect.withSpan("QueryExecutor.executeWhereClause"));

/**
 * Project solutions to requested variables
 */
const projectSolutions = (
  solutions: ReadonlyArray<SolutionBindings>,
  variables: ReadonlyArray<string>
): SparqlBindings => {
  const columns = variables as ReadonlyArray<VariableNameType>;

  const rows = A.map(solutions, (solution) =>
    A.filterMap(variables, (varName) =>
      O.map(R.get(solution, varName), (value) => new SparqlBinding({ name: makeVariableName(varName), value }))
    )
  );

  return new SparqlBindings({ columns: [...columns], rows });
};

/**
 * Get a unique key for a term (for deduplication)
 */
const getTermKey = (term: TermType): string =>
  F.pipe(
    term,
    O.liftPredicate(isLiteral),
    O.match({
      onNone: () => `T:${term}`,
      onSome: (lit) => `L:${lit.value}:${lit.datatype ?? ""}:${lit.language ?? ""}`,
    })
  );

/**
 * Create a solution key for deduplication
 */
const getSolutionKey = (solution: SolutionBindings, variables: ReadonlyArray<string>): string =>
  A.join(
    A.map(variables, (v) =>
      O.match(R.get(solution, v), {
        onNone: () => "null",
        onSome: (term) => getTermKey(term),
      })
    ),
    "|"
  );

/**
 * Deduplicate solutions by their variable bindings
 */
const deduplicateSolutions = (
  solutions: ReadonlyArray<SolutionBindings>,
  variables: ReadonlyArray<string>
): ReadonlyArray<SolutionBindings> => {
  const { result } = A.reduce(
    solutions,
    { seen: HashSet.empty<string>(), result: [] as SolutionBindings[] },
    (acc, sol) => {
      const key = getSolutionKey(sol, variables);
      return F.pipe(
        key,
        O.liftPredicate((k) => !HashSet.has(acc.seen, k)),
        O.match({
          onNone: () => acc,
          onSome: () => ({ seen: HashSet.add(acc.seen, key), result: A.append(acc.result, sol) }),
        })
      );
    }
  );
  return result;
};

/**
 * Extract projected variable names from SELECT clause
 * Handles both direct VariableTerm and VariableExpression (AS expressions)
 */
const extractProjectedVariables = (
  variables: ReadonlyArray<sparqljs.Variable | sparqljs.Wildcard>
): ReadonlyArray<string> =>
  A.filterMap(variables, (v): O.Option<string> => {
    // Handle VariableExpression (SELECT (expr AS ?var) case)
    if ("variable" in v && v.variable?.termType === "Variable") {
      return O.some(v.variable.value);
    }

    // Handle direct termType cases (VariableTerm and Wildcard)
    if ("termType" in v) {
      return Match.value(v.termType).pipe(
        Match.when("Wildcard", O.none<string>),
        Match.when("Variable", () => O.some((v as sparqljs.VariableTerm).value)),
        Match.orElse(O.none<string>)
      );
    }

    return O.none();
  });

/**
 * Collect all variable names from solutions (for SELECT *)
 */
const collectAllVariables = (solutions: ReadonlyArray<SolutionBindings>): ReadonlyArray<string> =>
  A.dedupe(A.flatMap(solutions, (sol) => R.keys(sol)));

/**
 * Execute a SELECT query
 *
 * @param ast - Parsed SELECT query AST
 * @param store - RDF store to query
 * @returns Effect yielding SparqlBindings
 *
 * @since 0.1.0
 * @category execution
 */
export const executeSelect = (
  ast: sparqljs.SelectQuery,
  store: RdfStore
): Effect.Effect<SparqlBindings, SparqlExecutionError | SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    const where = ast.where ?? [];
    const solutions = yield* executeWhereClause(where, store);

    const projectedVars = extractProjectedVariables(ast.variables);
    const variables = A.isEmptyReadonlyArray(projectedVars) ? collectAllVariables(solutions) : projectedVars;

    const afterDistinct = ast.distinct ? deduplicateSolutions(solutions, variables) : solutions;

    const offset = ast.offset ?? 0;
    const limit = ast.limit ?? A.length(afterDistinct);
    const finalSolutions = A.take(A.drop(afterDistinct, offset), limit);

    return projectSolutions(finalSolutions, variables);
  }).pipe(
    Effect.withSpan("QueryExecutor.executeSelect", {
      attributes: { distinct: ast.distinct ?? false },
    })
  );

/**
 * Resolve subject for template instantiation
 */
const resolveTemplateSubject = (
  subject: sparqljs.Triple["subject"],
  bindings: SolutionBindings
): O.Option<IRI.Type | BlankNode.Type> =>
  F.pipe(
    subject,
    O.liftPredicate(hasSparqlTermType),
    O.flatMap((t) =>
      matchSparqlTermType({
        Variable: (term) =>
          F.pipe(
            R.get(bindings, term.value),
            O.flatMap((val) =>
              F.pipe(
                val,
                O.liftPredicate((v): v is IRI.Type | BlankNode.Type => isIRI(v) || isBlankNode(v))
              )
            )
          ),
        NamedNode: (node) => O.some<IRI.Type | BlankNode.Type>(makeIRI(node.value)),
        BlankNode: (node) => O.some<IRI.Type | BlankNode.Type>(makeBlankNode(`_:${node.value}`)),
        Literal: O.none<IRI.Type | BlankNode.Type>,
        _: O.none<IRI.Type | BlankNode.Type>,
      })(t)
    )
  );

/**
 * Resolve predicate for template instantiation
 */
const resolveTemplatePredicate = (
  predicate: sparqljs.Triple["predicate"],
  bindings: SolutionBindings
): O.Option<IRI.Type> =>
  F.pipe(
    predicate,
    O.liftPredicate(hasSparqlTermType),
    O.filter(P.not(hasPathType)),
    O.flatMap((t) =>
      matchSparqlTermType({
        Variable: (term) =>
          F.pipe(
            R.get(bindings, term.value),
            O.flatMap((val) => F.pipe(val, O.liftPredicate(isIRI)))
          ),
        NamedNode: (node) => O.some(makeIRI(node.value)),
        BlankNode: O.none<IRI.Type>,
        Literal: O.none<IRI.Type>,
        _: O.none<IRI.Type>,
      })(t)
    )
  );

/**
 * Resolve object for template instantiation
 */
const resolveTemplateObject = (object: sparqljs.Triple["object"], bindings: SolutionBindings): O.Option<TermType> =>
  F.pipe(
    object,
    O.liftPredicate(hasSparqlTermType),
    O.flatMap((t) =>
      matchSparqlTermType({
        Variable: (term) => R.get(bindings, term.value),
        NamedNode: () => sparqlTermToDomain(object),
        BlankNode: () => sparqlTermToDomain(object),
        Literal: () => sparqlTermToDomain(object),
        _: () => O.none<TermType>(),
      })(t)
    )
  );

/**
 * Instantiate a triple template with bindings
 * Returns None if any variable is unbound
 */
const instantiateTemplate = (triple: sparqljs.Triple, bindings: SolutionBindings): O.Option<Quad> =>
  O.flatMap(resolveTemplateSubject(triple.subject, bindings), (subject) =>
    O.flatMap(resolveTemplatePredicate(triple.predicate, bindings), (predicate) =>
      O.map(resolveTemplateObject(triple.object, bindings), (object) => new Quad({ subject, predicate, object }))
    )
  );

/**
 * Deduplicate quads
 */
const deduplicateQuads = (quads: ReadonlyArray<Quad>): ReadonlyArray<Quad> => {
  const getQuadKey = (quad: Quad): string =>
    `${quad.subject}|${quad.predicate}|${getTermKey(quad.object)}|${quad.graph ?? ""}`;

  const { result } = A.reduce(quads, { seen: HashSet.empty<string>(), result: [] as Quad[] }, (acc, quad) => {
    const key = getQuadKey(quad);
    return F.pipe(
      key,
      O.liftPredicate((k) => !HashSet.has(acc.seen, k)),
      O.match({
        onNone: () => acc,
        onSome: () => ({ seen: HashSet.add(acc.seen, key), result: A.append(acc.result, quad) }),
      })
    );
  });
  return result;
};

/**
 * Execute a CONSTRUCT query
 *
 * @param ast - Parsed CONSTRUCT query AST
 * @param store - RDF store to query
 * @returns Effect yielding array of constructed quads
 *
 * @since 0.1.0
 * @category execution
 */
export const executeConstruct = (
  ast: sparqljs.ConstructQuery,
  store: RdfStore
): Effect.Effect<ReadonlyArray<Quad>, SparqlExecutionError | SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    const where = ast.where ?? [];
    const solutions = yield* executeWhereClause(where, store);

    const template = ast.template ?? [];

    const quads = A.filterMap(
      A.flatMap(solutions, (solution) => A.map(template, (tripleTemplate) => ({ solution, tripleTemplate }))),
      ({ solution, tripleTemplate }) => instantiateTemplate(tripleTemplate, solution)
    );

    return deduplicateQuads(quads);
  }).pipe(Effect.withSpan("QueryExecutor.executeConstruct"));

/**
 * Execute an ASK query
 *
 * @param ast - Parsed ASK query AST
 * @param store - RDF store to query
 * @returns Effect yielding boolean result
 *
 * @since 0.1.0
 * @category execution
 */
export const executeAsk = (
  ast: sparqljs.AskQuery,
  store: RdfStore
): Effect.Effect<boolean, SparqlExecutionError | SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    const where = ast.where ?? [];
    const solutions = yield* executeWhereClause(where, store);

    return !A.isEmptyReadonlyArray(solutions);
  }).pipe(Effect.withSpan("QueryExecutor.executeAsk"));
