---
title: Model.codecs.ts
nav_order: 151
parent: "@beep/schema"
---

## Model.codecs.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - [JsonFromString](#jsonfromstring)
- [models](#models)
  - [JsonFromString (interface)](#jsonfromstring-interface)
---

# codecs

## JsonFromString

A field that represents a JSON value stored as text in the database.

The "json" variants will use the object schema directly.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Record extends Model.Class<Record>("Record")({}) {}

console.log(Record)
```

**Signature**

```ts
declare const JsonFromString: <S extends S.Top>(schema: S) => JsonFromString<S>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.codecs.ts#L56)

Since v0.0.0

# models

## JsonFromString (interface)

Interface for a field stored as a JSON text column in the database.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const field = Model.JsonFromString(Schema.Struct({ a: Schema.String }))

console.log(field)
```

**Signature**

```ts
export interface JsonFromString<S extends S.Top>
  extends VariantSchema.Field<{
    readonly select: S.fromJsonString<S>;
    readonly insert: S.fromJsonString<S>;
    readonly update: S.fromJsonString<S>;
    readonly json: S;
    readonly jsonCreate: S;
    readonly jsonUpdate: S;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.codecs.ts#L28)

Since v0.0.0