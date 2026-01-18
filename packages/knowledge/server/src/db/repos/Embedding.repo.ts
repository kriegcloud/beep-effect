import { Entities } from "@beep/knowledge-domain";
import { KnowledgeDb } from "@beep/knowledge-server/db";
import { $KnowledgeServerId } from "@beep/identity/packages";
import { KnowledgeEntityIds } from "@beep/shared-domain";
import { DbRepo } from "@beep/shared-domain/factories";
import * as Effect from "effect/Effect";
import { dependencies } from "./_common";

const $I = $KnowledgeServerId.create("db/repos/PlaceholderRepo");

export class EmbeddingRepo extends Effect.Service<EmbeddingRepo>()($I`PlaceholderRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    yield* KnowledgeDb.Db;

    return yield* DbRepo.make(KnowledgeEntityIds.EmbeddingId, Entities.Embedding.Model, Effect.succeed({}));
  }),
}) {}
