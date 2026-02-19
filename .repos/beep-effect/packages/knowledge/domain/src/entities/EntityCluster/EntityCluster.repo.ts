import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import type * as EntityCluster from "./EntityCluster.model";

const $I = $KnowledgeDomainId.create("entities/EntityCluster/EntityCluster.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof EntityCluster.Model,
  {
    readonly findByCanonicalEntity: (
      canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<O.Option<EntityCluster.Model>, DatabaseError>;

    readonly findByMember: (
      memberId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<O.Option<EntityCluster.Model>, DatabaseError>;

    readonly findByOntology: (
      ontologyId: KnowledgeEntityIds.OntologyId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<EntityCluster.Model>, DatabaseError>;

    readonly findHighCohesion: (
      minCohesion: number,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<EntityCluster.Model>, DatabaseError>;

    readonly deleteByOntology: (
      ontologyId: KnowledgeEntityIds.OntologyId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<void, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
