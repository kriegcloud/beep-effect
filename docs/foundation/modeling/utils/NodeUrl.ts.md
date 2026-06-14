---
title: NodeUrl.ts
nav_order: 13
parent: "@beep/utils"
---

## NodeUrl.ts overview

Node URL helpers wrapped in `Effect`.

Provides typed wrappers around Node's file URL conversion utilities so
path and `file:` URL conversions can participate in Effect workflows.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [fileURLToPath](#fileurltopath)
  - [fromFileUrl](#fromfileurl)
  - [toFileUrl](#tofileurl)
---

# utilities

## fileURLToPath

Converts a `file:` URL back into a platform path string.

**Example**

```ts
import { fileURLToPath } from "@beep/utils/NodeUrl"

const path = fileURLToPath(new URL("file:///tmp/beep.txt"))
console.log(path)
```

**Signature**

```ts
declare const fileURLToPath: any
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/NodeUrl.ts#L127)

Since v0.0.0

## fromFileUrl

Converts a `file:` URL into a platform path string.

Wraps Node's `fileURLToPath` in `Effect.try`, translating thrown errors
into a typed `BadArgument`.

**Example**

```ts
import { Effect } from "effect"
import { fromFileUrl } from "@beep/utils/NodeUrl"

const program = Effect.gen(function* () {
  const path = yield* fromFileUrl(new URL("file:///tmp/beep.txt"))
  return path
})

console.log(program)
```

**Example**

```ts
import { Effect } from "effect"
import { fromFileUrl } from "@beep/utils/NodeUrl"

const invalid = fromFileUrl(new URL("https://example.com/file.txt"))

const recovered = Effect.catchTag(invalid, "BadArgument", () =>
  Effect.succeed("/tmp/fallback.txt")
)

console.log(recovered)
```

**Signature**

```ts
declare const fromFileUrl: (url: URL) => Effect.Effect<string, PlatformError.BadArgument>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/NodeUrl.ts#L53)

Since v0.0.0

## toFileUrl

Converts a platform path string into a `file:` URL.

Wraps Node's `pathToFileURL` in `Effect.try`, translating thrown errors
into a typed `BadArgument`.

**Example**

```ts
import { Effect } from "effect"
import { toFileUrl } from "@beep/utils/NodeUrl"

const program = Effect.gen(function* () {
  const url = yield* toFileUrl("/tmp/beep.txt")
  return url.href
})

console.log(program)
```

**Example**

```ts
import { Effect } from "effect"
import { toFileUrl } from "@beep/utils/NodeUrl"

const recovered = Effect.catchTag(toFileUrl(""), "BadArgument", () =>
  Effect.succeed(new URL("file:///tmp/fallback.txt"))
)

console.log(recovered)
```

**Signature**

```ts
declare const toFileUrl: (path: string) => Effect.Effect<URL, PlatformError.BadArgument>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/NodeUrl.ts#L102)

Since v0.0.0