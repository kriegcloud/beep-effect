import { describe, expect } from "bun:test";
import { UserRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import { layer } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { PgTest } from "./container";

describe("UserRepo", () => {
  layer(PgTest, { timeout: Duration.seconds(60) })("error should be matched", (it) =>
    it.effect(
      "should insert",
      () =>
        Effect.gen(function* () {
          const repo = yield* UserRepo;

          const mockedUser = User.Model.jsonCreate.make({
            email: BS.Email.make(`test1-${crypto.randomUUID()}@example.com`),
            name: "beep",
          });
          const inserted = yield* repo.insert(mockedUser);

          expect(S.is(User.Model)(inserted)).toBe(true);
        }),
      Duration.seconds(60)
    )
  );
});
