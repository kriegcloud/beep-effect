import { fileURLToPath } from "node:url";
import { makeDrizzle, migrate } from "@beep/postgres";
import { makePgliteSqlTestLayer, type SqlTestHooks, TestDatabaseInfo } from "@beep/test-utils";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const sharedConnectionUri = pipe(process.env.BEEP_TEST_DATABASE_URL, O.fromUndefinedOr, O.filter(Str.isNonEmpty));
const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));
const shouldUseTestcontainers = process.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
const shouldRunPgliteIntegration = O.isSome(sharedConnectionUri) || shouldUseTestcontainers;

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

if (!shouldRunPgliteIntegration) {
  describe.skip("db-admin architecture-lab migration PgLite integration", () => {});
} else {
  describe.sequential("db-admin architecture-lab migration PgLite integration", () => {
    layer(makePgliteLayer(), { timeout: "2 minutes" })((it) => {
      it.effect(
        "runs the architecture-lab migration target SQL",
        Effect.fnUntraced(function* () {
          const info = yield* TestDatabaseInfo;
          const db = yield* makeDrizzle();
          const migrationsSchema = pipe(
            info.schema,
            O.getOrElse(() => "drizzle")
          );

          yield* migrate(db, { migrationsFolder, migrationsSchema });

          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          yield* sql`
            INSERT INTO architecture_lab_work_item (id, title, status)
            VALUES ('migration-proof-1', 'Prove db-admin migration', 'open')
          `;
          const rows = yield* sql<{ readonly id: string }>`
            SELECT id FROM architecture_lab_work_item ORDER BY id ASC
          `;

          expect(
            pipe(
              rows,
              A.map((row) => row.id)
            )
          ).toEqual(["migration-proof-1"]);
        }),
        120_000
      );
    });
  });
}
