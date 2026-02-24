import { Entities } from "@beep/comms-domain";
import { CommsDb } from "@beep/comms-server/db";
import { CommsEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(CommsEntityIds.EmailTemplateId, Entities.EmailTemplate.Model);

export const RepoLive: Layer.Layer<Entities.EmailTemplate.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.EmailTemplate.Repo,
  serviceEffect
).pipe(Layer.provide(CommsDb.layer));
