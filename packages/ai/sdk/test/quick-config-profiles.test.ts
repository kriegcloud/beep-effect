import { QuerySupervisor } from "@beep/ai-sdk";
import { managedRuntime, runtimeLayer } from "@beep/ai-sdk/QuickConfig";
import { SandboxService } from "@beep/ai-sdk/Sandbox/SandboxService";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import { runEffect } from "./effect-test.js";

const toFailureMessage = (failure: unknown) =>
  P.hasProperty(failure, "message") && P.isString(failure.message) ? failure.message : undefined;

const expectRuntimeLayerFailure = async (options: Parameters<typeof runtimeLayer>[0], message: string) => {
  const result = await runEffect(
    Effect.result(Effect.scoped(Effect.service(QuerySupervisor).pipe(Effect.provide(runtimeLayer(options)))))
  );
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    const failureMessage = toFailureMessage(result.failure);
    expect(failureMessage).toBeDefined();
    if (failureMessage !== undefined) {
      expect(failureMessage).toContain(message);
    }
  }
};

test("runtimeLayer rejects kv+journaled profile", async () => {
  await expectRuntimeLayerFailure(
    {
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "kv",
      storageMode: "journaled",
      allowUnsafeKv: true,
    },
    "storageBackend 'kv' cannot be used with storageMode 'journaled'"
  );
});

test("runtimeLayer rejects sync with kv backend", async () => {
  await expectRuntimeLayerFailure(
    {
      apiKey: "test-key",
      persistence: { sync: "ws://localhost:8787" },
      storageBackend: "kv",
      allowUnsafeKv: true,
    },
    "persistence.sync is not supported with storageBackend 'kv'"
  );
});

test("runtimeLayer rejects sync with r2 backend", async () => {
  await expectRuntimeLayerFailure(
    {
      apiKey: "test-key",
      persistence: { sync: "ws://localhost:8787" },
      storageBackend: "r2",
    },
    "persistence.sync is not supported with storageBackend 'r2'"
  );
});

test("runtimeLayer rejects kv backend by default", async () => {
  await expectRuntimeLayerFailure(
    {
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "kv",
    },
    "storageBackend 'kv' is disabled by default"
  );
});

test("runtimeLayer rejects invalid tenant format", async () => {
  await expectRuntimeLayerFailure(
    {
      apiKey: "test-key",
      persistence: "filesystem",
      tenant: "bad/tenant",
    },
    "invalid tenant format"
  );
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

test("managedRuntime returns a usable runtime layer", async () => {
  const layer = managedRuntime({
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

test("managedRuntime local sandbox profile provides SandboxService", async () => {
  const layer = managedRuntime({
    apiKey: "test-key",
    persistence: "memory",
    sandbox: "local",
  });

  const sandbox = await runEffect(Effect.scoped(Effect.service(SandboxService).pipe(Effect.provide(layer))));
  expect(sandbox.provider).toBe("local");
  expect(sandbox.isolated).toBe(false);
});
