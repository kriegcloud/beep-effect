import { AgentRuntime, Storage } from "@beep/ai-sdk";
import type { QueryHandle, StreamBroadcastConfig } from "@beep/ai-sdk/Query";
import type { QuerySupervisorStats } from "@beep/ai-sdk/QuerySupervisor";
import type { SDKMessage, SDKUserMessage } from "@beep/ai-sdk/Schema/Message";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { runEffect } from "./effect-test.js";

const makeHandle = (messages: ReadonlyArray<SDKMessage>): QueryHandle => {
  const stream = Stream.fromIterable(messages);
  return {
    stream,
    send: (_message: SDKUserMessage) => Effect.void,
    sendAll: (_messages: Iterable<SDKUserMessage>) => Effect.void,
    sendForked: (_message: SDKUserMessage) => Effect.void,
    closeInput: Effect.void,
    share: (config) => Stream.share(stream, config ?? { capacity: 16, strategy: "suspend" }),
    broadcast: (config?: StreamBroadcastConfig) => {
      const resolved = config ?? 16;
      if (typeof resolved === "number") {
        return Stream.broadcast(stream, { capacity: resolved });
      }
      return Stream.broadcast(stream, resolved);
    },
    interrupt: Effect.void,
    setPermissionMode: (_mode) => Effect.die("not-implemented"),
    setModel: (_model) => Effect.die("not-implemented"),
    setMaxThinkingTokens: (_maxTokens) => Effect.die("not-implemented"),
    rewindFiles: (_uuid, _options) => Effect.die("not-implemented"),
    supportedCommands: Effect.die("not-implemented"),
    supportedModels: Effect.die("not-implemented"),
    mcpServerStatus: Effect.die("not-implemented"),
    setMcpServers: (_servers) => Effect.die("not-implemented"),
    accountInfo: Effect.die("not-implemented"),
    initializationResult: Effect.die("not-implemented"),
    stopTask: (_taskId) => Effect.die("not-implemented"),
  };
};

const makeRuntimeLayer = (messages: ReadonlyArray<SDKMessage>) => {
  const stats: QuerySupervisorStats = {
    active: 0,
    pending: 0,
    concurrencyLimit: 1,
    pendingQueueCapacity: 0,
    pendingQueueStrategy: "disabled",
  };
  const handle = makeHandle(messages);
  return Layer.succeed(
    AgentRuntime,
    AgentRuntime.of({
      query: (_prompt, _options) => Effect.succeed(handle),
      queryRaw: (_prompt, _options) => Effect.succeed(handle),
      stream: (_prompt, _options) => handle.stream,
      stats: Effect.succeed(stats),
      interruptAll: Effect.void,
      events: Stream.empty,
    })
  );
};

test("AgentRuntime.layerWithPersistence records chat history and artifacts", async () => {
  const message: SDKUserMessage = {
    type: "user",
    session_id: "session-1",
    message: {
      role: "user",
      content: [{ type: "text", text: "hello" }],
    },
    parent_tool_use_id: null,
    tool_use_result: { ok: true },
  };

  const chatHistoryLayer = Storage.ChatHistoryStore.layerMemory;
  const artifactLayer = Storage.ArtifactStore.layerMemory;
  const storageLayer = Layer.merge(chatHistoryLayer, artifactLayer);
  const runtimeLayer = AgentRuntime.layerWithPersistence({
    layers: {
      runtime: makeRuntimeLayer([message]),
      chatHistory: chatHistoryLayer,
      artifacts: artifactLayer,
    },
  }).pipe(Layer.provideMerge(storageLayer));
  const layer = Layer.merge(runtimeLayer, storageLayer);

  const program = Effect.scoped(
    Effect.gen(function* () {
      const runtime = yield* AgentRuntime;
      const handle = yield* runtime.query("test");
      yield* handle.stream.pipe(Stream.runDrain);
      const chat = yield* Storage.ChatHistoryStore;
      const artifacts = yield* Storage.ArtifactStore;
      const events = yield* chat.list("session-1");
      const records = yield* artifacts.list("session-1");
      return { events, records };
    }).pipe(Effect.provide(layer))
  );

  const result = await runEffect(program);
  expect(result.events.length).toBe(1);
  expect(result.records.length).toBe(1);
});
