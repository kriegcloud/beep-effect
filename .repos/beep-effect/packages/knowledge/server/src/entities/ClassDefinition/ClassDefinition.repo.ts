import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(KnowledgeEntityIds.ClassDefinitionId, Entities.ClassDefinition.Model);

export const RepoLive: Layer.Layer<Entities.ClassDefinition.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  Entities.ClassDefinition.Repo,
  serviceEffect
).pipe(Layer.provide(KnowledgeDb.layer));
