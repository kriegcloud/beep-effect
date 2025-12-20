import type { IamDb } from "@beep/iam-server/db/Db";
import { $IamServerId } from "@beep/identity/packages";
import type { Db } from "@beep/shared-server/Db";
import type { Email } from "@beep/shared-server/Email";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { AuthEmailService } from "./Emails.ts";
import { AuthEffect } from "./Options.ts";

const $I = $IamServerId.create("adapters/better-auth/Auth");

export class Service extends Context.Tag($I`Service`)<Service, Effect.Effect.Success<typeof AuthEffect>>() {}
type LayerDependencies = IamDb.IamDb | Email.ResendService | Db.SliceDbRequirements;
export const layer: Layer.Layer<Service, never, LayerDependencies> = Layer.effect(Service, AuthEffect).pipe(
  Layer.provide(AuthEmailService.Default)
);
