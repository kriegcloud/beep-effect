import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/ClassDefinitionRepo");

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.ClassDefinitionId,
  Entities.ClassDefinition.Model,
  Effect.succeed({})
);

export type ClassDefinitionRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class ClassDefinitionRepo extends Context.Tag($I`ClassDefinitionRepo`)<
  ClassDefinitionRepo,
  ClassDefinitionRepoShape
>() {}

export const ClassDefinitionRepoLive = Layer.effect(ClassDefinitionRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);
