---
title: Json.ts
nav_order: 137
parent: "@beep/schema"
---

## Json.ts overview

A module containing effect schema's for json data types

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - [decodeJsonString](#decodejsonstring)
  - [encodeJsonString](#encodejsonstring)
- [models](#models)
  - [JsonArray (type alias)](#jsonarray-type-alias)
  - [JsonObject (type alias)](#jsonobject-type-alias)
- [validation](#validation)
  - [JsonArray](#jsonarray)
  - [JsonObject](#jsonobject)
---

# codecs

## decodeJsonString

Decodes a JSON string into an unknown JSON-compatible value.

**Example**

```ts
import { Effect } from "effect"
import { decodeJsonString } from "@beep/schema/Json"

const decoded = Effect.runSync(decodeJsonString("{\"ok\":true}"))

console.log(decoded)
```

**Signature**

```ts
declare const decodeJsonString: (input: unknown, options?: ParseOptions) => Effect<unknown, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Json.ts#L86)

Since v0.0.0

## encodeJsonString

Encodes an unknown JSON-compatible value into a compact JSON string.

**Example**

```ts
import { Effect } from "effect"
import { encodeJsonString } from "@beep/schema/Json"

const encoded = Effect.runSync(encodeJsonString({ ok: true }))

console.log(encoded)
```

**Signature**

```ts
declare const encodeJsonString: (input: unknown, options?: ParseOptions) => Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Json.ts#L104)

Since v0.0.0

# models

## JsonArray (type alias)

Runtime type extracted from the `JsonArray` schema.

**Signature**

```ts
type JsonArray = typeof JsonArray.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Json.ts#L68)

Since v0.0.0

## JsonObject (type alias)

Runtime type extracted from the `JsonObject` schema.

**Signature**

```ts
type JsonObject = typeof JsonObject.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Json.ts#L39)

Since v0.0.0

# validation

## JsonArray

Schema for a JSON array (an array of JSON-compatible values).

**Example**

```ts
import * as S from "effect/Schema"
import { JsonArray } from "@beep/schema/Json"

const decoded = S.decodeUnknownSync(JsonArray)([1, "two", true, null])
console.log(decoded)
```

**Signature**

```ts
declare const JsonArray: AnnotatedSchema<S.$Array<S.Codec<S.Json, S.Json, never, never>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Json.ts#L56)

Since v0.0.0

## JsonObject

Schema for a JSON object (a record of string keys to JSON-compatible values).

**Example**

```ts
import * as S from "effect/Schema"
import { JsonObject } from "@beep/schema/Json"

const decoded = S.decodeUnknownSync(JsonObject)({ name: "Alice", age: 30 })
console.log(decoded)
```

**Signature**

```ts
declare const JsonObject: AnnotatedSchema<S.$Record<S.String, S.Codec<S.Json, S.Json, never, never>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Json.ts#L27)

Since v0.0.0