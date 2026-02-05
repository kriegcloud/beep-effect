import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/PropertyDefinitionRepo");

const serviceEffect = DbRepo.make(
  KnowledgeEntityIds.PropertyDefinitionId,
  Entities.PropertyDefinition.Model,
  Effect.succeed({})
);

export type PropertyDefinitionRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class PropertyDefinitionRepo extends Context.Tag($I`PropertyDefinitionRepo`)<
  PropertyDefinitionRepo,
  PropertyDefinitionRepoShape
>() {}

export const PropertyDefinitionRepoLive = Layer.effect(PropertyDefinitionRepo, serviceEffect).pipe(
  Layer.provide(KnowledgeDb.layer)
);
