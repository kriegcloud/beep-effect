import { serverEnv } from "@beep/env/server";
import { IamDb } from "@beep/iam-db";
import { Service } from "@beep/resend";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";
import { AuthService } from "../Auth.service";
import { AuthEmailService } from "../AuthEmail.service";

const AppLayer = Layer.mergeAll(
  Layer.provideMerge(
    AuthService.Default,
    IamDb.layer({
      url: serverEnv.db.pg.url,
      ssl: serverEnv.db.pg.ssl,
    })
  ),
  AuthEmailService.Default,
  Service.Default
);

export const serverRuntime = ManagedRuntime.make(AppLayer);
