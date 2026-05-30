/**
 * AnnotatedTextGraph - text graphs enriched with linguistic-annotation nodes.
 *
 * Extends the structural text graph with annotation strata produced by an
 * {@link Backend.NLPBackend}: {@link POSNode} (part-of-speech),
 * {@link EntityNode} (named entities), {@link LemmaNode} (lemmas),
 * {@link DependencyNode} (syntactic dependencies), and
 * {@link RelationNode} (semantic relations). Categorically this is a
 * richer category whose objects include both structural and annotation nodes.
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * - the heterogeneous node union is discriminated by schema-aware `S.is` guards
 *   over the plain `Schema.Class` node types (adjunct used `instanceof`; the repo
 *   forbids `instanceof` on schema types via the `instanceOfSchema` diagnostic).
 * - document/sentence `TextNode`s are built EFFECTFULLY, reading `Clock` for the
 *   timestamp (was `Date.now()`); annotation nodes arrive pre-built from the
 *   backend.
 * - native `Array.from`/`forEach`/`Object.keys`/`Array#push` become `effect/Array`
 *   (`A.*`), and `getNode`'s `Option` is consumed with `effect/Option`.
 * - `addDependencyAnnotations` is implemented (adjunct left it a TODO), wired to
 *   `backend.parseDependencies`; it stays off by default in
 *   {@link fromDocumentAnnotated} to match adjunct's defaults.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { A, O as OptionUtils } from "@beep/utils";
import { Clock, Effect, Graph } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Backend from "../Backend/NLPBackend.ts";
import { DependencyNode, EntityNode, LemmaNode, POSNode, RelationNode, TextEdge, TextNode } from "./Schema.ts";

// =============================================================================
// Annotated Node Types
// =============================================================================

/**
 * Union of all node types (structural + linguistic annotations).
 *
 * @since 0.0.0
 * @category models
 */
export type AnnotatedNode = TextNode | POSNode | EntityNode | LemmaNode | DependencyNode | RelationNode;

/**
 * Type guard: the node is a structural {@link TextNode}.
 *
 * @since 0.0.0
 * @category refinements
 */
export const isTextNode: (node: AnnotatedNode) => node is TextNode = S.is(TextNode);

/**
 * Type guard: the node is a {@link POSNode}.
 *
 * @since 0.0.0
 * @category refinements
 */
export const isPOSNode: (node: AnnotatedNode) => node is POSNode = S.is(POSNode);

/**
 * Type guard: the node is an {@link EntityNode}.
 *
 * @since 0.0.0
 * @category refinements
 */
export const isEntityNode: (node: AnnotatedNode) => node is EntityNode = S.is(EntityNode);

/**
 * Type guard: the node is a {@link LemmaNode}.
 *
 * @since 0.0.0
 * @category refinements
 */
export const isLemmaNode: (node: AnnotatedNode) => node is LemmaNode = S.is(LemmaNode);

/**
 * Type guard: the node is a {@link DependencyNode}.
 *
 * @since 0.0.0
 * @category refinements
 */
export const isDependencyNode: (node: AnnotatedNode) => node is DependencyNode = S.is(DependencyNode);

/**
 * Type guard: the node is a {@link RelationNode}.
 *
 * @since 0.0.0
 * @category refinements
 */
export const isRelationNode: (node: AnnotatedNode) => node is RelationNode = S.is(RelationNode);

// =============================================================================
// Annotated Graph Types
// =============================================================================

/**
 * A directed text graph whose nodes may be structural or annotation nodes.
 *
 * @since 0.0.0
 * @category models
 */
export type AnnotatedTextGraph = Graph.DirectedGraph<AnnotatedNode, TextEdge>;

/**
 * Mutable annotated text graph used during construction.
 *
 * @since 0.0.0
 * @category models
 */
export type MutableAnnotatedTextGraph = Graph.MutableDirectedGraph<AnnotatedNode, TextEdge>;

const makeTextNode = (fields: {
  readonly text: string;
  readonly type: TextNode["type"];
  readonly operation?: string;
}): Effect.Effect<TextNode> =>
  Effect.map(Clock.currentTimeMillis, (timestamp) =>
    TextNode.make({
      text: fields.text,
      type: fields.type,
      timestamp,
      ...OptionUtils.getSomesStruct({ operation: O.fromUndefinedOr(fields.operation) }),
    })
  );

// =============================================================================
// Constructors
// =============================================================================

/**
 * Create an empty annotated text graph.
 *
 * @example
 * ```ts
 * import { empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(empty())
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const empty = (): AnnotatedTextGraph => Graph.directed<AnnotatedNode, TextEdge>();

/**
 * Options controlling which annotation strata {@link fromDocumentAnnotated} adds.
 *
 * @since 0.0.0
 * @category models
 */
export interface AnnotationOptions {
  /** Add syntactic-dependency annotations (default `false`; expensive). */
  readonly includeDependencies?: boolean;
  /** Add named-entity annotations (default `true`). */
  readonly includeEntities?: boolean;
  /** Add lemma annotations (default `true`). */
  readonly includeLemmas?: boolean;
  /** Add part-of-speech annotations (default `true`). */
  readonly includePOS?: boolean;
}

const defaultAnnotationOptions: Required<AnnotationOptions> = {
  includePOS: true,
  includeLemmas: true,
  includeEntities: true,
  includeDependencies: false,
};

/**
 * Build a fully annotated text graph from a document.
 *
 * Produces a document root, sentence children, and (per `options`) POS, lemma,
 * entity, and dependency annotation nodes linked to their sentences.
 *
 * @since 0.0.0
 * @category constructors
 */
export const fromDocumentAnnotated = Effect.fn("fromDocumentAnnotated")(function* (
  text: string,
  options: AnnotationOptions = defaultAnnotationOptions
): Effect.fn.Return<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend> {
  const backend = yield* Backend.NLPBackend;
  const resolved = { ...defaultAnnotationOptions, ...options };

  const sentences = yield* backend.sentencize(text);
  const docNode = yield* makeTextNode({
    text,
    type: "document",
    operation: "root",
  });
  const sentenceNodes = yield* Effect.forEach(sentences, (sentence) =>
    makeTextNode({ text: sentence, type: "sentence", operation: "sentencize" })
  );

  let graph: AnnotatedTextGraph = Graph.directed<AnnotatedNode, TextEdge>((mutable) => {
    const docIndex = Graph.addNode(mutable, docNode);
    A.forEach(sentenceNodes, (sentenceNode) => {
      const sentenceIndex = Graph.addNode(mutable, sentenceNode);
      Graph.addEdge(mutable, docIndex, sentenceIndex, TextEdge.make({ relation: "contains" }));
    });
  });

  if (resolved.includePOS) {
    graph = yield* addPOSAnnotations(graph);
  }
  if (resolved.includeLemmas) {
    graph = yield* addLemmaAnnotations(graph);
  }
  if (resolved.includeEntities) {
    graph = yield* addEntityAnnotations(graph);
  }
  if (resolved.includeDependencies) {
    graph = yield* addDependencyAnnotations(graph);
  }

  return graph;
});

// =============================================================================
// Annotation passes
// =============================================================================

const sentenceIndices = (graph: AnnotatedTextGraph): ReadonlyArray<Graph.NodeIndex> =>
  Graph.findNodes(graph, (node) => isTextNode(node) && node.type === "sentence");

const childrenHave = (
  graph: AnnotatedTextGraph,
  nodeIndex: Graph.NodeIndex,
  predicate: (node: AnnotatedNode) => boolean
): boolean =>
  A.some(Graph.neighbors(graph, nodeIndex), (childIdx) =>
    O.match(Graph.getNode(graph, childIdx), {
      onNone: () => false,
      onSome: predicate,
    })
  );

interface SentenceAnnotationConfig<N extends AnnotatedNode> {
  readonly collect: (
    backend: Backend.NLPBackendShape,
    text: string
  ) => Effect.Effect<ReadonlyArray<N>, Backend.NLPBackendError>;
  readonly graph: AnnotatedTextGraph;
  readonly hasAnnotation: (node: AnnotatedNode) => node is N;
  readonly relation: TextEdge["relation"];
}

const addSentenceAnnotations = Effect.fn("AnnotatedTextGraph.addSentenceAnnotations")(function* <
  N extends AnnotatedNode,
>({
  collect,
  graph,
  hasAnnotation,
  relation,
}: SentenceAnnotationConfig<N>): Effect.fn.Return<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend> {
  const backend = yield* Backend.NLPBackend;
  let result = graph;

  for (const sentIdx of sentenceIndices(graph)) {
    const sentNode = Graph.getNode(graph, sentIdx);
    if (O.isNone(sentNode) || !isTextNode(sentNode.value)) continue;
    if (childrenHave(result, sentIdx, hasAnnotation)) continue;

    const annotationNodes = yield* collect(backend, sentNode.value.text);
    result = Graph.mutate(result, (mutable) => {
      A.forEach(annotationNodes, (annotationNode) => {
        const annotationIdx = Graph.addNode(mutable, annotationNode);
        Graph.addEdge(mutable, sentIdx, annotationIdx, TextEdge.make({ relation }));
      });
    });
  }

  return result;
});

/**
 * Add part-of-speech annotation nodes to each sentence (idempotent).
 *
 * @since 0.0.0
 * @category annotations
 */
export const addPOSAnnotations = (
  graph: AnnotatedTextGraph
): Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend> =>
  addSentenceAnnotations({
    collect: (backend, text) => backend.posTag(text),
    graph,
    hasAnnotation: isPOSNode,
    relation: "contains",
  });

/**
 * Add lemma annotation nodes to each sentence (idempotent).
 *
 * @since 0.0.0
 * @category annotations
 */
export const addLemmaAnnotations = (
  graph: AnnotatedTextGraph
): Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend> =>
  addSentenceAnnotations({
    collect: (backend, text) => backend.lemmatize(text),
    graph,
    hasAnnotation: isLemmaNode,
    relation: "contains",
  });

/**
 * Add named-entity annotation nodes to each sentence (idempotent).
 *
 * @since 0.0.0
 * @category annotations
 */
export const addEntityAnnotations = (
  graph: AnnotatedTextGraph
): Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend> =>
  addSentenceAnnotations({
    collect: (backend, text) => backend.extractEntities(text),
    graph,
    hasAnnotation: isEntityNode,
    relation: "entity-mention",
  });

/**
 * Add syntactic-dependency annotation nodes to each sentence (idempotent).
 *
 * @since 0.0.0
 * @category annotations
 */
export const addDependencyAnnotations = (
  graph: AnnotatedTextGraph
): Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend> =>
  addSentenceAnnotations({
    collect: (backend, text) => backend.parseDependencies(text),
    graph,
    hasAnnotation: isDependencyNode,
    relation: "head-of",
  });

// =============================================================================
// Query Functions
// =============================================================================

const entriesWhere = <K extends AnnotatedNode>(
  graph: AnnotatedTextGraph,
  refine: (node: AnnotatedNode) => node is K
): ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: K }> =>
  A.getSomes(
    A.map(A.fromIterable(graph.pipe(Graph.nodes, Graph.entries)), ([index, node]) =>
      refine(node) ? O.some({ index, node }) : O.none()
    )
  );

/**
 * All POS-annotation nodes with their indices.
 *
 * @since 0.0.0
 * @category getters
 */
export const getPOSNodes = (
  graph: AnnotatedTextGraph
): ReadonlyArray<{
  readonly index: Graph.NodeIndex;
  readonly node: POSNode;
}> => entriesWhere(graph, isPOSNode);

/**
 * All entity-annotation nodes with their indices.
 *
 * @since 0.0.0
 * @category getters
 */
export const getEntityNodes = (
  graph: AnnotatedTextGraph
): ReadonlyArray<{
  readonly index: Graph.NodeIndex;
  readonly node: EntityNode;
}> => entriesWhere(graph, isEntityNode);

/**
 * All lemma-annotation nodes with their indices.
 *
 * @since 0.0.0
 * @category getters
 */
export const getLemmaNodes = (
  graph: AnnotatedTextGraph
): ReadonlyArray<{
  readonly index: Graph.NodeIndex;
  readonly node: LemmaNode;
}> => entriesWhere(graph, isLemmaNode);

/**
 * All structural text nodes with their indices.
 *
 * @since 0.0.0
 * @category getters
 */
export const getTextNodes = (
  graph: AnnotatedTextGraph
): ReadonlyArray<{
  readonly index: Graph.NodeIndex;
  readonly node: TextNode;
}> => entriesWhere(graph, isTextNode);

/**
 * Entities of a given type.
 *
 * @since 0.0.0
 * @category getters
 */
export const filterEntitiesByType = (graph: AnnotatedTextGraph, entityType: string): ReadonlyArray<EntityNode> =>
  A.map(
    A.filter(getEntityNodes(graph), (item) => item.node.entityType === entityType),
    (item) => item.node
  );

/**
 * POS nodes carrying a given tag.
 *
 * @since 0.0.0
 * @category getters
 */
export const filterByPOSTag = (graph: AnnotatedTextGraph, tag: string): ReadonlyArray<POSNode> =>
  A.map(
    A.filter(getPOSNodes(graph), (item) => item.node.tag === tag),
    (item) => item.node
  );

/**
 * Count of nodes by kind (`text`/`pos`/`entity`/`lemma`/`dependency`/`relation`).
 *
 * @since 0.0.0
 * @category getters
 */
export const countNodesByType = (graph: AnnotatedTextGraph): Record<string, number> =>
  A.reduce(
    A.fromIterable(graph.pipe(Graph.nodes, Graph.values)),
    { text: 0, pos: 0, entity: 0, lemma: 0, dependency: 0, relation: 0 },
    (counts, node) => {
      if (isTextNode(node)) return { ...counts, text: counts.text + 1 };
      if (isPOSNode(node)) return { ...counts, pos: counts.pos + 1 };
      if (isEntityNode(node)) return { ...counts, entity: counts.entity + 1 };
      if (isLemmaNode(node)) return { ...counts, lemma: counts.lemma + 1 };
      if (isDependencyNode(node))
        return {
          ...counts,
          dependency: counts.dependency + 1,
        };
      return { ...counts, relation: counts.relation + 1 };
    }
  );

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * All nodes as an array.
 *
 * @since 0.0.0
 * @category getters
 */
export const toArray = (graph: AnnotatedTextGraph): ReadonlyArray<AnnotatedNode> =>
  A.fromIterable(graph.pipe(Graph.nodes, Graph.values));

/**
 * Total node count.
 *
 * @since 0.0.0
 * @category getters
 */
export const nodeCount = (graph: AnnotatedTextGraph): number => Graph.nodeCount(graph);

/**
 * Root node indices (no incoming edges).
 *
 * @since 0.0.0
 * @category getters
 */
export const getRoots = (graph: AnnotatedTextGraph): ReadonlyArray<Graph.NodeIndex> =>
  A.fromIterable(Graph.indices(Graph.externals(graph, { direction: "incoming" })));
