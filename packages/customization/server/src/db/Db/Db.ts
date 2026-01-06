import * as CustomizationDbSchema from "@beep/customization-tables/schema";
import { $CustomizationServerId } from "@beep/identity/packages";
import { Db } from "@beep/shared-server/Db";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";

const $I = $CustomizationServerId.create("CustomizationDb");

const serviceEffect = Db.make({
  schema: CustomizationDbSchema,
});

export class CustomizationDb extends Context.Tag($I`CustomizationDb`)<
  CustomizationDb,
  Db.Shape<typeof CustomizationDbSchema>
>() {
  static readonly Live: Layer.Layer<CustomizationDb, never, Db.SliceDbRequirements> = Layer.scoped(this, serviceEffect);
}

export const layer: Layer.Layer<CustomizationDb, never, Db.SliceDbRequirements> = CustomizationDb.Live;
