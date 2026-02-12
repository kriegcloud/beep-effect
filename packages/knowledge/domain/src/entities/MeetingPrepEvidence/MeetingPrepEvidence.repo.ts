import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as MeetingPrepEvidence from "./MeetingPrepEvidence.model";

const $I = $KnowledgeDomainId.create("entities/MeetingPrepEvidence/MeetingPrepEvidence.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MeetingPrepEvidence.Model,
  {
    readonly listByBulletId: (
      bulletId: KnowledgeEntityIds.MeetingPrepBulletId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<MeetingPrepEvidence.Model>, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
