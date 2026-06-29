---
name: effect-layer-map-v4
description: "Effect v4 LayerMap patterns for keyed, cached, auto-evicting Layer instances backed by RcMap. Use when working with LayerMap.Service, LayerMap.make, per-tenant/per-org resource caching, or multi-tenant service isolation. Triggers on LayerMap.Service, LayerMap.make, LayerMap, .get(key), .invalidate, .provide, idleTimeToLive, per-org, per-tenant."
---

# Effect LayerMap (v4)

## Core Concept

LayerMap is a keyed cache of Layers backed by RcMap. Given a lookup
function `(key: K) => Layer<I, E>`, it lazily builds, caches, and
auto-evicts Layer instances per key. Common use case: per-tenant or
per-org service instances (e.g., one HTTP client per organization).

## Defining a LayerMap Service

```ts
import { Layer, LayerMap } from "effect";

class PoolMap extends LayerMap.Service<PoolMap>()("PoolMap", {
  lookup: (tenantId: string) => Layer.effect(Pool, makePool(tenantId)),
  idleTimeToLive: "30 minutes",
  dependencies: [DatabaseConfig.layer],
}) {}
```

`LayerMap.Service<Self>()(id, options)` produces a class that is both
a `ServiceMap.ServiceClass` (context tag) and a holder of static
convenience methods.

Options:

- `lookup: (key: K) => Layer<I, E, R>` — factory that builds a Layer
  per key. Called once per key, result cached.
- `idleTimeToLive?: Duration.Input` — how long an idle entry lives
  before auto-eviction.
- `dependencies?: Layer[]` — layers to provide into `lookup` at
  construction time.

## Static Members

The class gets these static members automatically:

| Member             | Type                                                                        | Description                                            |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------ |
| `.layer`           | `Layer<Self, DepsError \| LE, Exclude<R, DepsSuccess> \| DepsRequirements>` | Provides the LayerMap with dependencies resolved       |
| `.layerNoDeps`     | `Layer<Self, LE, R>`                                                        | Provides the LayerMap without dependency resolution    |
| `.get(key)`        | `Layer<I, E, Self>`                                                         | Returns a Layer for the key (requires Self in context) |
| `.services(key)`   | `Effect<ServiceMap<I>, E, Scope \| Self>`                                   | Raw ServiceMap access                                  |
| `.invalidate(key)` | `Effect<void, never, Self>`                                                 | Forces rebuild on next access                          |

`DepsSuccess`, `DepsError`, and `DepsRequirements` refer to the
success, error, and requirement types of the `dependencies` layers.

## Instance Members

When you hold an instance (e.g., from `yield* PoolMap`):

| Member             | Type                              | Description                                 |
| ------------------ | --------------------------------- | ------------------------------------------- |
| `.get(key)`        | `Layer<I, E>`                     | Layer for the key (no context requirements) |
| `.services(key)`   | `Effect<ServiceMap<I>, E, Scope>` | Raw ServiceMap                              |
| `.invalidate(key)` | `Effect<void>`                    | Force rebuild                               |

The critical difference: **static `.get(key)`** requires `Self` in
context (it reads the map from context first). **Instance `.get(key)`**
has no context requirement (the map is already in hand).

## Consumer Patterns

### Pattern 1: Static `.get` (built-in)

The standard approach. Requires the LayerMap service in context:

```ts
const program = Effect.gen(function*() {
  const result = yield* queryUsers.pipe(
    Effect.provide(PoolMap.get("acme")),
  );
});

// Provide PoolMap itself at the top level
const main = program.pipe(Effect.provide(PoolMap.layer));
```

### Pattern 2: Custom `.provide` method (userland convenience)

Define a static method on the subclass that resolves the key from
context (e.g., current user's org):

```ts
class KlaviyoClientMap extends LayerMap.Service<KlaviyoClientMap>()(
  "KlaviyoClientMap",
  {
    idleTimeToLive: "30 minutes",
    dependencies: [IntegrationRepo.layer, WorkerClient.layer],
    lookup: (orgId: OrgId) => Layer.effect(KlaviyoClient, makeKlaviyoClient(orgId)),
  },
) {
  static provide = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    Effect.gen(function*() {
      const currentUser = yield* Policy.CurrentUserWithOrg;
      const map = yield* KlaviyoClientMap;
      return yield* Effect.provide(
        effect,
        map.get(currentUser.internalOrgId),
      );
    });
}
```

Used as a trailing pipe operator:

```ts
const html = yield * Effect.gen(function*() {
  const klaviyoClient = yield* KlaviyoClient;
  return yield* klaviyoClient.renderTemplate({
    templateId,
    context: content,
  });
}).pipe(KlaviyoClientMap.provide);
```

This is NOT built into LayerMap. It is a convenience method that:

1. Gets the current user (or other context) to determine the key
2. Yields the LayerMap instance from context
3. Calls instance `.get(key)` (returns `Layer<I, E>`, no Self needed)
4. Provides that layer to the wrapped effect

### Services that depend on a LayerMap-managed client

When building a `ServiceMap.Service` that uses a LayerMap-managed
client (e.g., `KlaviyoClient` from `KlaviyoClientMap`):

The service method yields the inner client directly. The consumer
provides it through the LayerMap:

```ts
class EmailContentRenderer extends ServiceMap.Service<EmailContentRenderer>()(
  "@org/experiments/EmailContentRenderer",
  {
    make: Effect.gen(function*() {
      const templateRepo = yield* KlaviyoTemplateRepo;

      const render = Effect.fnUntraced(function*(params: {
        readonly organizationId: OrgId;
        readonly templateId: KlaviyoTemplateId;
      }) {
        const klaviyoClient = yield* KlaviyoClient;
        // ... use klaviyoClient ...
      });

      return { render };
    }),
  },
) {
  static layer = Layer.effect(this, this.make).pipe(
    Layer.provide(KlaviyoTemplateRepo.layer),
  );
}
```

At the call site, the consumer wraps with `.provide`:

```ts
yield * emailContentRenderer.render({
  organizationId: currentUser.internalOrgId,
  templateId: variant.templateId,
}).pipe(KlaviyoClientMap.provide);
```

The RPC handler's layer includes `KlaviyoClientMap.layer` to satisfy
the requirement.

Do NOT capture the LayerMap instance in `make` and call
`.get(key)` inside the service method. The whole point of the LayerMap
pattern is that the consumer does `.provide`.

## Testing

### Mocking a LayerMap with `LayerMap.make`

Use `LayerMap.make` with a constant lookup that ignores the key:

```ts
import * as LayerMap from "effect/LayerMap";

const mockKlaviyoClientMap = Layer.effect(
  KlaviyoClientMap,
  LayerMap.make(() =>
    Layer.succeed(KlaviyoClient, {
      renderTemplate: () => Effect.succeed(mockRendered),
      // ... other methods ...
    }) as Layer.Layer<KlaviyoClient, KlaviyoNotConnected>
  ),
);
```

The `as Layer.Layer<KlaviyoClient, KlaviyoNotConnected>` widens the
error type from `never` to match the real LayerMap's error channel.

### Testing services that use the inner client directly

When the service yields `KlaviyoClient` (not `KlaviyoClientMap`),
tests provide the mock client directly without needing LayerMap:

```ts
const mockClient = Layer.succeed(KlaviyoClient, {
  renderTemplate: () => Effect.succeed(mockRendered),
  // ...
});

const testLayer = Layer.mergeAll(
  Layer.effect(EmailContentRenderer, EmailContentRenderer.make).pipe(
    Layer.provide(mockTemplateRepo),
  ),
  mockClient,
);

it.effect("renders content", () =>
  Effect.gen(function*() {
    const renderer = yield* EmailContentRenderer;
    const result = yield* renderer.render({ ... });
    expect(result.html).toBe("<p>rendered</p>");
  }).pipe(Effect.provide(testLayer)));
```

This is simpler and avoids mocking the LayerMap entirely.

## LayerMap.make (low-level constructor)

For advanced use or tests, `LayerMap.make` creates a raw `LayerMap`
instance:

```ts
const make: <
  K,
  L extends Layer.Layer<any, any, any>,
  PreloadKeys extends Iterable<K> | undefined = undefined,
>(
  lookup: (key: K) => L,
  options?: {
    readonly idleTimeToLive?: Duration.Input | undefined;
    readonly preloadKeys?: PreloadKeys;
  } | undefined,
) => Effect.Effect<
  LayerMap<K, Layer.Success<L>, Layer.Error<L>>,
  PreloadKeys extends undefined ? never : Layer.Error<L>,
  Scope.Scope | Layer.Services<L>
>;
```

Returns an Effect (needs Scope for resource management). Wrap with
`Layer.effect(MyMapTag, LayerMap.make(...))` to produce a Layer.
If you omit `preloadKeys`, the error channel is `never`.

## Quick Reference

| Task                               | Pattern                                                             |
| ---------------------------------- | ------------------------------------------------------------------- |
| Define a keyed service map         | `class Foo extends LayerMap.Service<Foo>()("Foo", { lookup, ... })` |
| Provide inner service at call site | `effect.pipe(FooMap.provide)`                                       |
| Provide via static get             | `Effect.provide(effect, FooMap.get(key))`                           |
| Invalidate cached entry            | `FooMap.invalidate(key)`                                            |
| Wire into layer graph              | `Layer.provide([..., FooMap.layer])`                                |
| Mock in tests (full)               | `Layer.effect(FooMap, LayerMap.make(() => mockLayer))`              |
| Mock in tests (skip map)           | `Layer.succeed(InnerService, mockImpl)`                             |
| Custom key resolver                | `static provide = <A,E,R>(effect) => Effect.gen(...)`               |
