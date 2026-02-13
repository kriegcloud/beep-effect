import { $WorkspacesDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type {
  Archive,
  Create,
  Get,
  HardDelete,
  List,
  ListArchived,
  ListByUser,
  ListChildren,
  Lock,
  Publish,
  Restore,
  Search,
  Unlock,
  Unpublish,
  Update,
} from "./contracts";
import type * as Document from "./Document.model";

const $I = $WorkspacesDomainId.create("entities/Document/Document.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Document.Model,
  {
    readonly search: DbRepo.Method<{
      payload: typeof Search.Payload;
      success: typeof Search.Success;
    }>;
    readonly listByUser: DbRepo.Method<{
      payload: typeof ListByUser.Payload;
      success: typeof ListByUser.Success;
    }>;
    readonly list: DbRepo.Method<{
      payload: typeof List.Payload;
      success: typeof List.Success;
    }>;
    readonly listArchived: DbRepo.Method<{
      payload: typeof ListArchived.Payload;
      success: typeof ListArchived.Success;
    }>;
    readonly listChildren: DbRepo.Method<{
      payload: typeof ListChildren.Payload;
      success: typeof ListChildren.Success;
    }>;
    readonly create: DbRepo.Method<{
      payload: typeof Create.Payload;
      success: typeof Create.Success;
      failure: typeof Create.Failure;
    }>;
    readonly update: DbRepo.Method<{
      payload: typeof Update.Payload;
      success: typeof Update.Success;
      failure: typeof Update.Failure;
    }>;
    readonly get: DbRepo.Method<{
      payload: typeof Get.Payload;
      success: typeof Get.Success;
      failure: typeof Get.Failure;
    }>;
    readonly archive: DbRepo.Method<{
      payload: typeof Archive.Payload;
      success: typeof Archive.Success;
      failure: typeof Archive.Failure;
    }>;
    readonly restore: DbRepo.Method<{
      payload: typeof Restore.Payload;
      success: typeof Restore.Success;
      failure: typeof Restore.Failure;
    }>;
    readonly publish: DbRepo.Method<{
      payload: typeof Publish.Payload;
      success: typeof Publish.Success;
      failure: typeof Publish.Failure;
    }>;
    readonly unpublish: DbRepo.Method<{
      payload: typeof Unpublish.Payload;
      success: typeof Unpublish.Success;
      failure: typeof Unpublish.Failure;
    }>;
    readonly lock: DbRepo.Method<{
      payload: typeof Lock.Payload;
      success: typeof Lock.Success;
      failure: typeof Lock.Failure;
    }>;
    readonly unlock: DbRepo.Method<{
      payload: typeof Unlock.Payload;
      success: typeof Unlock.Success;
      failure: typeof Unlock.Failure;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof HardDelete.Payload;
      success: typeof S.Void;
      failure: typeof HardDelete.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
