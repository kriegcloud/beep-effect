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
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as Str from "effect/String";
import * as N3 from "n3";

const $I = $KnowledgeServerId.create("Rdf/RdfStoreService");

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const RDF_LANG_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

const iriToN3 = (iri: IRI.Type): N3.NamedNode => N3.DataFactory.namedNode(iri);

const blankNodeToN3 = (bnode: BlankNode.Type): N3.BlankNode => {
  const id = Str.slice(2)(bnode);
  return N3.DataFactory.blankNode(id);
};

const literalToN3 = (literal: Literal): N3.Literal => {
  if (literal.language !== undefined) {
    return N3.DataFactory.literal(literal.value, literal.language);
  }

  if (literal.datatype !== undefined) {
    return N3.DataFactory.literal(literal.value, N3.DataFactory.namedNode(literal.datatype));
  }

  return N3.DataFactory.literal(literal.value);
};

const subjectToN3 = (subject: Quad["subject"]): N3.Quad_Subject => {
  if (isBlankNode(subject)) {
    return blankNodeToN3(subject);
  }
  return iriToN3(IRI.make(subject));
};

const predicateToN3 = (predicate: Quad["predicate"]): N3.Quad_Predicate => iriToN3(predicate);

const termToN3 = (term: Term.Type): N3.Quad_Object => {
  if (isBlankNode(term)) {
    return blankNodeToN3(term);
  }
  if (IRI.is(term)) {
    return iriToN3(term);
  }
  return literalToN3(Literal.make(term));
};

const graphToN3 = (graph: Quad["graph"]): N3.Quad_Graph => {
  if (graph !== undefined) {
    return iriToN3(graph);
  }
  return N3.DataFactory.defaultGraph();
};

const quadToN3 = (quad: Quad): N3.Quad =>
  N3.DataFactory.quad(
    subjectToN3(quad.subject),
    predicateToN3(quad.predicate),
    termToN3(quad.object),
    graphToN3(quad.graph)
  );

interface RdfJsTermLike {
  readonly termType: string;
  readonly value: string;
}

interface RdfJsLiteralLike extends RdfJsTermLike {
  readonly termType: "Literal";
  readonly language: string;
  readonly datatype: RdfJsTermLike;
}

interface RdfJsQuadLike {
  readonly subject: RdfJsTermLike;
  readonly predicate: RdfJsTermLike;
  readonly object: RdfJsTermLike;
  readonly graph: RdfJsTermLike;
}

const rdfJsSubjectToDomain = (term: RdfJsTermLike): Quad["subject"] => {
  if (term.termType === "BlankNode") {
    return makeBlankNode(`_:${term.value}`);
  }
  return IRI.make(term.value);
};

const rdfJsPredicateToDomain = (term: RdfJsTermLike): Quad["predicate"] => IRI.make(term.value);
const rdfJsObjectToDomain = Match.type<RdfJsTermLike>().pipe(
  Match.discriminators("termType")({
    NamedNode: (term) => IRI.make(term.value),
    BlankNode: (term) => BlankNode.make(`_:${term.value}`),
  }),
  Match.when(
    (u): u is RdfJsLiteralLike => u.termType === ("Literal" as const),
    (lit) => {
      const datatype = lit.datatype?.value;
      const language = lit.language;

      if (language && Str.length(language) > 0) {
        return new Literal({
          value: lit.value,
          language,
        });
      }

      if (datatype && datatype !== XSD_STRING && datatype !== RDF_LANG_STRING) {
        return new Literal({
          value: lit.value,
          datatype: IRI.make(datatype),
        });
      }

      return new Literal({ value: lit.value });
    }
  ),
  Match.orElse((term) => {
    throw new RdfTermConversionError({
      termType: term.termType,
      termValue: term.value,
      position: "object",
      message: `Unexpected term type in object position: ${term.termType}`,
    });
  })
);

const rdfJsGraphToDomain = (term: RdfJsTermLike): Quad["graph"] => {
  if (term.termType === "DefaultGraph" || term.value === "") {
    return undefined;
  }
  return IRI.make(term.value);
};

const rdfJsQuadToDomain = (quad: RdfJsQuadLike): Quad =>
  new Quad({
    subject: rdfJsSubjectToDomain(quad.subject),
    predicate: rdfJsPredicateToDomain(quad.predicate),
    object: rdfJsObjectToDomain(quad.object),
    graph: rdfJsGraphToDomain(quad.graph),
  });

const patternSubjectToN3 = (subject: QuadPattern["subject"]): N3.Quad_Subject | null => {
  if (subject === undefined) {
    return null;
  }
  return subjectToN3(subject);
};

const patternPredicateToN3 = (predicate: QuadPattern["predicate"]): N3.Quad_Predicate | null => {
  if (predicate === undefined) {
    return null;
  }
  return predicateToN3(predicate);
};

const patternObjectToN3 = (object: QuadPattern["object"]): N3.Quad_Object | null => {
  if (object === undefined) {
    return null;
  }
  return termToN3(object);
};

const patternGraphToN3 = (graph: QuadPattern["graph"]): N3.Quad_Graph | null => {
  if (graph === undefined) {
    return null;
  }
  return graphToN3(graph);
};

export interface RdfStoreShape {
  readonly addQuad: (quad: Quad) => Effect.Effect<void>;
  readonly addQuads: (quads: ReadonlyArray<Quad>) => Effect.Effect<void>;
  readonly removeQuad: (quad: Quad) => Effect.Effect<void>;
  readonly removeQuads: (quads: ReadonlyArray<Quad>) => Effect.Effect<void>;
  readonly hasQuad: (quad: Quad) => Effect.Effect<boolean>;
  readonly match: (pattern: QuadPattern) => Effect.Effect<ReadonlyArray<Quad>>;
  readonly getQuads: () => Effect.Effect<ReadonlyArray<Quad>>;
  readonly size: Effect.Effect<number>;
  readonly countMatches: (pattern: QuadPattern) => Effect.Effect<number>;
  readonly clear: () => Effect.Effect<void>;
  readonly getSubjects: () => Effect.Effect<ReadonlyArray<Quad["subject"]>>;
  readonly getPredicates: () => Effect.Effect<ReadonlyArray<Quad["predicate"]>>;
  readonly getObjects: () => Effect.Effect<ReadonlyArray<Term.Type>>;
  readonly getGraphs: () => Effect.Effect<ReadonlyArray<Quad["graph"]>>;
  readonly createGraph: (iri: IRI.Type) => Effect.Effect<void>;
  readonly dropGraph: (iri: IRI.Type) => Effect.Effect<void>;
  readonly listGraphs: () => Effect.Effect<ReadonlyArray<IRI.Type>>;
}

export class RdfStore extends Context.Tag($I`RdfStore`)<RdfStore, RdfStoreShape>() {}

const serviceEffect: Effect.Effect<RdfStoreShape> = Effect.gen(function* () {
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
        attributes: { quadCount: A.length(quads) },
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
        attributes: { quadCount: A.length(quads) },
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

      return A.map(A.fromIterable(store.match(n3Subject, n3Predicate, n3Object, n3Graph)), (q) => rdfJsQuadToDomain(q));
    })
  );

  const getQuads = Effect.fn("RdfStore.getQuads")(() =>
    Effect.sync(() => A.map(A.fromIterable(store.getQuads(null, null, null, null)), (q) => rdfJsQuadToDomain(q)))
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

  return RdfStore.of({
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
  });
});

export const RdfStoreLive = Layer.effect(RdfStore, serviceEffect);
