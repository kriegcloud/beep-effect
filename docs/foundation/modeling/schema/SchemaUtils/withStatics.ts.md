---
title: withStatics.ts
nav_order: 190
parent: "@beep/schema"
---

## withStatics.ts overview

Attach static methods to a schema.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [withStatics](#withstatics)
---

# constructors

## withStatics

Attach static methods to a schema object. Designed to be used with `.pipe()`.

**Example**

```ts
import * as S from "effect/Schema"
import { withStatics } from "@beep/schema/SchemaUtils/withStatics"

const MySchema = S.String.pipe(
  withStatics(() => ({
    empty: ""
  }))
)

console.log(MySchema.empty)
```

**Signature**

```ts
declare const withStatics: { <S extends object, M extends Record<string, unknown>>(methods: (schema: S) => M): (schema: S) => S & M; <S extends object, M extends Record<string, unknown>>(schema: S, methods: (schema: S) => M): S & M; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withStatics.ts#L91)

Since v0.0.0