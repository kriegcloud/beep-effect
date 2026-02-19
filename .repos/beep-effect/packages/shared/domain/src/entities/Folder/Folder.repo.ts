import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type { DeleteFolders } from "./contracts";
import type * as Folder from "./Folder.model";

const $I = $SharedDomainId.create("entities/Folder/Folder.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Folder.Model,
  {
    readonly deleteFolders: DbRepo.Method<{
      payload: typeof DeleteFolders.Payload;
      success: typeof DeleteFolders.Success;
      failure: typeof DeleteFolders.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
