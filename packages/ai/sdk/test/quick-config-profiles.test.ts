import { QuerySupervisor } from "@beep/ai-sdk";
import { managedRuntime, runtimeLayer } from "@beep/ai-sdk/QuickConfig";
import { SandboxService } from "@beep/ai-sdk/Sandbox/SandboxService";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { runEffect } from "./effect-test.js";

test("runtimeLayer rejects kv+journaled profile", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "kv",
      storageMode: "journaled",
      allowUnsafeKv: true,
    })
  ).toThrow("storageBackend 'kv' cannot be used with storageMode 'journaled'");
});

test("runtimeLayer rejects sync with kv backend", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: { sync: "ws://localhost:8787" },
      storageBackend: "kv",
      allowUnsafeKv: true,
    })
  ).toThrow("persistence.sync is not supported with storageBackend 'kv'");
});

test("runtimeLayer rejects sync with r2 backend", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: { sync: "ws://localhost:8787" },
      storageBackend: "r2",
    })
  ).toThrow("persistence.sync is not supported with storageBackend 'r2'");
});

test("runtimeLayer rejects kv backend by default", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "kv",
    })
  ).toThrow("storageBackend 'kv' is disabled by default");
});

test("runtimeLayer rejects invalid tenant format", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      tenant: "bad/tenant",
    })
  ).toThrow("invalid tenant format");
});

test("runtimeLayer accepts local sandbox profile", () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory",
    sandbox: "local",
  });
  expect(layer).toBeDefined();
});

test("runtimeLayer local sandbox profile provides SandboxService", async () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory",
    sandbox: "local",
  });

  const sandboxOption = await runEffect(
    Effect.scoped(Effect.serviceOption(SandboxService).pipe(Effect.provide(layer)))
  );

  expect(Option.isSome(sandboxOption)).toBe(true);
  if (Option.isSome(sandboxOption)) {
    expect(sandboxOption.value.provider).toBe("local");
    expect(sandboxOption.value.isolated).toBe(false);
  }
});

test("runtimeLayer exposes QuerySupervisor in output", async () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory",
  });

  const stats = await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const supervisor = yield* QuerySupervisor;
        return yield* supervisor.stats;
      }).pipe(Effect.provide(layer))
    )
  );

  expect(stats.concurrencyLimit).toBe(4);
});

test("runtimeLayer forwards supervisor config", async () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory",
    supervisor: { emitEvents: true, pendingQueueCapacity: 16 },
  });

  const stats = await runEffect(
    Effect.scoped(
      Effect.gen(function* () {
        const supervisor = yield* QuerySupervisor;
        return yield* supervisor.stats;
      }).pipe(Effect.provide(layer))
    )
  );

  expect(stats.pendingQueueCapacity).toBe(16);
});

test("managedRuntime creates a lifecycle-managed runtime", async () => {
  const rt = managedRuntime({
    apiKey: "test-key",
    persistence: "memory",
  });

  try {
    const stats = await rt.runPromise(
      Effect.gen(function* () {
        const supervisor = yield* QuerySupervisor;
        return yield* supervisor.stats;
      })
    );
    expect(stats.concurrencyLimit).toBe(4);
  } finally {
    await rt.dispose();
  }
});

test("managedRuntime local sandbox profile provides SandboxService", async () => {
  const rt = managedRuntime({
    apiKey: "test-key",
    persistence: "memory",
    sandbox: "local",
  });

  try {
    const sandbox = await rt.runPromise(Effect.service(SandboxService));
    expect(sandbox.provider).toBe("local");
    expect(sandbox.isolated).toBe(false);
  } finally {
    await rt.dispose();
  }
});
