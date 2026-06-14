---
title: Graph.rebuild.ts
nav_order: 108
parent: "@beep/schema"
---

## Graph.rebuild.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [rebuildImmutableGraph](#rebuildimmutablegraph)
  - [rebuildMutableGraph](#rebuildmutablegraph)
---

# constructors

## rebuildImmutableGraph

Public schema module export.

**Signature**

```ts
declare const rebuildImmutableGraph: <Node, Edge>(encoded: GraphEncoded<Node, Edge>, actual: unknown, expectedType?: GraphKindValue) => Effect.Effect<Graph_.Graph<Node, Edge, GraphKindValue>, SchemaIssue.Issue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.rebuild.ts#L59)

Since v0.0.0

## rebuildMutableGraph

Public schema module export.

**Signature**

```ts
declare const rebuildMutableGraph: <Node, Edge>(encoded: GraphEncoded<Node, Edge>, actual: unknown, expectedType?: GraphKindValue) => Effect.Effect<Graph_.MutableGraph<Node, Edge, GraphKindValue>, SchemaIssue.Issue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Graph/Graph.rebuild.ts#L88)

Since v0.0.0