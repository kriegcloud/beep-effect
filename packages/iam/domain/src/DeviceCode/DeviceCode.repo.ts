import { IamEntityIds } from "@beep/shared-domain";
import * as M from "@effect/sql/Model";
import * as Effect from "effect/Effect";
import { Model } from "./DeviceCode.model";

export class DeviceCodeRepo extends Effect.Service<DeviceCodeRepo>()("DeviceCodeRepo", {
  effect: M.makeRepository(Model, {
    tableName: IamEntityIds.DeviceCodeId.tableName,
    idColumn: "id",
    spanPrefix: "DeviceCodeRepo",
  }),
}) {}
