import { User } from "@beep/iam-domain/entities";
import { IamEntityIds } from "@beep/shared-domain/EntityIds";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { AdminDb } from "./Db";

console.log(process.env.DB_PG_URL!);

const program = Effect.gen(function* () {
  const { findById } = yield* User.UserRepo;

  const i = yield* findById(IamEntityIds.UserId.make("user__5f2ad10a-fed2-40cc-ac08-a2958bc14ac8"));
  yield* Console.log(i);
  // const Insert = yield* SqlResolver.ordered("InsertPerson", {
  //   Request: InsertPersonSchema,
  //   Result: Person,
  //   execute: (requests) => sql`INSERT INTO people ${sql.insert(requests)} RETURNING people.*`
  // })
  // const result = yield* repo.insert({
  //   name: "Alice Anderson",
  //   email: "alice@example.com",
  //   emailVerified: true,
  //   username: O.some("alice"),
  //   displayUsername: O.some("AliceA"),
  //   role: O.some("admin"),
  //   banned: O.some(false),
  //   image: O.some("beep"),
  //   twoFactorEnabled: O.some(false),
  //   isAnonymous: O.some(false),
  //   banReason: O.none(),
  //   stripeCustomerId: O.none(),
  // });

  // yield* Console.log(result);

  // const i = repo.insert;
  // console.log(i);
  // yield* db.execute((client) => client.delete(IamDbSchema.account))
  // yield* db
  //   .transaction((execute) =>
  //     Effect.gen(function* () {
  //       const result = yield* Effect.all(
  //         [
  //           execute((client) => client.delete(IamDbSchema.account)),
  //           execute((client) => client.delete(IamDbSchema.user)),
  //         ],
  //         {
  //           batching: true,
  //         }
  //       );
  //
  //       yield* Console.log(result);
  //       const user1Id = uuid();
  //       const user2Id = uuid();
  //       yield* execute((client) =>
  //         client.insert(IamDbSchema.user).values([
  //           // {
  //           //   id: user1Id,
  //           //   name: "Alice Anderson",
  //           //   email: "alice@example.com",
  //           //   emailVerified: true,
  //           //   username: "alice",
  //           //   displayUsername: "AliceA",
  //           //   role: "admin",
  //           //   banned: false,
  //           // },
  //           {
  //             id: user2Id,
  //             name: "Bob Brown",
  //             email: "bob@example.com",
  //             emailVerified: false,
  //             username: "bobby",
  //             displayUsername: "BobbyB",
  //             role: "user",
  //             banned: false,
  //           },
  //         ])
  //       );
  //       yield* execute((client) =>
  //         client.insert(IamDbSchema.account).values([
  //           {
  //             id: uuid(),
  //             accountId: "alice-google",
  //             providerId: "google",
  //             userId: user1Id,
  //             accessToken: "fake-access-token-alice",
  //             refreshToken: "fake-refresh-token-alice",
  //             scope: "openid email profile",
  //           },
  //           {
  //             id: uuid(),
  //             accountId: "bob-github",
  //             providerId: "github",
  //             userId: user2Id,
  //             accessToken: "fake-access-token-bob",
  //             refreshToken: "fake-refresh-token-bob",
  //             scope: "read:user",
  //           },
  //         ])
  //       );
  //     })
  //   )
  //   .pipe(Effect.catchTag("DbError", (e) => Effect.dieMessage(e.message)));

  return yield* Effect.void;
}).pipe(Effect.provide(User.UserRepo.Default));

const AppLayer = Layer.mergeAll(AdminDb.layer);

export const serverRuntime = ManagedRuntime.make(AppLayer);

serverRuntime.runPromise(Effect.scoped(program));
