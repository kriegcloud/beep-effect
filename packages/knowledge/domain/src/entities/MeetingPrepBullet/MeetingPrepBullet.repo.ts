import { $KnowledgeDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as MeetingPrepBullet from "./MeetingPrepBullet.model";
import type { ListByMeetingPrepId } from "./contracts";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepBullet/MeetingPrepBullet.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MeetingPrepBullet.Model,
  {
    readonly listByMeetingPrepId: DbRepo.Method<{
      payload: typeof ListByMeetingPrepId.Payload;
      success: typeof ListByMeetingPrepId.Success;
    }>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
