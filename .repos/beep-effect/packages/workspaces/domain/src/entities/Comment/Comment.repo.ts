/**
 * Comment repository contract (domain).
 *
 * This module intentionally lives in the domain package:
 * - Slice server packages implement this contract against the real database.
 * - Domain code can depend on the *shape* of persistence without importing server layers.
 *
 * Custom repo methods should prefer schema-derived signatures (`DbRepo.Method`) so
 * payload/success types and required schema contexts stay mechanically consistent.
 *
 * @module documents-domain/entities/Comment/Comment.repo
 * @since 1.0.0
 * @category repos
 */
import { $WorkspacesDomainId } from "@beep/identity/packages";
import type * as DbRepo from "@beep/shared-domain/factories/db-repo";
import * as Context from "effect/Context";
import type * as S from "effect/Schema";
import type * as Comment from "./Comment.model";
import type { Delete, ListByDiscussion, Update } from "./contracts";

const $I = $WorkspacesDomainId.create("entities/Comment/Comment.repo");

export type RepoShape = DbRepo.DbRepoSuccess<
  typeof Comment.Model,
  {
    /**
     * List all comments for a discussion.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly listByDiscussion: DbRepo.Method<{
      payload: typeof ListByDiscussion.Payload;
      success: typeof ListByDiscussion.Success;
    }>;

    /**
     * Update comment content (implementations typically set `isEdited = true`).
     *
     * `Get.Failure` is intentionally included to document the desired behavior:
     * implementations should translate "missing row" into a typed not-found error
     * rather than defecting.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly updateContent: DbRepo.Method<{
      payload: typeof Update.Payload;
      success: typeof Update.Success;
      failure: typeof Update.Failure;
    }>;

    /**
     * Hard delete a comment by id.
     *
     * @since 1.0.0
     * @category repos
     */
    readonly hardDelete: DbRepo.Method<{
      payload: typeof Delete.Payload;
      success: typeof S.Void;
      failure: typeof Delete.Failure;
    }>;
  }
>;

/**
 * Comment repository service tag.
 *
 * Base CRUD methods come from `DbRepo.DbRepoSuccess<typeof Comment.Model, ...>`.
 *
 * @since 1.0.0
 * @category repos
 */
export class Repo extends Context.Tag($I`Repo`)<Repo, RepoShape>() {}
