---
name: effect-services
description: >
  Creating services with Context.Service, IdentityComposer keys, and Layer composition.
  Trigger on: new service, service definition, Layer wiring, dependency injection, Context.
version: 0.1.0
status: active
---

# Creating a Service (Effect v4)

## Step 1: Create the Identity

Every service needs a unique key from `@beep/identity/packages`. Never use plain strings.

```ts
// WHY: IdentityComposer produces branded strings with compile-time path validation.
// The tagged template literal validates segment characters at runtime.
import { $PackageNameId } from "@beep/identity/packages"

const $I = $PackageNameId.create("relative/path/to/file/from/package/src")
//                        ↑ package composer      ↑ file-local composer
```

## Step 2: Define the Service Class

Use `Context.Service<Self, Shape>()(identityKey)`. Note: type params FIRST, then key in second call.

```ts
import { Effect, Context, Layer } from "effect"

// WHY: Class syntax gives you a nominal type (Self) + the service shape in one declaration.
// The $I template tag produces a branded IdentityString under the file-local path.
class Notifications extends Context.Service<Notifications, {
  readonly notify: (msg: string) => Effect.Effect<void>
}>()($I`Notifications`) {}
```

## Step 3: Add the Constructor

Use an explicit constructor effect and `Layer.effect(...)`. Parameterized or reusable constructor functions should be named `Effect.fn("Service.make")`. Zero-arg constructor values may stay `Effect.gen(...).pipe(Effect.withSpan("Service.make"))` to avoid immediate `Effect.fn()` IIFEs.

```ts
const makeNotifications = Effect.gen(function*() {
  const config = yield* AppConfig
  return {
    notify: Effect.fn("Notifications.notify")(function*(msg: string) {
      yield* Effect.annotateCurrentSpan({ message_length: msg.length })
      yield* Effect.logInfo({ message: "notification emitted" }).pipe(
        Effect.annotateLogs({ service: "notifications" })
      )
      return yield* Effect.log(`[${config.prefix}] ${msg}`)
    })
  }
}).pipe(Effect.withSpan("Notifications.make"))

class Notifications extends Context.Service<Notifications, {
  readonly notify: (msg: string) => Effect.Effect<void>
}>()($I`Notifications`) {
  // WHY: Explicit layer construction. Wire deps with Layer.provide, not `dependencies`.
  static layer = Layer.effect(this, makeNotifications).pipe(
    Layer.provide(AppConfig.layer)
  )
}
```

## Step 4: Consume the Service

Prefer `yield*` over `.use()` — it makes dependencies visible at the call site.

Exception: in callback-only APIs (for example `SchemaTransformation.transform*` decode/encode callbacks) where `yield*` is not available, use `Context.Service.use(...)` directly.

```ts
// WHY: yield* in Effect.fn makes the Notifications dependency appear in the R channel.
const sendWelcome = Effect.fn("sendWelcome")(function*(userId: string) {
  const notifications = yield* Notifications
  yield* notifications.notify(`Welcome ${userId}`)
})

const JsoncTextToUnknown = S.String.pipe(
  S.decodeTo(
    S.Unknown,
    SchemaTransformation.transformOrFail({
      decode: (content) => JsoncCodecService.use((service) => service.parseUnknown(content)),
      encode: (value) => Effect.fail(`unsupported encode: ${value}`)
    })
  )
)
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
2. `Layer.effect(Service, constructorEffect)` compiles — shape matches.
3. No `Context.Tag`, `Effect.Tag`, `Effect.Service`, or `.Default` anywhere in your code.
4. All service keys use `$I\`Name\`` template tags, not string literals.
5. Reusable service methods use named `Effect.fn("Service.method")`.
6. Constructor flows are observable with `Effect.withSpan(...)` plus structured log annotations where the path matters.
