import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-server/factories";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { KnowledgeDb } from "../Db";

const $I = $KnowledgeServerId.create("db/repos/OntologyRepo");

const serviceEffect = DbRepo.make(KnowledgeEntityIds.OntologyId, Entities.Ontology.Model, Effect.succeed({}));

export type OntologyRepoShape = Effect.Effect.Success<typeof serviceEffect>;

export class OntologyRepo extends Context.Tag($I`OntologyRepo`)<OntologyRepo, OntologyRepoShape>() {}

export const OntologyRepoLive = Layer.effect(OntologyRepo, serviceEffect).pipe(Layer.provide(KnowledgeDb.layer));
