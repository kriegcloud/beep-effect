import { $WorkspacesDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type { Create, CreateWithComment, Delete, Get, ListByDocument, Resolve, Unresolve } from "./contracts";
import type * as Discussion from "./Discussion.model";

const $I = $WorkspacesDomainId.create("entities/Discussion/Discussion.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Discussion.Model,
  {
    readonly getWithComments: DbRepo.Method<{
      payload: typeof Get.Payload;
      success: typeof Get.Success;
      failure: typeof Get.Failure;
    }>;
    readonly listByDocument: DbRepo.Method<{
      payload: typeof ListByDocument.Payload;
      success: typeof ListByDocument.Success;
    }>;
    readonly create: DbRepo.Method<{
      payload: typeof Create.Payload;
      success: typeof Create.Success;
      failure: typeof Create.Failure;
    }>;
    readonly createWithComment: DbRepo.Method<{
      payload: typeof CreateWithComment.Payload;
      success: typeof CreateWithComment.Success;
      failure: typeof CreateWithComment.Failure;
    }>;
    readonly resolve: DbRepo.Method<{
      payload: typeof Resolve.Payload;
      success: typeof Resolve.Success;
      failure: typeof Resolve.Failure;
    }>;
    readonly unresolve: DbRepo.Method<{
      payload: typeof Unresolve.Payload;
      success: typeof Unresolve.Success;
      failure: typeof Unresolve.Failure;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
