---
name: effect-rpc-v4
description: Effect RPC v4 patterns for defining procedures, groups, handlers, clients, middleware, streaming, and transports. Use when working with effect/unstable/rpc, Rpc.make, RpcGroup, RpcServer, RpcClient, RpcMiddleware, or RpcSerialization in Effect v4. Triggers on effect/unstable/rpc, Rpc.make, RpcGroup.make, RpcServer, RpcClient, RpcMiddleware, RpcSchema.Stream.
---

# Effect RPC (v4 / effect-smol)

Everything lives in `effect/unstable/rpc`. Source modules: `Rpc`, `RpcGroup`, `RpcClient`, `RpcServer`, `RpcMiddleware`, `RpcSchema`, `RpcSerialization`, `RpcMessage`, `RpcClientError`, `RpcTest`.

## Imports

```ts
import { Effect, Layer, Option, Queue, Schema, ServiceMap, Stream } from "effect";
import { Headers } from "effect/unstable/http";
import {
  Rpc,
  RpcClient,
  RpcGroup,
  RpcMiddleware,
  RpcSchema,
  RpcSerialization,
  RpcServer,
  RpcTest,
} from "effect/unstable/rpc";
import type { RpcClientError } from "effect/unstable/rpc/RpcClientError";
import { RequestId } from "effect/unstable/rpc/RpcMessage";
```

## Defining RPCs

### `Rpc.make`

```ts
class GetUser extends Rpc.make("GetUser", {
  success: User,
  payload: { id: Schema.String },
}) {}

Rpc.make("SimpleVoid");

Rpc.make("WithError", {
  success: Schema.String,
  error: MyError,
  payload: { id: Schema.String },
});

Rpc.make("MyStream", {
  success: User,
  stream: true,
  payload: { id: Schema.String },
});

Rpc.make("ProduceDefectCustom", {
  defect: Schema.DefectWithStack,
});
```

`Rpc.make(tag, options?)` is the primary constructor:

- `payload` accepts raw `Schema.Struct.Fields` (auto-wrapped into `Schema.Struct`)
- `success` defaults to `Schema.Void`, `error` defaults to `Schema.Never`
- `stream: true` wraps success/error into `RpcSchema.Stream` internally. The RPC-level error becomes `Schema.Never` (stream errors live inside the stream)
- `defect` defaults to `Schema.Defect`. Use `Schema.DefectWithStack` to preserve full Error objects (name, message, stack) through serialization
- The `class ... extends Rpc.make(...)` pattern gives a class constructor for the payload
- Dotted tags are still single keys on the client object: `Rpc.make("nested.test")` becomes `client["nested.test"]()`

### Rpc fluent methods

```ts
Rpc.make("TimedMethod", { payload: { shouldFail: Schema.Boolean }, success: Schema.Number })
  .middleware(TimingMiddleware);
```

Available: `.setSuccess()`, `.setError()`, `.setPayload()`, `.middleware()`, `.prefix()`, `.annotate()`, `.annotateMerge()`.

## RPC Groups

```ts
export const UserRpcs = RpcGroup.make(
  GetUser,
  Rpc.make("GetUserOption", {
    success: Schema.Option(User),
    payload: { id: Schema.String },
  }),
  StreamUsers,
  Rpc.make("GetInterrupts", { success: Schema.Number }),
  Rpc.make("ProduceDefect"),
  Rpc.make("nested.test"),
  Rpc.make("TimedMethod", {
    payload: { shouldFail: Schema.Boolean },
    success: Schema.Number,
  }).middleware(TimingMiddleware),
).middleware(AuthMiddleware);
```

`.middleware(M)` on a group applies to ALL RPCs added before the call. Order matters.

Group methods: `.add()`, `.merge()`, `.middleware()`, `.prefix()`, `.annotate()`, `.annotateRpcs()`, `.toLayer()`, `.toLayerHandler()`, `.accessHandler()`, `.of()`.

## Implementing Handlers

### `group.toLayer`

```ts
const UsersLive = UserRpcs.toLayer(Effect.gen(function*() {
  let interrupts = 0;
  return UserRpcs.of({
    GetUser: (_) => CurrentUser.asEffect().pipe(Rpc.fork),
    GetUserOption: Effect.fnUntraced(function*(req) {
      return Option.some(new User({ id: req.id, name: "John" }));
    }),
    StreamUsers: Effect.fnUntraced(function*(req, _) {
      const queue = yield* Queue.bounded<User>(0);
      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          interrupts++;
        })
      );
      yield* Queue.offer(queue, new User({ id: req.id, name: "John" })).pipe(
        Effect.delay(100),
        Effect.forever,
        Effect.forkScoped,
      );
      return queue;
    }),
    GetInterrupts: () => Effect.sync(() => interrupts),
    ProduceDefect: () => Effect.die("boom"),
    "nested.test": () => Effect.void,
  });
}));
```

`build` argument can be a plain handler object OR an `Effect` that produces one (for stateful setup like closing over mutable counters).

### Handler function signature

```ts
((
  payload: Payload<Current>,
  options: {
    readonly clientId: number;
    readonly requestId: RequestId;
    readonly headers: Headers;
    readonly rpc: Current;
  },
) => ResultFrom<Current, R> | Wrapper<ResultFrom<Current, R>>);
```

Return types:

- Non-stream: `Effect<Success, Error, R>`
- Stream: `Stream<A, E, R>` or `Effect<Queue.Dequeue<A, E | Cause.Done>, ..., R>`
- Wrapped: `Rpc.fork(effect)` (skip concurrency semaphore) or `Rpc.uninterruptible(effect)`

### Single handler

```ts
const TwoHandler = TestGroup.toLayerHandler("two", () => Effect.succeed("two"));
const handler = yield * TestGroup.accessHandler("two").pipe(Effect.provide(TwoHandler));
const result = yield * handler(void 0, {
  clientId: 0,
  requestId: RequestId.make(0),
  headers: Headers.empty,
});
```

## Client Creation

### `RpcClient.make`

```ts
RpcClient.make(group, options?) => Effect<RpcClient<Rpcs, RpcClientError>, never, Protocol | MiddlewareClient | Scope>
```

Requires `RpcClient.Protocol` in context (provided by transport layers).

### Client type shape

Non-stream methods:

```ts
client.GetUser({ id: "1" }) => Effect<User, Unauthorized | RpcClientError>
client.GetUser({ id: "1" }, { headers: { ... }, discard: true }) => Effect<void, ...>
```

Stream methods:

```ts
client.StreamUsers({ id: "1" }); // Stream with stream errors, client errors, and any middleware errors
client.StreamUsers({ id: "1" }, { asQueue: true }); // Queue based consumption with normal end signaled through the queue
```

### Flat client variant

`RpcClient.make(group, { flatten: true })` produces `(tag, payload, options?) => Effect` instead of object with methods.

### Service pattern (recommended)

```ts
export class UsersClient extends ServiceMap.Service<
  UsersClient,
  RpcClient.RpcClient<RpcGroup.Rpcs<typeof UserRpcs>, RpcClientError>
>()("UsersClient") {
  static layer = Layer.effect(UsersClient)(RpcClient.make(UserRpcs)).pipe(
    Layer.provide(AuthClient),
  );
  static layerTest = Layer.effect(UsersClient)(RpcTest.makeClient(UserRpcs)).pipe(
    Layer.provide([UsersLive, AuthLive, TimingLive, AuthClient]),
  );
}
```

### Headers

```ts
RpcClient.withHeaders({ userId: "123" });

yield * client.GetUser({ id: "1" }).pipe(
  RpcClient.withHeaders({ userId: "123" }),
);

client.GetUser({ id: "1" }, { headers: { userId: "123" } });
```

`withHeaders` uses `RpcClient.CurrentHeaders`, a `ServiceMap.Reference`, to propagate headers. Per-call headers are also supported via options.

## Middleware

### Defining middleware

```ts
class AuthMiddleware extends RpcMiddleware.Service<AuthMiddleware, {
  provides: CurrentUser;
}>()("AuthMiddleware", {
  error: Unauthorized,
  requiredForClient: true,
}) {}

class TimingMiddleware extends RpcMiddleware.Service<TimingMiddleware>()("TimingMiddleware") {}
```

Config type parameters (second generic arg to `RpcMiddleware.Service`):

- `provides`: service the middleware provides to handlers
- `requires`: services the middleware itself requires
- `clientError`: error type the client middleware can produce

Runtime options (second positional arg):

- `error`: Schema for errors this middleware can produce (added to error union of all RPCs using it)
- `requiredForClient`: If true, client middleware layer is required

### All middleware wraps the handler effect

In v4, all middleware has the same signature. The first argument is the handler effect, the second is options:

```ts
((effect, options: { clientId; requestId; rpc; payload; headers; }) => Effect);
```

**Provider middleware** (provides a service to handlers):

```ts
const AuthLive = Layer.succeed(AuthMiddleware)(
  AuthMiddleware.of((effect, options) =>
    Effect.provideService(
      effect,
      CurrentUser,
      new User({ id: options.headers.userid ?? "1", name: options.headers.name ?? "Fallback" }),
    )
  ),
);
```

**Observability middleware** (wraps handler with metrics/logging):

```ts
const TimingLive = Layer.succeed(TimingMiddleware)(
  TimingMiddleware.of((effect) =>
    effect.pipe(
      Effect.tap(Metric.update(rpcSuccesses, 1)),
      Effect.tapDefect(() => Metric.update(rpcDefects, 1)),
      Effect.ensuring(Metric.update(rpcCount, 1)),
    )
  ),
);
```

### Applying middleware

Per-RPC: `Rpc.make("TimedMethod", { ... }).middleware(TimingMiddleware)`
Per-group: `RpcGroup.make(...rpcs).middleware(AuthMiddleware)`

### Client middleware

```ts
const AuthClient = RpcMiddleware.layerClient(AuthMiddleware, ({ next, request }) =>
  next({
    ...request,
    headers: Headers.set(request.headers, "name", "Logged in user"),
  }));
```

Client middleware transforms outgoing requests (add headers, tokens). The `next` function sends the modified request to the server. Required when `requiredForClient: true`.

## Streaming RPCs

### Definition

```ts
class StreamUsers extends Rpc.make("StreamUsers", {
  success: User,
  stream: true,
  payload: { id: Schema.String },
}) {}
```

### Handler returns Queue (preferred) or Stream

The recommended pattern uses `Queue.bounded`. Create the queue, fork a scoped processor that offers items, and return the queue:

```ts
StreamUsers: Effect.fnUntraced(function*(req) {
  const queue = yield* Queue.bounded<User>(0);

  yield* processUsers(req).pipe(
    Effect.tap((user) => Queue.offer(queue, user)),
    Effect.ensuring(Queue.shutdown(queue)),
    Effect.forkScoped,
  );

  return queue;
});
```

The queue provides backpressure when the protocol supports acks (WebSocket, TCP). HTTP does not support acks.

### Client consumption

```ts
yield * client.StreamUsers({ id: "1" }).pipe(
  Stream.take(5),
  Stream.runForEach((user) =>
    Effect.sync(() => {
      users.push(user);
    })
  ),
);

const queue = yield * client.StreamUsers({ id: "1" }, { asQueue: true });
```

## Serialization

```ts
import { RpcSerialization } from "effect/unstable/rpc";
```

| Layer                               | Content Type           | Framing | Notes                                         |
| ----------------------------------- | ---------------------- | ------- | --------------------------------------------- |
| `RpcSerialization.layerJson`        | `application/json`     | No      | Use when protocol handles framing (WebSocket) |
| `RpcSerialization.layerNdjson`      | `application/ndjson`   | Yes     | Newline-delimited JSON. For HTTP/TCP          |
| `RpcSerialization.layerMsgPack`     | `application/msgpack`  | Yes     | Binary. Uses `msgpackr`. Most compact         |
| `RpcSerialization.layerJsonRpc()`   | `application/json`     | No      | JSON-RPC 2.0 wire format                      |
| `RpcSerialization.layerNdJsonRpc()` | `application/json-rpc` | Yes     | JSON-RPC 2.0 with newline framing             |

All data goes through `Schema.encode`/`Schema.decode`. Payloads encoded on client, decoded on server. Success/exit schemas follow the reverse path.

## Protocols / Transports

### Server protocol layers

| Function                                     | Transport    | Requirements                        |
| -------------------------------------------- | ------------ | ----------------------------------- |
| `RpcServer.layerProtocolHttp({ path })`      | HTTP POST    | `RpcSerialization`, `HttpRouter`    |
| `RpcServer.layerProtocolWebsocket({ path })` | WebSocket    | `RpcSerialization`, `HttpRouter`    |
| `RpcServer.layerProtocolSocketServer`        | Raw TCP      | `SocketServer`, `RpcSerialization`  |
| `RpcServer.layerProtocolWorkerRunner`        | Worker       | `WorkerRunner.WorkerRunnerPlatform` |
| `RpcServer.layerProtocolStdio`               | Stdin/stdout | `RpcSerialization`, `Stdio`         |

### Client protocol layers

| Function                                  | Transport     | Requirements                              |
| ----------------------------------------- | ------------- | ----------------------------------------- |
| `RpcClient.layerProtocolHttp({ url })`    | HTTP POST     | `HttpClient`, `RpcSerialization`          |
| `RpcClient.layerProtocolSocket()`         | WebSocket/TCP | `Socket.Socket`, `RpcSerialization`       |
| `RpcClient.layerProtocolWorker({ size })` | Worker pool   | `Worker.WorkerPlatform`, `Worker.Spawner` |

### `RpcServer.layer` (most common entry point)

```ts
const RpcLive = RpcServer.layer(UserRpcs, {
  disableFatalDefects: true,
}).pipe(
  Layer.provide([UsersLive, AuthLive, TimingLive]),
);
```

This returns a server layer, but it still needs the protocol layer and the server side handler or middleware dependencies to be provided.

### `RpcServer.layerHttp` (one-line HTTP setup)

```ts
RpcServer.layerHttp({
  group: UserRpcs,
  path: "/rpc",
  protocol: "websocket",
  concurrency: "unbounded",
});
```

### `RpcServer.toHttpEffect` and `HttpRouter.toWebHandler`

```ts
const httpApp = RpcServer.toHttpEffect(UserRpcs).pipe(
  Effect.provide(Layer.mergeAll(UsersLive, AuthLive, TimingLive, RpcSerialization.layerNdjson)),
);

const handler = HttpRouter.toWebHandler(httpApp);
```

### Full HTTP wiring example

```ts
const HttpServerLive = HttpRouter.Default.serve().pipe(
  Layer.provide(RpcLive),
  Layer.provideMerge(RpcServer.layerProtocolHttp({ path: "/rpc" })),
);

const HttpClientLive = UsersClient.layer.pipe(
  Layer.provide(
    RpcClient.layerProtocolHttp({
      url: "",
      transformClient: HttpClient.mapRequest(HttpClientRequest.appendUrl("/rpc")),
    }),
  ),
);

const Live = HttpClientLive.pipe(
  Layer.provideMerge(HttpServerLive),
  Layer.provide([NodeHttpServer.layerTest, RpcSerialization.layerNdjson]),
);
```

### WebSocket wiring

```ts
const WsServer = HttpRouter.Default.serve().pipe(
  Layer.provide(RpcLive),
  Layer.provideMerge(RpcServer.layerProtocolWebsocket({ path: "/rpc" })),
);

const WsClient = UsersClient.layer.pipe(
  Layer.provide(RpcClient.layerProtocolSocket()),
  Layer.provide(
    Effect.gen(function*() {
      const server = yield* HttpServer.HttpServer;
      const address = server.address as HttpServer.TcpAddress;
      return NodeSocket.layerWebSocket(`http://127.0.0.1:${address.port}/rpc`);
    }).pipe(Layer.unwrap),
  ),
);
```

## Error Handling

### Error sources

1. **RPC errors**: Defined via `error` in `Rpc.make`. Typed, serialized, survive the wire.
2. **Middleware errors**: Added via `error` on `RpcMiddleware.Service`. Union-ed with RPC errors.
3. **`RpcClientError`**: Protocol-level error. Always in client return types.

```ts
import { RpcClientError } from "effect/unstable/rpc";
```

4. **Defects**: Unhandled `Effect.die()` propagates to ALL pending requests by default. Use `disableFatalDefects: true` in `RpcServer.layer` for per-request failure only.

### Custom defect schema

Use `defect: Schema.DefectWithStack` on `Rpc.make` to preserve full Error objects through serialization:

```ts
Rpc.make("ProduceDefectCustom", { defect: Schema.DefectWithStack });
```

### Defect inspection on client

```ts
const cause = yield * client.ProduceDefect().pipe(
  Effect.sandbox,
  Effect.flip,
);
assert.deepStrictEqual(cause, Cause.die("boom"));
```

## v4 Layer Conventions

In v4, prefer `Layer.succeed` and `Layer.effect`:

```ts
Layer.succeed(Tag)(value);
Layer.effect(Tag)(effect);
```

## Key Differences from v3 (@effect/rpc)

| v3 (@effect/rpc)                     | v4 (effect/unstable/rpc)                                       |
| ------------------------------------ | -------------------------------------------------------------- |
| `import { Rpc } from "@effect/rpc"`  | `import { Rpc } from "effect/unstable/rpc"`                    |
| `Context.Tag` for client service     | `ServiceMap.Service` for client service                        |
| `Layer.succeed(Tag, value)`          | `Layer.succeed(Tag)(value)` (curried)                          |
| `Layer.scoped(Tag, effect)`          | `Layer.effect(Tag)(effect)`                                    |
| `RpcMiddleware.Tag<T>()(name, opts)` | `RpcMiddleware.Service<T, Config>()(name, opts)`               |
| Middleware `failure` option          | Middleware `error` option                                      |
| `wrap: true` + `options.next`        | All middleware wraps the effect directly                       |
| Provider middleware returns value    | Provider middleware calls `Effect.provideService(effect, ...)` |
| `Mailbox.make<T>()` for streaming    | `Queue.bounded<T>(0)` for streaming                            |
| `asMailbox: true` on client          | `asQueue: true` on client                                      |
| `RpcServer.layerHttpRouter`          | `RpcServer.layerHttp`                                          |

## Key Types

| Type                                                      | Purpose                                    |
| --------------------------------------------------------- | ------------------------------------------ |
| `Rpc<Tag, Payload, Success, Error, Middleware, Requires>` | Single RPC procedure definition            |
| `Rpc.Handler<Tag>`                                        | Implemented handler (ServiceMap entry)     |
| `Rpc.ToHandlerFn<Current, R>`                             | Handler function signature                 |
| `Rpc.ResultFrom<R, Context>`                              | What a handler returns (Effect or Stream)  |
| `Rpc.Wrapper<A>`                                          | `Rpc.fork` / `Rpc.uninterruptible` wrapper |
| `RpcGroup<R>`                                             | Group of RPC procedures                    |
| `RpcClient<Rpcs, E>`                                      | Client object (methods per RPC)            |
| `RpcClient.Flat<Rpcs, E>`                                 | Flat client (single function)              |
| `RpcClient.Protocol`                                      | Client transport abstraction               |
| `RpcServer.Protocol`                                      | Server transport abstraction               |
| `RpcSerialization`                                        | Serialization strategy service             |
| `RpcMiddleware.Service`                                   | Middleware definition                      |
| `RpcClientError`                                          | Client protocol error                      |
| `RpcSchema.Stream<A, E>`                                  | Stream schema wrapper                      |
