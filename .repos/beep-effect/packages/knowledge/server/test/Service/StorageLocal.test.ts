import * as os from "node:os";
import * as path from "node:path";
import {
  Storage,
  StorageGenerationConflictError,
  StorageLocalConfig,
  StorageLocalLive,
} from "@beep/knowledge-server/Service/Storage";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const makeTempRoot = Effect.sync(() => {
  const root = path.join(
    os.tmpdir(),
    `beep-knowledge-storage-local-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  return root;
});

describe("Service/StorageLocal", () => {
  effect(
    "stores and retrieves values with generation metadata",
    Effect.fn(function* () {
      const root = yield* makeTempRoot;
      const layer = StorageLocalLive.pipe(Layer.provide(Layer.succeed(StorageLocalConfig, { rootDirectory: root })));

      yield* Effect.gen(function* () {
        const storage = yield* Storage;

        const written = yield* storage.put("ontology/registry.json", '{"version":1,"entries":[]}');
        strictEqual(written.generation, 1);

        const maybeStored = yield* storage.get("ontology/registry.json");
        assertTrue(O.isSome(maybeStored));
        if (O.isSome(maybeStored)) {
          strictEqual(maybeStored.value.generation, 1);
          strictEqual(maybeStored.value.value, '{"version":1,"entries":[]}');
        }
      }).pipe(Effect.provide(layer));
    })
  );

  effect(
    "enforces optimistic concurrency on put/delete",
    Effect.fn(function* () {
      const root = yield* makeTempRoot;
      const layer = StorageLocalLive.pipe(Layer.provide(Layer.succeed(StorageLocalConfig, { rootDirectory: root })));

      yield* Effect.gen(function* () {
        const storage = yield* Storage;

        const first = yield* storage.put("ontology/schema.ttl", "v1");
        const second = yield* storage.put("ontology/schema.ttl", "v2", { expectedGeneration: first.generation });
        strictEqual(second.generation, 2);

        const stalePut = yield* Effect.either(storage.put("ontology/schema.ttl", "v3", { expectedGeneration: 1 }));
        assertTrue(Either.isLeft(stalePut));
        if (Either.isLeft(stalePut)) {
          assertTrue(stalePut.left instanceof StorageGenerationConflictError);
          assertTrue(O.isSome(stalePut.left.actualGeneration));
          if (O.isSome(stalePut.left.actualGeneration)) {
            strictEqual(stalePut.left.actualGeneration.value, 2);
          }
        }

        const removed = yield* storage.delete("ontology/schema.ttl", { expectedGeneration: 2 });
        strictEqual(removed, true);

        const staleDelete = yield* Effect.either(storage.delete("ontology/schema.ttl", { expectedGeneration: 2 }));
        assertTrue(Either.isLeft(staleDelete));
        if (Either.isLeft(staleDelete)) {
          assertTrue(staleDelete.left instanceof StorageGenerationConflictError);
          assertTrue(O.isNone(staleDelete.left.actualGeneration));
        }
      }).pipe(Effect.provide(layer));
    })
  );

  effect(
    "does not provide signed URLs",
    Effect.fn(function* () {
      const root = yield* makeTempRoot;
      const layer = StorageLocalLive.pipe(Layer.provide(Layer.succeed(StorageLocalConfig, { rootDirectory: root })));

      yield* Effect.gen(function* () {
        const storage = yield* Storage;
        const url = yield* storage.signedUrl("ontology/schema.ttl", { purpose: "get" });
        assertTrue(O.isNone(url));
      }).pipe(Effect.provide(layer));
    })
  );
});
