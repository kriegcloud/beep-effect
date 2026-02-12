import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type { DeleteFiles, GetFilesByKeys, ListPaginated, MoveFiles } from "./contracts";
import type * as File from "./File.model";

const $I = $SharedDomainId.create("entities/File/File.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof File.Model,
  {
    readonly listPaginated: DbRepo.Method<{
      payload: typeof ListPaginated.Payload;
      success: typeof ListPaginated.Success;
    }>;

    readonly moveFiles: DbRepo.Method<{
      payload: typeof MoveFiles.Payload;
      success: typeof MoveFiles.Success;
      failure: typeof MoveFiles.Failure;
    }>;

    readonly deleteFiles: DbRepo.Method<{
      payload: typeof DeleteFiles.Payload;
      success: typeof DeleteFiles.Success;
      failure: typeof DeleteFiles.Failure;
    }>;

    readonly getFilesByKeys: DbRepo.Method<{
      payload: typeof GetFilesByKeys.Payload;
      success: typeof GetFilesByKeys.Success;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
