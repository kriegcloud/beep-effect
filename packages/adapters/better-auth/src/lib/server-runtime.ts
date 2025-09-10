import {IamDb} from "@beep/iam-db";
import {ResendService} from "@beep/resend";
import * as ServerRuntime from "@beep/runtime/server";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import {AuthService} from "../Auth.service";
import {AuthEmailService} from "../AuthEmail.service";

const AppLayer = Layer.mergeAll(
  Layer.provideMerge(AuthService.Default, IamDb.layer),
  AuthEmailService.Default,
  ResendService.Default
);

export const serverRuntime = ManagedRuntime.make(Layer.provideMerge(AppLayer, ServerRuntime.layer));
