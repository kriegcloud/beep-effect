---
title: Schema.ts
nav_order: 29
parent: "@beep/nlp"
---

## Schema.ts overview

Graph node & edge schemas for the NLP text graph.

Schema-first domain types for the text-graph IR: structural nodes
(`TextNode`/`TextEdge`), the `NLPAnalysis` summary, and the
linguistic-annotation node classes (`POSNode`, `EntityNode`,
`LemmaNode`, `DependencyNode`, `RelationNode`). These are the
basis for the product-neutral handoff contract emitted to downstream consumers.

Effect v4 `@beep/nlp` implementation notes:
`Schema.Class("Name")` becomes `S.Class($I\`Name\`)(fields, $I.annote(...))\`,
multi-arm `Schema.Literal(...)` becomes `S.Literals(...)`, `Schema.optional`
becomes `S.optionalKey`, and `Schema.Record({key,value})` becomes the positional
`S.Record(key, value)`. `timestamp` remains a plain field supplied by the graph
producer (which reads `Clock`).

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DependencyNode (class)](#dependencynode-class)
  - [EntityNode (class)](#entitynode-class)
  - [LemmaNode (class)](#lemmanode-class)
  - [NLPAnalysis (class)](#nlpanalysis-class)
  - [POSNode (class)](#posnode-class)
  - [RelationNode (class)](#relationnode-class)
  - [TextEdge](#textedge)
  - [TextNode](#textnode)
- [schemas](#schemas)
  - [TextEdgeRelation](#textedgerelation)
  - [TextNodeType](#textnodetype)
- [type-level](#type-level)
  - [TextEdge (type alias)](#textedge-type-alias)
  - [TextNode (type alias)](#textnode-type-alias)
---

# models

## DependencyNode (class)

Syntactic dependency relation between two tokens.

**Example**

```ts
import { DependencyNode } from "@beep/nlp/Graph/Schema"

console.log(DependencyNode)
```

**Signature**

```ts
declare class DependencyNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L342)

Since v0.0.0

## EntityNode (class)

Named entity extracted from text (a functor `Text -> Entity`).

**Example**

```ts
import { EntityNode } from "@beep/nlp/Graph/Schema"

console.log(EntityNode)
```

**Signature**

```ts
declare class EntityNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L287)

Since v0.0.0

## LemmaNode (class)

Lemmatized (canonical) form of a token (a forgetful functor `Token -> Lemma`).

**Example**

```ts
import { LemmaNode } from "@beep/nlp/Graph/Schema"

console.log(LemmaNode)
```

**Signature**

```ts
declare class LemmaNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L315)

Since v0.0.0

## NLPAnalysis (class)

Summary result of analyzing a piece of text.

**Example**

```ts
import { NLPAnalysis } from "@beep/nlp/Graph/Schema"

console.log(NLPAnalysis)
```

**Signature**

```ts
declare class NLPAnalysis
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L234)

Since v0.0.0

## POSNode (class)

Part-of-speech annotation for a token (a functor `Token -> POS`).

**Example**

```ts
import { POSNode } from "@beep/nlp/Graph/Schema"

console.log(POSNode)
```

**Signature**

```ts
declare class POSNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L260)

Since v0.0.0

## RelationNode (class)

Semantic relation between two entities.

**Example**

```ts
import { RelationNode } from "@beep/nlp/Graph/Schema"

console.log(RelationNode)
```

**Signature**

```ts
declare class RelationNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L369)

Since v0.0.0

## TextEdge

Edge between text nodes, labeled with a structural or linguistic relation.

**Example**

```ts
import { TextEdge } from "@beep/nlp/Graph/Schema"

console.log(TextEdge)
```

**Signature**

```ts
declare const TextEdge: S.toTaggedUnion<"relation", readonly [AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>, AnnotatedSchema<S.Struct<{ relation: S.tag<"contains" | "follows" | "derived-from" | "parent-of" | "tagged-as" | "lemma-of" | "head-of" | "dependent-of" | "entity-mention" | "relates-to">; label: S.optionalKey<S.String>; weight: S.optionalKey<S.Finite>; }>>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L185)

Since v0.0.0

## TextNode

Text node stored in the graph: a piece of text with processing metadata.

**Example**

```ts
import { TextNode } from "@beep/nlp/Graph/Schema"

console.log(TextNode)
```

**Signature**

```ts
declare const TextNode: S.toTaggedUnion<"type", readonly [AnnotatedSchema<S.Struct<{ text: S.String; type: S.tag<"sentence">; operation: S.optionalKey<S.String>; timestamp: S.Finite; metadata: S.optionalKey<S.$Record<S.String, S.Unknown>>; }>>, AnnotatedSchema<S.Struct<{ text: S.String; type: S.tag<"token">; operation: S.optionalKey<S.String>; timestamp: S.Finite; metadata: S.optionalKey<S.$Record<S.String, S.Unknown>>; }>>, AnnotatedSchema<S.Struct<{ text: S.String; type: S.tag<"paragraph">; operation: S.optionalKey<S.String>; timestamp: S.Finite; metadata: S.optionalKey<S.$Record<S.String, S.Unknown>>; }>>, AnnotatedSchema<S.Struct<{ text: S.String; type: S.tag<"document">; operation: S.optionalKey<S.String>; timestamp: S.Finite; metadata: S.optionalKey<S.$Record<S.String, S.Unknown>>; }>>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L103)

Since v0.0.0

# schemas

## TextEdgeRelation

Edge-relation vocabulary (structural + linguistic-annotation relations).

**Example**

```ts
import { TextEdgeRelation } from "@beep/nlp/Graph/Schema"

console.log(TextEdgeRelation.is.contains("contains")) // true
```

**Signature**

```ts
declare const TextEdgeRelation: LiteralKit<readonly ["contains", "follows", "derived-from", "parent-of", "tagged-as", "lemma-of", "head-of", "dependent-of", "entity-mention", "relates-to"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L60)

Since v0.0.0

## TextNodeType

Structural text-node kind vocabulary.

**Example**

```ts
import { TextNodeType } from "@beep/nlp/Graph/Schema"

console.log(TextNodeType.is.sentence("sentence")) // true
```

**Signature**

```ts
declare const TextNodeType: LiteralKit<readonly ["sentence", "token", "paragraph", "document"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L41)

Since v0.0.0

# type-level

## TextEdge (type alias)

Runtime type for text-graph edges.

**Example**

```ts
import type { TextEdge } from "@beep/nlp/Graph/Schema"

const relation = (edge: TextEdge) => edge.relation
console.log(relation)
```

**Signature**

```ts
type TextEdge = typeof TextEdge.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L219)

Since v0.0.0

## TextNode (type alias)

Runtime type for text-graph nodes.

**Example**

```ts
import type { TextNode } from "@beep/nlp/Graph/Schema"

const typeName = (node: TextNode) => node.type
console.log(typeName)
```

**Signature**

```ts
type TextNode = typeof TextNode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/Graph/Schema.ts#L159)

Since v0.0.0