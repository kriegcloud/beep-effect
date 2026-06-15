---
title: Toml.ts
nav_order: 214
parent: "@beep/schema"
---

## Toml.ts overview

TOML parsing and schema transforms.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [decodeTomlTextAs](#decodetomltextas)
- [validation](#validation)
  - [TomlTextToUnknown](#tomltexttounknown)
---

# utilities

## decodeTomlTextAs

Builds a decoder that parses TOML text and then decodes the result through a
target schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { decodeTomlTextAs } from "@beep/schema/Toml"

const ServerConfig = S.Struct({ port: S.Finite, host: S.String })
const decodeConfig = decodeTomlTextAs(S.Struct({ server: ServerConfig }))

const program = decodeConfig("[server]\nport = 8080\nhost = \"localhost\"")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const decodeTomlTextAs: <Schema extends S.Top>(schema: Schema) => (input: unknown, options?: ParseOptions | undefined) => Effect.Effect<Schema["Type"], S.SchemaError, Schema["DecodingServices"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Toml.ts#L128)

Since v0.0.0

# validation

## TomlTextToUnknown

Schema transformation that decodes TOML text into an unknown record using
`Bun.TOML.parse`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { TomlTextToUnknown } from "@beep/schema/Toml"

const program = S.decodeUnknownEffect(TomlTextToUnknown)("port = 8080")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const TomlTextToUnknown: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.$Record<S.String, S.Unknown>>, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Toml.ts#L95)

Since v0.0.0