import { fileURLToPath } from "node:url";
import { makeDrizzle, makeDrizzleLayer, migrate, PostgresClient, PostgresDrizzle } from "@beep/postgres";
import { NativePgClient } from "@beep/postgres/interop";
import { makePgliteSqlTestLayer, type SqlTestHooks, TestDatabaseInfo } from "@beep/test-utils";
import { A, Str } from "@beep/utils";
import { describe, expect, layer } from "@effect/vitest";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { Effect, Layer, pipe } from "effect";
import * as O from "effect/Option";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const sharedConnectionUri = pipe(process.env.BEEP_TEST_DATABASE_URL, O.fromUndefinedOr, O.filter(Str.isNonEmpty));
const migrationsFolder = fileURLToPath(new URL("./fixtures/migrations", import.meta.url));
const shouldUseTestcontainers = process.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
const shouldRunPgliteIntegration = O.isSome(sharedConnectionUri) || shouldUseTestcontainers;

const driverNotes = pgTable("driver_notes", {
  body: text("body").notNull(),
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(),
});

const migratedNotes = pgTable("driver_migrated_notes", {
  body: text("body").notNull(),
  id: serial("id").primaryKey(),
});

const makePgliteLayer = <MigrateError = never, SeedError = never>(hooks?: SqlTestHooks<MigrateError, SeedError>) =>
  pipe(
    sharedConnectionUri,
    O.match({
      onNone: () =>
        hooks === undefined
          ? Layer.fresh(makePgliteSqlTestLayer({ mode: "testcontainers" }))
          : Layer.fresh(makePgliteSqlTestLayer({ hooks, mode: "testcontainers" })),
      onSome: (connectionUri) =>
        hooks === undefined
          ? Layer.fresh(
              makePgliteSqlTestLayer({
                external: { connectionUri },
                mode: "external",
              })
            )
          : Layer.fresh(
              makePgliteSqlTestLayer({
                external: { connectionUri },
                hooks,
                mode: "external",
              })
            ),
    })
  );

const makePostgresClientLayer = () =>
  Layer.unwrap(Effect.map(Effect.service(NativePgClient.PgClient), PostgresClient.fromPgClient)).pipe(
    Layer.provideMerge(makePgliteLayer())
  );

const makePostgresDrizzleLayer = () =>
  makeDrizzleLayer().pipe(Layer.provideMerge(makePgliteLayer({ migrate: createDriverNotesTable })));

const createDriverNotesTable = Effect.gen(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  yield* sql`
    CREATE TABLE driver_notes (
      id SERIAL PRIMARY KEY,
      body TEXT NOT NULL,
      rating INTEGER NOT NULL
    )
  `;
});

const bodiesWithRatings = (rows: ReadonlyArray<{ readonly body: string; readonly rating: number }>) =>
  pipe(
    rows,
    A.map((row) => `${row.body}:${row.rating}`)
  );

if (!shouldRunPgliteIntegration) {
  describe.skip("Postgres PgLite integration", () => {});
} else {
  describe.sequential("Postgres PgLite integration", () => {
    layer(makePostgresClientLayer(), { timeout: "2 minutes" })((it) => {
      it.effect(
        "provides PostgresClient over the PgLite PgClient",
        Effect.fnUntraced(function* () {
          const beepClient = yield* PostgresClient;
          const nativeClient = yield* NativePgClient.PgClient;
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          const info = yield* TestDatabaseInfo;
          const rows = yield* sql<{ readonly value: number }>`SELECT 41 + 1 AS value`;
          const value = pipe(
            rows,
            A.head,
            O.map((row) => row.value),
            O.getOrElse(() => 0)
          );

          expect(["pg-external", "pglite-testcontainers"]).toContain(info.driver);
          expect(beepClient).toBe(nativeClient);
          expect(value).toBe(42);
        }),
        120_000
      );
    });

    layer(makePostgresDrizzleLayer(), { timeout: "2 minutes" })((it) => {
      it.effect(
        "runs Drizzle CRUD and transactions through makeDrizzleLayer",
        Effect.fnUntraced(function* () {
          const db = yield* PostgresDrizzle;

          yield* db.insert(driverNotes).values([
            { body: "alpha", rating: 2 },
            { body: "beta", rating: 1 },
          ]);

          const selected = yield* db
            .select({ body: driverNotes.body, rating: driverNotes.rating })
            .from(driverNotes)
            .orderBy(driverNotes.rating);
          const transacted = yield* db.transaction(
            Effect.fnUntraced(function* (tx) {
              yield* tx.insert(driverNotes).values({ body: "tx", rating: 3 });
              return yield* tx
                .select({ body: driverNotes.body, rating: driverNotes.rating })
                .from(driverNotes)
                .orderBy(driverNotes.rating);
            })
          );

          expect(bodiesWithRatings(selected)).toEqual(["beta:1", "alpha:2"]);
          expect(bodiesWithRatings(transacted)).toEqual(["beta:1", "alpha:2", "tx:3"]);
        }),
        120_000
      );
    });

    layer(makePgliteLayer(), { timeout: "2 minutes" })((it) => {
      it.effect(
        "runs Drizzle migrations from a fixture folder through PgLite",
        Effect.fnUntraced(function* () {
          const info = yield* TestDatabaseInfo;
          const db = yield* makeDrizzle();
          const migrationsSchema = pipe(
            info.schema,
            O.getOrElse(() => "drizzle")
          );

          yield* migrate(db, {
            migrationsFolder,
            migrationsSchema,
          });
          yield* db.insert(migratedNotes).values({ body: "from migration" });
          const rows = yield* db.select({ body: migratedNotes.body }).from(migratedNotes);

          const result = pipe(
            rows,
            A.map((row) => row.body)
          );

          expect(result).toEqual(["from migration"]);
        }),
        120_000
      );
    });
  });
}
