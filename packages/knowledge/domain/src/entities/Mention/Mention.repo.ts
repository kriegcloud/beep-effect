import { $KnowledgeDomainId } from "@beep/identity/packages";
import type { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import type { DatabaseError } from "@beep/shared-domain/errors";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as Mention from "./Mention.model";

const $I = $KnowledgeDomainId.create("entities/Mention/Mention.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Mention.Model,
  {
    readonly findByEntityId: (
      entityId: KnowledgeEntityIds.KnowledgeEntityId.Type,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<Mention.Model>, DatabaseError>;
    readonly findByIds: (
      ids: ReadonlyArray<KnowledgeEntityIds.MentionId.Type>,
      organizationId: SharedEntityIds.OrganizationId.Type
    ) => Effect.Effect<ReadonlyArray<Mention.Model>, DatabaseError>;
    readonly findByDocumentId: (
      documentId: string,
      organizationId: SharedEntityIds.OrganizationId.Type,
      limit?: number
    ) => Effect.Effect<ReadonlyArray<Mention.Model>, DatabaseError>;
  }
>;

export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
