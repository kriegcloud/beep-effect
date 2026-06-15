---
title: DomDragEvent.schema.ts
nav_order: 51
parent: "@beep/schema"
---

## DomDragEvent.schema.ts overview

DOM schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isDragEvent](#isdragevent)
- [models](#models)
  - [DOMDragEvent (type alias)](#domdragevent-type-alias)
- [schemas](#schemas)
  - [DOMDragEvent](#domdragevent)
  - [DomDragEvent](#domdragevent-1)
  - [Schema](#schema)
---

# guards

## isDragEvent

Type guard for DragEvent.

**Example**

```ts
import { isDragEvent } from "@beep/schema/DomDragEvent"

console.log(isDragEvent(new DragEvent("dragstart")))
```

**Signature**

```ts
declare const isDragEvent: (u: unknown) => u is DragEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomDragEvent/DomDragEvent.schema.ts#L25)

Since v0.0.0

# models

## DOMDragEvent (type alias)

Type for `DOMDragEvent`.

**Signature**

```ts
type DOMDragEvent = typeof DOMDragEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomDragEvent/DomDragEvent.schema.ts#L54)

Since v0.0.0

# schemas

## DOMDragEvent

A DragEvent.

**Example**

```ts
import { DOMDragEvent } from "@beep/schema/DomDragEvent"
import * as S from "effect/Schema"

const event = S.decodeUnknownSync(DOMDragEvent)(new DragEvent("dragstart"))
console.log(event.type)
```

**Signature**

```ts
declare const DOMDragEvent: AnnotatedSchema<S.declare<DragEvent, DragEvent>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomDragEvent/DomDragEvent.schema.ts#L42)

Since v0.0.0

## DomDragEvent

Public aliases for concise namespace roles.

**Signature**

```ts
declare const DomDragEvent: AnnotatedSchema<S.declare<DragEvent, DragEvent>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomDragEvent/DomDragEvent.schema.ts#L62)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.declare<DragEvent, DragEvent>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomDragEvent/DomDragEvent.schema.ts#L62)

Since v0.0.0