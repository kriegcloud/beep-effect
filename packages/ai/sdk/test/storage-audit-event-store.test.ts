import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as EventLog from "effect/unstable/eventlog/EventLog";
import { KeyValueStore } from "effect/unstable/persistence";
import { Storage } from "../src/core/index.js";
import { runEffect } from "./effect-test.js";

test("AuditEventStore memory writes events", async () => {
  const program = Effect.gen(function* () {
    const store = yield* Storage.AuditEventStore;
    yield* store.write({
      event: "tool_use",
      payload: {
        sessionId: "session-1",
        toolName: "search",
        status: "start",
      },
    });
    const entries = yield* store.entries;
    return entries.length;
  }).pipe(Effect.provide(Storage.AuditEventStore.layerMemory));

  const count = await runEffect(program);
  expect(count).toBe(1);
});

test("AuditEventStore key value store writes events", async () => {
  const layer = Storage.AuditEventStore.layerKeyValueStore({
    journalKey: "test-audit-journal",
    identityKey: "test-audit-identity",
  }).pipe(
    Layer.provide(KeyValueStore.layerMemory),
    Layer.provide(Layer.sync(EventLog.Identity, () => EventLog.makeIdentityUnsafe()))
  );

  const program = Effect.gen(function* () {
    const store = yield* Storage.AuditEventStore;
    yield* store.write({
      event: "permission_decision",
      payload: {
        sessionId: "session-1",
        toolName: "edit",
        decision: "allow",
      },
    });
    const entries = yield* store.entries;
    return entries.length;
  }).pipe(Effect.provide(layer));

  const count = await runEffect(program);
  expect(count).toBe(1);
});
