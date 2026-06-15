---
title: AnnotatedTextGraph.ts
nav_order: 18
parent: "@beep/nlp"
---

## AnnotatedTextGraph.ts overview

AnnotatedTextGraph - text graphs enriched with linguistic-annotation nodes.

Extends the structural text graph with annotation strata produced by an
`Backend.NLPBackend`: `POSNode` (part-of-speech),
`EntityNode` (named entities), `LemmaNode` (lemmas),
`DependencyNode` (syntactic dependencies), and
`RelationNode` (semantic relations). Categorically this is a
richer category whose objects include both structural and annotation nodes.

Effect v4 `@beep/nlp` implementation notes:
- the heterogeneous node union is discriminated by schema-aware `S.is` guards
  over the plain `Schema.Class` node types.
- document/sentence `TextNode`s are built EFFECTFULLY, reading `Clock` for the
  timestamp (was `Date.now()`); annotation nodes arrive pre-built from the
  backend.
- native `Array.from`/`forEach`/`Object.keys`/`Array#push` become `effect/Array`
  (`A.*`), and `getNode`'s `Option` is consumed with `effect/Option`.
- `addDependencyAnnotations` is implemented and wired to
  `backend.parseDependencies`; it stays off by default in
  `fromDocumentAnnotated`.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [empty](#empty)
  - [fromDocumentAnnotated](#fromdocumentannotated)
- [getters](#getters)
  - [countNodesByType](#countnodesbytype)
  - [filterByPOSTag](#filterbypostag)
  - [filterEntitiesByType](#filterentitiesbytype)
  - [getEntityNodes](#getentitynodes)
  - [getLemmaNodes](#getlemmanodes)
  - [getPOSNodes](#getposnodes)
  - [getRoots](#getroots)
  - [getTextNodes](#gettextnodes)
  - [nodeCount](#nodecount)
  - [toArray](#toarray)
- [mapping](#mapping)
  - [addDependencyAnnotations](#adddependencyannotations)
  - [addEntityAnnotations](#addentityannotations)
  - [addLemmaAnnotations](#addlemmaannotations)
  - [addPOSAnnotations](#addposannotations)
- [models](#models)
  - [AnnotatedNode (type alias)](#annotatednode-type-alias)
  - [AnnotatedTextGraph (type alias)](#annotatedtextgraph-type-alias)
  - [MutableAnnotatedTextGraph (type alias)](#mutableannotatedtextgraph-type-alias)
- [refinements](#refinements)
  - [isDependencyNode](#isdependencynode)
  - [isEntityNode](#isentitynode)
  - [isLemmaNode](#islemmanode)
  - [isPOSNode](#isposnode)
  - [isRelationNode](#isrelationnode)
  - [isTextNode](#istextnode)
---

# constructors

## empty

Create an empty annotated graph.

**Example**

```ts
import { empty, nodeCount } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(nodeCount(empty())) // 0
```

**Signature**

```ts
declare const empty: () => AnnotatedTextGraph
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L256)

Since v0.0.0

## fromDocumentAnnotated

Build a fully annotated text graph from a document.

Produces a document root, sentence children, and (per `options`) POS, lemma,
entity, and dependency annotation nodes linked to their sentences.

**Example**

```ts
import { Effect } from "effect"
import { NLPBackend } from "@beep/nlp/Backend/NLPBackend"
import { fromDocumentAnnotated } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { nodeCount } from "@beep/nlp/Graph/AnnotatedTextGraph"

const graph = Effect.runSync(
  Effect.provideService(fromDocumentAnnotated("Acme acquired Beta."), NLPBackend, {
    name: "minimal",
    capabilities: {
      constituencyParsing: false,
      coreferenceResolution: false,
      dependencyParsing: false,
      lemmatization: false,
      ner: false,
      posTagging: false,
      relationExtraction: false,
      sentencization: true,
      tokenization: false
    },
    sentencize: () => Effect.succeed(["Acme acquired Beta."]),
    posTag: () => Effect.succeed([]),
    lemmatize: () => Effect.succeed([]),
    extractEntities: () => Effect.succeed([]),
    parseDependencies: () => Effect.succeed([]),
    extractRelations: () => Effect.succeed([]),
    tokenize: () => Effect.succeed([])
  })
)

console.log(nodeCount(graph)) // 2
```

**Signature**

```ts
declare const fromDocumentAnnotated: (text: string, options?: AnnotationOptions | undefined) => Effect.Effect<AnnotatedTextGraph, Backend.BackendNotSupported | Backend.BackendInitError | Backend.BackendOperationError, Backend.NLPBackend>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L332)

Since v0.0.0

# getters

## countNodesByType

Count of nodes by kind (`text`/`pos`/`entity`/`lemma`/`dependency`/`relation`).

**Example**

```ts
import { countNodesByType, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(countNodesByType(empty()).entity) // 0
```

**Signature**

```ts
declare const countNodesByType: (graph: AnnotatedTextGraph) => Record<string, number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L745)

Since v0.0.0

## filterByPOSTag

Return POS annotation nodes carrying a specific tag.

**Example**

```ts
import { empty, filterByPOSTag } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(filterByPOSTag(empty(), "NNP").length) // 0
```

**Signature**

```ts
declare const filterByPOSTag: { (graph: AnnotatedTextGraph, tag: string): ReadonlyArray<POSNode>; (tag: string): (graph: AnnotatedTextGraph) => ReadonlyArray<POSNode>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L720)

Since v0.0.0

## filterEntitiesByType

Return entity nodes whose `entityType` matches the requested label.

**Example**

```ts
import { empty, filterEntitiesByType } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(filterEntitiesByType(empty(), "ORG").length) // 0
```

**Signature**

```ts
declare const filterEntitiesByType: { (graph: AnnotatedTextGraph, entityType: string): ReadonlyArray<EntityNode>; (entityType: string): (graph: AnnotatedTextGraph) => ReadonlyArray<EntityNode>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L695)

Since v0.0.0

## getEntityNodes

Return entity annotation nodes together with their graph indices.

**Example**

```ts
import { empty, getEntityNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(getEntityNodes(empty()).length) // 0
```

**Signature**

```ts
declare const getEntityNodes: (graph: AnnotatedTextGraph) => ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: EntityNode; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L635)

Since v0.0.0

## getLemmaNodes

Return lemma annotation nodes together with their graph indices.

**Example**

```ts
import { empty, getLemmaNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(getLemmaNodes(empty()).length) // 0
```

**Signature**

```ts
declare const getLemmaNodes: (graph: AnnotatedTextGraph) => ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: LemmaNode; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L655)

Since v0.0.0

## getPOSNodes

Return POS annotation nodes together with their graph indices.

**Example**

```ts
import { empty, getPOSNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(getPOSNodes(empty()).length) // 0
```

**Signature**

```ts
declare const getPOSNodes: (graph: AnnotatedTextGraph) => ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: POSNode; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L615)

Since v0.0.0

## getRoots

Return root node indices with no incoming edges.

**Example**

```ts
import { empty, getRoots } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(getRoots(empty()).length) // 0
```

**Signature**

```ts
declare const getRoots: (graph: AnnotatedTextGraph) => ReadonlyArray<Graph.NodeIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L811)

Since v0.0.0

## getTextNodes

Return structural text nodes together with their graph indices.

**Example**

```ts
import { empty, getTextNodes } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(getTextNodes(empty()).length) // 0
```

**Signature**

```ts
declare const getTextNodes: (graph: AnnotatedTextGraph) => ReadonlyArray<{ readonly index: Graph.NodeIndex; readonly node: TextNode; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L675)

Since v0.0.0

## nodeCount

Count all structural and annotation nodes.

**Example**

```ts
import { empty, nodeCount } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(nodeCount(empty())) // 0
```

**Signature**

```ts
declare const nodeCount: (graph: AnnotatedTextGraph) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L796)

Since v0.0.0

## toArray

Collect all structural and annotation nodes in backing graph order.

**Example**

```ts
import { empty, toArray } from "@beep/nlp/Graph/AnnotatedTextGraph"

console.log(toArray(empty()).length) // 0
```

**Signature**

```ts
declare const toArray: (graph: AnnotatedTextGraph) => ReadonlyArray<AnnotatedNode>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L780)

Since v0.0.0

# mapping

## addDependencyAnnotations

Add syntactic-dependency annotation nodes to each sentence node.

**Example**

```ts
import { addDependencyAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"

const program = addDependencyAnnotations(empty())
console.log(program)
```

**Signature**

```ts
declare const addDependencyAnnotations: (graph: AnnotatedTextGraph) => Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L567)

Since v0.0.0

## addEntityAnnotations

Add named-entity annotation nodes to each sentence node.

**Example**

```ts
import { addEntityAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"

const program = addEntityAnnotations(empty())
console.log(program)
```

**Signature**

```ts
declare const addEntityAnnotations: (graph: AnnotatedTextGraph) => Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L539)

Since v0.0.0

## addLemmaAnnotations

Add lemma annotation children to each sentence node.

**Example**

```ts
import { addLemmaAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"

const program = addLemmaAnnotations(empty())
console.log(program)
```

**Signature**

```ts
declare const addLemmaAnnotations: (graph: AnnotatedTextGraph) => Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L515)

Since v0.0.0

## addPOSAnnotations

Add POS annotation children to each sentence node.

**Example**

```ts
import { addPOSAnnotations, empty } from "@beep/nlp/Graph/AnnotatedTextGraph"

const program = addPOSAnnotations(empty())
console.log(program)
```

**Signature**

```ts
declare const addPOSAnnotations: (graph: AnnotatedTextGraph) => Effect.Effect<AnnotatedTextGraph, Backend.NLPBackendError, Backend.NLPBackend>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L491)

Since v0.0.0

# models

## AnnotatedNode (type alias)

Union of all node types (structural + linguistic annotations).

**Example**

```ts
import { TextNode } from "@beep/nlp/Graph/Schema"
import type { AnnotatedNode } from "@beep/nlp/Graph/AnnotatedTextGraph"

const node: AnnotatedNode = TextNode.make({
  text: "Hello.",
  type: "sentence",
  timestamp: 0
})

console.log(node.type) // "sentence"
```

**Signature**

```ts
type AnnotatedNode = TextNode | POSNode | EntityNode | LemmaNode | DependencyNode | RelationNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L63)

Since v0.0.0

## AnnotatedTextGraph (type alias)

A directed text graph whose nodes may be structural or annotation nodes.

**Example**

```ts
import { empty, nodeCount, type AnnotatedTextGraph } from "@beep/nlp/Graph/AnnotatedTextGraph"

const graph: AnnotatedTextGraph = empty()
console.log(nodeCount(graph)) // 0
```

**Signature**

```ts
type AnnotatedTextGraph = Graph.DirectedGraph<AnnotatedNode, TextEdge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L207)

Since v0.0.0

## MutableAnnotatedTextGraph (type alias)

Mutable annotated graph used inside construction callbacks.

**Example**

```ts
import type { MutableAnnotatedTextGraph } from "@beep/nlp/Graph/AnnotatedTextGraph"

const acceptsMutable = (graph: MutableAnnotatedTextGraph) => graph
console.log(acceptsMutable)
```

**Signature**

```ts
type MutableAnnotatedTextGraph = Graph.MutableDirectedGraph<AnnotatedNode, TextEdge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L223)

Since v0.0.0

# refinements

## isDependencyNode

Refine a heterogeneous annotated node to a dependency node.

**Example**

```ts
import { isDependencyNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { DependencyNode } from "@beep/nlp/Graph/Schema"

const node = DependencyNode.make({
  relation: "root",
  head: { text: "runs", position: 0 },
  dependent: { text: "runs", position: 0 },
  distance: 0,
  timestamp: 0
})

console.log(isDependencyNode(node)) // true
```

**Signature**

```ts
declare const isDependencyNode: (node: AnnotatedNode) => node is DependencyNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L164)

Since v0.0.0

## isEntityNode

Refine a heterogeneous annotated node to a named-entity node.

**Example**

```ts
import { isEntityNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { EntityNode } from "@beep/nlp/Graph/Schema"

const node = EntityNode.make({
  text: "Acme",
  entityType: "ORG",
  span: { start: 0, end: 4 },
  timestamp: 0
})

console.log(isEntityNode(node)) // true
```

**Signature**

```ts
declare const isEntityNode: (node: AnnotatedNode) => node is EntityNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L124)

Since v0.0.0

## isLemmaNode

Refine a heterogeneous annotated node to a lemma node.

**Example**

```ts
import { isLemmaNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { LemmaNode } from "@beep/nlp/Graph/Schema"

const node = LemmaNode.make({ token: "running", lemma: "run", position: 0, timestamp: 0 })
console.log(isLemmaNode(node)) // true
```

**Signature**

```ts
declare const isLemmaNode: (node: AnnotatedNode) => node is LemmaNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L140)

Since v0.0.0

## isPOSNode

Refine a heterogeneous annotated node to a POS annotation node.

**Example**

```ts
import { isPOSNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { POSNode } from "@beep/nlp/Graph/Schema"

const node = POSNode.make({ text: "runs", tag: "VBZ", position: 0, timestamp: 0 })
console.log(isPOSNode(node)) // true
```

**Signature**

```ts
declare const isPOSNode: (node: AnnotatedNode) => node is POSNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L100)

Since v0.0.0

## isRelationNode

Refine a heterogeneous annotated node to a semantic-relation node.

**Example**

```ts
import { isRelationNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { RelationNode } from "@beep/nlp/Graph/Schema"

const node = RelationNode.make({
  relationType: "acquired",
  subject: { text: "Acme", entityType: "ORG", span: { start: 0, end: 4 } },
  object: { text: "Beta", entityType: "ORG", span: { start: 14, end: 18 } },
  timestamp: 0
})

console.log(isRelationNode(node)) // true
```

**Signature**

```ts
declare const isRelationNode: (node: AnnotatedNode) => node is RelationNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L187)

Since v0.0.0

## isTextNode

Refine a heterogeneous annotated node to a structural text node.

**Example**

```ts
import { isTextNode } from "@beep/nlp/Graph/AnnotatedTextGraph"
import { TextNode } from "@beep/nlp/Graph/Schema"

const node = TextNode.make({ text: "Hello.", type: "sentence", timestamp: 0 })
console.log(isTextNode(node)) // true
```

**Signature**

```ts
declare const isTextNode: (node: AnnotatedNode) => node is TextNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/AnnotatedTextGraph.ts#L82)

Since v0.0.0