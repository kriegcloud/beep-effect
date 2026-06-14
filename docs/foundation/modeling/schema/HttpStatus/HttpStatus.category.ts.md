---
title: HttpStatus.category.ts
nav_order: 120
parent: "@beep/schema"
---

## HttpStatus.category.ts overview

HTTP status category schema.

Since v0.0.0

---
## Exports Grouped by Category
- [validation](#validation)
  - [HttpStatusCategory](#httpstatuscategory)
  - [HttpStatusCategory (type alias)](#httpstatuscategory-type-alias)
---

# validation

## HttpStatusCategory

HttpStatusCategory - HTTP status code category

**Example**

```ts
import { HttpStatusCategory } from "@beep/schema/HttpStatus"

console.log(HttpStatusCategory.Pairs.length)
```

**Signature**

```ts
declare const HttpStatusCategory: AnnotatedSchema<MappedLiteralKit<readonly [readonly ["INFO", "1XX"], readonly ["SUCCESS", "2XX"], readonly ["REDIRECTION", "3XX"], readonly ["CLIENT_ERROR", "4XX"], readonly ["SERVER_ERROR", "5XX"]]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.category.ts#L26)

Since v0.0.0

## HttpStatusCategory (type alias)

{@inheritDoc HttpStatusCategory}

**Signature**

```ts
type HttpStatusCategory = typeof HttpStatusCategory.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/HttpStatus/HttpStatus.category.ts#L54)

Since v0.0.0