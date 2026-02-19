import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import type * as SameAsLink from "./SameAsLink.model";

const $I = $KnowledgeDomainId.create("entities/SameAsLink/SameAsLink.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof SameAsLink.Model,
  {
    readonly findByCanonical: (
      canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<SameAsLink.Model>, DatabaseError>;

    readonly findByMember: (
      memberId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<O.Option<SameAsLink.Model>, DatabaseError>;

    readonly resolveCanonical: (
      entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<KnowledgeEntityIds.KnowledgeEntityId.Type, DatabaseError>;

    readonly findHighConfidence: (
      minConfidence: number,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<SameAsLink.Model>, DatabaseError>;

    readonly findBySource: (
      sourceId: string,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<SameAsLink.Model>, DatabaseError>;

    readonly deleteByCanonical: (
      canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<void, DatabaseError>;

    readonly countMembers: (
      canonicalId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<number, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
