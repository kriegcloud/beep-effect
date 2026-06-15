---
title: WinkEngineRef.service.ts
nav_order: 8
parent: "@beep/wink"
---

## WinkEngineRef.service.ts overview

Compatibility service exposing the shared live wink runtime ref.

Since v0.0.0

---
## Exports Grouped by Category
- [identifiers](#identifiers)
  - [InstanceId](#instanceid)
- [layers](#layers)
  - [WinkEngineRefLive](#winkenginereflive)
- [models](#models)
  - [WinkEngineRuntimeState (type alias)](#winkengineruntimestate-type-alias)
  - [WinkEngineState](#winkenginestate)
- [services](#services)
  - [WinkEngineRef (class)](#winkengineref-class)
---

# identifiers

## InstanceId

Branded schema for live wink engine instance identifiers.

**Example**

```ts
import { InstanceId } from "@beep/wink"

const instanceId = InstanceId.make("wink-engine-example-1")
console.log(instanceId)
```

**Signature**

```ts
declare const InstanceId: AnnotatedSchema<brand<NonEmptyString, "InstanceId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkEngineRef.service.ts#L135)

Since v0.0.0

# layers

## WinkEngineRefLive

Live compatibility layer backed by the shared wink engine runtime.

**Example**

```ts
import { Effect, Layer, Ref } from "effect"
import { WinkEngineLive } from "@beep/wink"
import { WinkEngineRef, WinkEngineRefLive } from "@beep/wink"

const readInstance = Effect.gen(function* () {
  const ref = yield* WinkEngineRef
  const state = yield* Ref.get(ref.getRef())
  return state.instanceId
})

Effect.runPromise(
  readInstance.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
).then(console.log)
```

**Signature**

```ts
declare const WinkEngineRefLive: Layer.Layer<WinkEngineRef, never, WinkEngineService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkEngineRef.service.ts#L97)

Since v0.0.0

# models

## WinkEngineRuntimeState (type alias)

Runtime state stored inside the shared wink engine ref.

**Example**

```ts
import { Effect, Layer, Ref } from "effect"
import type { WinkEngineRuntimeState } from "@beep/wink"
import { WinkEngineLive } from "@beep/wink"
import { WinkEngineRef, WinkEngineRefLive } from "@beep/wink"

const readState = Effect.gen(function* () {
  const ref = yield* WinkEngineRef
  return yield* Ref.get(ref.getRef())
}).pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))

Effect.runPromise(readState).then((state) => console.log(state.instanceId))
```

**Signature**

```ts
type WinkEngineRuntimeState = WinkEngineRuntimeStateType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkEngineRef.service.ts#L120)

Since v0.0.0

## WinkEngineState

Serializable schema for wink engine state metadata.

**Example**

```ts
import * as O from "effect/Option"
import { InstanceId, WinkEngineState } from "@beep/wink"

const state = WinkEngineState.make({
  customEntities: O.none(),
  instanceId: InstanceId.make("wink-engine-example-1")
})

console.log(state.instanceId)
```

**Signature**

```ts
declare const WinkEngineState: typeof WinkEngineStateService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkEngineRef.service.ts#L155)

Since v0.0.0

# services

## WinkEngineRef (class)

Compatibility service for reading the live wink runtime ref and updating custom entities.

**Example**

```ts
import { Effect, Layer, Ref } from "effect"
import { WinkEngineLive } from "@beep/wink"
import { WinkEngineRef, WinkEngineRefLive } from "@beep/wink"

const program = Effect.gen(function* () {
  const ref = yield* WinkEngineRef
  const stateRef = ref.getRef()
  const state = yield* Ref.get(stateRef)
  return state.instanceId
})

Effect.runPromise(
  program.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
).then(console.log)
```

**Signature**

```ts
declare class WinkEngineRef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/WinkEngineRef.service.ts#L72)

Since v0.0.0