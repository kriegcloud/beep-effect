---
title: Yaml.ts
nav_order: 223
parent: "@beep/schema"
---

## Yaml.ts overview

YAML parsing and schema transforms.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [decodeYamlTextAs](#decodeyamltextas)
  - [parseYaml](#parseyaml)
- [validation](#validation)
  - [YamlTextToUnknown](#yamltexttounknown)
---

# utilities

## decodeYamlTextAs

Builds a decoder that parses YAML text and then decodes the result through a
target schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { decodeYamlTextAs } from "@beep/schema/Yaml"

const Config = S.Struct({ name: S.String, age: S.Finite })
const decodeConfig = decodeYamlTextAs(Config)

const program = decodeConfig("name: Beep\nage: 1")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const decodeYamlTextAs: <Schema extends S.Top>(schema: Schema) => (input: unknown, options?: ParseOptions | undefined) => Effect.Effect<Schema["Type"], S.SchemaError, Schema["DecodingServices"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Yaml.ts#L125)

Since v0.0.0

## parseYaml

Parses a YAML string into a JavaScript value. Uses `Bun.YAML` when available
and otherwise falls back to the `yaml` package.

**Example**

```ts
import { parseYaml } from "@beep/schema/Yaml"

const value = parseYaml("name: Alice\nage: 30")
console.log(value)
```

**Signature**

```ts
declare const parseYaml: (input: string) => unknown
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Yaml.ts#L73)

Since v0.0.0

# validation

## YamlTextToUnknown

Schema transformation that decodes YAML text into an unknown parsed value.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { YamlTextToUnknown } from "@beep/schema/Yaml"

const program = S.decodeUnknownEffect(YamlTextToUnknown)("name: Beep")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const YamlTextToUnknown: AnnotatedSchema<S.decodeTo<S.Unknown, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Yaml.ts#L92)

Since v0.0.0