import { Entities } from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import { IamEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(IamEntityIds.MemberId, Entities.Member.Model);

export const RepoLive: Layer.Layer<Entities.Member.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.Member.Repo,
  serviceEffect
).pipe(Layer.provide(IamDb.layer));
