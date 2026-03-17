import type {
  SDKMessage as ClaudeSDKMessage,
  SDKUserMessage as ClaudeSDKUserMessage,
  McpServerConfig,
  McpSetServersResult,
  PermissionMode,
} from "@anthropic-ai/claude-agent-sdk";
import { makeQueryHandle, type SdkQueryLike } from "@beep/ai-sdk/internal/queryHandle";
import { createInputQueue } from "@beep/ai-sdk/internal/streaming";
import { makeUserMessage } from "@beep/ai-sdk/Schema/Message";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Queue from "effect/Queue";
import * as Result from "effect/Result";
import * as Stream from "effect/Stream";
import { runEffect } from "./effect-test.js";

const makeClaudeUserMessage = (prompt: string): ClaudeSDKUserMessage => ({
  type: "user",
  session_id: "",
  message: {
    role: "user",
    content: [{ type: "text", text: prompt }],
  },
  parent_tool_use_id: null,
});

const makeSdkQuery = (
  messages: ReadonlyArray<ClaudeSDKMessage>,
  options?: {
    readonly interrupt?: () => Promise<void>;
  }
): SdkQueryLike => {
  const iterator: AsyncGenerator<ClaudeSDKMessage, void> = (async function* () {
    for (const message of messages) {
      yield message;
    }
  })();

  return Object.assign(iterator, {
    interrupt: options?.interrupt ?? (async () => {}),
    setPermissionMode: async (_mode: PermissionMode) => {},
    setModel: async (_model?: string) => {},
    setMaxThinkingTokens: async (_maxThinkingTokens: number | null) => {},
    applyFlagSettings: async (_settings: Parameters<SdkQueryLike["applyFlagSettings"]>[0]) => {},
    initializationResult: async () => ({
      commands: [],
      output_style: "default",
      available_output_styles: [],
      models: [],
      account: {},
      agents: [],
    }),
    supportedCommands: async () => [],
    supportedModels: async () => [],
    supportedAgents: async () => [],
    mcpServerStatus: async () => [],
    accountInfo: async () => ({}),
    rewindFiles: async (_userMessageId: string, _options?: { dryRun?: boolean }) => ({ canRewind: false }),
    reconnectMcpServer: async (_serverName: string) => {},
    toggleMcpServer: async (_serverName: string, _enabled: boolean) => {},
    setMcpServers: async (_servers: Record<string, McpServerConfig>): Promise<McpSetServersResult> => ({
      added: [],
      removed: [],
      errors: {},
    }),
    streamInput: async (_stream: AsyncIterable<ClaudeSDKUserMessage>) => {},
    stopTask: async (_taskId: string) => {},
    close: () => {},
  });
};

test("QueryHandle.share multicasts within scope", async () => {
  const messages = [makeClaudeUserMessage("first"), makeClaudeUserMessage("second")];
  const handle = makeQueryHandle(makeSdkQuery(messages));

  const program = Effect.scoped(
    Effect.gen(function* () {
      const shared = yield* handle.share();
      return yield* Effect.all([Stream.runCollect(shared), Stream.runCollect(shared)], {
        concurrency: "unbounded",
      });
    })
  );

  const [left, right] = await runEffect(program);
  expect(left).toEqual(messages);
  expect(right).toEqual(messages);
});

test("QueryHandle.broadcast multicasts within scope", async () => {
  const messages = [makeClaudeUserMessage("alpha"), makeClaudeUserMessage("beta")];
  const handle = makeQueryHandle(makeSdkQuery(messages));

  const program = Effect.scoped(
    Effect.gen(function* () {
      const broadcasted = yield* handle.broadcast({ capacity: 16 });
      return yield* Effect.all([Stream.runCollect(broadcasted), Stream.runCollect(broadcasted)], {
        concurrency: "unbounded",
      });
    })
  );

  const [left, right] = await runEffect(program);
  expect(left).toEqual(messages);
  expect(right).toEqual(messages);
});

test("QueryHandle.send enqueues input", async () => {
  const message = makeUserMessage("hello");
  const program = Effect.scoped(
    Effect.gen(function* () {
      const inputQueue = yield* createInputQueue(1);
      const handle = makeQueryHandle(makeSdkQuery([]), inputQueue, inputQueue.closeInput);
      yield* handle.send(message);
      return yield* Queue.take(inputQueue.queue);
    })
  );

  const received = await runEffect(program);
  expect(received).toEqual(message);
});

test("QueryHandle.sendAll enqueues all input messages", async () => {
  const first = makeUserMessage("first");
  const second = makeUserMessage("second");
  const program = Effect.scoped(
    Effect.gen(function* () {
      const inputQueue = yield* createInputQueue(2);
      const handle = makeQueryHandle(makeSdkQuery([]), inputQueue, inputQueue.closeInput);
      yield* handle.sendAll([first, second]);
      const one = yield* Queue.take(inputQueue.queue);
      const two = yield* Queue.take(inputQueue.queue);
      return { one, two };
    })
  );

  const { one, two } = await runEffect(program);
  expect(one).toEqual(first);
  expect(two).toEqual(second);
});

test("QueryHandle.send fails after closeInput", async () => {
  const program = Effect.scoped(
    Effect.gen(function* () {
      const inputQueue = yield* createInputQueue(1);
      const handle = makeQueryHandle(makeSdkQuery([]), inputQueue, inputQueue.closeInput);
      yield* handle.closeInput;
      return yield* Effect.result(handle.send(makeUserMessage("late")));
    })
  );

  const result = await runEffect(program);
  expect(Result.isSuccess(result)).toBe(true);
});

test("QueryHandle.interrupt maps sdk errors to TransportError", async () => {
  const handle = makeQueryHandle(
    makeSdkQuery([], {
      interrupt: async () => {
        throw new Error("boom");
      },
    })
  );

  const result = await runEffect(Effect.result(handle.interrupt));
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("TransportError");
  }
});
