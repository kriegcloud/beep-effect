import * as Schema from "@beep/db-admin/schema";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { PgContainer } from "./pg-container";

const i = Layer.mergeAll(PgContainer.Live);
it.layer(i, { timeout: "30 seconds" })("StylesRepo", (it) => {
  it.effect(
    "should create a style",
    Effect.fnUntraced(function* () {
      const db = yield* PgDrizzle.make<typeof Schema>({
        schema: Schema,
      });

      const users = yield* db.query.userTable.findMany();
      expect(users.length).toEqual(1);
    })
  );
});
