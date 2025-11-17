import { describe, expect } from "bun:test";
import { IamDb, UserRepo } from "@beep/iam-infra";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import { layer } from "@beep/testkit";
import { PgTest } from "@beep/testkit/container";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const RepoDepsLive = IamDb.IamDb.Live.pipe(Layer.provideMerge(PgTest));
const Live = UserRepo.DefaultWithoutDependencies.pipe(Layer.provide(RepoDepsLive));

describe("UserRepo", () => {
  layer(Live, { timeout: Duration.seconds(60) })("error should be matched", (it) =>
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
