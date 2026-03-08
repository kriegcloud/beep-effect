import { AgentRuntime, SessionPool } from "@beep/ai-sdk";
import { AgentHttpApi } from "@beep/ai-sdk/service/AgentHttpApi";
import { layer as AgentHttpHandlers } from "@beep/ai-sdk/service/AgentHttpHandlers";
import { AgentServerAccess, makeAgentServerAccess } from "@beep/ai-sdk/service/AgentServerAccess";
import { NodeHttpPlatform, NodeServices } from "@effect/platform-node";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { runEffect } from "./effect-test.js";

const runtimeLayer = Layer.succeed(
  AgentRuntime,
  AgentRuntime.of({
    query: () => Effect.die("unused in layer build test"),
    queryRaw: () => Effect.die("unused in layer build test"),
    stream: () => Stream.empty,
    stats: Effect.succeed({
      active: 0,
      pending: 0,
      concurrencyLimit: 1,
      pendingQueueCapacity: 0,
      pendingQueueStrategy: "disabled",
    }),
    interruptAll: Effect.void,
    events: Stream.empty,
  })
);

const makeAccessLayer = (options?: { readonly authToken?: string; readonly hostname?: string }) =>
  Layer.effect(AgentServerAccess, makeAgentServerAccess(options).pipe(Effect.orDie));

const httpTestPlatformLayer = Layer.mergeAll(NodeServices.layer, NodeHttpPlatform.layer);

const makeWebHandler = (serverLayer: Layer.Layer<never, never, any>) =>
  Effect.acquireRelease(
    Effect.sync(() =>
      HttpRouter.toWebHandler(
        serverLayer.pipe(Layer.provideMerge(httpTestPlatformLayer)) as Layer.Layer<unknown, never, never>
      )
    ),
    ({ dispose }) => Effect.promise(dispose)
  );

const makeApiLayer = <R>(handlersLayer: Layer.Layer<R, never, never>) =>
  HttpApiBuilder.layer(AgentHttpApi).pipe(Layer.provide(handlersLayer));
const encodeJson = S.encodeUnknownSync(S.UnknownFromJsonString);

test("AgentHttpHandlers layer builds with AgentRuntime only", async () => {
  const layer = AgentHttpHandlers.pipe(Layer.provide(runtimeLayer), Layer.provide(makeAccessLayer()));
  await runEffect(Effect.scoped(Layer.build(layer).pipe(Effect.asVoid)));
  expect(true).toBe(true);
});

test("makeAgentServerAccess rejects bind-all hostnames with a clear error", async () => {
  const result = await Effect.runPromise(
    Effect.result(makeAgentServerAccess({ hostname: "0.0.0.0", authToken: "secret-token" }))
  );
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure.message).toContain('hostname "0.0.0.0" binds all interfaces');
  }
});

test("AgentHttpHandlers layer builds with AgentRuntime and SessionPool", async () => {
  const poolLayer = Layer.succeed(
    SessionPool,
    SessionPool.of({
      create: () => Effect.die("unused in layer build test"),
      get: () => Effect.die("unused in layer build test"),
      info: () => Effect.die("unused in layer build test"),
      withSession: () => Effect.die("unused in layer build test"),
      list: Effect.succeed([]),
      listByTenant: () => Effect.succeed([]),
      close: () => Effect.void,
      closeAll: Effect.void,
    })
  );

  const layer = AgentHttpHandlers.pipe(
    Layer.provide(runtimeLayer),
    Layer.provide(poolLayer),
    Layer.provide(makeAccessLayer())
  );
  await runEffect(Effect.scoped(Layer.build(layer).pipe(Effect.asVoid)));
  expect(true).toBe(true);
});

test("AgentHttpHandlers rejects requests without the configured auth token", async () => {
  const handlersLayer = AgentHttpHandlers.pipe(
    Layer.provide(runtimeLayer),
    Layer.provide(makeAccessLayer({ authToken: "secret-token" }))
  );
  const apiLayer = makeApiLayer(handlersLayer);

  const program = Effect.scoped(
    Effect.gen(function* () {
      const { handler } = yield* makeWebHandler(apiLayer);

      const unauthorized = yield* Effect.promise(() => handler(new Request("http://localhost/stats")));
      expect(unauthorized.status).not.toBe(200);
      expect(yield* Effect.promise(() => unauthorized.text())).toContain("Missing or invalid agent auth token.");

      const authorized = yield* Effect.promise(() =>
        handler(
          new Request("http://localhost/stats", {
            headers: {
              Authorization: "Bearer secret-token",
            },
          })
        )
      );
      expect(authorized.status).toBe(200);
      expect(yield* Effect.promise(() => authorized.json())).toMatchObject({
        active: 0,
        concurrencyLimit: 1,
      });
    })
  );

  await runEffect(program);
});

test("AgentHttpHandlers requires caller tenant header before honoring a tenant-scoped session request", async () => {
  const captured: Array<string | undefined> = [];
  const poolLayer = Layer.succeed(
    SessionPool,
    SessionPool.of({
      create: (_overrides?: unknown, tenant?: string) => {
        captured.push(tenant);
        return Effect.succeed({
          sessionId: Effect.succeed("session-http"),
          send: () => Effect.void,
          stream: Stream.empty,
          close: Effect.void,
        });
      },
      get: () => Effect.die("get not used in HTTP tenant test"),
      info: () => Effect.die("info not used in HTTP tenant test"),
      withSession: () => Effect.die("withSession not used in HTTP tenant test"),
      list: Effect.succeed([]),
      listByTenant: () => Effect.succeed([]),
      close: () => Effect.void,
      closeAll: Effect.void,
    })
  );
  const handlersLayer = AgentHttpHandlers.pipe(
    Layer.provide(runtimeLayer),
    Layer.provide(poolLayer),
    Layer.provide(makeAccessLayer())
  );
  const apiLayer = makeApiLayer(handlersLayer);

  const program = Effect.scoped(
    Effect.gen(function* () {
      const { handler } = yield* makeWebHandler(apiLayer);
      const requestBody = encodeJson({
        options: {
          model: "claude-test",
        },
        tenant: "team-a",
      });

      const missingHeader = yield* Effect.promise(() =>
        handler(
          new Request("http://localhost/sessions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: requestBody,
          })
        )
      );
      expect(missingHeader.status).not.toBe(200);
      expect(yield* Effect.promise(() => missingHeader.text())).toContain("Caller tenant header is required");

      const accepted = yield* Effect.promise(() =>
        handler(
          new Request("http://localhost/sessions", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-agent-tenant": "team-a",
            },
            body: requestBody,
          })
        )
      );
      expect(accepted.status).toBe(200);
      expect(yield* Effect.promise(() => accepted.json())).toMatchObject({
        sessionId: "session-http",
      });
      expect(captured).toEqual(["team-a"]);
    })
  );

  await runEffect(program);
});
