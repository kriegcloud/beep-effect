import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Relation from "./Relation.model";
import type {
  CountByOrganization,
  Delete,
  FindByEntityIds,
  FindByPredicate,
  FindBySourceIds,
  FindByTargetIds,
} from "./contracts";

const $I = $KnowledgeDomainId.create("entities/Relation/Relation.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Relation.Model,
  {
    readonly findBySourceIds: DbRepo.Method<{
      payload: typeof FindBySourceIds.Payload;
      success: typeof FindBySourceIds.Success;
    }>;
    readonly findByTargetIds: DbRepo.Method<{
      payload: typeof FindByTargetIds.Payload;
      success: typeof FindByTargetIds.Success;
    }>;
    readonly findByEntityIds: DbRepo.Method<{
      payload: typeof FindByEntityIds.Payload;
      success: typeof FindByEntityIds.Success;
    }>;
    readonly findByPredicate: DbRepo.Method<{
      payload: typeof FindByPredicate.Payload;
      success: typeof FindByPredicate.Success;
    }>;
    readonly countByOrganization: DbRepo.Method<{
      payload: typeof CountByOrganization.Payload;
      success: typeof CountByOrganization.Success;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof Delete.Success;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
