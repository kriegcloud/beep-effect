import { buildRemoteUrl } from "@beep/ai-sdk/Sync/RemoteSync";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import { runEffect } from "./effect-test.js";

test("buildRemoteUrl requires a tenant for event-log", async () => {
  const result = await runEffect(Effect.result(buildRemoteUrl("wss://sync.example.com")));
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure.message).toContain("Remote sync requires a tenant when using /event-log.");
  }
});

test("buildRemoteUrl appends tenant and token", async () => {
  const url = await runEffect(
    buildRemoteUrl("wss://sync.example.com/event-log", {
      tenant: "demo",
      authToken: "token-123",
    })
  );
  expect(url).toBe("wss://sync.example.com/event-log/demo?token=token-123");
});

test("buildRemoteUrl preserves custom path", async () => {
  const url = await runEffect(
    buildRemoteUrl("wss://sync.example.com/custom", {
      tenant: "demo",
    })
  );
  expect(url).toBe("wss://sync.example.com/custom");
});

test("buildRemoteUrl rejects invalid tenant format", async () => {
  const result = await runEffect(
    Effect.result(
      buildRemoteUrl("wss://sync.example.com/event-log", {
        tenant: "bad/tenant",
      })
    )
  );
  expect(Result.isFailure(result)).toBe(true);
  if (Result.isFailure(result)) {
    expect(result.failure.message).toContain("Invalid tenant format.");
  }
});
