import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as RelationEvidence from "./RelationEvidence.model";

const $I = $KnowledgeDomainId.create("entities/RelationEvidence/RelationEvidence.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof RelationEvidence.Model,
  {
    readonly findByRelationId: (
      relationId: KnowledgeEntityIds.RelationId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<RelationEvidence.Model>, DatabaseError>;
    readonly findByIds: (
      ids: ReadonlyArray<KnowledgeEntityIds.RelationEvidenceId.Type>,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<RelationEvidence.Model>, DatabaseError>;
    readonly searchByText: (
      query: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<RelationEvidence.Model>, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
