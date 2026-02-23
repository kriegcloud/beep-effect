import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import type { DbClient } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import * as Layer from "effect/Layer";

const serviceEffect = DbRepo.make(KnowledgeEntityIds.PropertyDefinitionId, Entities.PropertyDefinition.Model);

export const RepoLive: Layer.Layer<Entities.PropertyDefinition.Repo, never, DbClient.SliceDbRequirements> =
  Layer.effect(Entities.PropertyDefinition.Repo, serviceEffect).pipe(Layer.provide(KnowledgeDb.layer));
