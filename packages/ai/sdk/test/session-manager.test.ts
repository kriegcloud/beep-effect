import { expect, test } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import { vi } from "vitest";
import { runEffect } from "./effect-test.js";

const createCalls: Array<unknown> = [];
const resumeCalls: Array<{ sessionId: string; options: unknown }> = [];
const promptCalls: Array<{ message: string; options: unknown }> = [];

type CapturedSessionOptions = {
  readonly model?: string;
  readonly executable?: string;
  readonly pathToClaudeCodeExecutable?: string;
  readonly executableArgs?: ReadonlyArray<string>;
  readonly env?: Record<string, string>;
  readonly allowedTools?: ReadonlyArray<string>;
  readonly disallowedTools?: ReadonlyArray<string>;
  readonly permissionMode?: string;
};

const makeSession = (sessionId = "session-1") => ({
  get sessionId() {
    return sessionId;
  },
  send: async () => {},
  stream: async function* () {},
  close: () => {},
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
    createCalls.push(options);
    return makeSession();
  },
  unstable_v2_resumeSession: (sessionId: string, options: unknown) => {
    resumeCalls.push({ sessionId, options });
    return makeSession(sessionId);
  },
  unstable_v2_prompt: async (message: string, options: unknown) => {
    promptCalls.push({ message, options });
    return { type: "result", subtype: "success" };
  },
}));

const configLayer = (entries: Record<string, string>) => ConfigProvider.layerAdd(ConfigProvider.fromUnknown(entries));
const makeSessionManagerLayer = async (entries: Record<string, string>) => {
  const { SessionManager } = await import("@beep/ai-sdk/SessionManager");
  const { SessionConfig } = await import("@beep/ai-sdk/SessionConfig");

  return {
    SessionManager,
    layer: Layer.fresh(SessionManager.layer).pipe(
      Layer.provide(Layer.fresh(SessionConfig.layer.pipe(Layer.provide(configLayer(entries)))))
    ),
  };
};

const findCreateOptionsByModel = (model: string): CapturedSessionOptions => {
  for (let index = createCalls.length - 1; index >= 0; index--) {
    const options = createCalls[index] as CapturedSessionOptions | undefined;
    if (options?.model === model) {
      return options;
    }
  }

  throw new Error(`create options for model ${model} were not captured`);
};

const findResumeCallBySessionId = (sessionId: string) => {
  for (let index = resumeCalls.length - 1; index >= 0; index--) {
    const call = resumeCalls[index];
    if (call?.sessionId === sessionId) {
      return call;
    }
  }

  throw new Error(`resume call for session ${sessionId} was not captured`);
};

const findPromptCallByMessage = (message: string) => {
  for (let index = promptCalls.length - 1; index >= 0; index--) {
    const call = promptCalls[index];
    if (call?.message === message) {
      return call;
    }
  }

  throw new Error(`prompt call for message ${message} was not captured`);
};

test("SessionManager.create merges defaults and overrides", async () => {
  const { SessionManager, layer } = await makeSessionManagerLayer({
    ANTHROPIC_API_KEY: "test-key",
    EXECUTABLE: "node",
    PATH_TO_CLAUDE_CODE_EXECUTABLE: "/tmp/claude",
    EXECUTABLE_ARGS: "--inspect, --no-warnings",
    PERMISSION_MODE: "plan",
    ALLOWED_TOOLS: "Read,Edit",
    DISALLOWED_TOOLS: "Bash",
  });

  const program = Effect.scoped(
    Effect.gen(function* () {
      const manager = yield* SessionManager;
      const handle = yield* manager.create({
        model: "claude-create-defaults",
        allowedTools: ["Override"],
      });
      return yield* handle.sessionId;
    }).pipe(Effect.provide(layer))
  );

  const sessionId = await runEffect(program);
  const createOptions = findCreateOptionsByModel("claude-create-defaults");
  expect(sessionId).toBe("session-1");
  expect(createOptions.executable).toBe("node");
  expect(createOptions.pathToClaudeCodeExecutable).toBe("/tmp/claude");
  expect(createOptions.executableArgs).toEqual(["--inspect", "--no-warnings"]);
  expect(createOptions.permissionMode).toBe("plan");
  expect(createOptions.allowedTools).toEqual(["Override"]);
  expect(createOptions.disallowedTools).toEqual(["Bash"]);
  expect(createOptions.env).toEqual({
    ANTHROPIC_API_KEY: "test-key",
  });
}, 15_000);

test("SessionManager.create merges auth defaults with explicit env overrides", async () => {
  const { SessionManager, layer } = await makeSessionManagerLayer({
    ANTHROPIC_API_KEY: "test-key",
    CLAUDE_CODE_SESSION_ACCESS_TOKEN: "session-token",
  });

  const program = Effect.scoped(
    Effect.gen(function* () {
      const manager = yield* SessionManager;
      const handle = yield* manager.create({
        model: "claude-create-env-merge",
        env: {
          ANTHROPIC_API_KEY: "override-key",
          EXTRA_FLAG: "enabled",
        },
      });
      return yield* handle.sessionId;
    }).pipe(Effect.provide(layer))
  );

  const sessionId = await runEffect(program);
  const createOptions = findCreateOptionsByModel("claude-create-env-merge");
  expect(sessionId).toBe("session-1");
  expect(createOptions.env).toEqual({
    ANTHROPIC_API_KEY: "override-key",
    CLAUDE_CODE_SESSION_ACCESS_TOKEN: "session-token",
    EXTRA_FLAG: "enabled",
  });
});

test("SessionManager.resume merges defaults and overrides", async () => {
  const { SessionManager, layer } = await makeSessionManagerLayer({
    ANTHROPIC_API_KEY: "test-key",
    EXECUTABLE: "node",
    DISALLOWED_TOOLS: "Bash",
  });

  const program = Effect.scoped(
    Effect.gen(function* () {
      const manager = yield* SessionManager;
      const handle = yield* manager.resume("session-99", {
        model: "claude-resume-overrides",
        disallowedTools: ["Override"],
      });
      return yield* handle.sessionId;
    }).pipe(Effect.provide(layer))
  );

  const sessionId = await runEffect(program);
  const resumeCall = findResumeCallBySessionId("session-99");
  expect(sessionId).toBe("session-99");
  expect(resumeCall.sessionId).toBe("session-99");
  expect((resumeCall.options as { executable?: string })?.executable).toBe("node");
  expect((resumeCall.options as { disallowedTools?: string[] })?.disallowedTools).toEqual(["Override"]);
});

test("SessionManager.prompt merges defaults and overrides", async () => {
  const { SessionManager, layer } = await makeSessionManagerLayer({
    ANTHROPIC_API_KEY: "test-key",
    EXECUTABLE: "node",
    PERMISSION_MODE: "plan",
  });

  const program = Effect.gen(function* () {
    const manager = yield* SessionManager;
    return yield* manager.prompt("hello from prompt overrides", {
      model: "claude-prompt-overrides",
      permissionMode: "dontAsk",
    });
  }).pipe(Effect.provide(layer));

  await runEffect(program);
  const promptCall = findPromptCallByMessage("hello from prompt overrides");
  expect(promptCall.message).toBe("hello from prompt overrides");
  expect((promptCall.options as { executable?: string })?.executable).toBe("node");
  expect((promptCall.options as { permissionMode?: string })?.permissionMode).toBe("dontAsk");
});

test("SessionManager.create fails when model is missing", async () => {
  const { SessionManager, layer } = await makeSessionManagerLayer({
    ANTHROPIC_API_KEY: "test-key",
  });

  const program = Effect.scoped(
    Effect.gen(function* () {
      const manager = yield* SessionManager;
      return yield* manager.create({ model: "" });
    }).pipe(Effect.provide(layer))
  );

  const result = await runEffect(Effect.result(program));
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("ConfigError");
  }
});
