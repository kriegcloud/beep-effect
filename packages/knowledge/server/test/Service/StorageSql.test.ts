import * as os from "node:os";
import * as path from "node:path";
import {
  Storage,
  StorageGenerationConflictError,
  StorageSqlConfig,
  StorageSqlLive,
} from "@beep/knowledge-server/Service/Storage";
import { assertTrue, describe, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";

const makeTempDbPath = Effect.sync(() =>
  path.join(os.tmpdir(), `beep-knowledge-storage-sql-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`)
);

describe("Service/StorageSql (sqlite)", () => {
  effect(
    "persists values durably across layer recreation",
    Effect.fn(function* () {
      const dbPath = yield* makeTempDbPath;

      const layer1 = StorageSqlLive.pipe(Layer.provide(Layer.succeed(StorageSqlConfig, { databasePath: dbPath })));
      yield* Effect.gen(function* () {
        const storage = yield* Storage;
        const written = yield* storage.put("ontology/schema.ttl", "v1");
        strictEqual(written.generation, 1);
      }).pipe(Effect.provide(layer1));

      const layer2 = StorageSqlLive.pipe(Layer.provide(Layer.succeed(StorageSqlConfig, { databasePath: dbPath })));
      yield* Effect.gen(function* () {
        const storage = yield* Storage;
        const maybe = yield* storage.get("ontology/schema.ttl");
        assertTrue(O.isSome(maybe));
        if (O.isSome(maybe)) {
          strictEqual(maybe.value.value, "v1");
          strictEqual(maybe.value.generation, 1);
        }
      }).pipe(Effect.provide(layer2));
    })
  );

  effect(
    "enforces optimistic concurrency on put/delete",
    Effect.fn(function* () {
      const dbPath = yield* makeTempDbPath;
      const layer = StorageSqlLive.pipe(Layer.provide(Layer.succeed(StorageSqlConfig, { databasePath: dbPath })));

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
      const dbPath = yield* makeTempDbPath;
      const layer = StorageSqlLive.pipe(Layer.provide(Layer.succeed(StorageSqlConfig, { databasePath: dbPath })));

      yield* Effect.gen(function* () {
        const storage = yield* Storage;
        const url = yield* storage.signedUrl("ontology/schema.ttl", { purpose: "get", expiresInSeconds: 60 });
        assertTrue(O.isNone(url));
      }).pipe(Effect.provide(layer));
    })
  );
});
