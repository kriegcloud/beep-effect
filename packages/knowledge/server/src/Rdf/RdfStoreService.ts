/**
 * RdfStore Service
 *
 * Effect.Service wrapping N3.Store for in-memory RDF quad storage.
 * Provides typed operations for adding, removing, and matching quads
 * using domain value objects.
 *
 * @module knowledge-server/Rdf/RdfStoreService
 * @since 0.1.0
 */
import { RdfTermConversionError } from "@beep/knowledge-domain/errors";
import {
  type BlankNode,
  type IRI,
  isBlankNode,
  isIRI,
  Literal,
  makeBlankNode,
  makeIRI,
  Quad,
  type QuadPattern,
  type Term,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";
import * as N3 from "n3";

/**
 * XSD namespace for literal datatype IRIs
 */
const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const RDF_LANG_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

/**
 * Convert a domain IRI to N3 NamedNode
 */
const iriToN3 = (iri: IRI.Type): N3.NamedNode => N3.DataFactory.namedNode(iri);

/**
 * Convert a domain BlankNode to N3 BlankNode
 * Domain BlankNode includes "_:" prefix, N3 expects just the identifier
 */
const blankNodeToN3 = (bnode: BlankNode.Type): N3.BlankNode => {
  // Strip the "_:" prefix for N3
  const id = Str.slice(2)(bnode);
  return N3.DataFactory.blankNode(id);
};

/**
 * Convert a domain Literal to N3 Literal
 * Handles language tags and datatype IRIs according to RDF spec
 */
const literalToN3 = (literal: Literal): N3.Literal => {
  // If language is present, use it (creates langString literal)
  if (literal.language !== undefined) {
    return N3.DataFactory.literal(literal.value, literal.language);
  }

  // If datatype is present, use it
  if (literal.datatype !== undefined) {
    return N3.DataFactory.literal(literal.value, N3.DataFactory.namedNode(literal.datatype));
  }

  // Default: plain string (xsd:string)
  return N3.DataFactory.literal(literal.value);
};

/**
 * Convert a domain Subject (IRI | BlankNode) to N3 Subject
 */
const subjectToN3 = (subject: Quad["subject"]): N3.Quad_Subject => {
  if (isBlankNode(subject)) {
    return blankNodeToN3(subject);
  }
  // Must be IRI
  return iriToN3(subject as IRI.Type);
};

/**
 * Convert a domain Predicate (IRI) to N3 Predicate
 */
const predicateToN3 = (predicate: Quad["predicate"]): N3.Quad_Predicate => iriToN3(predicate);

/**
 * Convert a domain Term (IRI | BlankNode | Literal) to N3 Term
 */
const termToN3 = (term: Term): N3.Quad_Object => {
  if (isBlankNode(term)) {
    return blankNodeToN3(term);
  }
  if (isIRI(term)) {
    return iriToN3(term);
  }
  // Must be Literal
  return literalToN3(term as Literal);
};

/**
 * Convert a domain Graph (optional IRI) to N3 Graph
 * undefined → default graph
 */
const graphToN3 = (graph: Quad["graph"]): N3.Quad_Graph => {
  if (graph !== undefined) {
    return iriToN3(graph);
  }
  return N3.DataFactory.defaultGraph();
};

/**
 * Convert a domain Quad to N3 Quad
 */
const quadToN3 = (quad: Quad): N3.Quad =>
  N3.DataFactory.quad(
    subjectToN3(quad.subject),
    predicateToN3(quad.predicate),
    termToN3(quad.object),
    graphToN3(quad.graph)
  );

/**
 * RDF/JS Term interface (common interface for all term types)
 * This matches what store.match() returns without N3-specific extensions
 */
interface RdfJsTerm {
  readonly termType: string;
  readonly value: string;
}

/**
 * RDF/JS Literal term interface
 */
interface RdfJsLiteral extends RdfJsTerm {
  readonly termType: "Literal";
  readonly language: string;
  readonly datatype: RdfJsTerm;
}

/**
 * RDF/JS Quad interface (compatible with store.match() return type)
 */
interface RdfJsQuad {
  readonly subject: RdfJsTerm;
  readonly predicate: RdfJsTerm;
  readonly object: RdfJsTerm;
  readonly graph: RdfJsTerm;
}

/**
 * Convert an RDF/JS Subject term to domain Subject (IRI | BlankNode)
 */
const rdfJsSubjectToDomain = (term: RdfJsTerm): Quad["subject"] => {
  if (term.termType === "BlankNode") {
    return makeBlankNode(`_:${term.value}`);
  }
  return makeIRI(term.value);
};

/**
 * Convert an RDF/JS Predicate term to domain Predicate (IRI)
 */
const rdfJsPredicateToDomain = (term: RdfJsTerm): Quad["predicate"] => makeIRI(term.value);

/**
 * Convert an RDF/JS Object term to domain Term (IRI | BlankNode | Literal)
 */
const rdfJsObjectToDomain = (term: RdfJsTerm): Term => {
  switch (term.termType) {
    case "NamedNode":
      return makeIRI(term.value);

    case "BlankNode":
      return makeBlankNode(`_:${term.value}`);

    case "Literal": {
      const lit = term as RdfJsLiteral;
      const datatype = lit.datatype?.value;
      const language = lit.language;

      // Handle language-tagged literals
      if (language && Str.length(language) > 0) {
        return new Literal({
          value: lit.value,
          language,
        });
      }

      // Handle typed literals (skip xsd:string as it's the default)
      if (datatype && datatype !== XSD_STRING && datatype !== RDF_LANG_STRING) {
        return new Literal({
          value: lit.value,
          datatype: makeIRI(datatype),
        });
      }

      // Plain string literal
      return new Literal({ value: lit.value });
    }

    default:
      // This is a defect - N3.js should only return valid term types
      // Effect.sync will capture this as a Defect in the Effect runtime
      throw new RdfTermConversionError({
        termType: term.termType,
        termValue: term.value,
        position: "object",
        message: `Unexpected term type in object position: ${term.termType}`,
      });
  }
};

/**
 * Convert an RDF/JS Graph term to domain Graph (optional IRI)
 */
const rdfJsGraphToDomain = (term: RdfJsTerm): Quad["graph"] => {
  if (term.termType === "DefaultGraph" || term.value === "") {
    return undefined;
  }
  return makeIRI(term.value);
};

/**
 * Convert an RDF/JS Quad to domain Quad
 */
const rdfJsQuadToDomain = (quad: RdfJsQuad): Quad =>
  new Quad({
    subject: rdfJsSubjectToDomain(quad.subject),
    predicate: rdfJsPredicateToDomain(quad.predicate),
    object: rdfJsObjectToDomain(quad.object),
    graph: rdfJsGraphToDomain(quad.graph),
  });

/**
 * Convert pattern component to N3 match argument (undefined → null for wildcard)
 */
const patternSubjectToN3 = (subject: QuadPattern["subject"]): N3.Quad_Subject | null => {
  if (subject === undefined) {
    return null; // wildcard
  }
  return subjectToN3(subject);
};

const patternPredicateToN3 = (predicate: QuadPattern["predicate"]): N3.Quad_Predicate | null => {
  if (predicate === undefined) {
    return null; // wildcard
  }
  return predicateToN3(predicate);
};

const patternObjectToN3 = (object: QuadPattern["object"]): N3.Quad_Object | null => {
  if (object === undefined) {
    return null; // wildcard
  }
  return termToN3(object);
};

const patternGraphToN3 = (graph: QuadPattern["graph"]): N3.Quad_Graph | null => {
  if (graph === undefined) {
    return null; // wildcard - matches ALL graphs including default
  }
  return graphToN3(graph);
};

/**
 * RdfStore Effect.Service
 *
 * In-memory RDF quad storage using N3.Store with Effect-based operations.
 * All operations are wrapped in Effect for observability and composition.
 *
 * @since 0.1.0
 * @category services
 *
 * @example
 * ```ts
 * import { RdfStore } from "@beep/knowledge-server/Rdf";
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* RdfStore;
 *
 *   // Add a quad
 *   yield* store.addQuad(new Quad({
 *     subject: makeIRI("http://example.org/alice"),
 *     predicate: makeIRI("http://xmlns.com/foaf/0.1/name"),
 *     object: new Literal({ value: "Alice" }),
 *   }));
 *
 *   // Query by pattern
 *   const results = yield* store.match(new QuadPattern({
 *     predicate: makeIRI("http://xmlns.com/foaf/0.1/name"),
 *   }));
 * });
 * ```
 */
export class RdfStore extends Effect.Service<RdfStore>()("@beep/knowledge-server/RdfStore", {
  accessors: true,
  effect: Effect.gen(function* () {
    // Internal N3 store instance
    const store = new N3.Store();

    return {
      /**
       * Add a quad to the store
       *
       * @param quad - The quad to add
       * @returns Effect that completes when the quad is added
       *
       * @since 0.1.0
       */
      addQuad: (quad: Quad): Effect.Effect<void> =>
        Effect.sync(() => {
          store.addQuad(quadToN3(quad));
        }).pipe(Effect.withSpan("RdfStore.addQuad")),

      /**
       * Add multiple quads to the store
       *
       * @param quads - The quads to add
       * @returns Effect that completes when all quads are added
       *
       * @since 0.1.0
       */
      addQuads: (quads: ReadonlyArray<Quad>): Effect.Effect<void> =>
        Effect.sync(() => {
          const n3Quads = A.map(quads, quadToN3);
          store.addQuads(n3Quads);
        }).pipe(
          Effect.withSpan("RdfStore.addQuads", {
            attributes: { quadCount: quads.length },
          })
        ),

      /**
       * Remove a quad from the store
       *
       * @param quad - The quad to remove
       * @returns Effect that completes when the quad is removed
       *
       * @since 0.1.0
       */
      removeQuad: (quad: Quad): Effect.Effect<void> =>
        Effect.sync(() => {
          store.removeQuad(quadToN3(quad));
        }).pipe(Effect.withSpan("RdfStore.removeQuad")),

      /**
       * Remove multiple quads from the store
       *
       * @param quads - The quads to remove
       * @returns Effect that completes when all quads are removed
       *
       * @since 0.1.0
       */
      removeQuads: (quads: ReadonlyArray<Quad>): Effect.Effect<void> =>
        Effect.sync(() => {
          const n3Quads = A.map(quads, quadToN3);
          store.removeQuads(n3Quads);
        }).pipe(
          Effect.withSpan("RdfStore.removeQuads", {
            attributes: { quadCount: quads.length },
          })
        ),

      /**
       * Check if a quad exists in the store
       *
       * @param quad - The quad to check
       * @returns Effect yielding true if the quad exists
       *
       * @since 0.1.0
       */
      hasQuad: (quad: Quad): Effect.Effect<boolean> =>
        Effect.sync(() => store.has(quadToN3(quad))).pipe(Effect.withSpan("RdfStore.hasQuad")),

      /**
       * Match quads by pattern
       *
       * All pattern fields are optional. Undefined fields act as wildcards.
       *
       * @param pattern - The quad pattern to match
       * @returns Effect yielding matching quads
       *
       * @since 0.1.0
       */
      match: (pattern: QuadPattern): Effect.Effect<ReadonlyArray<Quad>> =>
        Effect.sync(() => {
          const n3Subject = patternSubjectToN3(pattern.subject);
          const n3Predicate = patternPredicateToN3(pattern.predicate);
          const n3Object = patternObjectToN3(pattern.object);
          const n3Graph = patternGraphToN3(pattern.graph);

          const results: Quad[] = [];
          for (const n3Quad of store.match(n3Subject, n3Predicate, n3Object, n3Graph)) {
            results.push(rdfJsQuadToDomain(n3Quad));
          }
          return results as ReadonlyArray<Quad>;
        }).pipe(Effect.withSpan("RdfStore.match")),

      /**
       * Get all quads in the store
       *
       * @returns Effect yielding all quads
       *
       * @since 0.1.0
       */
      getQuads: (): Effect.Effect<ReadonlyArray<Quad>> =>
        Effect.sync(() => {
          const results: Quad[] = [];
          for (const n3Quad of store.getQuads(null, null, null, null)) {
            results.push(rdfJsQuadToDomain(n3Quad));
          }
          return results as ReadonlyArray<Quad>;
        }).pipe(Effect.withSpan("RdfStore.getQuads")),

      /**
       * Get the number of quads in the store
       *
       * @returns Effect yielding the quad count
       *
       * @since 0.1.0
       */
      size: Effect.sync(() => store.size).pipe(Effect.withSpan("RdfStore.size")),

      /**
       * Count quads matching a pattern
       *
       * @param pattern - The quad pattern to match
       * @returns Effect yielding the count of matching quads
       *
       * @since 0.1.0
       */
      countMatches: (pattern: QuadPattern): Effect.Effect<number> =>
        Effect.sync(() => {
          const n3Subject = patternSubjectToN3(pattern.subject);
          const n3Predicate = patternPredicateToN3(pattern.predicate);
          const n3Object = patternObjectToN3(pattern.object);
          const n3Graph = patternGraphToN3(pattern.graph);

          return store.countQuads(n3Subject, n3Predicate, n3Object, n3Graph);
        }).pipe(Effect.withSpan("RdfStore.countMatches")),

      /**
       * Clear all quads from the store
       *
       * @returns Effect that completes when the store is cleared
       *
       * @since 0.1.0
       */
      clear: (): Effect.Effect<void> =>
        Effect.sync(() => {
          // N3.Store doesn't have a clear method, so we remove all quads
          const allQuads = store.getQuads(null, null, null, null);
          store.removeQuads(allQuads);
        }).pipe(Effect.withSpan("RdfStore.clear")),

      /**
       * Get all unique subjects in the store
       *
       * @returns Effect yielding unique subject IRIs/BlankNodes
       *
       * @since 0.1.0
       */
      getSubjects: (): Effect.Effect<ReadonlyArray<Quad["subject"]>> =>
        Effect.sync(() => {
          const subjects = store.getSubjects(null, null, null);
          return A.map(A.fromIterable(subjects), rdfJsSubjectToDomain);
        }).pipe(Effect.withSpan("RdfStore.getSubjects")),

      /**
       * Get all unique predicates in the store
       *
       * @returns Effect yielding unique predicate IRIs
       *
       * @since 0.1.0
       */
      getPredicates: (): Effect.Effect<ReadonlyArray<Quad["predicate"]>> =>
        Effect.sync(() => {
          const predicates = store.getPredicates(null, null, null);
          return A.map(A.fromIterable(predicates), rdfJsPredicateToDomain);
        }).pipe(Effect.withSpan("RdfStore.getPredicates")),

      /**
       * Get all unique objects in the store
       *
       * @returns Effect yielding unique object Terms
       *
       * @since 0.1.0
       */
      getObjects: (): Effect.Effect<ReadonlyArray<Term>> =>
        Effect.sync(() => {
          const objects = store.getObjects(null, null, null);
          return A.map(A.fromIterable(objects), rdfJsObjectToDomain);
        }).pipe(Effect.withSpan("RdfStore.getObjects")),

      /**
       * Get all unique graphs in the store
       *
       * @returns Effect yielding unique graph IRIs (undefined for default graph)
       *
       * @since 0.1.0
       */
      getGraphs: (): Effect.Effect<ReadonlyArray<Quad["graph"]>> =>
        Effect.sync(() => {
          const graphs = store.getGraphs(null, null, null);
          return A.map(A.fromIterable(graphs), rdfJsGraphToDomain);
        }).pipe(Effect.withSpan("RdfStore.getGraphs")),

      /**
       * Create a named graph
       *
       * N3 creates graphs implicitly when adding quads, so this method
       * exists for API completeness and explicit intent. It ensures the
       * graph exists by adding and immediately removing a marker quad.
       *
       * @param iri - The IRI of the graph to create
       * @returns Effect that completes when the graph is created
       *
       * @since 0.1.0
       */
      createGraph: (iri: IRI.Type): Effect.Effect<void> =>
        Effect.sync(() => {
          // N3 creates graphs implicitly when adding quads
          // We add and immediately remove a marker quad to ensure graph exists
          const marker = N3.DataFactory.quad(
            N3.DataFactory.namedNode(iri),
            N3.DataFactory.namedNode("urn:beep:internal#marker"),
            N3.DataFactory.literal(""),
            N3.DataFactory.namedNode(iri)
          );
          store.addQuad(marker);
          store.removeQuad(marker);
        }).pipe(Effect.withSpan("RdfStore.createGraph")),

      /**
       * Drop a named graph and all its quads
       *
       * @param iri - The IRI of the graph to drop
       * @returns Effect that completes when the graph is dropped
       *
       * @since 0.1.0
       */
      dropGraph: (iri: IRI.Type): Effect.Effect<void> =>
        Effect.sync(() => {
          store.deleteGraph(iri);
        }).pipe(Effect.withSpan("RdfStore.dropGraph")),

      /**
       * List all named graphs (excluding the default graph)
       *
       * @returns Effect yielding IRIs of all named graphs
       *
       * @since 0.1.0
       */
      listGraphs: (): Effect.Effect<ReadonlyArray<IRI.Type>> =>
        Effect.sync(() => {
          const graphs = store.getGraphs(null, null, null);
          return A.filter(
            A.map(A.fromIterable(graphs), (g) => rdfJsGraphToDomain(g)),
            (g): g is IRI.Type => g !== undefined
          );
        }).pipe(Effect.withSpan("RdfStore.listGraphs")),
    };
  }),
}) {}
