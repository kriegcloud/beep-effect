import { Db, DbError } from "@beep/core-db";
import { FilesDb, FilesRepos } from "@beep/files-infra";
import * as Entities from "@beep/iam-domain/entities";
import { IamDb, IamRepos } from "@beep/iam-infra";
import { IamDbSchema } from "@beep/iam-tables";
import * as BS from "@beep/schema/schema";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { faker } from "@faker-js/faker";
import * as Console from "effect/Console";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

export const SliceDatabasesLive = Layer.mergeAll(IamDb.IamDb.Live, FilesDb.FilesDb.Live);
export const SliceRepositoriesLive = Layer.mergeAll(IamRepos.layer, FilesRepos.layer);

export const SliceDependenciesLayer = Layer.provideMerge(SliceDatabasesLive, Db.Live);

export const DbRepos = Layer.provideMerge(SliceRepositoriesLive, SliceDependenciesLayer);

const program = Effect.gen(function* () {
  const userRepo = yield* IamRepos.UserRepo;
  const { db } = yield* IamDb.IamDb;

  const now = yield* DateTime.now;
  const mockedUser = Entities.User.Model.insert.make({
    email: BS.Email.make(`test1-${crypto.randomUUID()}@example.com`),
    name: "beep",
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    image: O.some(faker.image.avatar()),
  });
  yield* userRepo.insert(mockedUser);

  const encodedMockedUser = yield* S.encode(Entities.User.Model.insert)(mockedUser);

  const error = yield* db
    .insert(IamDbSchema.userTable)
    .values(encodedMockedUser)
    .returning()
    .pipe(Effect.mapError(DbError.match), Effect.flip);

  yield* Console.log(JSON.stringify(error, null, 2));
});

NodeRuntime.runMain(program.pipe(Effect.provide([NodeContext.layer, DbRepos])));
