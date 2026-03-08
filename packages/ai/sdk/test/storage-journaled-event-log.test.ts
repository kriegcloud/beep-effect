import { Storage } from "@beep/ai-sdk";
import { makeUserMessage } from "@beep/ai-sdk/Schema/Message";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import { KeyValueStore } from "effect/unstable/persistence";
import { runEffect } from "./effect-test.js";

const flakyKeyValueLayer = () => {
  const map = new Map<string, string>();
  let failNextSet = true;

  const layer = Layer.succeed(
    KeyValueStore.KeyValueStore,
    KeyValueStore.makeStringOnly({
      get: (key) => Effect.succeed(map.get(key)),
      set: (key, value) =>
        failNextSet
          ? Effect.fail(
              new KeyValueStore.KeyValueStoreError({
                message: `persist failure for key=${key}`,
                method: "set",
                key,
              })
            )
          : Effect.sync(() => {
              map.set(key, value);
            }),
      remove: (key) =>
        Effect.sync(() => {
          map.delete(key);
        }),
      clear: Effect.sync(() => {
        map.clear();
      }),
      size: Effect.sync(() => map.size),
    })
  );

  return {
    layer,
    armFailure: () => {
      failNextSet = true;
    },
    disarmFailure: () => {
      failNextSet = false;
    },
  };
};

test("EventJournalKeyValueStore persists entries in order", async () => {
  const layer = Storage.layerKeyValueStore({ key: "test-journal" }).pipe(Layer.provide(KeyValueStore.layerMemory));

  const program = Effect.gen(function* () {
    const journal = yield* EventJournal.EventJournal;
    yield* journal.write({
      event: "event-a",
      primaryKey: "pk-a",
      payload: new TextEncoder().encode("a"),
      effect: () => Effect.void,
    });
    yield* journal.write({
      event: "event-b",
      primaryKey: "pk-b",
      payload: new TextEncoder().encode("b"),
      effect: () => Effect.void,
    });
    return yield* journal.entries;
  }).pipe(Effect.provide(layer));

  const entries = await runEffect(program);
  expect(entries).toHaveLength(2);
  expect(entries[0]?.event).toBe("event-a");
  expect(entries[1]?.event).toBe("event-b");
});

test("EventJournalKeyValueStore does not poison in-memory index on persist failure", async () => {
  const flaky = flakyKeyValueLayer();
  flaky.armFailure();

  const layer = Storage.layerKeyValueStore({ key: "flaky-journal" }).pipe(Layer.provide(flaky.layer));

  const program = Effect.gen(function* () {
    const journal = yield* EventJournal.EventJournal;

    const firstAttempt = yield* Effect.result(
      journal.write({
        event: "test-event",
        primaryKey: "pk-test",
        payload: new TextEncoder().encode("first"),
        effect: () => Effect.void,
      })
    );
    const afterFailure = yield* journal.entries;

    flaky.disarmFailure();
    const secondAttempt = yield* Effect.result(
      journal.write({
        event: "test-event",
        primaryKey: "pk-test-2",
        payload: new TextEncoder().encode("second"),
        effect: () => Effect.void,
      })
    );
    const afterSuccess = yield* journal.entries;

    return {
      firstAttempt,
      secondAttempt,
      afterFailure,
      afterSuccess,
    };
  }).pipe(Effect.provide(layer));

  const result = await runEffect(program);
  expect(Result.isFailure(result.firstAttempt)).toBe(true);
  expect(result.afterFailure).toHaveLength(0);
  expect(Result.isSuccess(result.secondAttempt)).toBe(true);
  expect(result.afterSuccess).toHaveLength(1);
});

test("ChatHistoryStore.layerJournaled appends and lists messages", async () => {
  const layer = Storage.ChatHistoryStore.layerJournaled({
    journalKey: "chat-journal",
    identityKey: "chat-identity",
    prefix: "chat-prefix",
  }).pipe(Layer.provide(KeyValueStore.layerMemory));

  const message = makeUserMessage("hello from journaled chat");
  const program = Effect.gen(function* () {
    const store = yield* Storage.ChatHistoryStore;
    yield* store.appendMessage("session-1", message);
    return yield* store.list("session-1");
  }).pipe(Effect.provide(layer));

  const events = await runEffect(program);
  expect(events).toHaveLength(1);
  expect(events[0]?.message).toEqual(message);
});
