import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as MergeHistory from "./MergeHistory.model";

const $I = $KnowledgeDomainId.create("entities/MergeHistory/MergeHistory.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MergeHistory.Model,
  {
    readonly findByTargetEntity: (
      targetEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<MergeHistory.Model>, DatabaseError>;

    readonly findBySourceEntity: (
      sourceEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<MergeHistory.Model>, DatabaseError>;

    readonly findByUser: (
      userId: SharedEntityIds.UserId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<MergeHistory.Model>, DatabaseError>;

    readonly findByOrganization: (
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<MergeHistory.Model>, DatabaseError>;

    readonly hardDelete: (mergeHistoryId: KnowledgeEntityIds.MergeHistoryId.Type) => Effect.Effect<void, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
