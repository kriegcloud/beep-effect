import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as RelationEvidence from "./RelationEvidence.model";
import type { FindByIds, FindByRelationId, SearchByText } from "./contracts";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/RelationEvidence.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof RelationEvidence.Model,
  {
    readonly findByRelationId: DbRepo.Method<{
      payload: typeof FindByRelationId.Payload;
      success: typeof FindByRelationId.Success;
    }>;
    readonly findByIds: DbRepo.Method<{
      payload: typeof FindByIds.Payload;
      success: typeof FindByIds.Success;
    }>;
    readonly searchByText: DbRepo.Method<{
      payload: typeof SearchByText.Payload;
      success: typeof SearchByText.Success;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
