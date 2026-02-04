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
  type IRI,
  isBlankNode,
  isIRI,
  Literal,
  makeBlankNode,
  makeIRI,
  Quad,
  QuadPattern,
  SparqlBinding,
  SparqlBindings,
  type Term,
  type VariableName,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import type * as sparqljs from "sparqljs";
import type { RdfStore } from "../Rdf/RdfStoreService";
import { evaluateFilters, isFilterExpression, type SolutionBindings } from "./FilterEvaluator";

/**
 * Type guard: Check if a term-like value is a Variable
 */
const isVariable = (term: unknown): term is sparqljs.VariableTerm =>
  term !== null &&
  typeof term === "object" &&
  "termType" in term &&
  (term as { termType: string }).termType === "Variable";

/**
 * Type guard: Check if a term-like value is a NamedNode (IRI)
 */
const isNamedNode = (term: unknown): term is sparqljs.IriTerm =>
  term !== null &&
  typeof term === "object" &&
  "termType" in term &&
  (term as { termType: string }).termType === "NamedNode";

/**
 * Type guard: Check if a term-like value is a BlankNode
 */
const isSparqlBlankNode = (term: unknown): term is sparqljs.BlankTerm =>
  term !== null &&
  typeof term === "object" &&
  "termType" in term &&
  (term as { termType: string }).termType === "BlankNode";

/**
 * Type guard: Check if a term-like value is a Literal
 */
const isSparqlLiteral = (term: unknown): term is sparqljs.LiteralTerm =>
  term !== null &&
  typeof term === "object" &&
  "termType" in term &&
  (term as { termType: string }).termType === "Literal";

/**
 * Type guard: Check if a value is a PropertyPath (not a simple term)
 */
const isPropertyPath = (term: unknown): boolean =>
  term !== null && typeof term === "object" && "type" in term && (term as { type: string }).type === "path";

/**
 * Convert sparqljs term to domain Term (for non-variable terms)
 * Returns None for variables or property paths
 */
const sparqlTermToDomain = (term: unknown): O.Option<Term> => {
  if (isVariable(term) || isPropertyPath(term)) {
    return O.none();
  }

  if (isNamedNode(term)) {
    return O.some(makeIRI(term.value));
  }

  if (isSparqlBlankNode(term)) {
    return O.some(makeBlankNode(`_:${term.value}`));
  }

  if (isSparqlLiteral(term)) {
    const datatype = term.datatype?.value as IRI.Type | undefined;
    const language = Str.isEmpty(term.language) ? undefined : term.language;

    return O.some(
      new Literal({
        value: term.value,
        datatype: language !== undefined ? undefined : datatype,
        language,
      })
    );
  }

  return O.none();
};

/**
 * Convert sparqljs subject to QuadPattern subject component
 */
const subjectToPatternComponent = (subject: sparqljs.Triple["subject"]): IRI.Type | BlankNode.Type | undefined => {
  if (isVariable(subject)) {
    return undefined;
  }

  if (isNamedNode(subject)) {
    return makeIRI(subject.value);
  }

  if (isSparqlBlankNode(subject)) {
    return makeBlankNode(`_:${subject.value}`);
  }

  return undefined;
};

/**
 * Convert sparqljs predicate to QuadPattern predicate component
 * Property paths are not supported and return undefined
 */
const predicateToPatternComponent = (predicate: sparqljs.Triple["predicate"]): IRI.Type | undefined => {
  if (isVariable(predicate)) {
    return undefined;
  }

  if (isNamedNode(predicate)) {
    return makeIRI(predicate.value);
  }

  // PropertyPath - not supported
  return undefined;
};

/**
 * Convert sparqljs object to QuadPattern object component
 */
const objectToPatternComponent = (object: sparqljs.Triple["object"]): Term | undefined => {
  if (isVariable(object) || isPropertyPath(object)) {
    return undefined;
  }

  return O.getOrUndefined(sparqlTermToDomain(object));
};

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
  const entries: Array<readonly [string, Term]> = [];

  if (isVariable(triple.subject)) {
    entries.push([triple.subject.value, quad.subject] as const);
  }

  if (isVariable(triple.predicate)) {
    entries.push([triple.predicate.value, quad.predicate] as const);
  }

  if (isVariable(triple.object)) {
    entries.push([triple.object.value, quad.object] as const);
  }

  return R.fromEntries(entries);
};

/**
 * Check if two terms are equal for binding compatibility
 */
const termsCompatible = (a: Term, b: Term): boolean => {
  // Check if both are literals
  const aIsLiteral = a instanceof Literal;
  const bIsLiteral = b instanceof Literal;

  if (aIsLiteral && bIsLiteral) {
    return a.value === b.value && a.datatype === b.datatype && a.language === b.language;
  }

  // Both must be same branded type (IRI or BlankNode)
  if (isIRI(a) && isIRI(b)) {
    return a === b;
  }

  if (isBlankNode(a) && isBlankNode(b)) {
    return a === b;
  }

  return false;
};

/**
 * Merge two bindings if compatible (no conflicting values for same variable)
 * Returns None if bindings conflict
 */
const mergeBindings = (a: SolutionBindings, b: SolutionBindings): O.Option<SolutionBindings> => {
  const bEntries = R.toEntries(b);

  // Check for conflicts
  const hasConflict = A.some(bEntries, ([key, value]) => {
    const existing = R.get(a, key);
    return O.isSome(existing) && !termsCompatible(existing.value, value);
  });

  if (hasConflict) {
    return O.none();
  }

  // Merge entries
  return O.some({ ...a, ...b });
};

/**
 * Apply bindings to a triple pattern to create a more specific QuadPattern
 * Variables with known bindings are replaced with their bound values
 */
const applyBindingsToTriple = (triple: sparqljs.Triple, bindings: SolutionBindings): QuadPattern => {
  const resolveSubject = (): IRI.Type | BlankNode.Type | undefined => {
    if (isVariable(triple.subject)) {
      return O.flatMap(R.get(bindings, triple.subject.value), (val) =>
        isIRI(val) || isBlankNode(val) ? O.some(val) : O.none()
      ).pipe(O.getOrUndefined);
    }
    return subjectToPatternComponent(triple.subject);
  };

  const resolvePredicate = (): IRI.Type | undefined => {
    if (isVariable(triple.predicate)) {
      return O.flatMap(R.get(bindings, triple.predicate.value), (val) => (isIRI(val) ? O.some(val) : O.none())).pipe(
        O.getOrUndefined
      );
    }
    return predicateToPatternComponent(triple.predicate);
  };

  const resolveObject = (): Term | undefined => {
    if (isVariable(triple.object)) {
      return O.getOrUndefined(R.get(bindings, triple.object.value));
    }
    return objectToPatternComponent(triple.object);
  };

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
      // Empty pattern matches once with empty bindings
      return [{}];
    }

    // Start with the first pattern
    const firstTriple = A.unsafeGet(triples, 0);
    const firstPattern = tripleToQuadPattern(firstTriple);
    const firstMatches = yield* store.match(firstPattern);

    // Build initial solutions from first pattern matches
    const initialSolutions: ReadonlyArray<SolutionBindings> = A.map(firstMatches, (quad) =>
      extractBindingsFromQuad(firstTriple, quad)
    );

    // Join with remaining patterns using reduce
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
    (acc, pattern) => {
      if (pattern.type === "bgp") {
        const bgp = pattern as sparqljs.BgpPattern;
        return { ...acc, triples: A.appendAll(acc.triples, bgp.triples) };
      }
      if (isFilterExpression(pattern)) {
        return { ...acc, filters: A.append(acc.filters, pattern.expression) };
      }
      if (pattern.type === "optional") {
        return { ...acc, optionals: A.append(acc.optionals, pattern as sparqljs.OptionalPattern) };
      }
      if (pattern.type === "union") {
        return { ...acc, unions: A.append(acc.unions, pattern as sparqljs.UnionPattern) };
      }
      return acc;
    }
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

    // Find compatible extensions that pass filters
    const compatible = yield* Effect.filter(
      A.filterMap(extendedSolutions, (ext) => mergeBindings(solution, ext)),
      (merged) => evaluateFilters(filters, merged)
    );

    // If no compatible extensions, keep original solution
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

    // Flatten all union patterns into branches
    const allBranches = A.flatMap(patterns, (union) => union.patterns);

    // Execute each branch and collect solutions
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

    // Execute basic graph pattern first
    let solutions = yield* executeBGP(triples, store);

    // Execute UNION patterns if present
    if (!A.isEmptyReadonlyArray(unions)) {
      const unionSolutions = yield* executeUnions(unions, store);

      // If we have both BGP and UNION, we need to join them
      solutions = A.isEmptyReadonlyArray(triples) ? unionSolutions : joinBgpAndUnion(solutions, unionSolutions);
    }

    // Execute OPTIONAL patterns (before filters, per SPARQL semantics)
    if (!A.isEmptyReadonlyArray(optionals)) {
      solutions = yield* executeOptionals(solutions, optionals, store);
    }

    // Apply FILTER expressions (after optionals so bound() can check optional vars)
    if (!A.isEmptyReadonlyArray(filters)) {
      solutions = yield* Effect.filter(solutions, (solution) => evaluateFilters(filters, solution));
    }

    return solutions;
  }).pipe(Effect.withSpan("QueryExecutor.executeWhereClause"));

/**
 * Project solutions to requested variables
 */
const projectSolutions = (
  solutions: ReadonlyArray<SolutionBindings>,
  variables: ReadonlyArray<string>
): SparqlBindings => {
  const columns = variables as ReadonlyArray<VariableName>;

  const rows = A.map(solutions, (solution) =>
    A.filterMap(variables, (varName) =>
      O.map(R.get(solution, varName), (value) => new SparqlBinding({ name: varName as VariableName, value }))
    )
  );

  return new SparqlBindings({ columns: [...columns], rows });
};

/**
 * Get a unique key for a term (for deduplication)
 */
const getTermKey = (term: Term): string => {
  if (term instanceof Literal) {
    return `L:${term.value}:${term.datatype ?? ""}:${term.language ?? ""}`;
  }
  return `T:${term}`;
};

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
      if (HashSet.has(acc.seen, key)) {
        return acc;
      }
      return { seen: HashSet.add(acc.seen, key), result: A.append(acc.result, sol) };
    }
  );
  return result;
};

/**
 * Extract projected variable names from SELECT clause
 */
const extractProjectedVariables = (
  variables: ReadonlyArray<sparqljs.Variable | sparqljs.Wildcard>
): ReadonlyArray<string> =>
  A.filterMap(variables, (v): O.Option<string> => {
    if ("termType" in v && v.termType === "Wildcard") {
      return O.none();
    }
    if ("termType" in v && v.termType === "Variable") {
      return O.some(v.value);
    }
    if ("variable" in v && v.variable?.termType === "Variable") {
      return O.some(v.variable.value);
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
    // Execute WHERE clause
    const where = ast.where ?? [];
    const solutions = yield* executeWhereClause(where, store);

    // Determine projected variables
    const projectedVars = extractProjectedVariables(ast.variables);

    // Handle SELECT * - collect all variables from solutions
    const variables = A.isEmptyReadonlyArray(projectedVars) ? collectAllVariables(solutions) : projectedVars;

    // Apply DISTINCT if specified
    const afterDistinct = ast.distinct ? deduplicateSolutions(solutions, variables) : solutions;

    // Apply LIMIT and OFFSET
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
): O.Option<IRI.Type | BlankNode.Type> => {
  if (isVariable(subject)) {
    return O.flatMap(R.get(bindings, subject.value), (val) =>
      isIRI(val) || isBlankNode(val) ? O.some(val) : O.none()
    );
  }
  if (isNamedNode(subject)) {
    return O.some(makeIRI(subject.value));
  }
  if (isSparqlBlankNode(subject)) {
    return O.some(makeBlankNode(`_:${subject.value}`));
  }
  return O.none();
};

/**
 * Resolve predicate for template instantiation
 */
const resolveTemplatePredicate = (
  predicate: sparqljs.Triple["predicate"],
  bindings: SolutionBindings
): O.Option<IRI.Type> => {
  if (isVariable(predicate)) {
    return O.flatMap(R.get(bindings, predicate.value), (val) => (isIRI(val) ? O.some(val) : O.none()));
  }
  if (isNamedNode(predicate)) {
    return O.some(makeIRI(predicate.value));
  }
  // PropertyPath - not supported
  return O.none();
};

/**
 * Resolve object for template instantiation
 */
const resolveTemplateObject = (object: sparqljs.Triple["object"], bindings: SolutionBindings): O.Option<Term> => {
  if (isVariable(object)) {
    return R.get(bindings, object.value);
  }
  return sparqlTermToDomain(object);
};

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
    if (HashSet.has(acc.seen, key)) {
      return acc;
    }
    return { seen: HashSet.add(acc.seen, key), result: A.append(acc.result, quad) };
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
    // Execute WHERE clause
    const where = ast.where ?? [];
    const solutions = yield* executeWhereClause(where, store);

    // Get template triples
    const template = ast.template ?? [];

    // Construct quads for each solution and template triple
    const quads = A.filterMap(
      A.flatMap(solutions, (solution) => A.map(template, (tripleTemplate) => ({ solution, tripleTemplate }))),
      ({ solution, tripleTemplate }) => instantiateTemplate(tripleTemplate, solution)
    );

    // Remove duplicates
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
    // Execute WHERE clause
    const where = ast.where ?? [];
    const solutions = yield* executeWhereClause(where, store);

    // ASK returns true if there's at least one solution
    return !A.isEmptyReadonlyArray(solutions);
  }).pipe(Effect.withSpan("QueryExecutor.executeAsk"));
