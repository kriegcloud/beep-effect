import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(KnowledgeEntityIds.KnowledgeAgentId, Entities.KnowledgeAgent.Model);

export const RepoLive: Layer.Layer<Entities.KnowledgeAgent.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.KnowledgeAgent.Repo,
  serviceEffect
).pipe(Layer.provide(KnowledgeDb.layer));
