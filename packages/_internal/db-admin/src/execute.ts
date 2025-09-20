import { Db } from "@beep/core-db";
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
  const { execute, transaction, makeQuery } = yield* IamDb.IamDb;

  const now = yield* DateTime.now;

  const mockedUser = Entities.User.Model.insert.make({
    email: BS.Email.make(`test1-${crypto.randomUUID()}@example.com`),
    name: "beep",
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    image: O.some(faker.image.avatar()),
  });

  const encodedMockedUser = yield* S.encode(Entities.User.Model.insert)(mockedUser);

  const insertUser = makeQuery((execute, input: typeof Entities.User.Model.insert.Type) =>
    S.encode(Entities.User.Model.insert)(input).pipe(
      Effect.flatMap((encoded) => execute((client) => client.insert(IamDbSchema.userTable).values(encoded).returning()))
    )
  );

  const r = yield* transaction((txnClient) =>
    Effect.gen(function* () {
      yield* execute((client) => client.insert(IamDbSchema.userTable).values(encodedMockedUser).returning());
      yield* insertUser(mockedUser);
    }).pipe(Effect.provideService(IamDb.TransactionContext, txnClient))
  ).pipe(Effect.flip);
  yield* Console.log(JSON.stringify(r, null, 2));
  // const error = yield* Effect.tryPromise({
  //   try: () =>
  //     drizzle.transaction(async (tx) => tx.insert(IamDbSchema.userTable).values(encodedMockedUser).returning()),
  //   catch: (e) => {
  //     console.log("RAW ERROR: ", JSON.stringify(e, null, 2));
  //     return DbError.match(e);
  //   },
  // }).pipe(Effect.flip);
  //
  // yield* Console.log(JSON.stringify(error, null, 2));
});

NodeRuntime.runMain(program.pipe(Effect.provide([NodeContext.layer, DbRepos])));
