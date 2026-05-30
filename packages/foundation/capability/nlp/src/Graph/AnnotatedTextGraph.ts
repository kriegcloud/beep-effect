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

import { $NlpId } from "@beep/identity";
import { SchemaUtils } from "@beep/schema";
import { A, dual, O as OptionUtils, P } from "@beep/utils";
import { Clock, Effect, Graph } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Backend from "../Backend/NLPBackend.ts";
import { DependencyNode, EntityNode, LemmaNode, POSNode, RelationNode, TextEdge, TextNode } from "./Schema.ts";

const $I = $NlpId.create("Graph/AnnotatedTextGraph");

// =============================================================================
// Annotated Node Types
// =============================================================================

/**
 * Union of all node types (structural + linguistic annotations).
 *
 * @example
 * ```ts
 * import { TextNode } from "@beep/nlp/Graph/Schema"
 * import type { AnnotatedNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const node: AnnotatedNode = TextNode.make({
 *   text: "Hello.",
 *   type: "sentence",
 *   timestamp: 0
 * })
 *
 * console.log(node.type) // "sentence"
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type AnnotatedNode = TextNode | POSNode | EntityNode | LemmaNode | DependencyNode | RelationNode;

/**
 * Refine a heterogeneous annotated node to a structural text node.
 *
 * @example
 * ```ts
 * import { isTextNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
 * import { TextNode } from "@beep/nlp/Graph/Schema"
 *
 * const node = TextNode.make({ text: "Hello.", type: "sentence", timestamp: 0 })
 * console.log(isTextNode(node)) // true
 * ```
 *
 * @param node - The annotated node to refine.
 * @returns True if the node is a TextNode, false otherwise.
 * @since 0.0.0
 * @category refinements
 */
export const isTextNode: (node: AnnotatedNode) => node is TextNode = S.is(TextNode);

/**
 * Refine a heterogeneous annotated node to a POS annotation node.
 *
 * @example
 * ```ts
 * import { isPOSNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
 * import { POSNode } from "@beep/nlp/Graph/Schema"
 *
 * const node = POSNode.make({ text: "runs", tag: "VBZ", position: 0, timestamp: 0 })
 * console.log(isPOSNode(node)) // true
 * ```
 * @param node - The annotated node to refine.
 * @returns True if the node is a POSNode, false otherwise.
 * @since 0.0.0
 * @category refinements
 */
export const isPOSNode: (node: AnnotatedNode) => node is POSNode = S.is(POSNode);

/**
 * Refine a heterogeneous annotated node to a named-entity node.
 *
 * @example
 * ```ts
 * import { isEntityNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
 * import { EntityNode } from "@beep/nlp/Graph/Schema"
 *
 * const node = EntityNode.make({
 *   text: "Acme",
 *   entityType: "ORG",
 *   span: { start: 0, end: 4 },
 *   timestamp: 0
 * })
 *
 * console.log(isEntityNode(node)) // true
 * ```
 * @param node - The annotated node to refine.
 * @returns True if the node is a EntityNode, false otherwise.
 * @since 0.0.0
 * @category refinements
 */
export const isEntityNode: (node: AnnotatedNode) => node is EntityNode = S.is(EntityNode);

/**
 * Refine a heterogeneous annotated node to a lemma node.
 *
 * @example
 * ```ts
 * import { isLemmaNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
 * import { LemmaNode } from "@beep/nlp/Graph/Schema"
 *
 * const node = LemmaNode.make({ token: "running", lemma: "run", position: 0, timestamp: 0 })
 * console.log(isLemmaNode(node)) // true
 * ```
 * @since 0.0.0
 * @category refinements
 */
export const isLemmaNode: (node: AnnotatedNode) => node is LemmaNode = S.is(LemmaNode);

/**
 * Refine a heterogeneous annotated node to a dependency node.
 *
 * @example
 * ```ts
 * import { isDependencyNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
 * import { DependencyNode } from "@beep/nlp/Graph/Schema"
 *
 * const node = DependencyNode.make({
 *   relation: "root",
 *   head: { text: "runs", position: 0 },
 *   dependent: { text: "runs", position: 0 },
 *   distance: 0,
 *   timestamp: 0
 * })
 *
 * console.log(isDependencyNode(node)) // true
 * ```
 *
 * @since 0.0.0
 * @category refinements
 */
export const isDependencyNode: (node: AnnotatedNode) => node is DependencyNode = S.is(DependencyNode);

/**
 * Refine a heterogeneous annotated node to a semantic-relation node.
 *
 * @example
 * ```ts
 * import { isRelationNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
 * import { RelationNode } from "@beep/nlp/Graph/Schema"
 *
 * const node = RelationNode.make({
 *   relationType: "acquired",
 *   subject: { text: "Acme", entityType: "ORG", span: { start: 0, end: 4 } },
 *   object: { text: "Beta", entityType: "ORG", span: { start: 14, end: 18 } },
 *   timestamp: 0
 * })
 *
 * console.log(isRelationNode(node)) // true
 * ```
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
 * @example
 * ```ts
 * import { empty, nodeCount, type AnnotatedTextGraph } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const graph: AnnotatedTextGraph = empty()
 * console.log(nodeCount(graph)) // 0
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type AnnotatedTextGraph = Graph.DirectedGraph<AnnotatedNode, TextEdge>;

/**
 * Mutable annotated graph used inside construction callbacks.
 *
 * @example
 * ```ts
 * import type { MutableAnnotatedTextGraph } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const acceptsMutable = (graph: MutableAnnotatedTextGraph) => graph
 * console.log(acceptsMutable)
 * ```
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
 * Create an empty annotated graph.
 *
 * @example
 * ```ts
 * import { empty, nodeCount } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(nodeCount(empty())) // 0
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
class AnnotationOptions extends S.Class<AnnotationOptions>($I`AnnotationOptions`)(
  {
    includeDependencies: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(false)).annotateKey({
      description: "Add syntactic-dependency annotations (default `false`; expensive).",
    }),
    includeEntities: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(true)).annotateKey({
      description: "Add named-entity annotations (default `true`).",
    }),
    includeLemmas: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(true)).annotateKey({
      description: "Add lemma annotations (default `true`).",
    }),
    includePOS: S.Boolean.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(true)).annotateKey({
      description: "Add part-of-speech annotations (default `true`).",
    }),
  },
  $I.annote("AnnotationOptions", {
    description: "Options controlling which annotation strata `fromDocumentAnnotated` adds.",
  })
) {}

/**
 * Build a fully annotated text graph from a document.
 *
 * Produces a document root, sentence children, and (per `options`) POS, lemma,
 * entity, and dependency annotation nodes linked to their sentences.
 *
 * @remarks
 * The returned effect requires `NLPBackend`. Dependency parsing is opt-in because
 * it is usually more expensive than POS, lemma, and entity annotation.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { NLPBackend } from "@beep/nlp/Backend/NLPBackend"
 * import { fromDocumentAnnotated } from "@beep/nlp/Graph/AnnotatedTextGraph"
 * import { nodeCount } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const graph = Effect.runSync(
 *   Effect.provideService(fromDocumentAnnotated("Acme acquired Beta."), NLPBackend, {
 *     name: "minimal",
 *     capabilities: {
 *       constituencyParsing: false,
 *       coreferenceResolution: false,
 *       dependencyParsing: false,
 *       lemmatization: false,
 *       ner: false,
 *       posTagging: false,
 *       relationExtraction: false,
 *       sentencization: true,
 *       tokenization: false
 *     },
 *     sentencize: () => Effect.succeed(["Acme acquired Beta."]),
 *     posTag: () => Effect.succeed([]),
 *     lemmatize: () => Effect.succeed([]),
 *     extractEntities: () => Effect.succeed([]),
 *     parseDependencies: () => Effect.succeed([]),
 *     extractRelations: () => Effect.succeed([]),
 *     tokenize: () => Effect.succeed([])
 *   })
 * )
 *
 * console.log(nodeCount(graph)) // 2
 * ```
 *
 * @effects Reads the `NLPBackend` service for sentence and annotation data and reads the Effect `Clock` while creating structural text nodes.
 * @category constructors
 * @since 0.0.0
 */
export const fromDocumentAnnotated = Effect.fn("fromDocumentAnnotated")(function* (
  text: string,
  options: AnnotationOptions = AnnotationOptions.make()
): Effect.fn.Return<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend> {
  const backend = yield* Backend.NLPBackend;
  const resolved = { ...AnnotationOptions.make(), ...options };

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

  if (P.isTruthy(resolved.includePOS)) {
    graph = yield* addPOSAnnotations(graph);
  }
  if (P.isTruthy(resolved.includeLemmas)) {
    graph = yield* addLemmaAnnotations(graph);
  }
  if (P.isTruthy(resolved.includeEntities)) {
    graph = yield* addEntityAnnotations(graph);
  }
  if (P.isTruthy(resolved.includeDependencies)) {
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
 * Add POS annotation children to each sentence node.
 *
 * @remarks
 * Existing POS children make the pass idempotent for that sentence. The effect
 * requires `NLPBackend` and links generated annotations with `contains` edges.
 *
 * @example
 * ```ts
 * import { addPOSAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const program = addPOSAnnotations(empty())
 * console.log(program)
 * ```
 *
 * @since 0.0.0
 * @category mapping
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
 * Add lemma annotation children to each sentence node.
 *
 * @example
 * ```ts
 * import { addLemmaAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const program = addLemmaAnnotations(empty())
 * console.log(program)
 * ```
 *
 * @since 0.0.0
 * @category mapping
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
 * Add named-entity annotation nodes to each sentence node.
 *
 * @example
 * ```ts
 * import { addEntityAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const program = addEntityAnnotations(empty())
 * console.log(program)
 * ```
 *
 * @since 0.0.0
 * @category mapping
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
 * Add syntactic-dependency annotation nodes to each sentence node.
 *
 * @remarks
 * Dependency nodes are linked with `head-of` edges. This pass is separate from
 * the default constructor options because dependency parsing can be expensive.
 *
 * @example
 * ```ts
 * import { addDependencyAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * const program = addDependencyAnnotations(empty())
 * console.log(program)
 * ```
 *
 * @since 0.0.0
 * @category mapping
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

const entriesWhere: {
  <K extends AnnotatedNode>(
    graph: AnnotatedTextGraph,
    refine: (node: AnnotatedNode) => node is K
  ): ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: K }>;
  <K extends AnnotatedNode>(
    refine: (node: AnnotatedNode) => node is K
  ): (graph: AnnotatedTextGraph) => ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: K }>;
} = dual(
  2,
  <K extends AnnotatedNode>(
    graph: AnnotatedTextGraph,
    refine: (node: AnnotatedNode) => node is K
  ): ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: K }> =>
    A.getSomes(
      A.map(A.fromIterable(graph.pipe(Graph.nodes, Graph.entries)), ([index, node]) =>
        refine(node) ? O.some({ index, node }) : O.none()
      )
    )
);

/**
 * Return POS annotation nodes together with their graph indices.
 *
 * @example
 * ```ts
 * import { empty, getPOSNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(getPOSNodes(empty()).length) // 0
 * ```
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
 * Return entity annotation nodes together with their graph indices.
 *
 * @example
 * ```ts
 * import { empty, getEntityNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(getEntityNodes(empty()).length) // 0
 * ```
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
 * Return lemma annotation nodes together with their graph indices.
 *
 * @example
 * ```ts
 * import { empty, getLemmaNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(getLemmaNodes(empty()).length) // 0
 * ```
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
 * Return structural text nodes together with their graph indices.
 *
 * @example
 * ```ts
 * import { empty, getTextNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(getTextNodes(empty()).length) // 0
 * ```
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
 * Return entity nodes whose `entityType` matches the requested label.
 *
 * @example
 * ```ts
 * import { empty, filterEntitiesByType } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(filterEntitiesByType(empty(), "ORG").length) // 0
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const filterEntitiesByType: {
  (graph: AnnotatedTextGraph, entityType: string): ReadonlyArray<EntityNode>;
  (entityType: string): (graph: AnnotatedTextGraph) => ReadonlyArray<EntityNode>;
} = dual(
  2,
  (graph: AnnotatedTextGraph, entityType: string): ReadonlyArray<EntityNode> =>
    A.map(
      A.filter(getEntityNodes(graph), (item) => item.node.entityType === entityType),
      (item) => item.node
    )
);

/**
 * Return POS annotation nodes carrying a specific tag.
 *
 * @example
 * ```ts
 * import { empty, filterByPOSTag } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(filterByPOSTag(empty(), "NNP").length) // 0
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const filterByPOSTag: {
  (graph: AnnotatedTextGraph, tag: string): ReadonlyArray<POSNode>;
  (tag: string): (graph: AnnotatedTextGraph) => ReadonlyArray<POSNode>;
} = dual(
  2,
  (graph: AnnotatedTextGraph, tag: string): ReadonlyArray<POSNode> =>
    A.map(
      A.filter(getPOSNodes(graph), (item) => item.node.tag === tag),
      (item) => item.node
    )
);

/**
 * Count of nodes by kind (`text`/`pos`/`entity`/`lemma`/`dependency`/`relation`).
 *
 * @example
 * ```ts
 * import { countNodesByType, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(countNodesByType(empty()).entity) // 0
 * ```
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
 * Collect all structural and annotation nodes in backing graph order.
 *
 * @example
 * ```ts
 * import { empty, toArray } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(toArray(empty()).length) // 0
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const toArray = (graph: AnnotatedTextGraph): ReadonlyArray<AnnotatedNode> =>
  A.fromIterable(graph.pipe(Graph.nodes, Graph.values));

/**
 * Count all structural and annotation nodes.
 *
 * @example
 * ```ts
 * import { empty, nodeCount } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(nodeCount(empty())) // 0
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const nodeCount = (graph: AnnotatedTextGraph): number => Graph.nodeCount(graph);

/**
 * Return root node indices with no incoming edges.
 *
 * @example
 * ```ts
 * import { empty, getRoots } from "@beep/nlp/Graph/AnnotatedTextGraph"
 *
 * console.log(getRoots(empty()).length) // 0
 * ```
 *
 * @since 0.0.0
 * @category getters
 */
export const getRoots = (graph: AnnotatedTextGraph): ReadonlyArray<Graph.NodeIndex> =>
  A.fromIterable(Graph.indices(Graph.externals(graph, { direction: "incoming" })));
