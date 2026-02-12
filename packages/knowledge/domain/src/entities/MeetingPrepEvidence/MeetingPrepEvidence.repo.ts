import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as MeetingPrepEvidence from "./MeetingPrepEvidence.model";
import type { ListByBulletId } from "./contracts";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepEvidence/MeetingPrepEvidence.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MeetingPrepEvidence.Model,
  {
    readonly listByBulletId: DbRepo.Method<{
      payload: typeof ListByBulletId.Payload;
      success: typeof ListByBulletId.Success;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
