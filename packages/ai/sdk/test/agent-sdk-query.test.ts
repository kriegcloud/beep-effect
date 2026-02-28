import { expect, test } from "@effect/vitest";
import { vi } from "vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Result from "effect/Result";
import * as Stream from "effect/Stream";
import { runEffect } from "./effect-test.js";

const makeSdkQuery = (prompt: unknown) => {
  async function* generator() {
    if (typeof prompt === "string") {
      return;
    }
    for await (const message of prompt as AsyncIterable<unknown>) {
      yield message;
    }
  }

  const iterator = generator();
  return Object.assign(iterator, {
    interrupt: async () => {},
    setPermissionMode: async () => {},
    setModel: async () => {},
    setMaxThinkingTokens: async () => {},
    rewindFiles: async () => ({ canRewind: false }),
    supportedCommands: async () => [],
    supportedModels: async () => [],
    mcpServerStatus: async () => [],
    setMcpServers: async () => ({ added: [], removed: [], errors: {} }),
    accountInfo: async () => ({}),
  });
};

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: ({ prompt }: { prompt: unknown }) => makeSdkQuery(prompt),
  createSdkMcpServer: (_options: unknown) => ({}),
  tool: (
    name: string,
    description: string,
    inputSchema: unknown,
    handler: (args: unknown, extra: unknown) => Promise<unknown>
  ) => ({ name, description, inputSchema, handler }),
  unstable_v2_createSession: () => ({
    sessionId: "mock-session",
    send: async () => {},
    stream: async function* () {},
    close: () => {},
    [Symbol.asyncDispose]: async () => {},
  }),
  unstable_v2_resumeSession: () => ({
    sessionId: "mock-session",
    send: async () => {},
    stream: async function* () {},
    close: () => {},
    [Symbol.asyncDispose]: async () => {},
  }),
  unstable_v2_prompt: async () => ({ type: "result", subtype: "success" }),
}));

test("AgentSdk.query surfaces failures from streaming prompt", async () => {
  const { AgentSdk } = await import("@beep/ai-sdk/AgentSdk");
  const { AgentSdkConfig } = await import("@beep/ai-sdk/AgentSdkConfig");

  async function* failingPrompt() {
    yield* [];
    throw new Error("boom");
  }

  const layer = AgentSdk.layer.pipe(
    Layer.provide(
      Layer.succeed(
        AgentSdkConfig,
        AgentSdkConfig.of({
          options: {},
          sandboxProvider: Option.some("local"),
          sandboxId: Option.none(),
          sandboxSleepAfter: Option.none(),
          storageBackend: Option.some("bun"),
          storageMode: Option.some("standard"),
          r2BucketBinding: Option.some("BUCKET"),
          kvNamespaceBinding: Option.some("KV"),
        })
      )
    )
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const sdk = yield* AgentSdk;
      const handle = yield* sdk.query(failingPrompt());
      return yield* Effect.result(Stream.runCollect(handle.stream));
    }).pipe(Effect.provide(layer))
  );

  const result = await runEffect(program);
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("TransportError");
    expect(result.failure.message).toBe("Input stream failed");
  }
});

test("AgentSdk.query closeInput does not fail output stream", async () => {
  const { AgentSdk } = await import("@beep/ai-sdk/AgentSdk");
  const { AgentSdkConfig } = await import("@beep/ai-sdk/AgentSdkConfig");

  async function* emptyPrompt() {
    yield* [];
    return;
  }

  const layer = AgentSdk.layer.pipe(
    Layer.provide(
      Layer.succeed(
        AgentSdkConfig,
        AgentSdkConfig.of({
          options: {},
          sandboxProvider: Option.some("local"),
          sandboxId: Option.none(),
          sandboxSleepAfter: Option.none(),
          storageBackend: Option.some("bun"),
          storageMode: Option.some("standard"),
          r2BucketBinding: Option.some("BUCKET"),
          kvNamespaceBinding: Option.some("KV"),
        })
      )
    )
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const sdk = yield* AgentSdk;
      const handle = yield* sdk.query(emptyPrompt());
      yield* handle.closeInput;
      return yield* Effect.result(Stream.runCollect(handle.stream));
    }).pipe(Effect.provide(layer))
  );

  const result = await runEffect(program);
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("TransportError");
  }
});
