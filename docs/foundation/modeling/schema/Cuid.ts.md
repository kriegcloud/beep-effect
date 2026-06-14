---
title: Cuid.ts
nav_order: 44
parent: "@beep/schema"
---

## Cuid.ts overview

CUID schema and deterministic seed services.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Cuid](#cuid)
  - [CuidState (class)](#cuidstate-class)
  - [cuid](#cuid-1)
- [models](#models)
  - [Cuid (type alias)](#cuid-type-alias)
  - [CuidSeed (type alias)](#cuidseed-type-alias)
- [predicates](#predicates)
  - [isCuid](#iscuid)
- [utilities](#utilities)
  - [sha512](#sha512)
---

# constructors

## Cuid

Branded schema for canonical CUID strings.

**Example**

```ts
import * as Schema from "effect/Schema"
import { Cuid } from "@beep/schema/Cuid"

const id = Schema.decodeUnknownSync(Cuid)("a123")
console.log(id)
```

**Signature**

```ts
declare const Cuid: Schema.brand<Schema.String, "@typed/id/CUID">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Cuid.ts#L52)

Since v0.0.0

## CuidState (class)

Service that produces deterministic CUID seeds.

**Example**

```ts
import { CuidState } from "@beep/schema/Cuid"

console.log(CuidState.Default)
```

**Signature**

```ts
declare class CuidState
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Cuid.ts#L123)

Since v0.0.0

## cuid

Effect that generates a branded `Cuid`.

**Example**

```ts
import { Effect } from "effect"
import { cuid, CuidState } from "@beep/schema/Cuid"

const id = Effect.runPromise(cuid.pipe(Effect.provide(CuidState.Default)))
console.log(id)
```

**Signature**

```ts
declare const cuid: Effect.Effect<string & Brand<"@typed/id/CUID">, never, CuidState>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Cuid.ts#L177)

Since v0.0.0

# models

## Cuid (type alias)

Type for `Cuid`.

**Example**

```ts
import type { Cuid } from "@beep/schema/Cuid"

const id = "a123" as Cuid
console.log(id)
```

**Signature**

```ts
type Cuid = Schema.Schema.Type<typeof Cuid>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Cuid.ts#L71)

Since v0.0.0

## CuidSeed (type alias)

Seed data used to produce a deterministic CUID value.

**Example**

```ts
import type { CuidSeed } from "@beep/schema/Cuid"

const seed: CuidSeed = { timestamp: 1, counter: 0, random: new Uint8Array([1]), fingerprint: "node" }
console.log(seed.counter)
```

**Signature**

```ts
type CuidSeed = {
  readonly timestamp: number;
  readonly counter: number;
  readonly random: Uint8Array;
  readonly fingerprint: string;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Cuid.ts#L103)

Since v0.0.0

# predicates

## isCuid

Type guard for `Cuid`.

**Example**

```ts
import { isCuid } from "@beep/schema/Cuid"

console.log(isCuid("a123"))
```

**Signature**

```ts
declare const isCuid: (value: string) => value is Cuid
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Cuid.ts#L86)

Since v0.0.0

# utilities

## sha512

Produces a SHA-512 digest for the provided buffer source.

**Example**

```ts
import { Effect } from "effect"
import { sha512 } from "@beep/schema/Cuid"

const digest = Effect.runPromise(sha512(new TextEncoder().encode("beep")))
console.log(digest)
```

**Signature**

```ts
declare const sha512: (data: BufferSource) => Effect.Effect<Uint8Array<ArrayBuffer>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Cuid.ts#L28)

Since v0.0.0