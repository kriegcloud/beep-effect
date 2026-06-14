---
title: DomEvent.schema.ts
nav_order: 53
parent: "@beep/schema"
---

## DomEvent.schema.ts overview

DOM schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isEvent](#isevent)
- [models](#models)
  - [DOMEvent (type alias)](#domevent-type-alias)
- [schemas](#schemas)
  - [DOMEvent](#domevent)
  - [DomEvent](#domevent-1)
  - [Schema](#schema)
---

# guards

## isEvent

Type guard for Event.

**Example**

```ts
import { isEvent } from "@beep/schema/DomEvent"

console.log(isEvent(new Event("submit")))
```

**Signature**

```ts
declare const isEvent: (u: unknown) => u is Event
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomEvent/DomEvent.schema.ts#L25)

Since v0.0.0

# models

## DOMEvent (type alias)

Type for `DOMEvent`.

**Signature**

```ts
type DOMEvent = typeof DOMEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomEvent/DomEvent.schema.ts#L54)

Since v0.0.0

# schemas

## DOMEvent

A DOM event.

**Example**

```ts
import { DOMEvent } from "@beep/schema/DomEvent"
import * as S from "effect/Schema"

const event = S.decodeUnknownSync(DOMEvent)(new Event("submit"))
console.log(event.type)
```

**Signature**

```ts
declare const DOMEvent: AnnotatedSchema<S.declare<Event, Event>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomEvent/DomEvent.schema.ts#L42)

Since v0.0.0

## DomEvent

Public aliases for concise namespace roles.

**Signature**

```ts
declare const DomEvent: AnnotatedSchema<S.declare<Event, Event>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomEvent/DomEvent.schema.ts#L62)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.declare<Event, Event>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomEvent/DomEvent.schema.ts#L62)

Since v0.0.0