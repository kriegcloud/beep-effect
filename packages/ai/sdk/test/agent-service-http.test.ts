import { AgentRuntime, SessionPool } from "@beep/ai-sdk";
import { layer as AgentHttpHandlers } from "@beep/ai-sdk/service/AgentHttpHandlers";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
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

test("AgentHttpHandlers layer builds with AgentRuntime only", async () => {
  const layer = AgentHttpHandlers.pipe(Layer.provide(runtimeLayer));
  await runEffect(Effect.scoped(Layer.build(layer).pipe(Effect.asVoid)));
  expect(true).toBe(true);
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

  const layer = AgentHttpHandlers.pipe(Layer.provide(runtimeLayer), Layer.provide(poolLayer));
  await runEffect(Effect.scoped(Layer.build(layer).pipe(Effect.asVoid)));
  expect(true).toBe(true);
});
