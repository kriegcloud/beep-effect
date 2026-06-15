---
title: Jsonc.ts
nav_order: 138
parent: "@beep/schema"
---

## Jsonc.ts overview

JSONC parsing and schema transforms.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [JsoncParseDiagnostic (class)](#jsoncparsediagnostic-class)
- [utilities](#utilities)
  - [decodeJsoncTextAs](#decodejsonctextas)
- [validation](#validation)
  - [JsoncTextToUnknown](#jsonctexttounknown)
---

# models

## JsoncParseDiagnostic (class)

Typed representation of a single JSONC parse diagnostic produced by `jsonc-parser`.

**Example**

```ts
import { JsoncParseDiagnostic } from "@beep/schema/Jsonc"
import * as S from "effect/Schema"

const diag = S.decodeUnknownSync(JsoncParseDiagnostic)({})
console.log(diag)
```

**Signature**

```ts
declare class JsoncParseDiagnostic
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Jsonc.ts#L32)

Since v0.0.0

# utilities

## decodeJsoncTextAs

Builds a decoder that parses JSONC text and then decodes the result through a
target schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { decodeJsoncTextAs } from "@beep/schema/Jsonc"

const Config = S.Struct({ port: S.Finite, host: S.String })
const decodeConfig = decodeJsoncTextAs(Config)

const program = decodeConfig('{ "port": 8080, "host": "localhost" }')
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const decodeJsoncTextAs: <Schema extends S.Top>(schema: Schema) => (input: unknown, options?: ParseOptions | undefined) => Effect.Effect<Schema["Type"], S.SchemaError, Schema["DecodingServices"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Jsonc.ts#L127)

Since v0.0.0

# validation

## JsoncTextToUnknown

Schema transformation that decodes a JSONC string (JSON with comments and
trailing commas) into an unknown parsed value.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { JsoncTextToUnknown } from "@beep/schema/Jsonc"

const program = S.decodeUnknownEffect(JsoncTextToUnknown)('{ "port": 8080 }')
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const JsoncTextToUnknown: AnnotatedSchema<S.decodeTo<S.Unknown, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Jsonc.ts#L91)

Since v0.0.0