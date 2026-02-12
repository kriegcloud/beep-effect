import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type * as EntityCluster from "./EntityCluster.model";
import type {
  Delete,
  DeleteByOntology,
  FindByCanonicalEntity,
  FindByMember,
  FindByOntology,
  FindHighCohesion,
} from "./contracts";

const $I = $KnowledgeDomainId.create("entities/EntityCluster/EntityCluster.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof EntityCluster.Model,
  {
    readonly findByCanonicalEntity: DbRepo.Method<{
      payload: typeof FindByCanonicalEntity.Payload;
      success: typeof FindByCanonicalEntity.Success;
    }>;

    readonly findByMember: DbRepo.Method<{
      payload: typeof FindByMember.Payload;
      success: typeof FindByMember.Success;
    }>;

    readonly findByOntology: DbRepo.Method<{
      payload: typeof FindByOntology.Payload;
      success: typeof FindByOntology.Success;
    }>;

    readonly findHighCohesion: DbRepo.Method<{
      payload: typeof FindHighCohesion.Payload;
      success: typeof FindHighCohesion.Success;
    }>;

    readonly deleteByOntology: DbRepo.Method<{
      payload: typeof DeleteByOntology.Payload;
      success: typeof S.Void;
    }>;

    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
