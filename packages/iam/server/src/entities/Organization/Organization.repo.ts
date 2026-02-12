import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { SharedEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(SharedEntityIds.OrganizationId, Entities.Organization.Model);

export const RepoLive: Layer.Layer<Entities.Organization.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.Organization.Repo,
  serviceEffect
).pipe(Layer.provide(IamDb.layer));
