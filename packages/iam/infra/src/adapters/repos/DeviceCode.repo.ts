import { Repo } from "@beep/core-db/Repo";
import { Entities } from "@beep/iam-domain";
import { dependencies } from "@beep/iam-infra/adapters/repos/_common";
import { IamDb } from "@beep/iam-infra/db";
import { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
// import * as S from "effect/Schema";
// import {sql} from "drizzle-orm";
// import {IamDbSchema} from "@beep/iam-tables";

export class DeviceCodeRepo extends Effect.Service<DeviceCodeRepo>()("@beep/iam-infra/adapters/repos/DeviceCodeRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    IamEntityIds.DeviceCodeId,
    Entities.DeviceCode.Model,
    Effect.gen(function* () {
      yield* IamDb.IamDb;

      // const upsert = (upsert: typeof Entities.DeviceCode.Model.insert.Type) => Effect.gen(function* () {
      //   const encoded = yield* S.encode(Entities.DeviceCode.Model.insert)(upsert);
      //   return yield* db.insert(IamDbSchema.deviceCodeTable).values(encoded).returning().onConflictDoUpdate({
      //     target: [IamDbSchema.deviceCodeTable.deviceCode, IamDbSchema.deviceCodeTable.clientId],
      //     set: {
      //       status: sql.raw(`excluded.${IamDbSchema.deviceCodeTable.status.name}`),
      //       expiresAt: sql.raw(`excluded.${IamDbSchema.deviceCodeTable.expiresAt.name}`),
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
