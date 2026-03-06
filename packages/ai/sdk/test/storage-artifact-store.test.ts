import { Schema, Storage } from "@beep/ai-sdk";
import { makeUnsafeUtc } from "@beep/utils/DateTime";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { KeyValueStore } from "effect/unstable/persistence";

const makeRecord = (id: string, sessionId: string) =>
  Schema.ArtifactRecord.make({
    id,
    sessionId,
    kind: "tool_result",
    encoding: "utf8",
    content: `content-${id}`,
    createdAt: makeUnsafeUtc(0),
  });

const runWithLayer = (layer: Layer.Layer<Storage.ArtifactStore>) =>
  Effect.gen(function* () {
    const store = yield* Storage.ArtifactStore;
    const first = makeRecord("artifact-1", "session-1");
    const second = makeRecord("artifact-2", "session-1");

    yield* store.put(first);
    yield* store.put(second);

    const list = yield* store.list("session-1");
    const fetched = yield* store.get("artifact-1");

    yield* store.delete("artifact-2");
    const afterDelete = yield* store.list("session-1");

    return { list, fetched, afterDelete };
  }).pipe(Effect.provide(layer));

test("ArtifactStore memory stores records", async () => {
  const program = runWithLayer(Storage.ArtifactStore.layerMemory);
  const result = await Effect.runPromise(program);

  expect(result.list.length).toBe(2);
  expect(result.fetched._tag).toBe("Some");
  expect(result.afterDelete.length).toBe(1);
});

test("ArtifactStore key value store stores records", async () => {
  const layer = Storage.ArtifactStore.layerKeyValueStore({ prefix: "test-artifacts" }).pipe(
    Layer.provide(KeyValueStore.layerMemory)
  );
  const program = runWithLayer(layer);
  const result = await Effect.runPromise(program);

  expect(result.list.length).toBe(2);
});
