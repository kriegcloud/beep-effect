import { Db } from "@beep/shared-infra/Db";
import * as Context from "effect/Context";
import * as _Layer from "effect/Layer";
import * as DbSchema from "../schema";

const serviceEffect = Db.make({
  schema: DbSchema,
});

export class AdminDb extends Context.Tag("@beep/documents-infra/AdminDb")<
  AdminDb,
  Db.DatabaseService<typeof DbSchema>
>() {
  static readonly Live: _Layer.Layer<AdminDb, never, Db.SliceDbRequirements> = _Layer.scoped(this, serviceEffect);
}
