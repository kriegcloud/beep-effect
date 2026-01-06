import { $DbAdminId } from "@beep/identity/packages";
import { DbClient } from "@beep/shared-server/factories";
import * as Context from "effect/Context";
import * as _Layer from "effect/Layer";
import * as DbSchema from "../schema";

const $I = $DbAdminId.create("Db/AdminDb");

const serviceEffect = DbClient.make({
  schema: DbSchema,
});

export class AdminDb extends Context.Tag($I`AdminDb`)<AdminDb, DbClient.Shape<typeof DbSchema>>() {
  static readonly Live: _Layer.Layer<AdminDb, never, DbClient.SliceDbRequirements> = _Layer.scoped(this, serviceEffect);
}
