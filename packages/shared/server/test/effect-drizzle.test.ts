import { Database } from "bun:sqlite";
import { makeWithDefaults } from "@beep/shared-server/factories/effect-drizzle";
import { describe, expect, it } from "@effect/vitest";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Effect, Exit } from "effect";
import * as A from "effect/Array";

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

const schema = { users };

const createUsersTableSql = "create table users (id integer primary key autoincrement, name text not null)";

const makeTestDatabase = Effect.gen(function* () {
  const client = yield* Effect.acquireRelease(
    Effect.sync(() => new Database(":memory:")),
    (client) =>
      Effect.sync(() => {
        client.close();
      })
  );

  return yield* makeWithDefaults<typeof schema>({
    client,
    schema,
  });
});

describe("effect-drizzle", () => {
  it.effect("supports yieldable query builders and prepared queries", () =>
    Effect.scoped(
      Effect.gen(function* () {
        const db = yield* makeTestDatabase;

        yield* db.effect.run(createUsersTableSql);
        yield* db.insert(users).values({ name: "Ada" });
        yield* db.insert(users).values({ name: "Grace" });

        const selectUsers = db.select().from(users);
        const preparedUsers = db.select().from(users).prepare();
        const rows = yield* selectUsers;
        const preparedRows = yield* preparedUsers;

        expect(rows).toEqual([
          { id: 1, name: "Ada" },
          { id: 2, name: "Grace" },
        ]);
        expect(preparedRows).toEqual(rows);
      })
    )
  );

  it.effect("rolls back nested transactions to savepoints without losing outer work", () =>
    Effect.scoped(
      Effect.gen(function* () {
        const db = yield* makeTestDatabase;

        yield* db.effect.run(createUsersTableSql);
        yield* db.effect.transaction((tx) =>
          Effect.gen(function* () {
            yield* tx.insert(users).values({ name: "outer" });

            const nestedExit = yield* Effect.exit(
              tx.effect.transaction((nestedTx) =>
                Effect.gen(function* () {
                  yield* nestedTx.insert(users).values({ name: "inner" });

                  return yield* nestedTx.effect.rollback();
                })
              )
            );

            expect(Exit.isFailure(nestedExit)).toBe(true);

            yield* tx.insert(users).values({ name: "after" });
          })
        );

        const rows = yield* db.effect.all<{ readonly id: number; readonly name: string }>(
          "select id, name from users order by id"
        );

        expect(A.map(rows, (row) => row.name)).toEqual(["outer", "after"]);
      })
    )
  );
});
