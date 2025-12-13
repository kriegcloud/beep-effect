import { Schema } from "@beep/iam-tables/schema-object";
import { Db } from "@beep/shared-infra/Db";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const serviceEffect: Db.PgClientServiceEffect<Schema.Type> = Db.make({
  schema: Schema,
});

export type Shape = Db.Shape<Schema.Type>;

export class IamDb extends Context.Tag("@beep/documents-infra/IamDb")<IamDb, Shape>() {
  static readonly Live: Layer.Layer<IamDb, never, Db.SliceDbRequirements> = Layer.scoped(this, serviceEffect);
}
