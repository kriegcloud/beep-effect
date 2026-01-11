import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { dependencies } from "@beep/iam-server/db/repos/_common";
import { $IamServerId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";

const $I = $IamServerId.create("db/repos/DeviceCodeRepo");

export class DeviceCodeRepo extends Effect.Service<DeviceCodeRepo>()($I`DeviceCodeRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(
    IamEntityIds.DeviceCodeId,
    Entities.DeviceCode.Model,
    Effect.gen(function* () {
      yield* IamDb.Db;

      // const upsert = (upsert: typeof Entities.DeviceCode.Model.insert.Type) => Effect.gen(function* () {
      //   const encoded = yield* S.encode(Entities.DeviceCode.Model.insert)(upsert);
      //   return yield* db.insert(IamDbSchema.deviceCode).values(encoded).returning().onConflictDoUpdate({
      //     target: [IamDbSchema.deviceCode.deviceCode, IamDbSchema.deviceCode.clientId],
      //     set: {
      //       status: sql.raw(`excluded.${IamDbSchema.deviceCode.status.name}`),
      //       expiresAt: sql.raw(`excluded.${IamDbSchema.deviceCode.expiresAt.name}`),
      //       // ...other columns to update
      //     },
      //   });
      // }).pipe(
      //   Effect.withSpan(`DeviceCodeRepo.upsert`, {
      //     captureStackTrace: false,
      //     attributes: {upsert}
      //   })
      // );

      return {
        // upsert,
      };
    })
  ),
}) {}
