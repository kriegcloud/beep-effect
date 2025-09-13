import { ResendService } from "@beep/core-email";
import * as ServerRuntime from "@beep/core-runtime/server";
import { AuthService } from "@beep/iam-infra/adapters";
import { IamDb } from "@beep/iam-infra/db/Db";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { AuthEmailService } from "../AuthEmail.service";

const AppLayer = Layer.mergeAll(
  Layer.provideMerge(IamDb.layer, ServerRuntime.layer),
  Layer.provideMerge(AuthEmailService.Default, ResendService.Default)
);

export const serverRuntime = ManagedRuntime.make(Layer.provideMerge(AppLayer, AuthService.Default));
