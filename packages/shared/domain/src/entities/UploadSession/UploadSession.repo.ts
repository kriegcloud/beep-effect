import { $SharedDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as UploadSession from "./UploadSession.model";
import type { DeleteByFileKey, DeleteExpired, FindByFileKey, IsValid, Store } from "./contracts";

const $I = $SharedDomainId.create("entities/UploadSession/UploadSession.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof UploadSession.Model,
  {
    readonly store: DbRepo.Method<{
      payload: typeof Store.Payload;
      success: typeof Store.Success;
      failure: typeof Store.Failure;
    }>;

    readonly findByFileKey: DbRepo.Method<{
      payload: typeof FindByFileKey.Payload;
      success: typeof FindByFileKey.Success;
      failure: typeof FindByFileKey.Failure;
    }>;

    readonly deleteByFileKey: DbRepo.Method<{
      payload: typeof DeleteByFileKey.Payload;
      success: typeof DeleteByFileKey.Success;
      failure: typeof DeleteByFileKey.Failure;
    }>;

    readonly deleteExpired: DbRepo.Method<{
      payload: typeof DeleteExpired.Payload;
      success: typeof DeleteExpired.Success;
      failure: typeof DeleteExpired.Failure;
    }>;

    readonly isValid: DbRepo.Method<{
      payload: typeof IsValid.Payload;
      success: typeof IsValid.Success;
      failure: typeof IsValid.Failure;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
