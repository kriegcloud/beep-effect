import * as IamDbSchema from "@beep/iam-tables/schema";
import {Db} from "@beep/shared-infra/Db";
import {Effect, Context, Layer, Console, Redacted} from "effect";
import {User} from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import {BS} from "@beep/schema";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";

export const iamDb = Db.make({
  schema: IamDbSchema
});
type _Layer = Layer.Layer<IamDb, never, never>

export class IamDb extends Context.Tag("IamDb")<IamDb, Db.DatabaseService<typeof IamDbSchema>>() {
  static readonly Live = (connection: Db.ConnectionOptions): _Layer => Layer.scoped(this, iamDb.pipe(Effect.orDie)).pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        // Use Default with ConnectionContext instead of Live to avoid the async connection listener
        // that keeps the process alive (Live is intended for long-running servers)
        Db.PoolService.Default.pipe(
          Layer.provide(Db.ConnectionContext.Live(connection))
        ),
        Db.Logger.Default,
      )
    ),
    Layer.orDie,
  );
}

const program = Effect.gen(function* () {
  const {transaction, makeQuery} = yield* IamDb;

  const m = User.Model.jsonCreate.make({
    email: BS.Email.make(`test1-${crypto.randomUUID()}@example.com`),
    name: "beep",
  });
  // const encoded = yield* S.encode(User.Model.jsonCreate)(m);

  const insertUser = makeQuery((execute, input: typeof User.Model.jsonCreate.Type) => S.encode(User.Model.jsonCreate)(input).pipe(
    Effect.flatMap((encoded) => execute((client) => client.insert(IamDbSchema.user).values({
      ...encoded,
      deletedAt: null,
      banExpires: null,
    }).returning())))
  )


  const inserted = yield* transaction((tx) => insertUser(m).pipe(
    Db.TransactionContext.provide(tx)
  ));

  yield* Console.log(inserted);
}).pipe(
  Effect.provide(
    IamDb.Live({
      connectionString: Redacted.make("postgres://admin:password@localhost:5432/db"),
      ssl: false,
    })
  )
);

BunRuntime.runMain(program);