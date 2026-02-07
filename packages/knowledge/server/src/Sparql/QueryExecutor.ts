import { SparqlExecutionError, type SparqlUnsupportedFeatureError } from "@beep/knowledge-domain/errors";
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
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";
import type { RdfStoreShape } from "../Rdf/RdfStoreService";

type TermType = IRI.Type | BlankNode.Type | Literal;
type GraphNameType = sparqljs.IriTerm | sparqljs.VariableTerm;
type VariableNameType = S.Schema.Type<typeof VariableName>;

import { thunkFalse, thunkSucceedEffect } from "@beep/utils";
import { isDiscriminatedWith } from "@beep/utils/guards";
import { evaluateFilters, type SolutionBindings } from "./FilterEvaluator";
import { SparqlTermType } from "./SparqlModels";

const isIRI = S.is(IRI);
const isLiteral = S.is(Literal);

const isPredicateTerm = (pred: sparqljs.Triple["predicate"]): pred is sparqljs.IriTerm | sparqljs.VariableTerm =>
  P.hasProperty("termType")(pred);

const decodeIRIEither = S.decodeEither(IRI);
const decodeVariableNameEither = S.decodeEither(VariableName);
const decodeIRI = (value: string): O.Option<IRI.Type> =>
  Either.match(decodeIRIEither(value), {
    onLeft: () => O.none(),
    onRight: O.some,
  });
const decodeVariableName = (value: string): O.Option<VariableNameType> =>
  Either.match(decodeVariableNameEither(value), {
    onLeft: () => O.none(),
    onRight: O.some,
  });

const sparqlTermToDomain = (term: sparqljs.Term): O.Option<TermType> => {
  const noneTermType = O.none<TermType>;
  return Match.value(term).pipe(
    Match.discriminatorsExhaustive("termType")({
      Variable: noneTermType,
      NamedNode: (node) => O.map(decodeIRI(node.value), (iri) => iri as TermType),
      BlankNode: (node) => O.some<TermType>(makeBlankNode(`_:${node.value}`)),
      Literal: (lit) => {
        const datatype = F.pipe(O.fromNullable(lit.datatype?.value), O.flatMap(decodeIRI));
        const language = F.pipe(lit.language, O.liftPredicate(P.not(Str.isEmpty)), O.getOrUndefined);

        return O.some<TermType>(
          new Literal({
            value: lit.value,
            datatype: language !== undefined ? undefined : O.getOrUndefined(datatype),
            language,
          })
        );
      },
      Quad: noneTermType,
    })
  );
};

const thunkNoneIriType = O.none<IRI.Type>;

const subjectToPatternComponent = (subject: sparqljs.Triple["subject"]): IRI.Type | BlankNode.Type | undefined => {
  const noneIriOrBlankNode = O.none<IRI.Type | BlankNode.Type>;
  return F.pipe(
    Match.value(subject),
    Match.discriminatorsExhaustive("termType")({
      Variable: noneIriOrBlankNode,
      NamedNode: (node) => O.map(decodeIRI(node.value), (iri) => iri as IRI.Type | BlankNode.Type),
      BlankNode: (node) => O.some<IRI.Type | BlankNode.Type>(makeBlankNode(`_:${node.value}`)),
      Quad: noneIriOrBlankNode,
    }),
    O.getOrUndefined
  );
};

const predicateToPatternComponent = (predicate: sparqljs.Triple["predicate"]): IRI.Type | undefined =>
  F.pipe(
    predicate,
    O.liftPredicate(isPredicateTerm),
    O.flatMap((t) =>
      Match.value(t).pipe(
        Match.discriminatorsExhaustive("termType")({
          Variable: thunkNoneIriType,
          NamedNode: (node) => decodeIRI(node.value),
        })
      )
    ),
    O.getOrUndefined
  );

const objectToPatternComponent = (object: sparqljs.Triple["object"]): TermType | undefined =>
  F.pipe(sparqlTermToDomain(object), O.getOrUndefined);

const asGraphName = (term: sparqljs.Term): O.Option<GraphNameType> =>
  Match.value(term).pipe(
    Match.when({ termType: "NamedNode" }, (named) => O.some(named)),
    Match.when({ termType: "Variable" }, (variable) => O.some(variable)),
    Match.orElse(() => O.none<GraphNameType>())
  );

const graphNameToPatternComponent = (
  graphName: O.Option<GraphNameType>,
  bindings: SolutionBindings
): Quad["graph"] | undefined =>
  O.match(graphName, {
    onNone: () => undefined,
    onSome: (term) =>
      term.termType === "NamedNode"
        ? O.getOrUndefined(decodeIRI(term.value))
        : F.pipe(R.get(bindings, term.value), O.flatMap(O.liftPredicate(isIRI)), O.getOrUndefined),
  });

interface TriplePattern {
  readonly triple: sparqljs.Triple;
  readonly graphName: O.Option<GraphNameType>;
}

const filterGraphScopedMatches = (
  matches: ReadonlyArray<Quad>,
  graphName: O.Option<GraphNameType>
): ReadonlyArray<Quad> =>
  O.match(graphName, {
    onNone: () => matches,
    onSome: () => A.filter(matches, (quad) => quad.graph !== undefined),
  });

const tripleToQuadPattern = (
  triple: sparqljs.Triple,
  graphName: O.Option<GraphNameType>,
  bindings: SolutionBindings
): QuadPattern =>
  new QuadPattern({
    subject: subjectToPatternComponent(triple.subject),
    predicate: predicateToPatternComponent(triple.predicate),
    object: objectToPatternComponent(triple.object),
    graph: graphNameToPatternComponent(graphName, bindings),
  });
const isTermTypeDiscriminatedWithVariable = (
  t: sparqljs.IriTerm | sparqljs.Variable | sparqljs.PropertyPath
): t is sparqljs.VariableTerm => isDiscriminatedWith("termType")(t, "Variable");
const extractBindingsFromQuad = (
  triple: sparqljs.Triple,
  quad: Quad,
  graphName: O.Option<GraphNameType>
): SolutionBindings => {
  const subjectBinding: O.Option<readonly [string, TermType]> = SparqlTermType.is.Variable(triple.subject.termType)
    ? O.some([triple.subject.value, quad.subject] as const)
    : O.none<readonly [string, TermType]>();

  const predicateBinding: O.Option<readonly [string, TermType]> = F.pipe(
    triple.predicate,
    O.liftPredicate(isPredicateTerm),
    O.filter(isTermTypeDiscriminatedWithVariable),
    O.map((t) => [t.value, quad.predicate] as const)
  );

  const objectBinding: O.Option<readonly [string, TermType]> = SparqlTermType.is.Variable(triple.object.termType)
    ? O.some([triple.object.value, quad.object] as const)
    : O.none<readonly [string, TermType]>();

  const graphBinding: O.Option<readonly [string, TermType]> = O.flatMap(graphName, (graphTerm) =>
    graphTerm.termType === "Variable" && quad.graph !== undefined
      ? O.some([graphTerm.value, quad.graph] as const)
      : O.none<readonly [string, TermType]>()
  );

  return R.fromEntries(A.filterMap([subjectBinding, predicateBinding, objectBinding, graphBinding], F.identity));
};

const termsCompatible = (a: TermType, b: TermType): boolean => {
  const aLit = isLiteral(a);
  const bLit = isLiteral(b);

  if (aLit && bLit) {
    const aTyped = Literal.make(a);
    const bTyped = Literal.make(b);
    return aTyped.value === bTyped.value && aTyped.datatype === bTyped.datatype && aTyped.language === bTyped.language;
  }

  if (isIRI(a) && isIRI(b)) {
    return a === b;
  }

  return isBlankNode(a) && isBlankNode(b) && a === b;
};

const mergeBindings = (a: SolutionBindings, b: SolutionBindings): O.Option<SolutionBindings> => {
  const bEntries = R.toEntries(b);

  const hasConflict = A.some(bEntries, ([key, value]) =>
    F.pipe(
      R.get(a, key),
      O.match({
        onNone: thunkFalse,
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

const applyBindingsToTriple = (
  triple: sparqljs.Triple,
  graphName: O.Option<GraphNameType>,
  bindings: SolutionBindings
): QuadPattern => {
  const resolveSubject = (): IRI.Type | BlankNode.Type | undefined =>
    SparqlTermType.is.Variable(triple.subject.termType)
      ? F.pipe(
          R.get(bindings, triple.subject.value),
          O.flatMap(O.liftPredicate((v): v is IRI.Type | BlankNode.Type => isIRI(v) || isBlankNode(v))),
          O.getOrElse(() => subjectToPatternComponent(triple.subject))
        )
      : subjectToPatternComponent(triple.subject);

  const resolvePredicate = (): IRI.Type | undefined =>
    F.pipe(
      triple.predicate,
      O.liftPredicate(isPredicateTerm),
      O.filter(isTermTypeDiscriminatedWithVariable),
      O.flatMap((t) => R.get(bindings, t.value)),
      O.flatMap(O.liftPredicate(isIRI)),
      O.getOrElse(() => predicateToPatternComponent(triple.predicate))
    );

  const resolveObject = (): TermType | undefined =>
    SparqlTermType.is.Variable(triple.object.termType)
      ? F.pipe(
          R.get(bindings, triple.object.value),
          O.getOrElse(() => objectToPatternComponent(triple.object))
        )
      : objectToPatternComponent(triple.object);

  return new QuadPattern({
    subject: resolveSubject(),
    predicate: resolvePredicate(),
    object: resolveObject(),
    graph: graphNameToPatternComponent(graphName, bindings),
  });
};

const joinSolutionWithTriple = (
  existingSolution: SolutionBindings,
  triplePattern: TriplePattern,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<SolutionBindings>, never> =>
  Effect.gen(function* () {
    const pattern = applyBindingsToTriple(triplePattern.triple, triplePattern.graphName, existingSolution);
    const rawMatches = yield* store.match(pattern);
    const matches = filterGraphScopedMatches(rawMatches, triplePattern.graphName);

    return A.filterMap(matches, (quad) => {
      const newBindings = extractBindingsFromQuad(triplePattern.triple, quad, triplePattern.graphName);
      return mergeBindings(existingSolution, newBindings);
    });
  });

const toExecutionError = (query: string, message: string, cause: unknown): SparqlExecutionError =>
  new SparqlExecutionError({
    query,
    message,
    cause: String(cause),
  });

const validateIri = (value: string, query: string, context: string): Effect.Effect<void, SparqlExecutionError> =>
  Either.match(decodeIRIEither(value), {
    onLeft: (cause) => Effect.fail(toExecutionError(query, `Invalid IRI in ${context}: ${value}`, cause)),
    onRight: () => Effect.void,
  });

const validateVariableName = (value: string, query: string): Effect.Effect<void, SparqlExecutionError> =>
  Either.match(decodeVariableNameEither(value), {
    onLeft: (cause) => Effect.fail(toExecutionError(query, `Invalid variable name: ${value}`, cause)),
    onRight: () => Effect.void,
  });

const validateTerm = (term: sparqljs.Term, query: string, context: string): Effect.Effect<void, SparqlExecutionError> =>
  Match.value(term).pipe(
    Match.discriminatorsExhaustive("termType")({
      Variable: (t) => validateVariableName(t.value, query),
      NamedNode: (t) => validateIri(t.value, query, context),
      BlankNode: () => Effect.void,
      Literal: (t) =>
        t.datatype?.value === undefined ? Effect.void : validateIri(t.datatype.value, query, `${context} datatype`),
      Quad: () => Effect.void,
    })
  );

const validateTriple = (triple: sparqljs.Triple, query: string): Effect.Effect<void, SparqlExecutionError> =>
  Effect.all([
    validateTerm(triple.subject, query, "triple subject"),
    F.pipe(
      triple.predicate,
      O.liftPredicate(isPredicateTerm),
      O.match({
        onNone: () => Effect.void,
        onSome: (predicate) => validateTerm(predicate, query, "triple predicate"),
      })
    ),
    validateTerm(triple.object, query, "triple object"),
  ]).pipe(Effect.asVoid);

const validatePattern = (pattern: sparqljs.Pattern, query: string): Effect.Effect<void, SparqlExecutionError> =>
  Match.value(pattern).pipe(
    Match.when({ type: "bgp" }, (bgp) =>
      Effect.forEach(bgp.triples, (triple) => validateTriple(triple, query)).pipe(Effect.asVoid)
    ),
    Match.when({ type: "optional" }, (optional) =>
      Effect.forEach(optional.patterns, (inner) => validatePattern(inner, query)).pipe(Effect.asVoid)
    ),
    Match.when({ type: "union" }, (union) =>
      Effect.forEach(union.patterns, (inner) => validatePattern(inner, query)).pipe(Effect.asVoid)
    ),
    Match.when({ type: "graph" }, (graphPattern) =>
      Effect.all([
        validateTerm(graphPattern.name, query, "GRAPH name"),
        Effect.forEach(graphPattern.patterns, (inner) => validatePattern(inner, query)).pipe(Effect.asVoid),
      ]).pipe(Effect.asVoid)
    ),
    Match.orElse(() => Effect.void)
  );

const validateWhere = (
  where: ReadonlyArray<sparqljs.Pattern>,
  query: string
): Effect.Effect<void, SparqlExecutionError> =>
  Effect.forEach(where, (pattern) => validatePattern(pattern, query)).pipe(Effect.asVoid);

const executeBGP = (
  triples: ReadonlyArray<TriplePattern>,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(triples)) {
      return [{}] as const;
    }

    const firstTriple = A.unsafeGet(triples, 0);
    const firstPattern = tripleToQuadPattern(firstTriple.triple, firstTriple.graphName, {});
    const rawFirstMatches = yield* store.match(firstPattern);
    const firstMatches = filterGraphScopedMatches(rawFirstMatches, firstTriple.graphName);

    const initialSolutions: ReadonlyArray<SolutionBindings> = A.map(firstMatches, (quad) =>
      extractBindingsFromQuad(firstTriple.triple, quad, firstTriple.graphName)
    );

    const remainingTriples = A.drop(triples, 1);

    return yield* Effect.reduce(remainingTriples, initialSolutions, (solutions, triplePattern) =>
      Effect.flatMap(
        Effect.forEach(solutions, (sol) => joinSolutionWithTriple(sol, triplePattern, store)),
        (nestedSolutions) => Effect.succeed(A.flatten(nestedSolutions))
      )
    );
  }).pipe(Effect.withSpan("QueryExecutor.executeBGP"));

interface ExtractedPatterns {
  readonly triples: ReadonlyArray<TriplePattern>;
  readonly filters: ReadonlyArray<sparqljs.Expression>;
  readonly optionals: ReadonlyArray<sparqljs.OptionalPattern>;
  readonly unions: ReadonlyArray<sparqljs.UnionPattern>;
}

const extractPatternsAndFilters = (
  patterns: ReadonlyArray<sparqljs.Pattern>,
  graphName: O.Option<GraphNameType> = O.none<GraphNameType>()
): ExtractedPatterns =>
  A.reduce(
    patterns,
    {
      triples: A.empty<TriplePattern>(),
      filters: A.empty<sparqljs.Expression>(),
      optionals: A.empty<sparqljs.OptionalPattern>(),
      unions: A.empty<sparqljs.UnionPattern>(),
    },
    (acc, pattern) =>
      Match.value(pattern).pipe(
        Match.when({ type: "bgp" }, (bgp) => ({
          ...acc,
          triples: A.appendAll(
            acc.triples,
            A.map(bgp.triples, (triple) => ({ triple, graphName }))
          ),
        })),
        Match.when({ type: "filter" }, (flt) => ({ ...acc, filters: A.append(acc.filters, flt.expression) })),
        Match.when({ type: "optional" }, (opt) => ({ ...acc, optionals: A.append(acc.optionals, opt) })),
        Match.when({ type: "union" }, (uni) => ({ ...acc, unions: A.append(acc.unions, uni) })),
        Match.when({ type: "graph" }, (graphPattern) => {
          const nestedGraphName = asGraphName(graphPattern.name);
          const nested = extractPatternsAndFilters(graphPattern.patterns, nestedGraphName);
          return {
            triples: A.appendAll(acc.triples, nested.triples),
            filters: A.appendAll(acc.filters, nested.filters),
            optionals: A.appendAll(acc.optionals, nested.optionals),
            unions: A.appendAll(acc.unions, nested.unions),
          };
        }),
        Match.orElse(() => acc)
      )
  );

const processOptionalForSolution = (
  solution: SolutionBindings,
  optional: sparqljs.OptionalPattern,
  store: RdfStoreShape
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

const executeOptionals = (
  solutions: ReadonlyArray<SolutionBindings>,
  optionals: ReadonlyArray<sparqljs.OptionalPattern>,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.reduce(optionals, solutions, (currentSolutions, optional) =>
    Effect.flatMap(
      Effect.forEach(currentSolutions, (sol) => processOptionalForSolution(sol, optional, store)),
      (nestedSolutions) => Effect.succeed(A.flatten(nestedSolutions))
    )
  );

const executeUnionBranch = (
  branch: sparqljs.Pattern,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    const { triples, filters } = extractPatternsAndFilters([branch]);
    const branchSolutions = yield* executeBGP(triples, store);
    return yield* Effect.filter(branchSolutions, (sol) => evaluateFilters(filters, sol));
  });

const executeUnions = (
  patterns: ReadonlyArray<sparqljs.UnionPattern>,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(patterns)) {
      return [{}] as const;
    }

    const allBranches = A.flatMap(patterns, (union) => union.patterns);
    const branchResults = yield* Effect.forEach(allBranches, (branch) => executeUnionBranch(branch, store));

    return A.flatten(branchResults);
  });

const joinBgpAndUnion = (
  bgpSolutions: ReadonlyArray<SolutionBindings>,
  unionSolutions: ReadonlyArray<SolutionBindings>
): ReadonlyArray<SolutionBindings> =>
  A.filterMap(
    A.flatMap(bgpSolutions, (bgpSol) => A.map(unionSolutions, (unionSol) => ({ bgpSol, unionSol }))),
    ({ bgpSol, unionSol }) => mergeBindings(bgpSol, unionSol)
  );

const executeWhereClause = (
  where: ReadonlyArray<sparqljs.Pattern>,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<SolutionBindings>, SparqlExecutionError> =>
  Effect.gen(function* () {
    const { triples, filters, optionals, unions } = extractPatternsAndFilters(where);

    let solutions = yield* executeBGP(triples, store);

    solutions = yield* F.pipe(
      unions,
      O.liftPredicate(P.not(A.isEmptyReadonlyArray)),
      O.match({
        onNone: thunkSucceedEffect(solutions),
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
        onNone: thunkSucceedEffect(solutions),
        onSome: (nonEmptyOptionals) => executeOptionals(solutions, nonEmptyOptionals, store),
      })
    );

    solutions = yield* F.pipe(
      filters,
      O.liftPredicate(P.not(A.isEmptyReadonlyArray)),
      O.match({
        onNone: thunkSucceedEffect(solutions),
        onSome: (nonEmptyFilters) => Effect.filter(solutions, (solution) => evaluateFilters(nonEmptyFilters, solution)),
      })
    );

    return solutions;
  }).pipe(Effect.withSpan("QueryExecutor.executeWhereClause"));

const projectSolutions = (
  solutions: ReadonlyArray<SolutionBindings>,
  variables: ReadonlyArray<string>
): SparqlBindings => {
  const columns: ReadonlyArray<VariableNameType> = A.filterMap(variables, (varName) => decodeVariableName(varName));

  const rows = A.map(solutions, (solution) =>
    A.filterMap(columns, (varName) =>
      O.map(R.get(solution, varName), (value) => new SparqlBinding({ name: varName, value }))
    )
  );

  return new SparqlBindings({ columns: [...columns], rows });
};

const getTermKey = (term: TermType): string =>
  F.pipe(
    term,
    O.liftPredicate(isLiteral),
    O.match({
      onNone: () => `T:${term}`,
      onSome: (lit) => `L:${lit.value}:${lit.datatype ?? ""}:${lit.language ?? ""}`,
    })
  );

const getSolutionKey = (solution: SolutionBindings, variables: ReadonlyArray<string>): string =>
  A.join(
    A.map(variables, (v) =>
      O.match(R.get(solution, v), {
        onNone: () => "null",
        onSome: getTermKey,
      })
    ),
    "|"
  );

const deduplicateSolutions = (
  solutions: ReadonlyArray<SolutionBindings>,
  variables: ReadonlyArray<string>
): ReadonlyArray<SolutionBindings> => {
  const { result } = A.reduce(
    solutions,
    { seen: HashSet.empty<string>(), result: A.empty<SolutionBindings>() },
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

const isVariableExpression = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.VariableExpression =>
  P.hasProperty(v, "variable");

const isVariableTermInProjection = (v: sparqljs.Variable | sparqljs.Wildcard): v is sparqljs.VariableTerm =>
  P.hasProperty(v, "termType") && v.termType === "Variable";

const extractProjectedVariables = (
  variables: ReadonlyArray<sparqljs.Variable | sparqljs.Wildcard>
): ReadonlyArray<string> =>
  A.filterMap(
    variables,
    (v): O.Option<string> =>
      Match.value(v).pipe(
        Match.when(isVariableExpression, (ve) => O.some(ve.variable.value)),
        Match.when(isVariableTermInProjection, (vt) => O.some(vt.value)),
        Match.orElse(O.none<string>)
      )
  );

const collectAllVariables = (solutions: ReadonlyArray<SolutionBindings>): ReadonlyArray<string> =>
  A.dedupe(A.flatMap(solutions, R.keys));

export const executeSelect = (
  ast: sparqljs.SelectQuery,
  store: RdfStoreShape
): Effect.Effect<SparqlBindings, SparqlExecutionError | SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    const where = ast.where ?? A.empty<sparqljs.Pattern>();
    yield* validateWhere(where, "SELECT");
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

const resolveTemplateSubject = (
  subject: sparqljs.Triple["subject"],
  bindings: SolutionBindings
): O.Option<IRI.Type | BlankNode.Type> =>
  Match.value(subject).pipe(
    Match.discriminatorsExhaustive("termType")({
      Variable: (term) =>
        F.pipe(
          R.get(bindings, term.value),
          O.flatMap(O.liftPredicate((v): v is IRI.Type | BlankNode.Type => isIRI(v) || isBlankNode(v)))
        ),
      NamedNode: (node) => O.map(decodeIRI(node.value), (iri) => iri as IRI.Type | BlankNode.Type),
      BlankNode: (node) => O.some<IRI.Type | BlankNode.Type>(makeBlankNode(`_:${node.value}`)),
      Quad: O.none<IRI.Type | BlankNode.Type>,
    })
  );

const resolveTemplatePredicate = (
  predicate: sparqljs.Triple["predicate"],
  bindings: SolutionBindings
): O.Option<IRI.Type> =>
  F.pipe(
    predicate,
    O.liftPredicate(isPredicateTerm),
    O.flatMap((t) =>
      Match.value(t).pipe(
        Match.discriminatorsExhaustive("termType")({
          Variable: (term) => F.pipe(R.get(bindings, term.value), O.flatMap(O.liftPredicate(isIRI))),
          NamedNode: (node) => decodeIRI(node.value),
        })
      )
    )
  );

const resolveTemplateObject = (object: sparqljs.Triple["object"], bindings: SolutionBindings): O.Option<TermType> => {
  const thunkSparqlToDomain = () => sparqlTermToDomain(object);

  return Match.value(object).pipe(
    Match.discriminatorsExhaustive("termType")({
      Variable: (term) => R.get(bindings, term.value),
      NamedNode: thunkSparqlToDomain,
      BlankNode: thunkSparqlToDomain,
      Literal: thunkSparqlToDomain,
      Quad: O.none<TermType>,
    })
  );
};

const instantiateTemplate = (triple: sparqljs.Triple, bindings: SolutionBindings): O.Option<Quad> =>
  O.flatMap(resolveTemplateSubject(triple.subject, bindings), (subject) =>
    O.flatMap(resolveTemplatePredicate(triple.predicate, bindings), (predicate) =>
      O.map(resolveTemplateObject(triple.object, bindings), (object) => new Quad({ subject, predicate, object }))
    )
  );

const deduplicateQuads = (quads: ReadonlyArray<Quad>): ReadonlyArray<Quad> => {
  const getQuadKey = (quad: Quad): string =>
    `${quad.subject}|${quad.predicate}|${getTermKey(quad.object)}|${quad.graph ?? ""}`;

  const { result } = A.reduce(quads, { seen: HashSet.empty<string>(), result: A.empty<Quad>() }, (acc, quad) => {
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

const describeTerm = (term: TermType, store: RdfStoreShape): Effect.Effect<ReadonlyArray<Quad>> =>
  Effect.gen(function* () {
    if (!isIRI(term)) {
      return [] as const;
    }

    const asSubject = yield* store.match(new QuadPattern({ subject: term }));
    const asObject = yield* store.match(new QuadPattern({ object: term }));
    return deduplicateQuads(A.appendAll(asSubject, asObject));
  });

const collectDescribeTargets = (
  ast: sparqljs.DescribeQuery,
  solutions: ReadonlyArray<SolutionBindings>
): ReadonlyArray<TermType> => {
  const targets = A.empty<TermType>();

  for (const target of ast.variables) {
    if (target.termType === "NamedNode") {
      const decoded = decodeIRI(target.value);
      if (O.isSome(decoded)) {
        targets.push(decoded.value);
      }
      continue;
    }

    if (target.termType === "Variable") {
      for (const solution of solutions) {
        const bound = R.get(solution, target.value);
        if (O.isSome(bound)) {
          targets.push(bound.value);
        }
      }
      continue;
    }

    for (const solution of solutions) {
      targets.push(...R.values(solution));
    }
  }

  return A.dedupeWith(targets, termsCompatible);
};

export const executeConstruct = (
  ast: sparqljs.ConstructQuery,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<Quad>, SparqlExecutionError | SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    const where = ast.where ?? A.empty<sparqljs.Pattern>();
    yield* validateWhere(where, "CONSTRUCT");
    const solutions = yield* executeWhereClause(where, store);

    const template = ast.template ?? A.empty<sparqljs.Triple>();
    yield* Effect.forEach(template, (triple) => validateTriple(triple, "CONSTRUCT template"));

    const quads = A.filterMap(
      A.flatMap(solutions, (solution) => A.map(template, (tripleTemplate) => ({ solution, tripleTemplate }))),
      ({ solution, tripleTemplate }) => instantiateTemplate(tripleTemplate, solution)
    );

    return deduplicateQuads(quads);
  }).pipe(Effect.withSpan("QueryExecutor.executeConstruct"));

export const executeAsk = (
  ast: sparqljs.AskQuery,
  store: RdfStoreShape
): Effect.Effect<boolean, SparqlExecutionError | SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    const where = ast.where ?? A.empty<sparqljs.Pattern>();
    yield* validateWhere(where, "ASK");
    const solutions = yield* executeWhereClause(where, store);

    return !A.isEmptyReadonlyArray(solutions);
  }).pipe(Effect.withSpan("QueryExecutor.executeAsk"));

export const executeDescribe = (
  ast: sparqljs.DescribeQuery,
  store: RdfStoreShape
): Effect.Effect<ReadonlyArray<Quad>, SparqlExecutionError | SparqlUnsupportedFeatureError> =>
  Effect.gen(function* () {
    const where = ast.where ?? A.empty<sparqljs.Pattern>();
    yield* validateWhere(where, "DESCRIBE");
    yield* Effect.forEach(ast.variables, (variable) =>
      variable.termType === "NamedNode"
        ? validateIri(variable.value, "DESCRIBE", "DESCRIBE target")
        : variable.termType === "Variable"
          ? validateVariableName(variable.value, "DESCRIBE")
          : Effect.void
    );
    const solutions = yield* executeWhereClause(where, store);
    const targets = collectDescribeTargets(ast, solutions);

    const described = yield* Effect.forEach(targets, (target) => describeTerm(target, store));
    return deduplicateQuads(A.flatten(described));
  }).pipe(Effect.withSpan("QueryExecutor.executeDescribe"));
