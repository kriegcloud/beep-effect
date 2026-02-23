import { Entities } from "@beep/customization-domain";
import { CustomizationDb } from "@beep/customization-server/db";
import { CustomizationEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(CustomizationEntityIds.UserHotkeyId, Entities.UserHotkey.Model);

export const RepoLive: Layer.Layer<Entities.UserHotkey.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.UserHotkey.Repo,
  serviceEffect
).pipe(Layer.provide(CustomizationDb.layer));
