import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as MentionRecord from "./MentionRecord.model";

const $I = $KnowledgeDomainId.create("entities/MentionRecord/MentionRecord.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof MentionRecord.Model,
  {
    readonly findByExtractionId: (
      extractionId: KnowledgeEntityIds.ExtractionId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<MentionRecord.Model>, DatabaseError>;
    readonly findByResolvedEntityId: (
      entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<MentionRecord.Model>, DatabaseError>;
    readonly findUnresolved: (
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<MentionRecord.Model>, DatabaseError>;
    readonly updateResolvedEntityId: (
      mentionRecordId: KnowledgeEntityIds.MentionRecordId.Type,
      entityId: KnowledgeEntityIds.KnowledgeEntityId.Type
    ) => Effect.Effect<void, DatabaseError>;
    readonly hardDelete: (
      mentionRecordId: KnowledgeEntityIds.MentionRecordId.Type
    ) => Effect.Effect<void, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
