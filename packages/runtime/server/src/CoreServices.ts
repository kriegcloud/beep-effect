import { Db } from "@beep/core-db";
import { ResendService } from "@beep/core-email";
import { AuthEmailService, IamConfig } from "@beep/iam-infra";
import type * as SqlClient from "@effect/sql/SqlClient";
import * as Layer from "effect/Layer";

export type CoreServicesLive = Layer.Layer<
  ResendService | AuthEmailService | SqlClient.SqlClient | IamConfig,
  never,
  never
>;

export const CoreServicesLive: CoreServicesLive = AuthEmailService.DefaultWithoutDependencies.pipe(
  Layer.provideMerge(Layer.mergeAll(ResendService.Default, Db.Live, IamConfig.Live).pipe(Layer.orDie))
);
