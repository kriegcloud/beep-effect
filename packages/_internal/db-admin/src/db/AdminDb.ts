import { DbClient } from "@beep/shared-server/factories";
import * as Context from "effect/Context";
import * as _Layer from "effect/Layer";
import * as DbSchema from "../schema";

const serviceEffect = DbClient.make({
  schema: DbSchema,
});

export class AdminDb extends Context.Tag("@beep/documents-server/AdminDb")<AdminDb, DbClient.Shape<typeof DbSchema>>() {
  static readonly Live: _Layer.Layer<AdminDb, never, DbClient.SliceDbRequirements> = _Layer.scoped(this, serviceEffect);
}
