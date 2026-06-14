---
title: Wink.service.ts
nav_order: 5
parent: "@beep/wink"
---

## Wink.service.ts overview

Wink runtime engine service.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [WinkEngineLive](#winkenginelive)
- [models](#models)
  - [InstanceId](#instanceid)
  - [InstanceId (type alias)](#instanceid-type-alias)
  - [WinkEngineRuntimeState (type alias)](#winkengineruntimestate-type-alias)
  - [WinkEngineState (class)](#winkenginestate-class)
- [services](#services)
  - [WinkEngine (class)](#winkengine-class)
---

# layers

## WinkEngineLive

Live layer that loads `wink-nlp` with the bundled English lite web model.

**Example**

```ts
import { Effect } from "effect"
import { WinkEngine, WinkEngineLive } from "@beep/wink"

const readRuntimeHelpers = Effect.gen(function* () {
  const engine = yield* WinkEngine
  return yield* engine.as
})

Effect.runPromise(readRuntimeHelpers.pipe(Effect.provide(WinkEngineLive))).then((helpers) =>
  console.log(Object.keys(helpers).length)
)
```

**Signature**

```ts
declare const WinkEngineLive: Layer.Layer<WinkEngine, WinkEngineError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.service.ts#L307)

Since v0.0.0

# models

## InstanceId

Branded runtime identifier for one initialized wink engine instance.

**Example**

```ts
import * as S from "effect/Schema"
import { InstanceId } from "@beep/wink"

const instanceId = S.decodeSync(InstanceId)("wink-engine-example-1")
console.log(instanceId)
```

**Signature**

```ts
declare const InstanceId: AnnotatedSchema<S.brand<S.NonEmptyString, "InstanceId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.service.ts#L54)

Since v0.0.0

## InstanceId (type alias)

Runtime TypeScript type produced by the `InstanceId` schema.

**Example**

```ts
import { InstanceId } from "@beep/wink"
import type { InstanceId as InstanceIdType } from "@beep/wink"

const instanceId: InstanceIdType = InstanceId.make("wink-engine-example-2")
console.log(instanceId)
```

**Signature**

```ts
type InstanceId = typeof InstanceId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.service.ts#L76)

Since v0.0.0

## WinkEngineRuntimeState (type alias)

In-memory state held by the live wink engine ref.

**Example**

```ts
import { Effect, Ref } from "effect"
import { WinkEngine, WinkEngineLive } from "@beep/wink"
import type { WinkEngineRuntimeState } from "@beep/wink"

const readState = Effect.gen(function* () {
  const engine = yield* WinkEngine
  const ref = yield* engine.getRef
  return yield* Ref.get(ref)
}).pipe(Effect.provide(WinkEngineLive))

Effect.runPromise(readState).then((state: WinkEngineRuntimeState) =>
  console.log(state.instanceId)
)
```

**Signature**

```ts
type WinkEngineRuntimeState = {
  readonly customEntities: O.Option<WinkEngineCustomEntities>;
  readonly instanceId: InstanceId;
  readonly nlp: WinkMethods;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.service.ts#L136)

Since v0.0.0

## WinkEngineState (class)

Serializable metadata for the current wink runtime and learned entity set.

**Example**

```ts
import * as O from "effect/Option"
import { InstanceId, WinkEngineState } from "@beep/wink"

const state = WinkEngineState.make({
  customEntities: O.none(),
  instanceId: InstanceId.make("wink-engine-example-3")
})

console.log(state.customEntities._tag)
```

**Signature**

```ts
declare class WinkEngineState
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.service.ts#L97)

Since v0.0.0

# services

## WinkEngine (class)

Service tag for direct access to the loaded `wink-nlp` runtime.

**Example**

```ts
import { Effect } from "effect"
import { WinkEngine, WinkEngineLive } from "@beep/wink"

const tokenCount = Effect.gen(function* () {
  const engine = yield* WinkEngine
  return yield* engine.getWinkTokenCount("Wink engine counts these tokens.")
})

Effect.runPromise(tokenCount.pipe(Effect.provide(WinkEngineLive))).then(console.log)
```

**Signature**

```ts
declare class WinkEngine
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/Wink.service.ts#L284)

Since v0.0.0