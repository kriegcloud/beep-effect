import { DbError } from "@beep/core-db/errors";
import * as Entities from "@beep/iam-domain/entities";
import * as IamRepos from "@beep/iam-infra/adapters/repositories";
import * as BS from "@beep/schema/schema";
import { assert, describe, it } from "@effect/vitest";
import { faker } from "@faker-js/faker";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { PgContainer, pgContainerPreflight } from "./pg-container";

const preflight = pgContainerPreflight;
const describePg = preflight.type === "ready" ? describe : describe.skip;

if (preflight.type === "skip") {
  console.warn(`[@beep/core-db] skipping docker-backed tests: ${preflight.reason}`);
}

describePg("@beep/core-db", () =>
  it.layer(PgContainer.Live, { timeout: "30 seconds" })("test core db errors", (it) => {
    it.effect(
      "error should be matched",
      Effect.fnUntraced(function* () {
        const userRepo = yield* IamRepos.UserRepo;

        const now = yield* DateTime.now;
        const mockedUser = Entities.User.Model.insert.make({
          email: BS.Email.make(`test1-${crypto.randomUUID()}@example.com`),
          name: "beep",
          gender: "male",
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
          image: O.some(faker.image.avatar()),
        });

        yield* userRepo.insert(mockedUser);

        // This should cause a unique violation since we're inserting the same user again
        const error = yield* userRepo.insert(mockedUser).pipe(Effect.flip);

        assert.isTrue(error instanceof DbError);
        assert.isTrue(error.type === "UNIQUE_VIOLATION");
      })
    );
  })
);
