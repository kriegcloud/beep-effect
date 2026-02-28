import { expect, test, vi } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import { runEffect } from "./effect-test.js";

let createOptions: unknown;
let resumeOptions: unknown;
let resumeSessionId: string | undefined;
let closeCalls = 0;
let createError: Error | undefined;
let promptError: Error | undefined;

const makeSession = (sessionId = "session-1") => ({
  get sessionId() {
    return sessionId;
  },
  send: async () => {},
  stream: async function* () {},
  close: () => {
    closeCalls += 1;
  },
  [Symbol.asyncDispose]: async () => {},
});

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: () => {
    async function* generator() {
      yield* [];
      return;
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
  },
  createSdkMcpServer: (_options: unknown) => ({}),
  tool: (
    name: string,
    description: string,
    inputSchema: unknown,
    handler: (args: unknown, extra: unknown) => Promise<unknown>
  ) => ({ name, description, inputSchema, handler }),
  unstable_v2_createSession: (options: unknown) => {
    if (createError) throw createError;
    createOptions = options;
    return makeSession();
  },
  unstable_v2_resumeSession: (sessionId: string, options: unknown) => {
    resumeSessionId = sessionId;
    resumeOptions = options;
    return makeSession(sessionId);
  },
  unstable_v2_prompt: (message: string, options: unknown) => {
    if (promptError) throw promptError;
    void message;
    void options;
    return Promise.resolve({ type: "result", subtype: "success" });
  },
}));

test("Session.createSession defaults executable and closes on scope exit", async () => {
  closeCalls = 0;
  createOptions = undefined;
  createError = undefined;

  const { createSession } = await import("@beep/ai-sdk/Session");
  const program = Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* createSession({ model: "claude-test" });
      return yield* handle.sessionId;
    })
  );

  const sessionId = await runEffect(program);
  expect(sessionId).toBe("session-1");
  expect((createOptions as { executable?: string })?.executable).toBe("bun");
  expect((createOptions as { model?: string })?.model).toBe("claude-test");
  expect(closeCalls).toBe(1);
});

test("Session.resumeSession passes session id and defaults executable", async () => {
  resumeSessionId = undefined;
  resumeOptions = undefined;
  createError = undefined;

  const { resumeSession } = await import("../src/Session.js");
  const program = Effect.scoped(
    Effect.gen(function* () {
      const handle = yield* resumeSession("session-42", { model: "claude-test" });
      return yield* handle.sessionId;
    })
  );

  const sessionId = await runEffect(program);
  expect(sessionId).toBe("session-42");
  const capturedSessionId = resumeSessionId;
  if (capturedSessionId === undefined) {
    throw new Error("resumeSessionId was not captured");
  }
  expect(String(capturedSessionId)).toBe("session-42");
  expect((resumeOptions as { executable?: string })?.executable).toBe("bun");
});

test("Session.createSession maps errors to TransportError", async () => {
  createError = new Error("boom");

  const { createSession } = await import("../src/Session.js");
  const program = Effect.scoped(createSession({ model: "claude-test" }));
  const result = await runEffect(Effect.result(program));

  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("TransportError");
    expect(result.failure.message).toBe("Failed to create session");
  }

  createError = undefined;
});

test("Session.prompt maps errors to TransportError", async () => {
  promptError = new Error("boom");

  const { prompt } = await import("../src/Session.js");
  const result = await runEffect(Effect.result(prompt("hello", { model: "claude-test" })));

  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("TransportError");
    expect(result.failure.message).toBe("Failed to run session prompt");
  }

  promptError = undefined;
});
