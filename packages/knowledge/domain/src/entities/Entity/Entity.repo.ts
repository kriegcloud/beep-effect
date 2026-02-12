import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Entity from "./Entity.model";
import type {
  CountByOrganization,
  Delete,
  FindByIds,
  FindByNormalizedText,
  FindByOntology,
  FindByType,
} from "./contracts";

const $I = $KnowledgeDomainId.create("entities/Entity/Entity.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Entity.Model,
  {
    readonly findByIds: DbRepo.Method<{
      payload: typeof FindByIds.Payload;
      success: typeof FindByIds.Success;
    }>;
    readonly findByOntology: DbRepo.Method<{
      payload: typeof FindByOntology.Payload;
      success: typeof FindByOntology.Success;
    }>;
    readonly findByType: DbRepo.Method<{
      payload: typeof FindByType.Payload;
      success: typeof FindByType.Success;
    }>;
    readonly countByOrganization: DbRepo.Method<{
      payload: typeof CountByOrganization.Payload;
      success: typeof CountByOrganization.Success;
    }>;
    readonly findByNormalizedText: DbRepo.Method<{
      payload: typeof FindByNormalizedText.Payload;
      success: typeof FindByNormalizedText.Success;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof Delete.Success;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
