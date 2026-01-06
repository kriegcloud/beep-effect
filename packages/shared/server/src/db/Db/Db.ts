import { $SharedServerId } from "@beep/identity/packages";
import * as DbSchema from "@beep/shared-tables/schema";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as DbClient from "../../factories/db-client/pg";

const $I = $SharedServerId.create("db/Db");

const serviceEffect: DbClient.PgClientServiceEffect<typeof DbSchema> = DbClient.make({
  schema: DbSchema,
});

export type Shape = DbClient.Shape<typeof DbSchema>;

export class Db extends Context.Tag($I`Db`)<Db, Shape>() {}

export const layer: Layer.Layer<Db, never, DbClient.SliceDbRequirements> = Layer.scoped(Db, serviceEffect);
