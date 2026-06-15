---
title: Stream.ts
nav_order: 19
parent: "@beep/utils"
---

## Stream.ts overview

A module containing utilities for working with `effect/Stream`.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [streamFilterJson](#streamfilterjson)
---

# utilities

## streamFilterJson

Splits a text stream into lines, decodes each line as JSON with `schema`,
and emits only the successfully decoded values.

Invalid JSON lines and schema decode failures are filtered out rather than
failing the stream.

Supports both call styles:
- Data-last: `pipe(stream, streamFilterJson(schema))`
- Data-first: `streamFilterJson(stream, schema)`

**Example**

```ts
import { Effect, Stream } from "effect"
import * as S from "effect/Schema"
import { streamFilterJson } from "@beep/utils/Stream"

const program = Stream.make("1\n", "nope\n", "2\n").pipe(
  streamFilterJson(S.Finite),
  Stream.runCollect
)

console.log(Effect.runPromise(program))
```

**Signature**

```ts
declare const streamFilterJson: { <const TSchema extends S.Top>(schema: TSchema): <E, R>(self: Stream.Stream<string, E, R>) => Stream.Stream<TSchema["Type"], E, R | TSchema["DecodingServices"]>; <const TSchema extends S.Top, E, R>(self: Stream.Stream<string, E, R>, schema: TSchema): Stream.Stream<TSchema["Type"], E, R | TSchema["DecodingServices"]>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Stream.ts#L43)

Since v0.0.0