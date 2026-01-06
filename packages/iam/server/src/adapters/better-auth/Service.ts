import type { IamDb } from "@beep/iam-server/db/Db";
import { $IamServerId } from "@beep/identity/packages";
import type { DbClient } from "@beep/shared-server";
import type { Email } from "@beep/shared-server/Email";
import * as Context from "effect/Context";
import * as Layer from "effect/Layer";
import { AuthEmailService } from "./Emails";
import { AuthEffect } from "./Options";
import type { Auth } from "./types";

const $I = $IamServerId.create("adapters/better-auth/Auth");

export class Service extends Context.Tag($I`Service`)<Service, Auth>() {}
type LayerDependencies = IamDb.Db | Email.ResendService | DbClient.SliceDbRequirements;
export const layer: Layer.Layer<Service, never, LayerDependencies> = Layer.effect(Service, AuthEffect).pipe(
  Layer.provide(AuthEmailService.Default)
);
