import * as Entities from "@beep/iam-domain/entities";
import * as IamRepos from "@beep/iam-infra/adapters/repositories";
import { IamDb } from "@beep/iam-infra/db";
import * as BS from "@beep/schema/schema";
import { expect, it } from "@effect/vitest";
import { faker } from "@faker-js/faker";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { PgContainer } from "./pg-container";

it.layer(PgContainer.Live, { timeout: "30 seconds" })("mocked drizzle db", (it) => {
  it.effect(
    "mocked drizzle db should work",
    Effect.fnUntraced(function* () {
      const { db } = yield* IamDb.IamDb;
      const userRepo = yield* IamRepos.UserRepo;

      const mockedUser = Entities.User.Model.insert.make({
        email: BS.Email.make("test1@example.com"),
        name: "beep1",
        emailVerified: false,
        createdAt: DateTime.unsafeNow(),
        updatedAt: DateTime.unsafeNow(),
        image: O.some(faker.image.avatar()),
        twoFactorEnabled: O.some(false),
        isAnonymous: O.some(false),
      });

      yield* userRepo.insert(mockedUser);

      const users = yield* db.query.userTable.findMany();

      // const users = yield* db.query.userTable.findMany();
      expect(users.length).toEqual(2);
    })
  );
});
