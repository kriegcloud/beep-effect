import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Mention from "./Mention.model";
import type { FindByDocumentId, FindByEntityId, FindByIds } from "./contracts";

const $I = $KnowledgeDomainId.create("entities/Mention/Mention.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Mention.Model,
  {
    readonly findByEntityId: DbRepo.Method<{
      payload: typeof FindByEntityId.Payload;
      success: typeof FindByEntityId.Success;
    }>;
    readonly findByIds: DbRepo.Method<{
      payload: typeof FindByIds.Payload;
      success: typeof FindByIds.Success;
    }>;
    readonly findByDocumentId: DbRepo.Method<{
      payload: typeof FindByDocumentId.Payload;
      success: typeof FindByDocumentId.Success;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
