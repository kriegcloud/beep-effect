import { ResendService } from "@beep/core-email";
import * as ServerRuntime from "@beep/core-runtime/server";
import { IamDb } from "@beep/iam-infra";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { AuthService } from "../Auth.service";
import { AuthEmailService } from "../AuthEmail.service";

const AppLayer = Layer.mergeAll(
  Layer.provideMerge(AuthService.Default, Layer.provideMerge(IamDb.layer, ServerRuntime.layer)),
  AuthEmailService.Default,
  ResendService.Default
);

export const serverRuntime = ManagedRuntime.make(AppLayer);
