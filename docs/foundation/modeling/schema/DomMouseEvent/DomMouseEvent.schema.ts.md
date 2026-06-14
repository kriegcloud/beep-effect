---
title: DomMouseEvent.schema.ts
nav_order: 57
parent: "@beep/schema"
---

## DomMouseEvent.schema.ts overview

DOM schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isMouseEvent](#ismouseevent)
- [models](#models)
  - [DOMMouseEvent (type alias)](#dommouseevent-type-alias)
- [schemas](#schemas)
  - [DOMMouseEvent](#dommouseevent)
  - [DomMouseEvent](#dommouseevent-1)
  - [Schema](#schema)
---

# guards

## isMouseEvent

Type guard for MouseEvent.

**Example**

```ts
import { isMouseEvent } from "@beep/schema/DomMouseEvent"

console.log(isMouseEvent(new MouseEvent("click")))
```

**Signature**

```ts
declare const isMouseEvent: (u: unknown) => u is MouseEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomMouseEvent/DomMouseEvent.schema.ts#L25)

Since v0.0.0

# models

## DOMMouseEvent (type alias)

Type for `DOMMouseEvent`.

**Signature**

```ts
type DOMMouseEvent = typeof DOMMouseEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomMouseEvent/DomMouseEvent.schema.ts#L54)

Since v0.0.0

# schemas

## DOMMouseEvent

A DOM mouse event.

**Example**

```ts
import { DOMMouseEvent } from "@beep/schema/DomMouseEvent"
import * as S from "effect/Schema"

const event = S.decodeUnknownSync(DOMMouseEvent)(new MouseEvent("click"))
console.log(event.type)
```

**Signature**

```ts
declare const DOMMouseEvent: AnnotatedSchema<S.declare<MouseEvent, MouseEvent>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomMouseEvent/DomMouseEvent.schema.ts#L42)

Since v0.0.0

## DomMouseEvent

Public aliases for concise namespace roles.

**Signature**

```ts
declare const DomMouseEvent: AnnotatedSchema<S.declare<MouseEvent, MouseEvent>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomMouseEvent/DomMouseEvent.schema.ts#L62)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.declare<MouseEvent, MouseEvent>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomMouseEvent/DomMouseEvent.schema.ts#L62)

Since v0.0.0