import { Storage, StorageGenerationConflictError, StorageMemoryLive } from "@beep/knowledge-server/Service/Storage";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as O from "effect/Option";

describe("Service/Storage", () => {
  effect(
    "stores and retrieves values with generation metadata",
    Effect.fn(function* () {
      const storage = yield* Storage;

      const written = yield* storage.put("ontology/registry.json", '{"version":1,"entries":[]}');
      strictEqual(written.generation, 1);

      const maybeStored = yield* storage.get("ontology/registry.json");
      assertTrue(O.isSome(maybeStored));
      if (O.isSome(maybeStored)) {
        strictEqual(maybeStored.value.generation, 1);
        strictEqual(maybeStored.value.value, '{"version":1,"entries":[]}');
      }
    }, Effect.provide(StorageMemoryLive))
  );

  effect(
    "increments generation on optimistic write when expected generation matches",
    Effect.fn(function* () {
      const storage = yield* Storage;

      const first = yield* storage.put("ontology/schema.ttl", "v1");
      const second = yield* storage.put("ontology/schema.ttl", "v2", { expectedGeneration: first.generation });

      strictEqual(first.generation, 1);
      strictEqual(second.generation, 2);
      strictEqual(second.value, "v2");
    }, Effect.provide(StorageMemoryLive))
  );

  effect(
    "fails stale optimistic write with generation conflict",
    Effect.fn(function* () {
      const storage = yield* Storage;

      const first = yield* storage.put("ontology/schema.ttl", "v1");
      const second = yield* storage.put("ontology/schema.ttl", "v2", { expectedGeneration: first.generation });

      strictEqual(second.generation, 2);

      const staleAttempt = yield* Effect.either(
        storage.put("ontology/schema.ttl", "v3", {
          expectedGeneration: first.generation,
        })
      );

      assertTrue(Either.isLeft(staleAttempt));
      if (Either.isLeft(staleAttempt)) {
        assertTrue(staleAttempt.left instanceof StorageGenerationConflictError);
        strictEqual(staleAttempt.left.expectedGeneration, 1);
        strictEqual(staleAttempt.left.actualGeneration, 2);
      }
    }, Effect.provide(StorageMemoryLive))
  );

  effect(
    "fails stale optimistic delete with generation conflict",
    Effect.fn(function* () {
      const storage = yield* Storage;

      const current = yield* storage.put("ontology/schema.ttl", "v1");
      const removed = yield* storage.delete("ontology/schema.ttl", { expectedGeneration: current.generation });
      strictEqual(removed, true);

      const staleDelete = yield* Effect.either(storage.delete("ontology/schema.ttl", { expectedGeneration: 1 }));
      assertTrue(Either.isLeft(staleDelete));
      if (Either.isLeft(staleDelete)) {
        assertTrue(staleDelete.left instanceof StorageGenerationConflictError);
        strictEqual(staleDelete.left.actualGeneration, null);
      }
    }, Effect.provide(StorageMemoryLive))
  );
});
