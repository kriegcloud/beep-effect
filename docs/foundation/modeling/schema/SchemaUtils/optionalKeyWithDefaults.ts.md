---
title: optionalKeyWithDefaults.ts
nav_order: 183
parent: "@beep/schema"
---

## optionalKeyWithDefaults.ts overview

Contains a helper schema to create an `S.Struct.Field` property that is
optional and has defaults.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [optionalKeyWithDefault](#optionalkeywithdefault)
---

# utilities

## optionalKeyWithDefault

Helper to create an optional key with a default value.

Replaces `S.optionalWith(schema, { exact: true, default: () => val })` in v4.

**Example**

```ts
import { optionalKeyWithDefault } from "@beep/schema/SchemaUtils/optionalKeyWithDefaults"
import * as S from "effect/Schema"

const Settings = S.Struct({ label: optionalKeyWithDefault(S.String, "draft") })
console.log(S.decodeUnknownSync(Settings)({}).label)
```

**Signature**

```ts
declare const optionalKeyWithDefault: { <S extends S.Top>(schema: S, defaultValue: S["Type"]): S.decodeTo<S.toType<S>, S.optionalKey<S>>; <S extends S.Top>(defaultValue: S["Type"]): (schema: S) => S.decodeTo<S.toType<S>, S.optionalKey<S>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/optionalKeyWithDefaults.ts#L29)

Since v0.0.0