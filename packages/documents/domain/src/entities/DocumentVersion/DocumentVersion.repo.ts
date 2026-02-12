import { $DocumentsDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type * as DocumentVersion from "./DocumentVersion.model";
import type { CreateSnapshot, Get, GetContent, HardDelete, ListByDocument } from "./contracts";

const $I = $DocumentsDomainId.create("entities/DocumentVersion/DocumentVersion.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof DocumentVersion.Model,
  {
    readonly getWithAuthor: DbRepo.Method<{
      payload: typeof Get.Payload;
      success: typeof Get.Success;
      failure: typeof Get.Failure;
    }>;
    readonly getContent: DbRepo.Method<{
      payload: typeof GetContent.Payload;
      success: typeof GetContent.Success;
      failure: typeof GetContent.Failure;
    }>;
    readonly listByDocument: DbRepo.Method<{
      payload: typeof ListByDocument.Payload;
      success: typeof ListByDocument.Success;
    }>;
    readonly createSnapshot: DbRepo.Method<{
      payload: typeof CreateSnapshot.Payload;
      success: typeof CreateSnapshot.Success;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof HardDelete.Payload;
      success: typeof S.Void;
      failure: typeof HardDelete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
