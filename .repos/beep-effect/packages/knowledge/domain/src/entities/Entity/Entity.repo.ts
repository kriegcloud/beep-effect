import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as Entity from "./Entity.model";

const $I = $KnowledgeDomainId.create("entities/Entity/Entity.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Entity.Model,
  {
    readonly findByIds: (
      ids: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<Entity.Model>, DatabaseError>;
    readonly findByOntology: (
      ontologyId: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<Entity.Model>, DatabaseError>;
    readonly findByType: (
      typeIri: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<Entity.Model>, DatabaseError>;
    readonly countByOrganization: (
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<number, DatabaseError>;
    readonly findByNormalizedText: (
      normalizedText: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<Entity.Model>, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
