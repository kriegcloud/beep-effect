import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as MeetingPrepBullet from "./MeetingPrepBullet.model";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepBullet/MeetingPrepBullet.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MeetingPrepBullet.Model,
  {
    readonly listByMeetingPrepId: (
      meetingPrepId: string,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<MeetingPrepBullet.Model>, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
