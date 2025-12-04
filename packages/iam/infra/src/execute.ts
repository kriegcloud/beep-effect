import * as IamDbSchema from "@beep/iam-tables/schema";
import {PgClient} from "@beep/shared-infra/internal/db/pg";
import {Effect, Context, Layer, Console, Redacted} from "effect";
import {User} from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import {BS} from "@beep/schema";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import {liveLayer, type PgClientConfig, TransactionContext} from "@beep/shared-infra/internal/db/pg/PgClient";
import type { DatabaseService } from "@beep/shared-infra/internal/db/pg/types";
import type * as Reactivity from "@effect/experimental/Reactivity";
import type * as SqlClient from "@effect/sql/SqlClient";
export const iamDb = PgClient.make({
  schema: IamDbSchema
});
type _Layer = Layer.Layer<PgClient.ConnectionContext | PgClient.Logger | Reactivity.Reactivity | PgClient.PoolService | IamDb | PgClient.PgClient | SqlClient.SqlClient, never, never>

export class IamDb extends Context.Tag("IamDb")<IamDb, DatabaseService<typeof IamDbSchema>>() {
  static readonly Live = (connection: PgClientConfig): _Layer => Layer.scoped(this, iamDb.pipe(Effect.orDie)).pipe(
    Layer.provideMerge(
     liveLayer(connection)
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
    TransactionContext.provide(tx)
  ));

  yield* Console.log(inserted);
}).pipe(
  Effect.provide(
    IamDb.Live({
      url: Redacted.make("postgres://admin:password@localhost:5432/db"),
      ssl: false,
    })
  )
);

BunRuntime.runMain(program);