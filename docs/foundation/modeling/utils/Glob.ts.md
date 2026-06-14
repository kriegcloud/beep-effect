---
title: Glob.ts
nav_order: 9
parent: "@beep/utils"
---

## Glob.ts overview

Glob pattern schemas and file matching service helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [GlobError (class)](#globerror-class)
  - [GlobError (namespace)](#globerror-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [GlobOptions (class)](#globoptions-class)
  - [Pattern (type alias)](#pattern-type-alias)
- [services](#services)
  - [Glob](#glob)
  - [Glob (interface)](#glob-interface)
- [utilities](#utilities)
  - [Pattern](#pattern)
  - [layer](#layer)
---

# models

## GlobError (class)

An error raised when glob pattern matching fails.

Carries the offending `pattern` and an optional `cause` with stack trace.
Accepts both the decoded `Option` cause and the encoded optional cause shape
for constructor compatibility.

**Example**

```ts
import { GlobError } from "@beep/utils/Glob"

import * as O from "effect/Option"

const error = GlobError.new("src/*.ts", O.none())
console.log(error)
```

**Signature**

```ts
declare class GlobError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L136)

Since v0.0.0

## GlobError (namespace)

Namespace for the encoded form of `GlobError`.

**Example**

```ts
import { GlobError } from "@beep/utils/Glob"

const pattern = (value: GlobError.Encoded) => value.pattern
console.log(pattern)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L98)

Since v0.0.0

### Encoded (type alias)

Encoded shape of `GlobError`.

**Example**

```ts
import { GlobError } from "@beep/utils/Glob"

const pattern = (value: GlobError.Encoded) => value.pattern
console.log(pattern)
```

**Signature**

```ts
type Encoded = typeof GlobError.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L113)

Since v0.0.0

## GlobOptions (class)

Optional runtime flags for glob scans.

**Example**

```ts
import { GlobOptions } from "@beep/utils/Glob"

const opts = GlobOptions.make({ absolute: true, dot: true })
console.log(opts)
```

**Signature**

```ts
declare class GlobOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L71)

Since v0.0.0

## Pattern (type alias)

A glob pattern: either a single string or an array of strings.

**Example**

```ts
import type { Pattern } from "@beep/utils/Glob"

const pattern: Pattern = ["src/*.ts", "test/*.ts"]
console.log(pattern)
```

**Signature**

```ts
type Pattern = typeof Pattern.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L55)

Since v0.0.0

# services

## Glob

Service tag for the `Glob` capability.

**Example**

```ts
import { Glob } from "@beep/utils/Glob"

const tag = Glob
console.log(tag)
```

**Signature**

```ts
declare const Glob: Context.Service<Glob, Glob>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L205)

Since v0.0.0

## Glob (interface)

Service interface for performing glob-based file matching.

Provides a single `glob` method that resolves glob patterns against the
file system and returns the matched paths.

**Example**

```ts
import { Effect } from "effect"
import { Glob } from "@beep/utils/Glob"

const program = Effect.gen(function* () {
  const service = yield* Glob
  return yield* service.glob("src/*.ts")
})

console.log(program)
```

**Signature**

```ts
export interface Glob {
  readonly glob: (pattern: Pattern, options?: undefined | GlobOptions) => Effect.Effect<Array<string>, GlobError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L187)

Since v0.0.0

# utilities

## Pattern

Schema for a glob pattern: either a single string or an array of strings.

**Example**

```ts
import { Pattern } from "@beep/utils/Glob"

const schema = Pattern
console.log(schema)
```

**Signature**

```ts
declare const Pattern: AnnotatedSchema<S.Union<readonly [S.String, S.$Array<S.String>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L35)

Since v0.0.0

## layer

Live `Layer` providing the `Glob` service backed by `Bun.Glob` when
available and Node's `fs.globSync` otherwise.

**Example**

```ts
import { Effect } from "effect"
import { Glob, layer } from "@beep/utils/Glob"

const program = Effect.provide(
  Effect.gen(function* () {
    const service = yield* Glob
    return yield* service.glob("src/*.ts")
  }),
  layer
)

console.log(program)
```

**Signature**

```ts
declare const layer: Layer.Layer<Glob, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Glob.ts#L541)

Since v0.0.0