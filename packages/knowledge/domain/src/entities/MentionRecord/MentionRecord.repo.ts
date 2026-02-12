import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type * as MentionRecord from "./MentionRecord.model";
import type {
  Delete,
  FindByExtractionId,
  FindByResolvedEntityId,
  FindUnresolved,
  UpdateResolvedEntityId,
} from "./contracts";

const $I = $KnowledgeDomainId.create("entities/MentionRecord/MentionRecord.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MentionRecord.Model,
  {
    readonly findByExtractionId: DbRepo.Method<{
      payload: typeof FindByExtractionId.Payload;
      success: typeof FindByExtractionId.Success;
    }>;

    readonly findByResolvedEntityId: DbRepo.Method<{
      payload: typeof FindByResolvedEntityId.Payload;
      success: typeof FindByResolvedEntityId.Success;
    }>;

    readonly findUnresolved: DbRepo.Method<{
      payload: typeof FindUnresolved.Payload;
      success: typeof FindUnresolved.Success;
    }>;

    readonly updateResolvedEntityId: DbRepo.Method<{
      payload: typeof UpdateResolvedEntityId.Payload;
      success: typeof S.Void;
      failure: typeof UpdateResolvedEntityId.Failure;
    }>;

    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
