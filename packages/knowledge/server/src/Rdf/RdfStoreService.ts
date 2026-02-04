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
import { $KnowledgeServerId } from "@beep/identity/packages";
import { RdfTermConversionError } from "@beep/knowledge-domain/errors";
import {
  BlankNode,
  IRI,
  isBlankNode,
  Literal,
  makeBlankNode,
  Quad,
  type QuadPattern,
  type Term,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";
import * as N3 from "n3";

const $I = $KnowledgeServerId.create("Rdf/RdfStoreService");

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
  return iriToN3(IRI.make(subject));
};

/**
 * Convert a domain Predicate (IRI) to N3 Predicate
 */
const predicateToN3 = (predicate: Quad["predicate"]): N3.Quad_Predicate => iriToN3(predicate);

/**
 * Convert a domain Term (IRI | BlankNode | Literal) to N3 Term
 */
const termToN3 = (term: Term.Type): N3.Quad_Object => {
  if (isBlankNode(term)) {
    return blankNodeToN3(term);
  }
  if (IRI.is(term)) {
    return iriToN3(term);
  }
  // Must be Literal
  return literalToN3(Literal.make(term));
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
  return IRI.make(term.value);
};

/**
 * Convert an RDF/JS Predicate term to domain Predicate (IRI)
 */
const rdfJsPredicateToDomain = (term: RdfJsTerm): Quad["predicate"] => IRI.make(term.value);

/**
 * Convert an RDF/JS Object term to domain Term (IRI | BlankNode | Literal)
 */
const rdfJsObjectToDomain = (term: RdfJsTerm): Term.Type => {
  switch (term.termType) {
    case "NamedNode":
      return IRI.make(term.value);

    case "BlankNode":
      return BlankNode.make(`_:${term.value}`);

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
          datatype: IRI.make(datatype),
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
  return IRI.make(term.value);
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
export class RdfStore extends Effect.Service<RdfStore>()($I`RdfStore`, {
  accessors: true,
  effect: Effect.gen(function* () {
    // Internal N3 store instance
    const store = new N3.Store();

    const addQuad = Effect.fn("RdfStore.addQuad")((quad: Quad) =>
      Effect.sync(() => {
        store.addQuad(quadToN3(quad));
      })
    );

    const addQuads = Effect.fn("RdfStore.addQuads")((quads: ReadonlyArray<Quad>) =>
      Effect.sync(() => {
        const n3Quads = A.map(quads, quadToN3);
        store.addQuads(n3Quads);
      }).pipe(
        Effect.withSpan("RdfStore.addQuads", {
          attributes: { quadCount: quads.length },
        })
      )
    );

    const removeQuad = Effect.fn("RdfStore.removeQuad")((quad: Quad) =>
      Effect.sync(() => {
        store.removeQuad(quadToN3(quad));
      })
    );

    const removeQuads = Effect.fn("RdfStore.removeQuads")((quads: ReadonlyArray<Quad>) =>
      Effect.sync(() => {
        const n3Quads = A.map(quads, quadToN3);
        store.removeQuads(n3Quads);
      }).pipe(
        Effect.withSpan("RdfStore.removeQuads", {
          attributes: { quadCount: quads.length },
        })
      )
    );

    const hasQuad = Effect.fn("RdfStore.hasQuad")((quad: Quad) => Effect.sync(() => store.has(quadToN3(quad))));

    const match = Effect.fn("RdfStore.match")((pattern: QuadPattern) =>
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
      })
    );

    const getQuads = Effect.fn("RdfStore.getQuads")(() =>
      Effect.sync(() => {
        const results: Quad[] = [];
        for (const n3Quad of store.getQuads(null, null, null, null)) {
          results.push(rdfJsQuadToDomain(n3Quad));
        }
        return results as ReadonlyArray<Quad>;
      })
    );

    const size = Effect.sync(() => store.size).pipe(Effect.withSpan("RdfStore.size"));

    const countMatches = Effect.fn("RdfStore.countMatches")((pattern: QuadPattern) =>
      Effect.sync(() => {
        const n3Subject = patternSubjectToN3(pattern.subject);
        const n3Predicate = patternPredicateToN3(pattern.predicate);
        const n3Object = patternObjectToN3(pattern.object);
        const n3Graph = patternGraphToN3(pattern.graph);

        return store.countQuads(n3Subject, n3Predicate, n3Object, n3Graph);
      })
    );

    const clear = Effect.fn("RdfStore.clear")(() =>
      Effect.sync(() => {
        const allQuads = store.getQuads(null, null, null, null);
        store.removeQuads(allQuads);
      })
    );

    const getSubjects = Effect.fn("RdfStore.getSubjects")(() =>
      Effect.sync(() => {
        const subjects = store.getSubjects(null, null, null);
        return A.map(A.fromIterable(subjects), rdfJsSubjectToDomain);
      })
    );

    const getPredicates = Effect.fn("RdfStore.getPredicates")(() =>
      Effect.sync(() => {
        const predicates = store.getPredicates(null, null, null);
        return A.map(A.fromIterable(predicates), rdfJsPredicateToDomain);
      })
    );

    const getObjects = Effect.fn("RdfStore.getObjects")(() =>
      Effect.sync(() => {
        const objects = store.getObjects(null, null, null);
        return A.map(A.fromIterable(objects), rdfJsObjectToDomain);
      })
    );

    const getGraphs = Effect.fn("RdfStore.getGraphs")(() =>
      Effect.sync(() => {
        const graphs = store.getGraphs(null, null, null);
        return A.map(A.fromIterable(graphs), rdfJsGraphToDomain);
      })
    );

    const createGraph = Effect.fn("RdfStore.createGraph")((iri: IRI.Type) =>
      Effect.sync(() => {
        const marker = N3.DataFactory.quad(
          N3.DataFactory.namedNode(iri),
          N3.DataFactory.namedNode("urn:beep:internal#marker"),
          N3.DataFactory.literal(""),
          N3.DataFactory.namedNode(iri)
        );
        store.addQuad(marker);
        store.removeQuad(marker);
      })
    );

    const dropGraph = Effect.fn("RdfStore.dropGraph")((iri: IRI.Type) =>
      Effect.sync(() => {
        store.deleteGraph(iri);
      })
    );

    const listGraphs = Effect.fn("RdfStore.listGraphs")(() =>
      Effect.sync(() => {
        const graphs = store.getGraphs(null, null, null);
        return A.filter(
          A.map(A.fromIterable(graphs), (g) => rdfJsGraphToDomain(g)),
          (g): g is IRI.Type => g !== undefined
        );
      })
    );

    return {
      addQuad,
      addQuads,
      removeQuad,
      removeQuads,
      hasQuad,
      match,
      getQuads,
      size,
      countMatches,
      clear,
      getSubjects,
      getPredicates,
      getObjects,
      getGraphs,
      createGraph,
      dropGraph,
      listGraphs,
    };
  }),
}) {}
