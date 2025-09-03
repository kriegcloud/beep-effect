import { IamDb } from "@beep/iam-db";
// import { Entities } from "@beep/iam-domain";
import { IamDbSchema } from "@beep/iam-tables";
// import {
//   SqlClient,
//   // SqlResolver
// } from "@effect/sql";
import * as DevTools from "@effect/experimental/DevTools";
// import { v4 as uuid } from "uuid";
import * as M from "@effect/sql/Model";
// import * as O from "effect/Option";
// import * as M from "@effect/sql/Model";
import { PgClient } from "@effect/sql-pg";
import { getTableName } from "drizzle-orm";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";

console.log(process.env.DB_PG_URL!);
const PgLive = PgClient.layer({
  // url: Redacted.make(process.env.DB_PG_URL!),
  port: 5432,
  host: "localhost",
  database: "postgres",
  username: "postgres",
  password: Redacted.make("postgres"),
  transformResultNames: Str.snakeToCamel,
});

/**
 * User model representing application users with authentication and profile data.
 * Maps to the `user` table in the database.
 */
export class Model extends M.Class<Model>(`User.Model`)({
  /** Primary key identifier for the user */
  id: M.Generated(S.String),

  /** User's display name */
  name: S.NonEmptyString.annotations({
    description: "The user's display name",
  }),

  /** User's email address (unique) */
  email: M.Sensitive(
    S.String.annotations({
      description: "The user's email address",
    })
  ),

  /** Whether the user's email has been verified */
  emailVerified: S.Boolean.annotations({
    description: "Whether the user's email address has been verified",
  }).pipe(
    S.optional,
    S.withDefaults({
      decoding: () => false,
      constructor: () => false,
    })
  ),

  /** User's profile image URL */
  image: M.FieldOption(
    S.String.pipe(S.pattern(/^https?:\/\/.+/)).annotations({
      description: "URL to the user's profile image",
    })
  ),

  /** Whether two-factor authentication is enabled */
  twoFactorEnabled: M.FieldOption(
    S.NullOr(S.Boolean).annotations({
      description: "Whether two-factor authentication is enabled for this user",
    })
  ),

  /** Whether this is an anonymous user */
  isAnonymous: M.FieldOption(
    S.Boolean.annotations({
      description: "Whether this user is anonymous (guest user)",
    })
  ),

  /** User's role in the system */
  role: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "The user's role in the system",
      examples: ["admin", "member", "guest"],
    })
  ),

  username: M.FieldOption(S.NonEmptyString),
  displayUsername: M.FieldOption(S.NonEmptyString),
  // /** Whether the user is banned */
  banned: M.FieldOption(
    S.Boolean.annotations({
      description: "Whether the user is currently banned",
    })
  ),

  // /** Reason for ban if user is banned */
  banReason: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "Reason why the user was banned",
    })
  ),

  // /** When the ban expires */
  banExpires: S.Any,

  /** Stripe customer ID for billing */
  stripeCustomerId: M.FieldOption(
    S.NonEmptyString.annotations({
      description: "Stripe customer ID for billing integration",
    })
  ),

  // Audit and tracking columns
}) {}
const program = Effect.gen(function* () {
  // const db = yield* IamDb.IamDb;
  // const sql = yield* SqlClient.SqlClient;
  const { findById } = yield* M.makeDataLoaders(Model, {
    tableName: getTableName(IamDbSchema.user),
    idColumn: "id",
    spanPrefix: "User",
    window: 10,
  });

  const i = yield* findById("5f2ad10a-fed2-40cc-ac08-a2958bc14ac8");
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
});

const AppLayer = Layer.mergeAll(
  IamDb.layer({
    url: Redacted.make(process.env.DB_PG_URL!),
    ssl: false,
  }),
  PgLive.pipe(Layer.provide(DevTools.layer()))
);

export const serverRuntime = ManagedRuntime.make(AppLayer);

serverRuntime.runPromise(Effect.scoped(program));
