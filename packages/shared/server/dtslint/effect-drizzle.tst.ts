import type {
  EffectDrizzleDatabase,
  EffectDrizzleError,
  EffectDrizzleOperations,
  EffectDrizzleQueryError,
  EffectTransactionRollbackError,
} from "@beep/shared-server/factories/effect-drizzle";
import type { SQLiteBunDatabase } from "drizzle-orm/bun-sqlite";
import type { EmptyRelations } from "drizzle-orm/relations";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Effect } from "effect";
import { describe, expect, it } from "tstyche";

const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

type Schema = {
  readonly users: typeof users;
};

declare const db: EffectDrizzleDatabase<Schema, EmptyRelations>;

describe("effect-drizzle", () => {
  it("extends the Bun SQLite database with Effect helpers", () => {
    expect(db).type.toBe<
      SQLiteBunDatabase<Schema, EmptyRelations> & {
        readonly effect: EffectDrizzleOperations<Schema, EmptyRelations>;
      }
    >();
  });

  it("exposes typed raw helpers and transactions", () => {
    expect(db.effect.run("select 1")).type.toBe<Effect.Effect<unknown, EffectDrizzleQueryError>>();
    expect(db.effect.all("select 1")).type.toBe<Effect.Effect<readonly unknown[], EffectDrizzleQueryError>>();
    expect(db.effect.values("select 1")).type.toBe<Effect.Effect<unknown[][], EffectDrizzleQueryError>>();
    expect(db.effect.transaction((_tx) => Effect.succeed("ok"))).type.toBe<
      Effect.Effect<string, EffectDrizzleError | EffectTransactionRollbackError>
    >();
  });

  it("makes query builders and prepared queries yieldable", () => {
    const selectUsers = db.select().from(users);
    const preparedUsers = db.select().from(users).prepare();
    const selectProgram = Effect.gen(function* () {
      return yield* selectUsers;
    });
    const preparedProgram = Effect.gen(function* () {
      return yield* preparedUsers;
    });

    expect(selectUsers.asEffect()).type.toBe<Effect.Effect<{ id: number; name: string }[], EffectDrizzleQueryError>>();
    expect(preparedUsers.asEffect()).type.toBe<
      Effect.Effect<{ id: number; name: string }[], EffectDrizzleQueryError>
    >();
    expect(selectProgram).type.toBe<Effect.Effect<{ id: number; name: string }[], EffectDrizzleQueryError>>();
    expect(preparedProgram).type.toBe<Effect.Effect<{ id: number; name: string }[], EffectDrizzleQueryError>>();
  });
});
