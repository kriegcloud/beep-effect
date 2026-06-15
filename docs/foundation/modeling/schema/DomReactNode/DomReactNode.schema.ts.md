---
title: DomReactNode.schema.ts
nav_order: 59
parent: "@beep/schema"
---

## DomReactNode.schema.ts overview

DOM schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [createDOMRefSchema](#createdomrefschema)
- [guards](#guards)
  - [isReactNode](#isreactnode)
  - [isReactRef](#isreactref)
- [models](#models)
  - [DOMReactNode (type alias)](#domreactnode-type-alias)
- [schemas](#schemas)
  - [DOMReactNode](#domreactnode)
  - [DomReactNode](#domreactnode-1)
  - [Schema](#schema)
---

# constructors

## createDOMRefSchema

Creates a schema for React.Ref<T> where T extends HTMLElement.

**Example**

```ts
import { createDOMRefSchema } from "@beep/schema/DomReactNode"
import * as S from "effect/Schema"

const DOMRef = createDOMRefSchema<HTMLDivElement>()
const ref = S.decodeUnknownSync(DOMRef)({ current: null })
console.log(ref)
```

**Signature**

```ts
declare const createDOMRefSchema: <T extends HTMLElement>() => AnnotatedSchema<S.declare<React.Ref<T>, React.Ref<T>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomReactNode/DomReactNode.schema.ts#L110)

Since v0.0.0

# guards

## isReactNode

Type guard for React.ReactNode.

**Example**

```ts
import { isReactNode } from "@beep/schema/DomReactNode"

console.log(isReactNode(["hello", 1, null]))
```

**Signature**

```ts
declare const isReactNode: (u: unknown) => u is React.ReactNode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomReactNode/DomReactNode.schema.ts#L27)

Since v0.0.0

## isReactRef

Type guard for React.Ref<T>.

**Example**

```ts
import { isReactRef } from "@beep/schema/DomReactNode"

console.log(isReactRef({ current: null }))
```

**Signature**

```ts
declare const isReactRef: <T>(u: unknown) => u is React.Ref<T>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomReactNode/DomReactNode.schema.ts#L83)

Since v0.0.0

# models

## DOMReactNode (type alias)

Type for `DOMReactNode`.

**Signature**

```ts
type DOMReactNode = typeof DOMReactNode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomReactNode/DomReactNode.schema.ts#L68)

Since v0.0.0

# schemas

## DOMReactNode

A React.ReactNode value.

**Example**

```ts
import { DOMReactNode } from "@beep/schema/DomReactNode"
import * as S from "effect/Schema"

const node = S.decodeUnknownSync(DOMReactNode)("hello")
console.log(node)
```

**Signature**

```ts
declare const DOMReactNode: AnnotatedSchema<S.declare<React.ReactNode, React.ReactNode>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomReactNode/DomReactNode.schema.ts#L56)

Since v0.0.0

## DomReactNode

Public aliases for concise namespace roles.

**Signature**

```ts
declare const DomReactNode: AnnotatedSchema<S.declare<React.ReactNode, React.ReactNode>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomReactNode/DomReactNode.schema.ts#L123)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.declare<React.ReactNode, React.ReactNode>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomReactNode/DomReactNode.schema.ts#L123)

Since v0.0.0