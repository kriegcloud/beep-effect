import type { AgentRuntimeSettings } from "@beep/ai-sdk/AgentRuntimeConfig";
import type { QuerySupervisorSettings } from "@beep/ai-sdk/QuerySupervisorConfig";
import { expect, test, vi } from "@effect/vitest";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { TestClock } from "effect/testing";
import { runEffect } from "./effect-test.js";

let sdkQueryHandler: ((prompt: unknown) => unknown) | undefined;

const makeSdkQuery = (options?: { readonly interrupt?: () => Promise<void> }) => {
  async function* generator() {
    yield* [];
    return;
  }

  const iterator = generator();
  return Object.assign(iterator, {
    interrupt: options?.interrupt ?? (async () => {}),
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
  query: ({ prompt }: { prompt: unknown }) => (sdkQueryHandler ? sdkQueryHandler(prompt) : makeSdkQuery()),
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

test("AgentRuntime interrupts queries on timeout", async () => {
  let interruptCalls = 0;
  sdkQueryHandler = () =>
    makeSdkQuery({
      interrupt: async () => {
        interruptCalls += 1;
      },
    });

  const { AgentRuntime } = await import("@beep/ai-sdk/AgentRuntime");
  const { AgentRuntimeConfig } = await import("@beep/ai-sdk/AgentRuntimeConfig");
  const { AgentSdk } = await import("@beep/ai-sdk/AgentSdk");
  const { AgentSdkConfig } = await import("@beep/ai-sdk/AgentSdkConfig");
  const { QuerySupervisor } = await import("@beep/ai-sdk/QuerySupervisor");
  const { QuerySupervisorConfig } = await import("@beep/ai-sdk/QuerySupervisorConfig");

  const supervisorSettings: QuerySupervisorSettings = {
    concurrencyLimit: 1,
    pendingQueueCapacity: 4,
    pendingQueueStrategy: "suspend",
    maxPendingTime: undefined,
    emitEvents: false,
    eventBufferCapacity: 16,
    eventBufferStrategy: "sliding",
    metricsEnabled: false,
    tracingEnabled: false,
  };

  const runtimeSettings: AgentRuntimeSettings = {
    defaultOptions: {},
    queryTimeout: Duration.seconds(2),
    firstMessageTimeout: Duration.seconds(1),
    retryMaxRetries: 0,
    retryBaseDelay: Duration.seconds(1),
  };

  const supervisorLayer = QuerySupervisor.layer.pipe(
    Layer.provide(Layer.succeed(QuerySupervisorConfig, QuerySupervisorConfig.of({ settings: supervisorSettings }))),
    Layer.provide(
      AgentSdk.layer.pipe(
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
      )
    )
  );

  const runtimeLayer = AgentRuntime.layer.pipe(
    Layer.provide(Layer.succeed(AgentRuntimeConfig, AgentRuntimeConfig.of({ settings: runtimeSettings }))),
    Layer.provide(supervisorLayer)
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const runtime = yield* AgentRuntime;
      yield* runtime.query("timeout-test");

      yield* TestClock.adjust("3 seconds");
      yield* Effect.yieldNow;

      expect(interruptCalls).toBeGreaterThan(0);
    }).pipe(Effect.provide(runtimeLayer))
  );

  await runEffect(program);
});
