---
name: effect-services
description: >
  Creating services with ServiceMap.Service, IdentityComposer keys, and Layer composition.
  Trigger on: new service, service definition, Layer wiring, dependency injection, ServiceMap.
version: 0.1.0
status: active
---

# Creating a Service (Effect v4)

## Step 1: Create the Identity

Every service needs a unique key from `@beep/identity`. Never use plain strings.

```ts
// WHY: IdentityComposer produces branded strings with compile-time path validation.
// The tagged template literal validates segment characters at runtime.
import { make } from "@beep/identity"

const $Id = make("beep").$BeepId.create("myDomain")
//                 ↑ base         ↑ compose = returns IdentityComposer for sub-paths
```

## Step 2: Define the Service Class

Use `ServiceMap.Service<Self, Shape>()(identityKey)`. Note: type params FIRST, then key in second call.

```ts
import { Effect, ServiceMap, Layer } from "effect"

// WHY: Class syntax gives you a nominal type (Self) + the service shape in one declaration.
// The $Id template tag produces "@beep/myDomain/Notifications" as a branded IdentityString.
class Notifications extends ServiceMap.Service<Notifications, {
  readonly notify: (msg: string) => Effect.Effect<void>
}>()($Id`Notifications`) {}
```

## Step 3: Add the Constructor

Use the `make` option for effectful construction. Do NOT use `dependencies` — it does not exist in v4.

```ts
class Notifications extends ServiceMap.Service<Notifications, {
  readonly notify: (msg: string) => Effect.Effect<void>
}>()($Id`Notifications`, {
  // WHY: `make` stores the constructor on the class but does NOT auto-generate a Layer.
  make: Effect.gen(function*() {
    const config = yield* AppConfig
    return {
      notify: (msg) => Effect.log(`[${config.prefix}] ${msg}`)
    }
  })
}) {
  // WHY: Explicit layer construction. Wire deps with Layer.provide, not `dependencies`.
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(AppConfig.layer)
  )
}
```

## Step 4: Consume the Service

Prefer `yield*` over `.use()` — it makes dependencies visible at the call site.

```ts
// WHY: yield* in Effect.fn makes the Notifications dependency appear in the R channel.
const sendWelcome = Effect.fn("sendWelcome")(function*(userId: string) {
  const notifications = yield* Notifications
  yield* notifications.notify(`Welcome ${userId}`)
})
```

## Step 5: Compose Layers

Wire the full dependency graph at the application entry point.

```ts
// WHY: MemoMap deduplicates layers by reference. Same const = built once.
// No intermediate bundles needed — just provide each layer directly.
const AppLayer = Layer.mergeAll(
  Notifications.layer,
  UserService.layer
)

const program = myEffect.pipe(Effect.provide(AppLayer))
```

## Verify

1. `yield* ServiceName` compiles — the R channel includes the service.
2. `Layer.effect(Service, Service.make)` compiles — shape matches.
3. No `Context.Tag`, `Effect.Tag`, `Effect.Service`, or `.Default` anywhere in your code.
4. All service keys use `$Id\`Name\`` template tags, not string literals.
