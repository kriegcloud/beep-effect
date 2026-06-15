---
title: AbortSignal.ts
nav_order: 1
parent: "@beep/schema"
---

## AbortSignal.ts overview

AbortSignal schema.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AbortSig (type alias)](#abortsig-type-alias)
- [validation](#validation)
  - [AbortSig](#abortsig)
  - [isAbortSignal](#isabortsignal)
---

# models

## AbortSig (type alias)

{@inheritDoc AbortSig}

**Example**

```ts
import type { AbortSig } from "@beep/schema/AbortSignal"

const handler = (signal: AbortSig) => signal.aborted
```

**Signature**

```ts
type AbortSig = typeof AbortSig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/AbortSignal.ts#L65)

Since v0.0.0

# validation

## AbortSig

Declared schema for `AbortSignal` instances.

**Example**

```ts
import * as S from "effect/Schema"
import { AbortSig } from "@beep/schema/AbortSignal"

const controller = new AbortController()
const signal = S.decodeUnknownSync(AbortSig)(controller.signal)
console.log(signal.aborted) // false
```

**Signature**

```ts
declare const AbortSig: AnnotatedSchema<S.declare<AbortSignal, AbortSignal>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/AbortSignal.ts#L46)

Since v0.0.0

## isAbortSignal

Type guard that checks whether a value is an `AbortSignal` instance.

**Example**

```ts
import { isAbortSignal } from "@beep/schema/AbortSignal"

const controller = new AbortController()
console.log(isAbortSignal(controller.signal)) // true
console.log(isAbortSignal("nope")) // false
```

**Signature**

```ts
declare const isAbortSignal: (u: unknown) => u is AbortSignal
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/AbortSignal.ts#L28)

Since v0.0.0