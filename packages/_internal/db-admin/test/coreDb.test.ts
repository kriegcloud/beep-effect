import { describe } from "bun:test";
import { DbError } from "@beep/core-db/errors";
import * as Entities from "@beep/iam-domain/entities";
import * as IamRepos from "@beep/iam-infra/adapters/repositories";
import * as BS from "@beep/schema/schema";
import { assertTrue, layer } from "@beep/testkit";
import { faker } from "@faker-js/faker";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { PgContainer, pgContainerPreflight } from "./pg-container";

const preflight = pgContainerPreflight;

if (preflight.type === "skip") {
  console.warn(`[@beep/core-db] skipping docker-backed tests: ${preflight.reason}`);
  describe.skip("test core db errors", () => undefined);
} else {
  layer(PgContainer.Live)("test core db errors", (it) => {
    it.effect("error should be matched", () =>
      Effect.gen(function* () {
        const userRepo = yield* IamRepos.UserRepo;

        const mockedUser = Entities.User.Model.insert.make({
          email: BS.Email.make(`test1-${crypto.randomUUID()}@example.com`),
          name: "beep",
          gender: "male",
          emailVerified: false,
          image: O.some(faker.image.avatar()),
        });

        yield* userRepo.insert(mockedUser);

        // This should cause a unique violation since we're inserting the same user again
        const error = yield* userRepo.insert(mockedUser).pipe(Effect.flip);

        assertTrue(error instanceof DbError);
        assertTrue(error.type === "UNIQUE_VIOLATION");
      })
    );
  });
}
