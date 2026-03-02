import { SessionConfig } from "@beep/ai-sdk/SessionConfig";
import { expect, test } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import { runEffect } from "./effect-test.js";

const configLayer = (entries: Record<string, string>) => ConfigProvider.layerAdd(ConfigProvider.fromUnknown(entries));
const toMillis = (input: Duration.Input) => {
  const duration = Duration.fromInput(input);
  return duration === undefined ? undefined : Duration.toMillis(duration);
};

test("SessionConfig reads defaults from config provider", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        EXECUTABLE: "node",
        PATH_TO_CLAUDE_CODE_EXECUTABLE: "/tmp/claude",
        EXECUTABLE_ARGS: "--inspect, --no-warnings",
        PERMISSION_MODE: "plan",
        ALLOWED_TOOLS: "Read,Edit",
        DISALLOWED_TOOLS: "Bash",
      })
    )
  );

  const program = Effect.gen(function* () {
    const config = yield* SessionConfig;
    return config;
  }).pipe(Effect.provide(layer));

  const config = await runEffect(program);
  expect(config.defaults.executable).toBe("node");
  expect(config.defaults.pathToClaudeCodeExecutable).toBe("/tmp/claude");
  expect(config.defaults.executableArgs).toEqual(["--inspect", "--no-warnings"]);
  expect(config.defaults.permissionMode).toBe("plan");
  expect(config.defaults.allowedTools).toEqual(["Read", "Edit"]);
  expect(config.defaults.disallowedTools).toEqual(["Bash"]);
  expect(config.defaults.env?.ANTHROPIC_API_KEY).toBe("test-key");
  expect(toMillis(config.runtime.closeDrainTimeout)).toBe(15_000);
  expect(config.runtime.turnSendTimeout).toBeUndefined();
  expect(config.runtime.turnResultTimeout).toBeUndefined();
});

test("SessionConfig defaults executable to bun", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
      })
    )
  );

  const program = Effect.gen(function* () {
    const config = yield* SessionConfig;
    return config;
  }).pipe(Effect.provide(layer));

  const config = await runEffect(program);
  expect(config.defaults.executable).toBeUndefined();
  expect(toMillis(config.runtime.closeDrainTimeout)).toBe(15_000);
  expect(config.runtime.turnSendTimeout).toBeUndefined();
  expect(config.runtime.turnResultTimeout).toBeUndefined();
});

test("SessionConfig uses API_KEY fallback for env injection", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        API_KEY: "fallback-key",
      })
    )
  );

  const program = Effect.gen(function* () {
    const config = yield* SessionConfig;
    return config;
  }).pipe(Effect.provide(layer));

  const config = await runEffect(program);
  expect(config.defaults.env?.ANTHROPIC_API_KEY).toBe("fallback-key");
  expect(toMillis(config.runtime.closeDrainTimeout)).toBe(15_000);
  expect(config.runtime.turnSendTimeout).toBeUndefined();
  expect(config.runtime.turnResultTimeout).toBeUndefined();
});

test("SessionConfig reads CLOSE_DRAIN_TIMEOUT override", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        CLOSE_DRAIN_TIMEOUT: "45 seconds",
      })
    )
  );

  const program = Effect.gen(function* () {
    const config = yield* SessionConfig;
    return config;
  }).pipe(Effect.provide(layer));

  const config = await runEffect(program);
  expect(toMillis(config.runtime.closeDrainTimeout)).toBe(45_000);
  expect(config.runtime.turnSendTimeout).toBeUndefined();
  expect(config.runtime.turnResultTimeout).toBeUndefined();
});

test("SessionConfig reads turn timeout overrides", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        TURN_SEND_TIMEOUT: "12 seconds",
        TURN_RESULT_TIMEOUT: "90 seconds",
      })
    )
  );

  const program = Effect.gen(function* () {
    const config = yield* SessionConfig;
    return config;
  }).pipe(Effect.provide(layer));

  const config = await runEffect(program);
  expect(config.runtime.turnSendTimeout).toBeDefined();
  expect(config.runtime.turnResultTimeout).toBeDefined();
  if (config.runtime.turnSendTimeout !== undefined) {
    expect(toMillis(config.runtime.turnSendTimeout)).toBe(12_000);
  }
  if (config.runtime.turnResultTimeout !== undefined) {
    expect(toMillis(config.runtime.turnResultTimeout)).toBe(90_000);
  }
});

test("SessionConfig fails fast when credentials are missing", async () => {
  const layer = SessionConfig.layer.pipe(Layer.provide(configLayer({})));

  const program = Effect.service(SessionConfig).pipe(Effect.provide(layer));

  const result = await runEffect(Effect.result(program));
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure._tag).toBe("ConfigError");
    expect(result.failure.message).toContain("Missing API credentials");
    expect(result.failure.message).toContain("ANTHROPIC_API_KEY");
    expect(result.failure.message).toContain("CLAUDE_CODE_SESSION_ACCESS_TOKEN");
  }
});
