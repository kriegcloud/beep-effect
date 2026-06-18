import * as Pglite from "@beep/pglite";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Layer, Path } from "effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const makePersistentLayer = (dataDir: string) => Pglite.makeLayer({ dataDir, relaxedDurability: true });

const PersistentTestServices = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

const createTableAndInsert = Effect.fnUntraced(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();

  yield* sql`
    CREATE TABLE persistent_notes (
      id SERIAL PRIMARY KEY,
      body TEXT NOT NULL
    )
  `;
  yield* sql`
    INSERT INTO persistent_notes (body)
    VALUES ('durable hello')
  `;
});

const readPersistentBodies = Effect.fnUntraced(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const rows = yield* sql<{ readonly body: string }>`
    SELECT body
    FROM persistent_notes
    ORDER BY id ASC
  `;

  return rows.map((row) => row.body);
});

describe("PgliteClient (file-backed)", () => {
  it.effect("persists rows across closing and reopening the same dataDir", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const tempDir = yield* fs.makeTempDirectoryScoped({ prefix: "beep-pglite-persistent-" });
      const dataDir = path.join(tempDir, "pgdata");
      const layer = makePersistentLayer(dataDir);

      yield* createTableAndInsert().pipe(provideScopedLayer(layer));
      const bodies = yield* readPersistentBodies().pipe(provideScopedLayer(layer));

      expect(bodies).toEqual(["durable hello"]);
    }).pipe(provideScopedLayer(PersistentTestServices))
  );
});
