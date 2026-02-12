import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type * as MergeHistory from "./MergeHistory.model";
import type {
  Delete,
  FindByOrganization,
  FindBySourceEntity,
  FindByTargetEntity,
  FindByUser,
} from "./contracts";

const $I = $KnowledgeDomainId.create("entities/MergeHistory/MergeHistory.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MergeHistory.Model,
  {
    readonly findByTargetEntity: DbRepo.Method<{
      payload: typeof FindByTargetEntity.Payload;
      success: typeof FindByTargetEntity.Success;
    }>;

    readonly findBySourceEntity: DbRepo.Method<{
      payload: typeof FindBySourceEntity.Payload;
      success: typeof FindBySourceEntity.Success;
    }>;

    readonly findByUser: DbRepo.Method<{
      payload: typeof FindByUser.Payload;
      success: typeof FindByUser.Success;
    }>;

    readonly findByOrganization: DbRepo.Method<{
      payload: typeof FindByOrganization.Payload;
      success: typeof FindByOrganization.Success;
    }>;

    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
