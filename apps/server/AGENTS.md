# Server AGENTS.md

> See root `/AGENTS.md` for monorepo conventions.

## Commands

| Command                                        | Purpose                  |
| ---------------------------------------------- | ------------------------ |
| `bun dev --filter=server`                      | Start server (port 9000) |
| `bun test --filter=server`                     | Run server tests         |
| `bun test --filter=server -- src/file.test.ts` | Run single test          |

## Effect Service Pattern

```typescript
// Define service with Effect.Service
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () {
    // Initialize dependencies
    const ref = yield* Ref.make(initialState);
    const pubsub = yield* PubSub.unbounded<Event>();

    return {
      // Methods return Effect, use Effect.gen internally
      getData: () =>
        Effect.gen(function* () {
          return yield* Ref.get(ref);
        }),
      subscribe: () => PubSub.subscribe(pubsub),
    };
  }),
}) {}

// Use MyService.Default as Layer
```

## RPC Implementation Pattern

```typescript
// HTTP RPC (request/response or streaming)
const MyRpcLive = MyRpc.toLayer(
  Effect.gen(function* () {
    const service = yield* MyService; // Access dependency via yield*

    return {
      // Use Effect.fn for handlers
      myMethod: Effect.fn(function* (payload) {
        return yield* service.getData();
      }),

      // Streaming: return Mailbox
      myStream: Effect.fn(function* (payload) {
        const mailbox = yield* Mailbox.make<Event>();

        yield* Effect.forkScoped(
          Effect.gen(function* () {
            yield* mailbox.offer({ _tag: "start" });
            // ... send events
            yield* mailbox.offer({ _tag: "end" });
          }).pipe(Effect.ensuring(mailbox.end)) // Always cleanup!
        );

        return mailbox;
      }),
    };
  })
);
```

## Layer Composition

```typescript
// 1. Create router with RPC group
const HttpRpcRouter = RpcServer.layerHttpRouter({
  group: EventRpc,
  path: "/rpc",
  protocol: "http", // or "websocket" for real-time
}).pipe(
  Layer.provide(MyRpcLive), // Provide RPC implementation
  Layer.provide(MyService.Default), // Provide service dependencies
  Layer.provide(RpcSerialization.layerNdjson)
);

// 2. Merge routers
const AllRouters = Layer.mergeAll(ApiRouter, HttpRpcRouter, WebSocketRouter);

// 3. Serve with configuration
HttpLayerRouter.serve(AllRouters).pipe(
  Layer.provide(BunHttpServer.layerConfig(ServerConfig)),
  Layer.launch
);
```

## Concurrency Patterns

| Primitive | Purpose             | Usage                                    |
| --------- | ------------------- | ---------------------------------------- |
| `Ref`     | Mutable state       | `yield* Ref.make(...)`, `Ref.update()`   |
| `PubSub`  | Broadcasting        | `PubSub.publish()`, `PubSub.subscribe()` |
| `Mailbox` | Streaming responses | `mailbox.offer()`, return from RPC       |
| `Stream`  | Process sequences   | `Stream.fromQueue()`, `Stream.tap()`     |

## Key Patterns

- **Always `yield*`**: Unwrap every Effect value in generators
- **`Effect.fn`**: Wrap RPC handlers (handles generator boilerplate)
- **`Effect.forkScoped`**: Background tasks tied to request lifecycle
- **`Effect.ensuring`**: Guaranteed cleanup (mailbox.end, unsubscribe)
- **Layer.provide order**: Dependencies before dependents

## Configuration

```typescript
const ServerConfig = Config.all({
  port: Config.number("PORT").pipe(Config.withDefault(9000)),
  hostname: Config.string("HOST").pipe(Config.withDefault("0.0.0.0")),
});
```

---

_This document is a living guide. Update it as the project evolves and new
patterns emerge._
