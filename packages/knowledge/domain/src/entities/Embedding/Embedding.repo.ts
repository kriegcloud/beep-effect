import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type * as Embedding from "./Embedding.model";
import type { Delete, DeleteByEntityIdPrefix, FindByCacheKey, FindByEntityType, FindSimilar } from "./contracts";

const $I = $KnowledgeDomainId.create("entities/Embedding/Embedding.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Embedding.Model,
  {
    readonly findByCacheKey: DbRepo.Method<{
      payload: typeof FindByCacheKey.Payload;
      success: typeof FindByCacheKey.Success;
    }>;

    readonly findSimilar: DbRepo.Method<{
      payload: typeof FindSimilar.Payload;
      success: typeof FindSimilar.Success;
    }>;

    readonly findByEntityType: DbRepo.Method<{
      payload: typeof FindByEntityType.Payload;
      success: typeof FindByEntityType.Success;
    }>;

    readonly deleteByEntityIdPrefix: DbRepo.Method<{
      payload: typeof DeleteByEntityIdPrefix.Payload;
      success: typeof DeleteByEntityIdPrefix.Success;
    }>;

    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
