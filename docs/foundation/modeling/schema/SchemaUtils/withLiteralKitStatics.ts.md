---
title: withLiteralKitStatics.ts
nav_order: 189
parent: "@beep/schema"
---

## withLiteralKitStatics.ts overview

Reattach LiteralKit statics after a schema transformation or annotation.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [withLiteralKitStatics](#withliteralkitstatics)
---

# utilities

## withLiteralKitStatics

`LiteralKit` augments the underlying schema object with runtime helpers like
`Enum`, `Options`, and `pickOptions`. Schema annotations rebuild the schema,
so those helpers need to be copied back onto the annotated value.

**Example**

```ts
import { LiteralKit } from "@beep/schema/LiteralKit"
import { withLiteralKitStatics } from "@beep/schema/SchemaUtils/withLiteralKitStatics"

const StatusBase = LiteralKit(["draft", "published"])
const Status = StatusBase.pipe(withLiteralKitStatics(StatusBase))

console.log(Status.Options)
```

**Signature**

```ts
declare const withLiteralKitStatics: <const L extends A.NonEmptyReadonlyArray<SchemaAST.LiteralValue>>(literalKit: LiteralKitSchema<L>) => (<S extends object>(schema: S) => S & LiteralKitStatics<L>)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withLiteralKitStatics.ts#L37)

Since v0.0.0