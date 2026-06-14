---
title: TextGraph.ts
nav_order: 30
parent: "@beep/nlp"
---

## TextGraph.ts overview

TextGraph - text processing over Effect's in-core `effect/Graph`.

Builds and manipulates directed graphs of `TextNode` data linked by
`TextEdge` relationships, integrating with the package's
`Tokenization` service for sentence/token extraction.

Effect v4 `@beep/nlp` implementation notes:
- node-creating constructors (`singleton`/`fromDocument`/`tokenizeNodes`) are
  EFFECTFUL, reading `Clock` for the node timestamp (was `Date.now()`).
- `fromDocument`/`tokenizeNodes` consume the existing `Core/Tokenization` service
  (mapping `Sentence.text` / `Token.text`).
- `addChildren` fails with a tagged `GraphCycleError` instead of `throw`.
- native `Array.from`/`forEach` become `effect/Array`; the `@effect/printer`
  formatter is dropped (`show` renders plain text).

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [addChildren](#addchildren)
  - [tokenizeNodes](#tokenizenodes)
- [constructors](#constructors)
  - [empty](#empty)
  - [fromDocument](#fromdocument)
  - [singleton](#singleton)
- [errors](#errors)
  - [GraphCycleError (class)](#graphcycleerror-class)
- [filtering](#filtering)
  - [filterNodes](#filternodes)
- [formatting](#formatting)
  - [show](#show)
  - [toGraphViz](#tographviz)
  - [toMermaid](#tomermaid)
- [getters](#getters)
  - [edgeCount](#edgecount)
  - [findNodesByType](#findnodesbytype)
  - [getChildren](#getchildren)
  - [getLeaves](#getleaves)
  - [getRoots](#getroots)
  - [nodeCount](#nodecount)
  - [toArray](#toarray)
- [mapping](#mapping)
  - [mapNodes](#mapnodes)
- [models](#models)
  - [MutableTextGraph (type alias)](#mutabletextgraph-type-alias)
  - [TextGraph (type alias)](#textgraph-type-alias)
- [sequencing](#sequencing)
  - [bfs](#bfs)
  - [dfs](#dfs)
  - [topo](#topo)
- [utilities](#utilities)
  - [isAcyclic](#isacyclic)
  - [stronglyConnectedComponents](#stronglyconnectedcomponents)
---

# combinators

## addChildren

Add child nodes under a parent, validating the result stays acyclic.

**Example**

```ts
import { Effect } from "effect"
import { addChildren, getRoots, nodeCount, singleton } from "@beep/nlp/Graph/TextGraph"
import { TextNode } from "@beep/nlp/Graph/Schema"
import * as A from "effect/Array"
import * as O from "effect/Option"

const program = Effect.flatMap(singleton("Hello.", "document"), (graph) =>
  O.match(A.head(getRoots(graph)), {
    onNone: () => Effect.succeed(graph),
    onSome: (root) =>
      addChildren(graph, root, [
        TextNode.make({ text: "Hello.", type: "sentence", timestamp: 0 })
      ], "contains")
  })
)

console.log(nodeCount(Effect.runSync(program))) // 2
```

**Signature**

```ts
declare const addChildren: { (graph: TextGraph, parentIndex: Graph.NodeIndex, children: ReadonlyArray<TextNode>, relation: TextEdge["relation"]): Effect.Effect<TextGraph, GraphCycleError>; (parentIndex: Graph.NodeIndex, children: ReadonlyArray<TextNode>, relation: TextEdge["relation"]): (graph: TextGraph) => Effect.Effect<TextGraph, GraphCycleError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L275)

Since v0.0.0

## tokenizeNodes

Tokenize every sentence node, adding token children (idempotent: skips
sentences that already have token children).

**Example**

```ts
import { Chunk, Effect } from "effect"
import * as O from "effect/Option"
import { Document as NLPDocument, DocumentId } from "@beep/nlp/Core/Document"
import { CharPosition, Token, TokenIndex } from "@beep/nlp/Core/Token"
import { Tokenization } from "@beep/nlp/Core/Tokenization"
import { nodeCount, singleton, tokenizeNodes } from "@beep/nlp/Graph/TextGraph"

const token = (text: string, index: number, start: number, end: number) =>
  Token.make({
    text,
    index: TokenIndex.make(index),
    start: CharPosition.make(start),
    end: CharPosition.make(end),
    pos: O.none(),
    lemma: O.none(),
    stem: O.none(),
    normal: O.none(),
    shape: O.none(),
    prefix: O.none(),
    suffix: O.none(),
    case: O.none(),
    uniqueId: O.none(),
    abbrevFlag: O.none(),
    contractionFlag: O.none(),
    stopWordFlag: O.none(),
    negationFlag: O.none(),
    precedingSpaces: O.none(),
    tags: []
  })

const graph = Effect.runSync(
  Effect.provideService(Effect.flatMap(singleton("Hello world.", "sentence"), tokenizeNodes), Tokenization, {
    tokenize: () => Effect.succeed([token("Hello", 0, 0, 5), token("world", 1, 6, 11)]),
    sentences: () => Effect.succeed([]),
    document: (text) =>
      Effect.succeed(
        NLPDocument.make({
          id: DocumentId.make("doc-example"),
          text,
          tokens: Chunk.empty(),
          sentences: Chunk.empty(),
          sentiment: O.none()
        })
      ),
    tokenCount: () => Effect.succeed(2)
  })
)

console.log(nodeCount(graph)) // 3
```

**Signature**

```ts
declare const tokenizeNodes: (graph: TextGraph) => Effect.Effect<TextGraph, Tok.TokenizationError, Tok.Tokenization>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L371)

Since v0.0.0

# constructors

## empty

Create an empty structural text graph.

**Example**

```ts
import { empty, nodeCount } from "@beep/nlp/Graph/TextGraph"

console.log(nodeCount(empty())) // 0
```

**Signature**

```ts
declare const empty: () => TextGraph
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L121)

Since v0.0.0

## fromDocument

Build a document graph by splitting the root text into sentence children.

**Example**

```ts
import { Chunk, Effect } from "effect"
import * as O from "effect/Option"
import { Document as NLPDocument, DocumentId } from "@beep/nlp/Core/Document"
import { Sentence, SentenceIndex } from "@beep/nlp/Core/Sentence"
import { TokenIndex } from "@beep/nlp/Core/Token"
import { Tokenization } from "@beep/nlp/Core/Tokenization"
import { fromDocument, nodeCount } from "@beep/nlp/Graph/TextGraph"

const sentence = (text: string, index: number) =>
  Sentence.make({
    text,
    index: SentenceIndex.make(index),
    tokens: Chunk.empty(),
    start: TokenIndex.make(0),
    end: TokenIndex.make(0),
    sentiment: O.none(),
    importance: O.none(),
    negationFlag: O.none(),
    markedUpText: O.none()
  })

const graph = Effect.runSync(
  Effect.provideService(fromDocument("One. Two."), Tokenization, {
    sentences: () => Effect.succeed([sentence("One.", 0), sentence("Two.", 1)]),
    tokenize: () => Effect.succeed([]),
    document: (text) =>
      Effect.succeed(
        NLPDocument.make({
          id: DocumentId.make("doc-example"),
          text,
          tokens: Chunk.empty(),
          sentences: Chunk.empty(),
          sentiment: O.none()
        })
      ),
    tokenCount: () => Effect.succeed(0)
  })
)

console.log(nodeCount(graph)) // 3
```

**Signature**

```ts
declare const fromDocument: (text: string) => Effect.Effect<TextGraph, Tok.TokenizationError, Tok.Tokenization>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L207)

Since v0.0.0

## singleton

Create a text graph with one generated root node.

**Example**

```ts
import { Effect } from "effect"
import { nodeCount, singleton } from "@beep/nlp/Graph/TextGraph"

const graph = Effect.runSync(singleton("Hello.", "document"))
console.log(nodeCount(graph)) // 1
```

**Signature**

```ts
declare const singleton: { (text: string, type: TextNode["type"]): Effect.Effect<TextGraph>; (type: TextNode["type"]): (text: string) => Effect.Effect<TextGraph>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L139)

Since v0.0.0

# errors

## GraphCycleError (class)

Raised when adding children would introduce a cycle (graphs must stay acyclic).

**Example**

```ts
import { GraphCycleError } from "@beep/nlp/Graph/TextGraph"

const error = GraphCycleError.make({ parentIndex: 0 })
console.log(error._tag) // "GraphCycleError"
```

**Signature**

```ts
declare class GraphCycleError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L80)

Since v0.0.0

# filtering

## filterNodes

Keep matching text nodes and edges whose endpoints both remain.

**Example**

```ts
import { Effect } from "effect"
import { filterNodes, nodeCount, singleton } from "@beep/nlp/Graph/TextGraph"

const graph = Effect.runSync(singleton("Hello.", "document"))
console.log(nodeCount(filterNodes(graph, (node) => node.type === "document"))) // 1
```

**Signature**

```ts
declare const filterNodes: { (graph: TextGraph, predicate: (node: TextNode) => boolean): TextGraph; (predicate: (node: TextNode) => boolean): (graph: TextGraph) => TextGraph; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L496)

Since v0.0.0

# formatting

## show

Render the graph as an indented tree from roots downward.

**Example**

```ts
import { Effect } from "effect"
import { show, singleton } from "@beep/nlp/Graph/TextGraph"

console.log(show(Effect.runSync(singleton("Hello.", "document")))) // "[node] document: Hello."
```

**Signature**

```ts
declare const show: (graph: TextGraph) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L765)

Since v0.0.0

## toGraphViz

Export the text graph to GraphViz DOT format.

**Example**

```ts
import { empty, toGraphViz } from "@beep/nlp/Graph/TextGraph"

console.log(toGraphViz(empty()).includes("TextProcessingGraph")) // true
```

**Signature**

```ts
declare const toGraphViz: (graph: TextGraph) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L717)

Since v0.0.0

## toMermaid

Export the text graph to a Mermaid diagram.

**Example**

```ts
import { empty, toMermaid } from "@beep/nlp/Graph/TextGraph"

console.log(toMermaid(empty()).includes("graph")) // true
```

**Signature**

```ts
declare const toMermaid: (graph: TextGraph) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L737)

Since v0.0.0

# getters

## edgeCount

Count edges in a text graph.

**Example**

```ts
import { empty, edgeCount } from "@beep/nlp/Graph/TextGraph"

console.log(edgeCount(empty())) // 0
```

**Signature**

```ts
declare const edgeCount: (graph: TextGraph) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L610)

Since v0.0.0

## findNodesByType

Find node indices whose `type` matches a structural text-node kind.

**Example**

```ts
import { Effect } from "effect"
import { findNodesByType, singleton } from "@beep/nlp/Graph/TextGraph"

const graph = Effect.runSync(singleton("Hello.", "document"))
console.log(findNodesByType(graph, "document").length) // 1
```

**Signature**

```ts
declare const findNodesByType: { (graph: TextGraph, type: TextNode["type"]): ReadonlyArray<Graph.NodeIndex>; (type: TextNode["type"]): (graph: TextGraph) => ReadonlyArray<Graph.NodeIndex>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L627)

Since v0.0.0

## getChildren

Return direct child indices for a text node.

**Example**

```ts
import { Effect } from "effect"
import { getChildren, getRoots, singleton } from "@beep/nlp/Graph/TextGraph"
import * as A from "effect/Array"
import * as O from "effect/Option"

const graph = Effect.runSync(singleton("Hello.", "document"))
const childCount = O.match(A.head(getRoots(graph)), {
  onNone: () => 0,
  onSome: (root) => getChildren(graph, root).length
})

console.log(childCount) // 0
```

**Signature**

```ts
declare const getChildren: { (graph: TextGraph, nodeIndex: Graph.NodeIndex): ReadonlyArray<Graph.NodeIndex>; (nodeIndex: Graph.NodeIndex): (graph: TextGraph) => ReadonlyArray<Graph.NodeIndex>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L692)

Since v0.0.0

## getLeaves

Return text-graph leaves, defined as nodes with no outgoing edges.

**Example**

```ts
import { Effect } from "effect"
import { getLeaves, singleton } from "@beep/nlp/Graph/TextGraph"

console.log(getLeaves(Effect.runSync(singleton("Hello.", "document"))).length) // 1
```

**Signature**

```ts
declare const getLeaves: (graph: TextGraph) => ReadonlyArray<Graph.NodeIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L667)

Since v0.0.0

## getRoots

Return text-graph roots, defined as nodes with no incoming edges.

**Example**

```ts
import { Effect } from "effect"
import { getRoots, singleton } from "@beep/nlp/Graph/TextGraph"

console.log(getRoots(Effect.runSync(singleton("Hello.", "document"))).length) // 1
```

**Signature**

```ts
declare const getRoots: (graph: TextGraph) => ReadonlyArray<Graph.NodeIndex>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L650)

Since v0.0.0

## nodeCount

Count nodes in a text graph.

**Example**

```ts
import { empty, nodeCount } from "@beep/nlp/Graph/TextGraph"

console.log(nodeCount(empty())) // 0
```

**Signature**

```ts
declare const nodeCount: (graph: TextGraph) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L595)

Since v0.0.0

## toArray

Collect all text nodes in backing graph order.

**Example**

```ts
import { Effect } from "effect"
import { singleton, toArray } from "@beep/nlp/Graph/TextGraph"

console.log(toArray(Effect.runSync(singleton("Hello.", "document"))).length) // 1
```

**Signature**

```ts
declare const toArray: (graph: TextGraph) => ReadonlyArray<TextNode>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L575)

Since v0.0.0

# mapping

## mapNodes

Map every text node while preserving edges between retained nodes.

**Example**

```ts
import { Effect } from "effect"
import { mapNodes, singleton, toArray } from "@beep/nlp/Graph/TextGraph"

const graph = Effect.runSync(singleton("Hello.", "document"))
const mapped = mapNodes(graph, (node) => ({ ...node, text: node.text.toUpperCase() }))

console.log(toArray(mapped)[0]?.text) // "HELLO."
```

**Signature**

```ts
declare const mapNodes: { (graph: TextGraph, f: (node: TextNode) => TextNode): TextGraph; (f: (node: TextNode) => TextNode): (graph: TextGraph) => TextGraph; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L476)

Since v0.0.0

# models

## MutableTextGraph (type alias)

Mutable text graph used inside construction callbacks.

**Example**

```ts
import type { MutableTextGraph } from "@beep/nlp/Graph/TextGraph"

const acceptsMutable = (graph: MutableTextGraph) => graph
console.log(acceptsMutable)
```

**Signature**

```ts
type MutableTextGraph = Graph.MutableDirectedGraph<TextNode, TextEdge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L64)

Since v0.0.0

## TextGraph (type alias)

A text-processing graph: `TextNode` data with `TextEdge` relationships.

**Example**

```ts
import { empty, nodeCount, type TextGraph } from "@beep/nlp/Graph/TextGraph"

const graph: TextGraph = empty()
console.log(nodeCount(graph)) // 0
```

**Signature**

```ts
type TextGraph = Graph.DirectedGraph<TextNode, TextEdge>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L48)

Since v0.0.0

# sequencing

## bfs

Create a breadth-first walker over text nodes.

**Example**

```ts
import { Effect, Graph } from "effect"
import { bfs, singleton } from "@beep/nlp/Graph/TextGraph"

const graph = Effect.runSync(singleton("Hello.", "document"))
console.log(Array.from(Graph.values(bfs(graph))).length) // 1
```

**Signature**

```ts
declare const bfs: (graph: TextGraph, start?: ReadonlyArray<Graph.NodeIndex>) => Graph.NodeWalker<TextNode>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L541)

Since v0.0.0

## dfs

Create a depth-first walker over text nodes.

**Example**

```ts
import { Effect, Graph } from "effect"
import { dfs, singleton } from "@beep/nlp/Graph/TextGraph"

const graph = Effect.runSync(singleton("Hello.", "document"))
console.log(Array.from(Graph.values(dfs(graph))).length) // 1
```

**Signature**

```ts
declare const dfs: (graph: TextGraph, start?: ReadonlyArray<Graph.NodeIndex>) => Graph.NodeWalker<TextNode>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L523)

Since v0.0.0

## topo

Create a topological walker where parents precede children.

**Example**

```ts
import { Effect, Graph } from "effect"
import { singleton, topo } from "@beep/nlp/Graph/TextGraph"

const graph = Effect.runSync(singleton("Hello.", "document"))
console.log(Array.from(Graph.values(topo(graph))).length) // 1
```

**Signature**

```ts
declare const topo: (graph: TextGraph) => Graph.NodeWalker<TextNode>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L559)

Since v0.0.0

# utilities

## isAcyclic

Check whether the text graph is acyclic.

**Example**

```ts
import { empty, isAcyclic } from "@beep/nlp/Graph/TextGraph"

console.log(isAcyclic(empty())) // true
```

**Signature**

```ts
declare const isAcyclic: (graph: TextGraph) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L794)

Since v0.0.0

## stronglyConnectedComponents

Compute strongly connected components as node-index groups.

**Example**

```ts
import { empty, stronglyConnectedComponents } from "@beep/nlp/Graph/TextGraph"

console.log(stronglyConnectedComponents(empty()).length) // 0
```

**Signature**

```ts
declare const stronglyConnectedComponents: (graph: TextGraph) => ReadonlyArray<ReadonlyArray<Graph.NodeIndex>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/TextGraph.ts#L809)

Since v0.0.0