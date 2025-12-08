import { $SharedInfraId } from "@beep/identity/packages";
import { Db } from "@beep/shared-infra/Db";
import * as SharedDbSchema from "@beep/shared-tables/schema";
import type * as Reactivity from "@effect/experimental/Reactivity";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const $I = $SharedInfraId.create("db/Db");

const serviceEffect: Effect.Effect<
  Db.DatabaseService<typeof SharedDbSchema>,
  never,
  Db.Logger | Db.PoolService | Reactivity.Reactivity | Db.ConnectionContext
> = Db.make({
  schema: SharedDbSchema,
});

export class SharedDb extends Context.Tag($I`SharedDb`)<SharedDb, Db.DatabaseService<typeof SharedDbSchema>>() {
  static readonly Live: Layer.Layer<SharedDb, never, Db.SliceDbRequirements> = Layer.scoped(this, serviceEffect);
}
