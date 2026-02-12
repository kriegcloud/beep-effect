import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as O from "effect/Option";
import type * as Embedding from "./Embedding.model";
import type { SimilarityResult } from "./Embedding.values";

const $I = $KnowledgeDomainId.create("entities/Embedding/Embedding.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Embedding.Model,
  {
    readonly findByCacheKey: (
      cacheKey: string,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<O.Option<Embedding.Model>, DatabaseError>;

    readonly findSimilar: (
      queryVector: ReadonlyArray<number>,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number,
      threshold?: number
    ) => Effect.Effect<ReadonlyArray<SimilarityResult>, DatabaseError>;

    readonly findByEntityType: (
      entityType: Embedding.EntityType.Type,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<Embedding.Model>, DatabaseError>;

    readonly deleteByEntityIdPrefix: (
      entityIdPrefix: string,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<number, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
