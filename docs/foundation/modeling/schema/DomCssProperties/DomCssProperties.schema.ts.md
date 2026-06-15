---
title: DomCssProperties.schema.ts
nav_order: 49
parent: "@beep/schema"
---

## DomCssProperties.schema.ts overview

DOM schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isCSSProperties](#iscssproperties)
- [schemas](#schemas)
  - [DOMCssProperties](#domcssproperties)
  - [DomCssProperties](#domcssproperties-1)
  - [Schema](#schema)
---

# guards

## isCSSProperties

Type guard for React.CSSProperties.

**Example**

```ts
import { isCSSProperties } from "@beep/schema/DomCssProperties"

console.log(isCSSProperties({ color: "red" }))
```

**Signature**

```ts
declare const isCSSProperties: (u: unknown) => u is React.CSSProperties
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomCssProperties/DomCssProperties.schema.ts#L27)

Since v0.0.0

# schemas

## DOMCssProperties

A React.CSSProperties object.

**Example**

```ts
import { DOMCssProperties } from "@beep/schema/DomCssProperties"
import * as S from "effect/Schema"

const styles = S.decodeUnknownSync(DOMCssProperties)({ color: "red" })
console.log(styles)
```

**Signature**

```ts
declare const DOMCssProperties: AnnotatedSchema<S.declare<React.CSSProperties, React.CSSProperties>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomCssProperties/DomCssProperties.schema.ts#L49)

Since v0.0.0

## DomCssProperties

Public aliases for concise namespace roles.

**Signature**

```ts
declare const DomCssProperties: AnnotatedSchema<S.declare<React.CSSProperties, React.CSSProperties>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomCssProperties/DomCssProperties.schema.ts#L61)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.declare<React.CSSProperties, React.CSSProperties>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/DomCssProperties/DomCssProperties.schema.ts#L61)

Since v0.0.0