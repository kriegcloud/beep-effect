import { PgContainer } from "@beep/db-admin/test/utils";
import { IamDbSchema } from "@beep/iam-tables";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

class Service extends Effect.Service<Service>()("TestService", {
  effect: Effect.gen(function* () {
    const db = yield* PgDrizzle.make({
      schema: IamDbSchema,
    });

    return {
      db,
    };
  }).pipe(Effect.provide(PgContainer.Default)),
}) {}

const TestLayer = Layer.provideMerge(Service.Default, PgContainer.Live);

it.layer(TestLayer, { timeout: "30 seconds" })("mocked drizzle db", (it) => {
  it.effect(
    "mocked drizzle db should work",
    Effect.fnUntraced(function* () {
      const { db } = yield* Service;
      const users = yield* db.query.userTable.findMany();

      // const users = yield* db.query.userTable.findMany();
      expect(users.length).toEqual(1);
    })
  );
});
