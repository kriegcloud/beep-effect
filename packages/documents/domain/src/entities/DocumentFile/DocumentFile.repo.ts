import { $DocumentsDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type { Create, Get, HardDelete, ListByDocument, ListByUser } from "./contracts";
import type * as DocumentFile from "./DocumentFile.model";

const $I = $DocumentsDomainId.create("entities/DocumentFile/DocumentFile.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof DocumentFile.Model,
  {
    readonly findByIdOrFail: DbRepo.Method<{
      payload: typeof Get.Payload;
      success: typeof DocumentFile.Model;
      failure: typeof Get.Failure;
    }>;
    readonly listByDocument: DbRepo.Method<{
      payload: typeof ListByDocument.Payload;
      success: typeof ListByDocument.Success;
    }>;
    readonly listByUser: DbRepo.Method<{
      payload: typeof ListByUser.Payload;
      success: typeof ListByUser.Success;
    }>;
    readonly create: DbRepo.Method<{
      payload: typeof Create.Payload;
      success: typeof Create.Success;
    }>;
    readonly hardDelete: DbRepo.Method<{
      payload: typeof HardDelete.Payload;
      success: typeof HardDelete.Success;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
