import { Drizzle, type DrizzleClient, DrizzleError, DrizzleErrorContext, type DrizzleRows } from "@beep/drizzle";
import { makePgliteSqlTestLayer, type SqlTestHooks } from "@beep/test-utils";
import { A, Str } from "@beep/utils";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const sharedConnectionUri = pipe(Bun.env.BEEP_TEST_DATABASE_URL, O.fromUndefinedOr, O.filter(Str.isNonEmpty));
const shouldUseTestcontainers = Bun.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
const shouldRunPgliteIntegration = O.isSome(sharedConnectionUri) || shouldUseTestcontainers;
const NoteRow = S.Struct({ body: S.String });
const decodeNoteRows = S.decodeUnknownEffect(S.Array(NoteRow));

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

const createNeutralNotesTable = SqlClient.SqlClient.use((sqlClient) => {
  const sql = sqlClient.withoutTransforms();
  return sql`
    CREATE TABLE neutral_notes (
      id SERIAL PRIMARY KEY,
      body TEXT NOT NULL
    )
  `;
});

const makeSqlBackedDrizzleClient = (sqlClient: SqlClient.SqlClient): DrizzleClient => {
  let client: DrizzleClient;
  const sql = sqlClient.withoutTransforms();

  client = {
    execute: (statement, parameters) =>
      sql.unsafe<Record<string, unknown>>(statement, parameters).pipe(
        Effect.map((rows): DrizzleRows => rows),
        Effect.mapError((cause) =>
          DrizzleError.fromUnknown(
            "execute",
            cause,
            DrizzleErrorContext.make({
              params: parameters,
              query: statement,
            })
          )
        )
      ),
    withTransaction: (use) =>
      sql
        .withTransaction(use(client))
        .pipe(Effect.mapError((cause) => DrizzleError.fromUnknown("withTransaction", cause))),
  };

  return client;
};

const DrizzlePgliteLayer = Layer.unwrap(
  SqlClient.SqlClient.use((sqlClient) => Effect.succeed(Drizzle.makeLayer(makeSqlBackedDrizzleClient(sqlClient))))
).pipe(Layer.provideMerge(makePgliteLayer({ migrate: createNeutralNotesTable })));

const readBodies = (rows: DrizzleRows) =>
  pipe(
    decodeNoteRows(rows),
    Effect.map(A.map((row) => row.body)),
    Effect.mapError((cause) => DrizzleError.fromUnknown("decodeRows", cause))
  );

if (!shouldRunPgliteIntegration) {
  describe.skip("Drizzle PgLite integration", () => {});
} else {
  describe.sequential("Drizzle PgLite integration", () => {
    layer(DrizzlePgliteLayer, { timeout: "2 minutes" })((it) => {
      it.effect(
        "runs execute and transaction flows against a PgLite-backed adapter",
        Effect.fnUntraced(function* () {
          const drizzle = yield* Drizzle;

          yield* drizzle.execute("INSERT INTO neutral_notes (body) VALUES ($1), ($2)", ["alpha", "beta"]);
          const committed = yield* drizzle.withTransaction(
            Effect.fnUntraced(function* (tx) {
              yield* tx.execute("INSERT INTO neutral_notes (body) VALUES ($1)", ["gamma"]);
              const rows = yield* tx.execute("SELECT body FROM neutral_notes ORDER BY id ASC", []);
              return yield* readBodies(rows);
            })
          );
          const rollback = DrizzleError.fromUnknown("withTransaction", "rollback");
          const rollbackFailure = yield* drizzle
            .withTransaction(
              Effect.fnUntraced(function* (tx) {
                yield* tx.execute("INSERT INTO neutral_notes (body) VALUES ($1)", ["rolled back"]);
                return yield* rollback;
              })
            )
            .pipe(Effect.flip);
          const afterRollback = yield* drizzle.execute("SELECT body FROM neutral_notes ORDER BY id ASC", []);
          const afterRollbackBodies = yield* readBodies(afterRollback);

          expect(committed).toEqual(["alpha", "beta", "gamma"]);
          expect(afterRollbackBodies).toEqual(["alpha", "beta", "gamma"]);
          expect(rollbackFailure).toBeInstanceOf(DrizzleError);
          expect(rollbackFailure.operation).toBe("withTransaction");
        }),
        120_000
      );
    });
  });
}
