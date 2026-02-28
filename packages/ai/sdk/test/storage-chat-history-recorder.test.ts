import type { QueryHandle, StreamBroadcastConfig } from "@beep/ai-sdk/Query";
import type { SDKMessage, SDKUserMessage } from "@beep/ai-sdk/Schema/Message";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Storage } from "../src/core/index.js";

const makeUserMessage = (sessionId: string, text: string): SDKUserMessage => ({
  type: "user",
  session_id: sessionId,
  message: {
    role: "user",
    content: [{ type: "text", text }],
  },
  parent_tool_use_id: null,
});

const makeHandle = (messages: ReadonlyArray<SDKMessage>): QueryHandle => {
  const stream = Stream.fromIterable(messages);
  return {
    stream,
    send: (_message) => Effect.void,
    sendAll: (_messages) => Effect.void,
    sendForked: (_message) => Effect.void,
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

test("ChatHistory.withRecorder records stream output", async () => {
  const program = Effect.gen(function* () {
    const handle = makeHandle([makeUserMessage("session-1", "hello"), makeUserMessage("session-1", "world")]);
    const recorded = yield* Storage.ChatHistory.withRecorder(handle, {
      recordOutput: true,
    });
    yield* recorded.stream.pipe(Stream.runDrain);
    const store = yield* Storage.ChatHistoryStore;
    const events = yield* store.list("session-1");
    return events.length;
  }).pipe(Effect.provide(Storage.ChatHistoryStore.layerMemory));

  const count = await Effect.runPromise(program);
  expect(count).toBe(2);
});

test("ChatHistory.withRecorder records input when enabled", async () => {
  const program = Effect.gen(function* () {
    const handle = makeHandle([]);
    const recorded = yield* Storage.ChatHistory.withRecorder(handle, {
      recordInput: true,
    });
    yield* recorded.send(makeUserMessage("session-2", "ping"));
    const store = yield* Storage.ChatHistoryStore;
    const events = yield* store.list("session-2");
    return events.length;
  }).pipe(Effect.provide(Storage.ChatHistoryStore.layerMemory));

  const count = await Effect.runPromise(program);
  expect(count).toBe(1);
});
