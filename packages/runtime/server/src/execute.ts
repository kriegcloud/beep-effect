import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-infra";
import { IamDbSchema } from "@beep/iam-tables";
import { BS } from "@beep/schema";
import { faker } from "@faker-js/faker";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { serverRuntime } from "./server-runtime";

const program = Effect.gen(function* () {
  const { db } = yield* IamDb.IamDb;

  const mockedUser = Entities.User.Model.insert.make({
    email: BS.Email.make("test@example.com"),
    name: "beep",
    emailVerified: false,
    image: O.some(faker.image.avatar()),
    twoFactorEnabled: O.some(false),
    isAnonymous: O.some(false),
  });
  const encoded = yield* S.encode(Entities.User.Model.insert)(mockedUser);
  yield* db.insert(IamDbSchema.userTable).values([encoded]);
});

serverRuntime.runPromise(program);
