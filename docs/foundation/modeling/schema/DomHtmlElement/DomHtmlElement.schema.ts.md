---
title: DomHtmlElement.schema.ts
nav_order: 55
parent: "@beep/schema"
---

## DomHtmlElement.schema.ts overview

DOM schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isHTMLElement](#ishtmlelement)
- [models](#models)
  - [DOMHtmlElement (type alias)](#domhtmlelement-type-alias)
- [schemas](#schemas)
  - [DOMHtmlElement](#domhtmlelement)
  - [DomHtmlElement](#domhtmlelement-1)
  - [Schema](#schema)
---

# guards

## isHTMLElement

Type guard for HTMLElement.

**Example**

```ts
import { isHTMLElement } from "@beep/schema/DomHtmlElement"

console.log(isHTMLElement(document.createElement("div")))
```

**Signature**

```ts
declare const isHTMLElement: (u: unknown) => u is HTMLElement
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomHtmlElement/DomHtmlElement.schema.ts#L25)

Since v0.0.0

# models

## DOMHtmlElement (type alias)

Type for `DOMHtmlElement`.

**Signature**

```ts
type DOMHtmlElement = typeof DOMHtmlElement.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomHtmlElement/DomHtmlElement.schema.ts#L54)

Since v0.0.0

# schemas

## DOMHtmlElement

An HTMLElement.

**Example**

```ts
import { DOMHtmlElement } from "@beep/schema/DomHtmlElement"
import * as S from "effect/Schema"

const element = S.decodeUnknownSync(DOMHtmlElement)(document.createElement("div"))
console.log(element.tagName)
```

**Signature**

```ts
declare const DOMHtmlElement: AnnotatedSchema<S.declare<HTMLElement, HTMLElement>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomHtmlElement/DomHtmlElement.schema.ts#L42)

Since v0.0.0

## DomHtmlElement

Public aliases for concise namespace roles.

**Signature**

```ts
declare const DomHtmlElement: AnnotatedSchema<S.declare<HTMLElement, HTMLElement>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomHtmlElement/DomHtmlElement.schema.ts#L62)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.declare<HTMLElement, HTMLElement>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomHtmlElement/DomHtmlElement.schema.ts#L62)

Since v0.0.0