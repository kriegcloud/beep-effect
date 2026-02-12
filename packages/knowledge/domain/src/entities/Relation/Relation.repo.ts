import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as Relation from "./Relation.model";

const $I = $KnowledgeDomainId.create("entities/Relation/Relation.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Relation.Model,
  {
    readonly findBySourceIds: (
      sourceIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<Relation.Model>, DatabaseError>;

    readonly findByTargetIds: (
      targetIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<Relation.Model>, DatabaseError>;

    readonly findByEntityIds: (
      entityIds: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<Relation.Model>, DatabaseError>;

    readonly findByPredicate: (
      predicateIri: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<Relation.Model>, DatabaseError>;

    readonly countByOrganization: (
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<number, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
