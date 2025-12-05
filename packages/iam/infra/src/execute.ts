import * as IamDbSchema from "@beep/iam-tables/schema";
import { BS } from "@beep/schema";
import { User } from "@beep/shared-domain/entities";
import { Db } from "@beep/shared-infra/Db";
import type { PgClient, PgClientServices } from "@beep/shared-infra/internal/db/pg";
import type { DatabaseService } from "@beep/shared-infra/internal/db/pg/types";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { Console, Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";

export const iamDb = Db.make({
  schema: IamDbSchema,
});

export class IamDb extends Context.Tag("IamDb")<IamDb, DatabaseService<typeof IamDbSchema>>() {
  static readonly layer: IamDbLayer = Layer.scoped(this, iamDb).pipe(Layer.provideMerge(Db.layer));
}
type IamDbLayer = Layer.Layer<PgClientServices | IamDb | PgClient, never, never>;

const program = Effect.gen(function* () {
  const { transaction, makeQuery } = yield* IamDb;

  // Use a fixed email to trigger a unique constraint violation on second run
  const testEmail = BS.Email.make("test-error-formatting@example.com");

  const m = User.Model.jsonCreate.make({
    email: testEmail,
    name: "beep",
  });

  const insertUser = makeQuery((execute, input: typeof User.Model.jsonCreate.Type) =>
    S.encode(User.Model.jsonCreate)(input).pipe(
      Effect.flatMap((encoded) =>
        execute((client) =>
          client
            .insert(IamDbSchema.user)
            .values({
              ...encoded,
              deletedAt: null,
              banExpires: null,
            })
            .returning()
        )
      )
    )
  );

  yield* Console.log("Attempting to insert user with email:", testEmail);
  yield* Console.log("If this email already exists, you will see the formatted error output.");
  yield* Console.log("");

  const inserted = yield* transaction((tx) => insertUser(m).pipe(Db.TransactionContext.provide(tx)));

  yield* Console.log("Inserted successfully:", inserted);
}).pipe(
  Effect.provide(IamDb.layer),
  Effect.catchTag("DatabaseError", (error) =>
    Console.log("\n[Caught DatabaseError]", error._tag, "- type:", error.type)
  )
);

BunRuntime.runMain(program);
