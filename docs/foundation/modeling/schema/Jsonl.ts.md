---
title: Jsonl.ts
nav_order: 139
parent: "@beep/schema"
---

## Jsonl.ts overview

JSONL parsing and schema transforms.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [decodeJsonlTextAs](#decodejsonltextas)
- [validation](#validation)
  - [JsonlTextToUnknown](#jsonltexttounknown)
---

# utilities

## decodeJsonlTextAs

Builds a decoder that parses JSONL text and then decodes the resulting value
array through a target schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { decodeJsonlTextAs } from "@beep/schema/Jsonl"

const Row = S.Struct({ a: S.Finite })
const decodeRows = decodeJsonlTextAs(S.Array(Row))

const program = decodeRows('{"a":1}\n')
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const decodeJsonlTextAs: <Schema extends S.Top>(schema: Schema) => (input: unknown, options?: ParseOptions | undefined) => Effect.Effect<Schema["Type"], S.SchemaError, Schema["DecodingServices"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Jsonl.ts#L136)

Since v0.0.0

# validation

## JsonlTextToUnknown

Schema transformation that decodes JSONL (JSON Lines) text into an array of
parsed values using `Bun.JSONL.parseChunk`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { JsonlTextToUnknown } from "@beep/schema/Jsonl"

const program = S.decodeUnknownEffect(JsonlTextToUnknown)('{"a":1}\n')
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const JsonlTextToUnknown: AnnotatedSchema<S.decodeTo<S.toType<S.$Array<S.Unknown>>, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Jsonl.ts#L103)

Since v0.0.0