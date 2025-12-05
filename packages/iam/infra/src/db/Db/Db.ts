import * as IamDbSchema from "@beep/iam-tables/schema";
import { Db } from "@beep/shared-infra/Db";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const serviceEffect = Db.make({
  schema: IamDbSchema,
});

export class IamDb extends Context.Tag("@beep/documents-infra/IamDb")<IamDb, Db.DatabaseService<typeof IamDbSchema>>() {
  static readonly Live: Layer.Layer<IamDb, never, Db.SliceDbRequirements> = Layer.scoped(this, serviceEffect);
}
