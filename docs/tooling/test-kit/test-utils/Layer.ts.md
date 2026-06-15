---
title: Layer.ts
nav_order: 2
parent: "@beep/test-utils"
---

## Layer.ts overview

Reusable Effect layer helpers for tests.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [provideScopedLayer](#providescopedlayer)
---

# layers

## provideScopedLayer

Provide a layer to an effect inside a scoped lifetime.

This is the test-friendly counterpart to `Effect.provide` for layers that
allocate resources and need their finalizers to run after the assertion body.

**Example**

```ts
import { provideScopedLayer } from "@beep/test-utils"
import { Effect, Layer } from "effect"

const layer = Layer.empty
const program = Effect.void.pipe(provideScopedLayer(layer))
console.log(program)
```

**Signature**

```ts
declare const provideScopedLayer: <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/test-kit/test-utils/src/Layer.ts#L30)

Since v0.0.0