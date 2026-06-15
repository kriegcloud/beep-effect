---
title: Drizzle.service.ts
nav_order: 2
parent: "@beep/drizzle"
---

## Drizzle.service.ts overview

Product-neutral Drizzle execution service.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DrizzleClient (interface)](#drizzleclient-interface)
  - [DrizzleRows (type alias)](#drizzlerows-type-alias)
- [schemas](#schemas)
  - [DrizzleRows](#drizzlerows)
- [services](#services)
  - [Drizzle (class)](#drizzle-class)
  - [DrizzleShape (interface)](#drizzleshape-interface)
---

# models

## DrizzleClient (interface)

Narrow adapter accepted by `Drizzle.makeLayer`.

The adapter is intentionally product-neutral: composition decides whether it
is backed by Postgres or another database runtime.

**Example**

```ts
import type { DrizzleClient } from "@beep/drizzle"
import { Effect } from "effect"

const client: DrizzleClient = {
  execute: () => Effect.succeed([]),
  withTransaction: (use) => use(client)
}

console.log(client)
```

**Signature**

```ts
export interface DrizzleClient {
  readonly execute: (statement: string, parameters: ReadonlyArray<unknown>) => Effect.Effect<DrizzleRows, DrizzleError>;
  readonly withTransaction: <A, R>(
    use: (transaction: DrizzleClient) => Effect.Effect<A, DrizzleError, R>
  ) => Effect.Effect<A, DrizzleError, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/Drizzle.service.ts#L75)

Since v0.0.0

## DrizzleRows (type alias)

Type for `DrizzleRows`.

**Example**

```ts
import type { DrizzleRows } from "@beep/drizzle"

const rows: DrizzleRows = []
console.log(rows)
```

**Signature**

```ts
type DrizzleRows = typeof DrizzleRows.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/Drizzle.service.ts#L51)

Since v0.0.0

# schemas

## DrizzleRows

Schema for rows returned by a product-neutral Drizzle adapter.

**Example**

```ts
import { DrizzleRows } from "@beep/drizzle"
import * as S from "effect/Schema"

const rows = S.decodeUnknownSync(DrizzleRows)([])
console.log(rows)
```

**Signature**

```ts
declare const DrizzleRows: AnnotatedSchema<S.$Array<S.Unknown>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/Drizzle.service.ts#L31)

Since v0.0.0

# services

## Drizzle (class)

Effect service for product-neutral Drizzle execution.

**Example**

```ts
import { Drizzle } from "@beep/drizzle"

const tag = Drizzle
console.log(tag)
```

**Signature**

```ts
declare class Drizzle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/Drizzle.service.ts#L128)

Since v0.0.0

## DrizzleShape (interface)

Runtime shape exposed by the `Drizzle` service.

**Example**

```ts
import type { DrizzleShape } from "@beep/drizzle"
import { Effect } from "effect"

const service: DrizzleShape = {
  execute: () => Effect.succeed([]),
  withTransaction: (use) => use(service)
}

console.log(service)
```

**Signature**

```ts
export interface DrizzleShape {
  readonly execute: (statement: string, parameters: ReadonlyArray<unknown>) => Effect.Effect<DrizzleRows, DrizzleError>;
  readonly withTransaction: <A, R>(
    use: (transaction: DrizzleShape) => Effect.Effect<A, DrizzleError, R>
  ) => Effect.Effect<A, DrizzleError, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/Drizzle.service.ts#L101)

Since v0.0.0