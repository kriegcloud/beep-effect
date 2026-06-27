---
name: effect-rpc-testing-v4
description: Effect RPC v4 testing patterns with RpcTest, in-memory transports, handler unit tests, and HTTP integration tests. Use when testing RPC handlers, groups, middleware, streaming RPCs, or writing integration tests for effect/unstable/rpc in Effect v4. Triggers on RpcTest, RpcTest.makeClient, toLayerHandler, accessHandler, RPC test files, effect/unstable/rpc test.
---

# Effect RPC Testing (v4 / effect-smol)

> **See also**: Load the `effect-rpc-v4` skill for RPC API reference. Load the `effect-testing` skill for general Effect testing patterns.

**Key assumption:** In application tests, prefer importing schemas, RPCs, groups, and middleware tags from source code. Inline definitions are still valid for focused library style tests.

## Imports

```ts
import { assert, describe, it } from "@effect/vitest";
import { Cause, Effect, Exit, Fiber, Layer, Option, Queue, ServiceMap, Stream } from "effect";
import { Headers } from "effect/unstable/http";
import {
  Rpc,
  RpcClient,
  RpcGroup,
  RpcMiddleware,
  RpcSerialization,
  RpcServer,
  RpcTest,
} from "effect/unstable/rpc";
import type { RpcClientError } from "effect/unstable/rpc/RpcClientError";
import { RequestId } from "effect/unstable/rpc/RpcMessage";
```

## Testing Hierarchy

| Level       | Tool                                                    | What It Tests                                        | Transport   |
| ----------- | ------------------------------------------------------- | ---------------------------------------------------- | ----------- |
| Unit        | `group.toLayerHandler` + `accessHandler`                | Single handler in isolation                          | None        |
| Integration | `RpcTest.makeClient`                                    | Full client/server with middleware, no serialization | In-memory   |
| E2E         | `RpcServer.layerProtocol*` + `RpcClient.layerProtocol*` | Full stack with serialization and transport          | HTTP/WS/TCP |

## In-Memory Test Client: `RpcTest.makeClient`

The primary tool for RPC testing. Wires `RpcClient.makeNoSerialization` directly to `RpcServer.makeNoSerialization`. No serialization, no network, no HTTP server. Tests the full handler logic, middleware chain, streaming, and error propagation. Supports ack/backpressure.

```ts
import { RpcTest } from "effect/unstable/rpc"

RpcTest.makeClient(group, options?) => Effect<
  RpcClient<Rpcs>,
  never,
  Scope | Rpc.ToHandler<Rpcs> | Rpc.Middleware<Rpcs> | Rpc.MiddlewareClient<Rpcs>
>
```

Requirements: handler layers + server middleware layers + client middleware layers.

## Test Layer Setup

Import your RPC group, handler layer, middleware layers, and client service from source. The test file only wires them together.

```ts
import { RpcTest } from "effect/unstable/rpc";
import { AuthClient, AuthLive, TimingLive, UserRpcs, UsersLive } from "../src/users-rpc.js";
```

### Client service with `layerTest` (recommended pattern)

The client service is defined alongside the RPC group in source code, with both production and test layers:

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

If the source doesn't define `layerTest`, build it in the test file:

```ts
const TestLayer = Layer.effect(UsersClient)(RpcTest.makeClient(UserRpcs)).pipe(
  Layer.provide([UsersLive, AuthLive, TimingLive, AuthClient]),
);
```

### Layer composition

```
UsersClient.layerTest
├── RpcTest.makeClient(UserRpcs)   → in-memory client+server
├── UsersLive                       → handler implementations
├── AuthLive                        → server middleware
├── TimingLive                      → server observability middleware
└── AuthClient                      → client middleware
```

## Writing Tests

### Basic in-memory test

```ts
describe("UsersRpc", () => {
  it.effect("should get user", () =>
    Effect.gen(function*() {
      const client = yield* UsersClient;
      const user = yield* client.GetUser({ id: "1" });
      assert.deepStrictEqual(user, new User({ id: "1", name: "Logged in user" }));
    }).pipe(Effect.provide(UsersClient.layerTest)));
});
```

### Testing Option responses

```ts
it.effect("returns Option", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const user = yield* client.GetUserOption({ id: "1" });
    assert.deepStrictEqual(user, Option.some(new User({ id: "1", name: "John" })));
  }).pipe(Effect.provide(UsersClient.layerTest)));
```

### Testing nested/namespaced RPCs

```ts
it.effect("nested rpc", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    yield* client["nested.test"]();
  }).pipe(Effect.provide(UsersClient.layerTest)));
```

### Testing headers

```ts
it.effect("propagates headers", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const user = yield* client.GetUser({ id: "1" });
    assert.deepStrictEqual(user, new User({ id: "123", name: "Logged in user" }));
  }).pipe(
    RpcClient.withHeaders({ userId: "123" }),
    Effect.provide(UsersClient.layerTest),
  ));
```

### Testing typed errors

```ts
it.effect("returns typed error", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const exit = yield* client.GetUser({ id: "nonexistent" }).pipe(Effect.exit);
    assert.deepStrictEqual(exit, Exit.fail(new UserNotFound({ id: "nonexistent" })));
  }).pipe(Effect.provide(UsersClient.layerTest)));
```

### Testing defects

```ts
it.effect("defect propagation", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const cause = yield* client.ProduceDefect().pipe(
      Effect.sandbox,
      Effect.flip,
    );
    assert.deepStrictEqual(cause, Cause.die("boom"));
  }).pipe(
    RpcClient.withHeaders({ userId: "123" }),
    Effect.provide(UsersClient.layerTest),
  ));
```

### Testing custom defect schema

`Schema.DefectWithStack` preserves full Error objects (name, message, stack) through serialization:

```ts
it.effect("preserves full defect with custom schema", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const cause = yield* client.ProduceDefectCustom().pipe(
      Effect.sandbox,
      Effect.flip,
    );
    const defect = Cause.squash(cause);
    assert.instanceOf(defect, Error);
    assert.strictEqual(defect.name, "CustomDefect");
    assert.strictEqual(defect.message, "detailed error");
  }).pipe(Effect.provide(UsersClient.layerTest)));
```

### Testing streaming RPCs

```ts
it.live("streaming with backpressure", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const users: Array<User> = [];
    yield* client.StreamUsers({ id: "1" }).pipe(
      Stream.take(5),
      Stream.runForEach((user) =>
        Effect.sync(() => {
          users.push(user);
        })
      ),
      Effect.fork,
    );
    yield* Effect.sleep(2000);
    assert.lengthOf(users, 5);
  }).pipe(Effect.provide(UsersClient.layerTest)), { timeout: 20000 });
```

### Testing stream as Queue

```ts
it.live("consume stream as queue", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const queue = yield* client.StreamUsers({ id: "1" }, { asQueue: true });
    const first = yield* Queue.take(queue);
    assert.instanceOf(first, User);
  }).pipe(Effect.provide(UsersClient.layerTest)), { timeout: 20000 });
```

### Testing interruption

```ts
it.live("interruption propagates to server", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const fiber = yield* client.Never().pipe(Effect.forkChild);
    yield* Effect.sleep(500);
    assert.isUndefined(fiber.pollUnsafe());
    yield* Fiber.interrupt(fiber);
  }).pipe(
    RpcClient.withHeaders({ userId: "123" }),
    Effect.provide(UsersClient.layerTest),
  ));
```

### Testing middleware metrics

```ts
it.effect("observability middleware tracks metrics", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    yield* client.TimedMethod({ shouldFail: false });
    yield* client.TimedMethod({ shouldFail: true }).pipe(Effect.exit);
    const { count, defect, success } = yield* client.GetTimingMiddlewareMetrics();
    assert.notEqual(count, 0);
    assert.notEqual(defect, 0);
    assert.notEqual(success, 0);
  }).pipe(Effect.provide(UsersClient.layerTest)));
```

## Unit Testing: Single Handler

Test a handler in complete isolation without client/server. Import the group from source:

```ts
it.effect("single handler", () =>
  Effect.gen(function*() {
    const TwoHandler = MyRpcs.toLayerHandler("two", () => Effect.succeed("two"));
    const handler = yield* MyRpcs.accessHandler("two").pipe(
      Effect.provide(TwoHandler),
    );
    const result = yield* handler(void 0, {
      clientId: 0,
      requestId: RequestId.make(0),
      headers: Headers.empty,
    });
    assert.strictEqual(result, "two");
  }));
```

## E2E HTTP Integration Tests

For full stack testing with serialization and transport. Import `RpcLive` (the server layer) from source.

### HTTP (NDJSON)

```ts
import { HttpClient, HttpClientRequest, HttpRouter } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Layer } from "effect";
import { RpcClient, RpcSerialization, RpcServer } from "effect/unstable/rpc";
import { RpcLive, UsersClient } from "../src/users-rpc.js";

const HttpNdjsonServer = HttpRouter.serve().pipe(
  Layer.provide(RpcLive),
  Layer.provideMerge(RpcServer.layerProtocolHttp({ path: "/rpc" })),
);

const HttpNdjsonClient = UsersClient.layer.pipe(
  Layer.provide(
    RpcClient.layerProtocolHttp({
      url: "",
      transformClient: HttpClient.mapRequest(HttpClientRequest.appendUrl("/rpc")),
    }),
  ),
);

const TestLayer = HttpNdjsonClient.pipe(
  Layer.provideMerge(HttpNdjsonServer),
  Layer.provide([NodeHttpServer.layerTest, RpcSerialization.layerNdjson]),
);

it.effect("e2e http", () =>
  Effect.gen(function*() {
    const client = yield* UsersClient;
    const user = yield* client.GetUser({ id: "1" });
    assert.instanceOf(user, User);
  }).pipe(Effect.provide(TestLayer)));
```

### WebSocket

```ts
import { HttpServer, NodeSocket } from "@effect/platform-node";

const WsServer = HttpRouter.serve().pipe(
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

const TestLayer = WsClient.pipe(
  Layer.provideMerge(WsServer),
  Layer.provide([NodeHttpServer.layerTest, RpcSerialization.layerNdjson]),
);
```

### TCP Socket

```ts
import { SocketServer } from "@effect/platform";
import { NodeSocket, NodeSocketServer } from "@effect/platform-node";

const TcpServer = RpcLive.pipe(
  Layer.provideMerge(RpcServer.layerProtocolSocketServer),
  Layer.provideMerge(NodeSocketServer.layer({ port: 0 })),
);

const TcpClient = UsersClient.layer.pipe(
  Layer.provide(RpcClient.layerProtocolSocket()),
  Layer.provide(
    Effect.gen(function*() {
      const server = yield* SocketServer.SocketServer;
      const address = server.address as SocketServer.TcpAddress;
      return NodeSocket.layerNet({ port: address.port });
    }).pipe(Layer.unwrap),
  ),
);

const TestLayer = TcpClient.pipe(
  Layer.provideMerge(TcpServer),
  Layer.provide([NodeHttpServer.layerTest, RpcSerialization.layerNdjson]),
);
```

### HTTP test layer composition

```
TestLayer
├── HttpNdjsonClient (UsersClient.layer + RpcClient.layerProtocolHttp)
├── HttpNdjsonServer (HttpRouter.serve() + RpcLive + RpcServer.layerProtocolHttp)
├── NodeHttpServer.layerTest (test HTTP server on port 0 + HttpClient pointed at it)
└── RpcSerialization.layerNdjson
```

## Reusable E2E Test Suite Pattern

Create a function that accepts any transport layer and runs the full test suite:

```ts
export const e2eSuite = <E>(
  name: string,
  layer: Layer.Layer<UsersClient | RpcServer.Protocol, E>,
  concurrent = true,
) => {
  describe(name, { concurrent, timeout: 30_000 }, () => {
    it.effect("should get user", () =>
      Effect.gen(function*() {
        const client = yield* UsersClient;
        const user = yield* client.GetUser({ id: "1" });
        assert.instanceOf(user, User);
      }).pipe(Effect.provide(layer)));

    it.live("streaming", () =>
      Effect.gen(function*() {
        const client = yield* UsersClient;
        const users: Array<User> = [];
        yield* client.StreamUsers({ id: "1" }).pipe(
          Stream.take(5),
          Stream.runForEach((user) =>
            Effect.sync(() => {
              users.push(user);
            })
          ),
          Effect.fork,
        );
        yield* Effect.sleep(2000);
        assert.lengthOf(users, 5);
      }).pipe(Effect.provide(layer)), { timeout: 20000 });

    it.effect("defect", () =>
      Effect.gen(function*() {
        const client = yield* UsersClient;
        const cause = yield* client.ProduceDefect().pipe(Effect.sandbox, Effect.flip);
        assert.deepStrictEqual(cause, Cause.die("boom"));
      }).pipe(
        RpcClient.withHeaders({ userId: "123" }),
        Effect.provide(layer),
      ));
  });
};

e2eSuite("http ndjson", HttpNdjsonLayer);
e2eSuite("websocket", WebSocketLayer);
e2eSuite("tcp", TcpLayer);
```

## Transport Matrix Testing

The effect-smol test suite runs the same e2e tests across all transport/serialization combinations:

| Transport        | Serialization Formats          |
| ---------------- | ------------------------------ |
| HTTP (POST)      | ndjson, msgpack, nd-jsonrpc    |
| WebSocket        | ndjson, json, msgpack, jsonrpc |
| TCP (raw socket) | ndjson, msgpack, nd-jsonrpc    |

HTTP does NOT support ack (backpressure) or server-initiated interruption. WebSocket/TCP/Worker all support ack.

## Key Differences from v3 Testing

| v3 (@effect/rpc)                                     | v4 (effect/unstable/rpc)                             |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `import { RpcTest } from "@effect/rpc"`              | `import { RpcTest } from "effect/unstable/rpc"`      |
| `Context.Tag` for client service                     | `ServiceMap.Service` for client service              |
| `Layer.scoped(UsersClient, RpcTest.makeClient(...))` | `Layer.effect(UsersClient)(RpcTest.makeClient(...))` |
| `Layer.scoped(UsersClient, RpcClient.make(...))`     | `Layer.effect(UsersClient)(RpcClient.make(...))`     |
| `asMailbox: true` on client stream                   | `asQueue: true` on client stream                     |
| `import { Headers } from "@effect/platform"`         | `import { Headers } from "effect"`                   |

## Rules of Thumb

1. **Never define schemas or RPCs in test files.** Import everything from source
2. **Default to `RpcTest.makeClient`** for most tests. It tests handlers, middleware, streaming, and error propagation without transport overhead
3. **Use `toLayerHandler` + `accessHandler`** only when testing a single handler in isolation
4. **Use E2E tests** when you need to verify serialization or transport-specific behavior
5. **Use `it.live`** for streaming and interruption tests (they need real time)
6. **Use `it.effect`** for everything else (deterministic, uses TestClock)
7. **Always provide client middleware** when middleware has `requiredForClient: true`
8. **The `layerTest` pattern** on the client service (production layer vs test layer) is the standard approach
