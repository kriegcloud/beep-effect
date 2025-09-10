import { DbPool } from "@beep/db-scope";
import { IamDb } from "@beep/iam-db";
import { ResendService } from "@beep/resend";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { AuthService } from "../Auth.service";
import { AuthEmailService } from "../AuthEmail.service";

const AppLayer = Layer.mergeAll(
  Layer.provideMerge(AuthService.Default, Layer.provideMerge(IamDb.layer, DbPool.Live)),
  AuthEmailService.Default,
  ResendService.Default
);

export const serverRuntime = ManagedRuntime.make(AppLayer);
