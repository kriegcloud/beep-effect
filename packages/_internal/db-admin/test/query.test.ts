import * as Schema from "@beep/db-admin/schema";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { PgContainer } from "./pg-container";

it.layer(PgContainer.Live, { timeout: "30 seconds" })("mocked drizzle db", (it) => {
  it.effect(
    "mocked drizzle db should work",
    Effect.fnUntraced(function* () {
      const db = yield* PgDrizzle.make<typeof Schema>({
        schema: Schema,
      });

      const users = yield* db.query.userTable.findMany();
      expect(users.length).toEqual(1);
    })
  );
});
