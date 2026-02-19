import { $WorkspacesDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type { FindByMappingKey } from "./contracts";
import type * as DocumentSource from "./DocumentSource.model";

const $I = $WorkspacesDomainId.create("entities/DocumentSource/DocumentSource.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof DocumentSource.Model,
  {
    readonly findByMappingKey: DbRepo.Method<{
      payload: typeof FindByMappingKey.Payload;
      success: typeof FindByMappingKey.Success;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
