import { Db } from "@beep/core-db";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import * as DbSchema from "./schema";

/**
 * @internal
 */
export namespace AdminDb {
  const { serviceEffect } = Db.make(DbSchema);

  export class AdminDb extends Context.Tag("@beep/admin-db/AdminDb")<AdminDb, Db.Db<typeof DbSchema>>() {}

  // No-deps layer: requires PgLive | DbPool.Live to be provided by the app runtime
  export const layer = Layer.scoped(AdminDb, serviceEffect);
}
