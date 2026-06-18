import * as Pglite from "@beep/pglite";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Exit, FileSystem, Layer, Path } from "effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import {
  ChatDbCompatibilityMarker,
  ensureCompatibleChatDbDataDir,
  markCompatibleChatDbDataDir,
} from "@/runtime/Pglite";

const TestServices = Layer.mergeAll(BunFileSystem.layer, BunPath.layer);

const provideScopedLayer =
  <ROut, E2, RIn>(scopeLayer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(scopeLayer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const withPgliteSql = <A, E, R>(dataDir: string, effect: Effect.Effect<A, E, R>) =>
  effect.pipe(provideScopedLayer(Pglite.makeLayer({ dataDir, relaxedDurability: true })));

const markerPath = (path: Path.Path, dataDir: string): string => path.join(dataDir, ChatDbCompatibilityMarker);

const createPgliteFixture = Effect.fn("ProfessionalDesktop.PgliteCompatibilityTest.createPgliteFixture")(function* (
  dataDir: string
) {
  yield* withPgliteSql(
    dataDir,
    Effect.gen(function* () {
      const sql = (yield* SqlClient.SqlClient).withoutTransforms();
      yield* sql`
        CREATE TABLE preserved_notes (
          id SERIAL PRIMARY KEY,
          body TEXT NOT NULL
        )
      `;
      yield* sql`
        INSERT INTO preserved_notes (body)
        VALUES ('keep me')
      `;
    })
  );
});

const readPgliteFixture = Effect.fn("ProfessionalDesktop.PgliteCompatibilityTest.readPgliteFixture")(function* (
  dataDir: string
) {
  return yield* withPgliteSql(
    dataDir,
    Effect.gen(function* () {
      const sql = (yield* SqlClient.SqlClient).withoutTransforms();
      const rows = yield* sql<{ readonly body: string }>`
        SELECT body
        FROM preserved_notes
        ORDER BY id ASC
      `;

      return rows.map((row) => row.body);
    })
  );
});

const backupNames = Effect.fn("ProfessionalDesktop.PgliteCompatibilityTest.backupNames")(function* (
  rootDir: string,
  dataDirName: string
) {
  const fs = yield* FileSystem.FileSystem;
  return (yield* fs.readDirectory(rootDir)).filter((entry) => entry.startsWith(`${dataDirName}.pre-inprocess-`));
});

layer(TestServices)("Pglite data-dir compatibility gate", (it) => {
  describe("ensureCompatibleChatDbDataDir", () => {
    it.effect(
      "prepares a fresh data dir and defers the marker until successful open",
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const rootDir = yield* fs.makeTempDirectoryScoped({ prefix: "beep-chat-db-fresh-" });
        const dataDir = path.join(rootDir, "chat-db");

        const shouldMarkDataDir = yield* ensureCompatibleChatDbDataDir(dataDir);

        expect(shouldMarkDataDir).toBe(true);
        expect(yield* fs.exists(markerPath(path, dataDir))).toBe(false);
        yield* markCompatibleChatDbDataDir(dataDir);
        expect(yield* fs.exists(markerPath(path, dataDir))).toBe(true);
        expect(yield* backupNames(rootDir, "chat-db")).toEqual([]);
      })
    );

    it.effect(
      "leaves an already marked data dir in place",
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const rootDir = yield* fs.makeTempDirectoryScoped({ prefix: "beep-chat-db-marked-" });
        const dataDir = path.join(rootDir, "chat-db");
        const retainedPath = path.join(dataDir, "retained.txt");

        yield* fs.makeDirectory(dataDir, { recursive: true });
        yield* fs.writeFileString(markerPath(path, dataDir), "runtime=professional-desktop-pglite-inprocess\n");
        yield* fs.writeFileString(retainedPath, "still here");

        const shouldMarkDataDir = yield* ensureCompatibleChatDbDataDir(dataDir);

        expect(shouldMarkDataDir).toBe(false);
        expect(yield* fs.readFileString(retainedPath)).toBe("still here");
        expect(yield* backupNames(rootDir, "chat-db")).toEqual([]);
      })
    );

    it.effect(
      "preserves an unmarked data dir that opens with the in-process driver",
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const rootDir = yield* fs.makeTempDirectoryScoped({ prefix: "beep-chat-db-compatible-" });
        const dataDir = path.join(rootDir, "chat-db");

        yield* createPgliteFixture(dataDir);
        const shouldMarkDataDir = yield* ensureCompatibleChatDbDataDir(dataDir);

        expect(shouldMarkDataDir).toBe(true);
        expect(yield* fs.exists(markerPath(path, dataDir))).toBe(false);
        yield* markCompatibleChatDbDataDir(dataDir);
        expect(yield* fs.exists(markerPath(path, dataDir))).toBe(true);
        expect(yield* readPgliteFixture(dataDir)).toEqual(["keep me"]);
        expect(yield* backupNames(rootDir, "chat-db")).toEqual([]);
      })
    );

    it.effect(
      "moves a populated non-PGlite data dir aside without a premature marker",
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const rootDir = yield* fs.makeTempDirectoryScoped({ prefix: "beep-chat-db-legacy-" });
        const dataDir = path.join(rootDir, "chat-db");

        yield* fs.makeDirectory(dataDir, { recursive: true });
        yield* fs.writeFileString(path.join(dataDir, "legacy.txt"), "legacy contents");

        const shouldMarkDataDir = yield* ensureCompatibleChatDbDataDir(dataDir);

        const backups = yield* backupNames(rootDir, "chat-db");
        expect(shouldMarkDataDir).toBe(true);
        expect(backups).toHaveLength(1);
        expect(yield* fs.exists(markerPath(path, dataDir))).toBe(false);
        expect(yield* fs.readFileString(path.join(rootDir, backups[0]!, "legacy.txt"))).toBe("legacy contents");
        yield* markCompatibleChatDbDataDir(dataDir);
        expect(yield* fs.exists(markerPath(path, dataDir))).toBe(true);
      })
    );

    it.effect(
      "fails instead of moving an unreadable data dir",
      Effect.fn(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const rootDir = yield* fs.makeTempDirectoryScoped({ prefix: "beep-chat-db-unreadable-" });
        const dataDir = path.join(rootDir, "chat-db");

        yield* fs.makeDirectory(dataDir, { recursive: true });
        yield* fs.writeFileString(path.join(dataDir, "legacy.txt"), "legacy contents");
        yield* fs.chmod(dataDir, 0);
        const result = yield* ensureCompatibleChatDbDataDir(dataDir).pipe(Effect.exit);
        yield* fs.chmod(dataDir, 0o700).pipe(Effect.ignore);

        expect(Exit.isFailure(result)).toBe(true);
        expect(yield* fs.exists(markerPath(path, dataDir))).toBe(false);
        expect(yield* backupNames(rootDir, "chat-db")).toEqual([]);
      })
    );
  });
});
